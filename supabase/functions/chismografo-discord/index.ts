import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Método no permitido.' }, 405);

  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY');
  const discordWebhook = Deno.env.get('CHISMOGRAFO_WEBHOOK_URL');
  if (!authorization || !supabaseUrl || !publishableKey) return jsonResponse({ error: 'Falta una configuración de Supabase.' }, 500);
  if (!discordWebhook) return jsonResponse({ error: 'Falta configurar el webhook de Discord en Supabase.' }, 503);

  let interactionId = '';
  try {
    const body = await request.json();
    interactionId = String(body?.interaction_id || '');
  } catch {
    return jsonResponse({ error: 'La solicitud no contiene JSON válido.' }, 400);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(interactionId)) {
    return jsonResponse({ error: 'Identificador de cuadernito inválido.' }, 400);
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return jsonResponse({ error: 'Inicia sesión para continuar.' }, 401);

  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', authData.user.id).maybeSingle();
  if (profileError || profile?.role !== 'admin') return jsonResponse({ error: 'Solo administración puede anunciar cuadernitos.' }, 403);

  const { data: interaction, error: interactionError } = await supabase
    .from('interactions')
    .select('id, kind, payload')
    .eq('id', interactionId)
    .maybeSingle();
  if (interactionError || !interaction) return jsonResponse({ error: 'No se encontró el cuadernito.' }, 404);

  const payload = interaction.payload || {};
  if (interaction.kind !== 'question' || payload.form_type !== 'chismografo' || payload.public_status !== 'published' || payload.allow_public !== true) {
    return jsonResponse({ error: 'El cuadernito no está aprobado para publicarse.' }, 409);
  }
  if (payload.discord_status === 'sent') return jsonResponse({ sent: true, already_sent: true, discord_posted_at: payload.discord_posted_at || null });
  if (payload.discord_status !== 'pending') return jsonResponse({ error: 'El aviso no está pendiente.' }, 409);

  const response = await fetch(discordWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: '📓 ¡Nuevo cuadernito aprobado! Ya puedes leer un chismógrafo anónimo de la comunidad: https://jatsi.github.io/jatsi-page/#experiencias',
      allowed_mentions: { parse: [] }
    })
  });
  if (!response.ok) return jsonResponse({ error: `Discord rechazó el aviso (${response.status}).` }, 502);

  const discordPostedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from('interactions')
    .update({ payload: { ...payload, discord_status: 'sent', discord_posted_at: discordPostedAt } })
    .eq('id', interactionId)
    .select('id')
    .maybeSingle();
  if (updateError || !updated) return jsonResponse({ error: 'Discord recibió el aviso, pero no se pudo guardar el estado de envío.' }, 500);

  return jsonResponse({ sent: true, discord_posted_at: discordPostedAt });
});
