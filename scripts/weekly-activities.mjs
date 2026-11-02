import sharp from 'sharp';

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DISCORD_WEBHOOK_URL',
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

const seasons = [
  {
    poll: { title: '¿Qué aventura abrimos en el próximo directo?', options: ['Noche de terror', 'Un juego cozy', 'Gaming con la comunidad', 'Charla y confesiones'] },
    wheel: { title: 'Reto cósmico de la semana', options: ['Hablar como NPC', 'Jugar sin saltar', 'El chat elige mi outfit', 'Imitar a mi personaje favorito', 'Contar una anécdota', 'Una ronda con los ojos cerrados'] }
  },
  {
    poll: { title: '¿Qué mood quieres para el stream?', options: ['Caos y risas', 'Misterio y sustos', 'Relajarnos juntas', 'Competencia intensa'] },
    wheel: { title: 'La comunidad pone el reto', options: ['No reír por un minuto', 'Narrar como documental', 'Ronda con una mano', 'Inventar una historia', 'Hacer una voz nueva', 'Chat elige la dificultad'] }
  },
  {
    poll: { title: '¿Qué formato hacemos esta semana?', options: ['Tier list inesperada', 'Probamos algo nuevo', 'Q&A estelar', 'Reto de la comunidad'] },
    wheel: { title: 'Desafío para el siguiente directo', options: ['Leer el chat con voz dramática', 'Elegir juego al azar', 'Ronda sin curarse', 'Agradecer a una estrella del chat', 'Improvisar una canción', 'Modo difícil'] }
  },
  {
    poll: { title: '¿Con quién te unes a la próxima aventura?', options: ['Jatsi en modo caos', 'Katsy en modo cozy', 'Las dos en crossover', 'Que el chat decida'] },
    wheel: { title: 'Gira y cumple el destino', options: ['Bailecito de victoria', 'Imitar a Katsy', 'Imitar a Jatsi', 'Compartir un dato random', 'Hacer una pose épica', 'Chat elige el reto'] }
  },
  {
    poll: { title: 'Elige el próximo universo', options: ['Terror psicológico', 'Fantasía y magia', 'Anime y teorías', 'Indies raritos'] },
    wheel: { title: 'Una misión nueva', options: ['Prohibido decir “no”', 'Una ronda sin mapa', 'Usar un objeto inútil', 'Voz de villana', 'Chat decide la ruta', 'Revancha obligatoria'] }
  },
  {
    poll: { title: '¿Qué hacemos juntas en comunidad?', options: ['Juego cooperativo', 'Historias del chat', 'Noche de clips', 'Concurso de dibujos'] },
    wheel: { title: 'Reto para compartir', options: ['Chat escoge mi personaje', 'Inventar un apodo cósmico', 'Leer un mensaje bonito', 'Reto sin correr', 'Mini trivia VTuber', 'Todos eligen el juego'] }
  },
  {
    poll: { title: '¿Qué merece un especial?', options: ['Juegos que dan miedo', 'Fails y momentos', 'Preguntas atrevidas', 'Una sorpresa para el chat'] },
    wheel: { title: 'Especial sorpresa', options: ['Repetir el último reto', 'Una ronda con handicap', 'Contar el peor fail', 'Hacer una voz tierna', 'Chat pone una regla', 'Sorpresa del cosmos'] }
  },
  {
    poll: { title: '¿Qué quieres ver más en Jatsi y Katsy?', options: ['Clips divertidos', 'Directos relajados', 'Retos del chat', 'Historias y lore'] },
    wheel: { title: 'El chat escribe el guion', options: ['El chat elige mi saludo', 'Modo narradora', 'Una ronda con reto', 'Compartir un recuerdo', 'Elegir el siguiente juego', 'Final dramático'] }
  }
];

const christmas = [
  {
    poll: { title: '¿Qué especial navideño hacemos juntas?', options: ['Juegos cozy', 'Noche de terror', 'Intercambio de historias', 'Reto con el chat'] },
    wheel: { title: 'Ruleta de retos navideños', options: ['Saludo de duende', 'Contar un recuerdo bonito', 'Elegir canción festiva', 'Imitar a un reno', 'Pose de postal', 'Chat decide el reto'] }
  },
  {
    poll: { title: '¿Qué regalo de stream te gustaría?', options: ['Q&A navideño', 'Juegos con seguidores', 'Reacción a clips', 'Un directo sorpresa'] },
    wheel: { title: 'Sorpresa bajo el árbol', options: ['Una ronda cozy', 'Reto sin reír', 'Mensaje bonito para el chat', 'Voz de personaje', 'El chat elige el juego', 'Regalo sorpresa'] }
  },
  {
    poll: { title: '¿Con qué cerramos el año?', options: ['Maratón de juegos', 'Recuerdos del año', 'Noche de comunidad', 'Metas para el próximo'] },
    wheel: { title: 'Última ruleta del año', options: ['Agradecer al chat', 'Elegir el primer juego del año', 'Recordar un fail', 'Brindis virtual', 'Reto final', 'Deseo para la comunidad'] }
  },
  {
    poll: { title: '¿Cuál sería tu plan perfecto de invierno?', options: ['Juego cozy', 'Terror bajo cobija', 'Chocolate y charla', 'Reto de temporada'] },
    wheel: { title: 'Un reto calentito', options: ['Voz de duende', 'Contar una anécdota', 'Jugar con una regla nueva', 'Leer el chat como poema', 'Pose invernal', 'Sorpresa del cosmos'] }
  }
];

const plan = month === 12 ? christmas[(isoWeek - 1) % christmas.length] : seasons[(isoWeek - 1) % seasons.length];
const entries = [
  {
    slug: `jatsi-semana-${safeWeek}-encuesta`, type: 'poll', title: plan.poll.title,
    description: 'La comunidad decide el próximo plan de Jatsi y Katsy. Vota y ayúdanos a abrir la siguiente aventura.',
    config: { options: plan.poll.options, campaign: 'weekly', week: weekKey }
  },
  {
    slug: `jatsi-semana-${safeWeek}-ruleta`, type: 'wheel', title: plan.wheel.title,
    description: 'Gira la ruleta: el chat propone el destino y Jatsi o Katsy acepta el reto en directo.',
    config: { options: plan.wheel.options, campaign: 'weekly', week: weekKey }
  }
];

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
  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
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
