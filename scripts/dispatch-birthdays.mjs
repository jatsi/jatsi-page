const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'COMMUNITY_WEBHOOK_URL'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Faltan secretos requeridos: ${missing.join(', ')}.`);

const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseRequest(path, init = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...init.headers
    }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase devolvió ${response.status}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : null;
}

const permanentActivities = [
  {
    slug: 'cumpleanos-del-portal',
    type: 'question',
    title: 'Cumpleaños del portal',
    description: 'Comparte solo el día y el mes. Si aceptas, publicaremos tu alias y fecha en el Discord de la comunidad.',
    config: { form_type: 'birthday' },
    is_active: true
  },
  {
    slug: 'chismografo-del-portal',
    type: 'question',
    title: 'Chismógrafo del portal',
    description: 'Preguntas ligeras para compartir gustos, ideas y anécdotas divertidas de la comunidad.',
    config: { form_type: 'chismografo', questions: ['¿Qué gusto culposo defenderías con orgullo?', '¿Qué momento del stream te ha hecho reír más?', '¿Qué juego o tema te gustaría ver en el portal?'] },
    is_active: true
  }
];
await supabaseRequest('/rest/v1/activities?on_conflict=slug', {
  method: 'POST',
  headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
  body: JSON.stringify(permanentActivities)
});

async function setStatus(id, discordStatus) {
  const query = new URLSearchParams({ id: `eq.${id}` });
  await supabaseRequest(`/rest/v1/interactions?${query}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    // Keep only the delivery state; erase the birthday and alias after handling.
    body: JSON.stringify({ payload: { form_type: 'birthday', discord_status: discordStatus, posted_at: new Date().toISOString() } })
  });
}

function validBirthday(month, day) {
  return Number.isInteger(month) && month >= 1 && month <= 12
    && Number.isInteger(day) && day >= 1 && day <= new Date(2000, month, 0).getDate();
}

const pendingQuery = new URLSearchParams({
  select: 'id,visitor_id,payload',
  kind: 'eq.question',
  'payload->>form_type': 'eq.birthday',
  'payload->>discord_status': 'eq.pending',
  order: 'created_at.asc',
  limit: '50'
});
const pending = await supabaseRequest(`/rest/v1/interactions?${pendingQuery}`);
let published = 0;
let duplicates = 0;

for (const item of pending) {
  const birthday = item.payload || {};
  const month = Number(birthday.month);
  const day = Number(birthday.day);
  if (!birthday.consent || !validBirthday(month, day)) {
    await setStatus(item.id, 'invalid');
    continue;
  }

  if (item.visitor_id) {
    const duplicateQuery = new URLSearchParams({
      select: 'id',
      visitor_id: `eq.${item.visitor_id}`,
      kind: 'eq.question',
      'payload->>form_type': 'eq.birthday',
      'payload->>discord_status': 'eq.sent',
      limit: '1'
    });
    const prior = await supabaseRequest(`/rest/v1/interactions?${duplicateQuery}`);
    if (prior.length) {
      await setStatus(item.id, 'duplicate');
      duplicates++;
      continue;
    }
  }

  const alias = String(birthday.display_name || 'Anónim@')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/@/g, '@\u200b')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40) || 'Anónim@';
  const date = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2000, month - 1, day)));
  const response = await fetch(process.env.COMMUNITY_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🎂 ¡Sumamos a **${alias}** al calendario de cumpleaños de la comunidad! Su cumpleaños es el **${date}**. ¡Déjale mucho cariño cuando llegue el día!`,
      allowed_mentions: { parse: [] }
    })
  });
  if (!response.ok) throw new Error(`Discord no aceptó el cumpleaños (${response.status}).`);
  await setStatus(item.id, 'sent');
  published++;
}

console.log(`Cumpleaños revisados: ${pending.length}; publicados: ${published}; duplicados omitidos: ${duplicates}.`);
