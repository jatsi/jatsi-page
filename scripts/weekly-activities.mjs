import sharp from 'sharp';

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'COMMUNITY_WEBHOOK_URL',
  'INSTAGRAM_USER_ID',
  'INSTAGRAM_ACCESS_TOKEN'
];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Faltan secretos requeridos: ${missing.join(', ')}. No se cambió ni publicó nada.`);

const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const graphVersion = process.env.META_GRAPH_API_VERSION || 'v25.0';
const pageUrl = 'https://jatsi.github.io/jatsi-page/#experiencias';
const mexicoDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
const [year, month, day] = mexicoDate.split('-').map(Number);
const isoDate = new Date(Date.UTC(year, month - 1, day));
const isoDay = isoDate.getUTCDay() || 7;
isoDate.setUTCDate(isoDate.getUTCDate() + 4 - isoDay);
const isoYear = isoDate.getUTCFullYear();
const isoWeek = Math.ceil((((isoDate - new Date(Date.UTC(isoYear, 0, 1))) / 86400000) + 1) / 7);
const weekKey = `${isoYear}-W${String(isoWeek).padStart(2, '0')}`;
const safeWeek = weekKey.toLowerCase().replace(/[^a-z0-9-]/g, '-');

const topics = [
  { id: 'terror', label: 'la noche de terror', pollOptions: ['Terror psicológico', 'Casa embrujada', 'Criaturas extrañas', 'Historias del chat'], wheelOptions: ['Juega sin mirar el mapa', 'Narra el susto como telenovela', 'Deja que el chat elija la ruta', 'Haz una pausa dramática', 'Imita al monstruo', 'Cuenta tu leyenda urbana'] },
  { id: 'cozy', label: 'el stream cozy', pollOptions: ['Juego de granjita', 'Decoramos juntas', 'Charla con cafecito', 'Aventura relajada'], wheelOptions: ['Diseña una habitación', 'Ponle nombre a una mascota', 'Cuenta tu plan perfecto', 'Haz una recomendación cozy', 'Elige el próximo objeto', 'Inventa una mini historia'] },
  { id: 'gaming', label: 'el próximo reto gaming', pollOptions: ['Una partida cooperativa', 'Modo difícil', 'Juego indie sorpresa', 'El chat decide el juego'], wheelOptions: ['Juega una ronda sin saltar', 'Usa el objeto menos popular', 'Deja que el chat elija personaje', 'Haz la siguiente misión sin mapa', 'Prueba una estrategia absurda', 'Revancha con una regla nueva'] },
  { id: 'anime', label: 'la noche de anime', pollOptions: ['Teorías locas', 'Tier list de personajes', 'Adivina el opening', 'Recomendaciones del chat'], wheelOptions: ['Defiende a un personaje impopular', 'Inventa un opening para el canal', 'Haz una pose de protagonista', 'Crea un poder para Katsy', 'Describe un anime en tres pistas', 'El chat elige tu personaje'] },
  { id: 'comunidad', label: 'el plan de la comunidad', pollOptions: ['Jugar con seguidores', 'Noche de clips', 'Preguntas y respuestas', 'Concurso de dibujos'], wheelOptions: ['Lee un mensaje con voz épica', 'El chat inventa un apodo', 'Responde una pregunta sorpresa', 'Recrea un momento del canal', 'Agradece a una estrella del chat', 'Propón el siguiente juego'] },
  { id: 'lore', label: 'el lore de Jatsi y Katsy', pollOptions: ['Una historia de Jatsi', 'Un secreto de Katsy', 'Crossover inesperado', 'Que el chat escriba el final'], wheelOptions: ['Inventa un planeta nuevo', 'Cuenta un recuerdo del portal', 'Crea un villano para el lore', 'El chat elige el siguiente capítulo', 'Ponle nombre a una constelación', 'Improvisa un final dramático'] },
  { id: 'clips', label: 'la noche de clips', pollOptions: ['Fails legendarios', 'Momentos tiernos', 'Reacciones inesperadas', 'Clips enviados por el chat'], wheelOptions: ['Recrea un fail famoso', 'Ponle narración de documental', 'Inventa un título para el clip', 'El chat escoge la siguiente reacción', 'Haz una predicción antes de verlo', 'Cuenta el detrás de cámaras'] },
  { id: 'roleplay', label: 'la aventura de rol', pollOptions: ['Misterio detectivesco', 'Fantasía mágica', 'Comedia caótica', 'Ciencia ficción'], wheelOptions: ['Interpreta a una villana elegante', 'Crea un hechizo en vivo', 'Habla como NPC por una ronda', 'Deja que el chat elija tu misión', 'Inventa un objeto legendario', 'Improvisa una escena de escape'] },
  { id: 'vtuber', label: 'el especial VTuber', pollOptions: ['Preguntas del chat', 'Dibujo de avatar', 'Mímica de emociones', 'Historias del modelo'], wheelOptions: ['Haz una pose de victoria', 'Imita una expresión del avatar', 'Inventa un accesorio nuevo', 'Cuenta un dato del modelo', 'El chat elige una emoción', 'Describe tu avatar como jefa final'] },
  { id: 'musica', label: 'la sesión musical', pollOptions: ['Adivina la canción', 'Opening de anime', 'Playlist del chat', 'Karaoke de broma'], wheelOptions: ['Tararea una canción para adivinar', 'Inventa una letra para el canal', 'Haz una entrada de estrella pop', 'El chat elige el siguiente género', 'Describe una canción sin nombrarla', 'Dedica una melodía al chat'] },
  { id: 'preguntas', label: 'la charla de preguntas', pollOptions: ['Preguntas divertidas', 'Historias vergonzosas', 'Metas de la comunidad', 'Confesiones ligeras'], wheelOptions: ['Responde con una sola palabra', 'Cuenta una anécdota en un minuto', 'Deja que el chat haga una pregunta', 'Responde como Katsy', 'Responde como Jatsi', 'Inventa una pregunta para el chat'] },
  { id: 'competencia', label: 'el torneo amistoso', pollOptions: ['Duelo Jatsi contra Katsy', 'Reto por equipos', 'Chat contra streamer', 'Mini campeonato sorpresa'], wheelOptions: ['Juega la siguiente ronda con handicap', 'El chat elige tu rival', 'Celebra como campeona', 'Haz una revancha relámpago', 'Ponle nombre al torneo', 'Predice quién gana la próxima ronda'] },
  { id: 'navidad', label: 'el especial de invierno', pollOptions: ['Juego cozy', 'Terror bajo cobija', 'Historias de invierno', 'Reto navideño con el chat'], wheelOptions: ['Saluda como duende', 'Cuenta un recuerdo bonito', 'Elige un reto bajo el árbol', 'Haz una pose de postal', 'Inventa un regalo para el chat', 'Brinda virtualmente con la comunidad'] }
];
const pollFormats = [
  { id: 'plan', question: topic => `¿Qué hacemos en ${topic.label}?`, wheelTitle: topic => `Ruleta: ${topic.label}`, prefix: '' },
  { id: 'mood', question: topic => `¿Con qué mood abrimos ${topic.label}?`, wheelTitle: topic => `Reto relámpago: ${topic.label}`, prefix: 'En 30 segundos: ' },
  { id: 'community', question: topic => `¿Cómo quieres participar en ${topic.label}?`, wheelTitle: topic => `La comunidad decide: ${topic.label}`, prefix: 'Con voz de narradora: ' },
  { id: 'twist', question: topic => `¿Qué giro le ponemos a ${topic.label}?`, wheelTitle: topic => `Giro inesperado: ${topic.label}`, prefix: 'Con una regla inventada por el chat: ' }
];
const pollAlternatives = [
  ['Caos y risas', 'Misterio y sustos', 'Relajarnos juntas', 'Competencia intensa'],
  ['El chat escoge el reto', 'Jugamos en equipo', 'Votamos por rondas', 'Sorpresa al final'],
  ['Cambio de reglas', 'Ruleta sorpresa', 'Crossover Jatsi × Katsy', 'Final elegido por el chat']
];
const planCatalog = topics.flatMap(topic => pollFormats.map((format, index) => ({
  id: `${topic.id}-${format.id}`,
  poll: { title: format.question(topic), options: index === 0 ? topic.pollOptions : pollAlternatives[index - 1] },
  wheel: { title: format.wheelTitle(topic), options: topic.wheelOptions.map(option => `${format.prefix}${option}`) }
})));
let plan;
let entries;
async function supabaseRequest(path, init = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      ...(init.body instanceof Uint8Array ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers
    }
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase devolvió ${response.status}: ${body.slice(0, 600)}`);
  return body ? JSON.parse(body) : null;
}

async function loadWeeklyHistory() {
  const activities = [];
  for (let offset = 0; ; offset += 1000) {
    const query = new URLSearchParams({
      select: 'slug,config',
      'slug': 'like.jatsi-semana-*',
      limit: '1000',
      offset: String(offset)
    });
    const batch = await supabaseRequest(`/rest/v1/activities?${query}`);
    activities.push(...batch);
    if (batch.length < 1000) return activities;
  }
}

const weeklyHistory = (await loadWeeklyHistory()).filter(activity => activity.config?.campaign === 'weekly');
const weekPollSlug = `jatsi-semana-${safeWeek}-encuesta`;
const alreadyThisWeek = weeklyHistory.find(activity => activity.slug === weekPollSlug)?.config?.plan_id;
const usedPlanIds = new Set(weeklyHistory.map(activity => activity.config?.plan_id).filter(Boolean));
plan = planCatalog.find(candidate => candidate.id === alreadyThisWeek)
  || planCatalog.find(candidate => !usedPlanIds.has(candidate.id));
if (!plan) {
  throw new Error(`Se agotaron las ${planCatalog.length} ideas semanales sin repetir. No se activó ni publicó nada; agrega nuevas ideas al catálogo antes de la siguiente rotación.`);
}
entries = [
  {
    slug: weekPollSlug, type: 'poll', title: plan.poll.title,
    description: 'La comunidad decide el próximo plan de Jatsi y Katsy. Vota y ayúdanos a abrir la siguiente aventura.',
    config: { options: plan.poll.options, campaign: 'weekly', plan_id: plan.id, week: weekKey }
  },
  {
    slug: `jatsi-semana-${safeWeek}-ruleta`, type: 'wheel', title: plan.wheel.title,
    description: 'Gira la ruleta: el chat propone el destino y Jatsi o Katsy acepta el reto en directo.',
    config: { options: plan.wheel.options, campaign: 'weekly', plan_id: plan.id, week: weekKey }
  }
];
async function publishStoryImage() {
  const svg = makeStorySvg(plan.poll.title, plan.wheel.title, weekKey);
  const jpeg = await sharp(Buffer.from(svg)).resize(1080, 1920).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  const bucketName = 'weekly-ig-stories';
  const bucket = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucketName}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  });
  if (bucket.status === 404) {
    const create = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: bucketName, public: true, file_size_limit: 5242880, allowed_mime_types: ['image/jpeg'] })
    });
    if (!create.ok && create.status !== 409) throw new Error(`No se pudo crear el espacio de imágenes (${create.status}).`);
  } else if (!bucket.ok) {
    throw new Error(`No se pudo revisar el espacio de imágenes (${bucket.status}).`);
  } else {
    const details = await bucket.json();
    if (!details.public) throw new Error(`El espacio ${bucketName} ya existe, pero no es público. Cambia su acceso a público en Supabase Storage.`);
  }
  const objectPath = `activity-${safeWeek}.jpg`;
  const upload = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${objectPath}`, {
    method: 'PUT',
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: jpeg
  });
  if (!upload.ok) throw new Error(`No se pudo subir la imagen de Instagram (${upload.status}).`);
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${objectPath}`;
}

function makeStorySvg(pollTitle, wheelTitle, week) {
  const xml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
  const wrap = (value, max = 29) => {
    const words = value.split(/\s+/); const lines = []; let line = '';
    for (const word of words) {
      if ((line + ' ' + word).trim().length > max && line) { lines.push(line); line = word; }
      else line = (line + ' ' + word).trim();
    }
    if (line) lines.push(line);
    return lines.slice(0, 3);
  };
  const pollLines = wrap(pollTitle);
  const wheelLines = wrap(wheelTitle, 35);
  const textLines = (lines, x, y, size, fill, weight = 600) => lines.map((line, index) => `<text x="${x}" y="${y + index * (size + 12)}" font-size="${size}" font-weight="${weight}" fill="${fill}">${xml(line)}</text>`).join('');
  const stars = Array.from({ length: 34 }, (_, index) => {
    const x = (index * 277 + 71) % 1000 + 40; const y = (index * 619 + 83) % 1750 + 45;
    const r = index % 7 === 0 ? 3.3 : 1.5;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${index % 3 === 0 ? '#8cecff' : '#f2d5ff'}" opacity="${index % 7 === 0 ? '.75' : '.37'}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#160d2c"/><stop offset=".53" stop-color="#291642"/><stop offset="1" stop-color="#0d1c35"/></linearGradient><radialGradient id="glow"><stop stop-color="#a76dff" stop-opacity=".55"/><stop offset="1" stop-color="#a76dff" stop-opacity="0"/></radialGradient><linearGradient id="card" x2="1" y2="1"><stop stop-color="#ffffff" stop-opacity=".13"/><stop offset="1" stop-color="#ffffff" stop-opacity=".035"/></linearGradient><linearGradient id="accent"><stop stop-color="#ffb7df"/><stop offset="1" stop-color="#9aeaff"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#bg)"/><circle cx="820" cy="390" r="560" fill="url(#glow)"/><circle cx="180" cy="1430" r="500" fill="url(#glow)" opacity=".55"/>${stars}<rect x="55" y="62" width="970" height="1796" rx="46" fill="none" stroke="#e9d9ff" stroke-opacity=".17"/><g font-family="Arial, sans-serif"><text x="100" y="160" fill="#aeeeff" font-size="24" letter-spacing="7" font-weight="700">JATSI × KATSY</text><text x="100" y="246" fill="#ffdaec" font-size="20" letter-spacing="5">${xml(week)} · PORTAL SEMANAL</text><text x="100" y="398" fill="#fff7ff" font-size="82" font-weight="800" letter-spacing="-3">ACTIVIDADES</text><text x="100" y="493" fill="url(#accent)" font-size="82" font-weight="800" letter-spacing="-3">NUEVAS ✦</text><text x="100" y="570" fill="#b9aecb" font-size="27">La comunidad elige la próxima aventura.</text><rect x="84" y="668" width="912" height="496" rx="32" fill="url(#card)" stroke="#d9c8f5" stroke-opacity=".28"/><rect x="122" y="713" width="268" height="49" rx="24" fill="#71e5f4" fill-opacity=".13" stroke="#71e5f4" stroke-opacity=".34"/><text x="150" y="746" fill="#a5f2ff" font-size="17" font-weight="700" letter-spacing="3">01 / ENCUESTA</text>${textLines(pollLines, 128, 838, 36, '#fff4ff', 700)}<text x="128" y="1050" fill="#bbaac9" font-size="21">Tu voto ayuda a elegir el siguiente stream.</text><rect x="84" y="1205" width="912" height="385" rx="32" fill="url(#card)" stroke="#d9c8f5" stroke-opacity=".28"/><rect x="122" y="1250" width="226" height="49" rx="24" fill="#b988ff" fill-opacity=".16" stroke="#b988ff" stroke-opacity=".38"/><text x="150" y="1283" fill="#ddc4ff" font-size="17" font-weight="700" letter-spacing="3">02 / RULETA</text>${textLines(wheelLines, 128, 1375, 31, '#fff4ff', 700)}<text x="128" y="1513" fill="#bbaac9" font-size="21">Gira y deja que el cosmos decida el reto.</text><rect x="84" y="1653" width="912" height="119" rx="26" fill="url(#accent)"/><text x="540" y="1707" text-anchor="middle" fill="#251333" font-size="19" font-weight="700" letter-spacing="3">VOTA · GIRA · JUEGA CON NOSOTRAS</text><text x="540" y="1744" text-anchor="middle" fill="#251333" font-size="17">jatsi.github.io/jatsi-page · link en bio</text><text x="100" y="1814" fill="#9d91ae" font-size="16" letter-spacing="3">UNA COMUNIDAD. MUCHAS FORMAS DE JUGAR.</text></g></svg>`;
}

async function postDiscord() {
  const response = await fetch(process.env.COMMUNITY_WEBHOOK_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `✦ ¡Actividades nuevas en la página de Jatsi y Katsy! ${weekKey}`,
      allowed_mentions: { parse: [] },
      embeds: [{
        title: 'Esta semana: la comunidad decide',
        description: `**Encuesta:** ${plan.poll.title}\n\n**Dinámica:** ${plan.wheel.title}\n\nVota, gira y juega con nosotras.`,
        url: pageUrl, color: 0xb879ef,
        footer: { text: 'Jatsi × Katsy · Portal semanal' }
      }]
    })
  });
  if (!response.ok) throw new Error(`Discord no aceptó el aviso (${response.status}).`);
}

async function postInstagramStory(imageUrl) {
  const graph = `https://graph.facebook.com/${graphVersion}`;
  const form = new URLSearchParams({ media_type: 'STORIES', image_url: imageUrl, access_token: process.env.INSTAGRAM_ACCESS_TOKEN });
  const create = await fetch(`${graph}/${process.env.INSTAGRAM_USER_ID}/media`, { method: 'POST', body: form });
  const container = await create.json();
  if (!create.ok || !container.id) throw new Error(`Instagram no pudo preparar la historia (${create.status}): ${container.error?.message || 'respuesta sin identificador'}`);
  const publishForm = new URLSearchParams({ creation_id: container.id, access_token: process.env.INSTAGRAM_ACCESS_TOKEN });
  const publish = await fetch(`${graph}/${process.env.INSTAGRAM_USER_ID}/media_publish`, { method: 'POST', body: publishForm });
  const published = await publish.json();
  if (!publish.ok || !published.id) throw new Error(`Instagram no publicó la historia (${publish.status}): ${published.error?.message || 'respuesta sin identificador'}`);
}

const currentPrefix = `jatsi-semana-${safeWeek}-`;
const oldCampaigns = await supabaseRequest('/rest/v1/activities?select=id,slug&slug=like.jatsi-semana-%&is_active=eq.true');
await supabaseRequest('/rest/v1/activities?on_conflict=slug', {
  method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify(entries.map(activity => ({ ...activity, is_active: true })))
});
for (const activity of oldCampaigns.filter(item => !item.slug.startsWith(currentPrefix))) {
  await supabaseRequest(`/rest/v1/activities?id=eq.${activity.id}`, {
    method: 'PATCH', body: JSON.stringify({ is_active: false })
  });
}
const announcements = await Promise.allSettled([
  postDiscord(),
  publishStoryImage().then(postInstagramStory)
]);
const announcementErrors = announcements.filter(result => result.status === 'rejected').map(result => result.reason?.message || 'Error al anunciar.');
if (announcementErrors.length) throw new Error(`Las actividades quedaron activas para ${weekKey}, pero hubo un problema con los avisos: ${announcementErrors.join(' | ')}`);
console.log(`Semana ${weekKey}: encuesta y ruleta activadas; aviso de Discord e historia de Instagram publicados.`);
