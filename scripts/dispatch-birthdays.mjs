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

const chismografoQuestions = [
  '¿Quién te gusta actualmente? Puedes decir solo una inicial o pasar.',
  '¿Te ha gustado alguien que conociste en un directo? ¿Qué te llamó la atención?',
  '¿Has conocido a alguien por TikTok y luego te cayó muy bien? Cuenta la anécdota sin nombres.',
  '¿Cuál ha sido tu crush más inesperado?',
  '¿Qué hiciste para llamar la atención de alguien que te gustaba?',
  '¿Alguna vez mandaste un mensaje y te arrepentiste al segundo?',
  '¿Te has declarado alguna vez? ¿Cómo te fue?',
  '¿Qué canción dedicarías en secreto?',
  '¿Qué green flag te conquista rapidísimo?',
  '¿Qué red flag ya no dejarías pasar?',
  '¿Has tenido ex? Sin nombres: ¿qué aprendiste de esa relación?',
  '¿Has vuelto a hablar con un ex aunque dijiste “nunca más”? Puedes pasar.',
  '¿Cuál fue tu cita más incómoda o más chistosa?',
  '¿Te han dejado en visto justo cuando más esperabas respuesta?',
  '¿Alguna vez confundiste amabilidad con coqueteo?',
  '¿Cuál fue la excusa más rara que usaste para cancelar una cita?',
  '¿Has stalkeado el perfil de un crush más de lo que admitirías?',
  '¿Cuál es tu gusto culposo en personas que te atraen?',
  '¿Qué consejo le darías a tu yo de su primer amor?',
  '¿Qué detalle romántico te daría muchísima pena recibir en público?',
  '¿Cuál ha sido tu momento más vergonzoso en público?',
  '¿Te has caído o tropezado justo cuando alguien te estaba viendo?',
  '¿Has saludado con emoción a alguien que no te estaba saludando?',
  '¿Cuál fue el mensaje que mandaste al chat equivocado?',
  '¿Has fingido entender un chiste y te reíste tarde?',
  '¿Qué outfit o peinado de tu pasado te da risa ahora?',
  '¿Alguna vez hablaste solo pensando que nadie te escuchaba?',
  '¿Qué mentira blanca dijiste y luego tuviste que sostener?',
  '¿Qué cosa ridícula haces cuando crees que nadie te ve?',
  '¿Qué palabra pronunciaste mal durante demasiado tiempo?',
  '¿Alguna vez te llevaste algo pequeño que no era tuyo? Puedes responder sí/no/paso; sin detalles ni nombres.',
  '¿Alguna vez fumaste o tomaste algo? Puedes decir sí, no o paso; sin presión ni detalles.',
  '¿Qué travesura casi te cuesta que te descubrieran?',
  '¿Alguna vez culpaste a alguien más de algo que hiciste? ¿Te arrepentiste?',
  '¿Has hecho trampa en un juego de mesa o videojuego? Confiesa tu nivel de maña.',
  '¿Qué excusa inventaste para llegar tarde?',
  '¿Alguna vez revisaste un regalo antes de que te lo dieran?',
  '¿Qué secreto inocente guardaste por más tiempo del necesario?',
  '¿Cuál fue tu berrinche más absurdo?',
  '¿Qué regla rompiste de pequeña/o y hoy te da risa?',
  '¿Cuál es un gusto culposo que te da pena admitir?',
  '¿Qué canción te sabes completa aunque digas que no te gusta?',
  '¿Qué apodo te pusieron y todavía recuerdas?',
  '¿Qué cosa infantil sigues disfrutando con orgullo?',
  '¿Cuál es tu talento más inútil?',
  '¿Qué búsqueda reciente te daría pena explicar?',
  '¿Qué comida amas y casi todo el mundo critica?',
  '¿Qué chisme inocente te gustaría que Jatsi y Katsy contesten en directo?',
  '¿Qué secreto divertido de tu personalidad casi nadie adivina?',
  'Si pudieras hacer una pregunta atrevida (pero respetuosa) a Jatsi o Katsy, ¿cuál sería?'
];

const permanentActivities = [
  {
    slug: 'chismografo-del-portal',
    type: 'question',
    title: 'Chismógrafo del cuaderno',
    description: 'Las 50 preguntas personales y opcionales están en el cuaderno de la comunidad.',
    config: { form_type: 'chismografo', notebook_only: true, questions: chismografoQuestions },
    is_active: true
  }
];
await supabaseRequest('/rest/v1/activities?on_conflict=slug', {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(permanentActivities)
});
await supabaseRequest('/rest/v1/activities?slug=eq.chismografo-del-portal', {
  method: 'PATCH', headers: { Prefer: 'return=minimal' },
  body: JSON.stringify({ title: 'Chismógrafo del cuaderno', description: 'Las 50 preguntas personales y opcionales están en el cuaderno de la comunidad.', config: { form_type: 'chismografo', notebook_only: true, questions: chismografoQuestions }, is_active: true })
});
await supabaseRequest('/rest/v1/activities?slug=eq.cumpleanos-del-portal', {
  method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ is_active: false })
});
await supabaseRequest('/rest/v1/activities?slug=like.jatsi-semana-*-chismografo', {
  method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ is_active: false })
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

// Publica solo una invitación genérica: las respuestas del cuadernito nunca salen de Supabase.
const chismografoWebhook = process.env.CHISMOGRAFO_WEBHOOK_URL;
if (!chismografoWebhook) {
  console.log('Avisos del chismógrafo omitidos: falta configurar CHISMOGRAFO_WEBHOOK_URL.');
} else {
  async function updateChismografoStatus(item, discordStatus) {
    await supabaseRequest(`/rest/v1/interactions?id=eq.${encodeURIComponent(item.id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ payload: { ...item.payload, discord_status: discordStatus, discord_posted_at: new Date().toISOString() } })
    });
  }

  const chismografoQuery = new URLSearchParams({
    select: 'id,payload',
    kind: 'eq.question',
    'payload->>form_type': 'eq.chismografo',
    'payload->>public_status': 'eq.published',
    'payload->>discord_status': 'eq.pending',
    order: 'created_at.asc',
    limit: '50'
  });
  const approvedChismografos = await supabaseRequest(`/rest/v1/interactions?${chismografoQuery}`);
  let chismografoAnnouncements = 0;
  for (const item of approvedChismografos) {
    const response = await fetch(chismografoWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📓 ¡Nuevo cuadernito aprobado! Ya puedes leer un chismógrafo anónimo de la comunidad: https://jatsi.github.io/jatsi-page/#experiencias`,
        allowed_mentions: { parse: [] }
      })
    });
    if (!response.ok) throw new Error(`Discord no aceptó el aviso del chismógrafo (${response.status}).`);
    await updateChismografoStatus(item, 'sent');
    chismografoAnnouncements++;
  }
  console.log(`Avisos de chismógrafos aprobados publicados: ${chismografoAnnouncements}.`);
}
