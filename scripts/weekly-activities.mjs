const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'COMMUNITY_WEBHOOK_URL',
];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Faltan secretos requeridos: ${missing.join(', ')}. No se cambió ni publicó nada.`);

const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
  { id: 'terror', label: 'la noche de terror', pollOptions: ['Terror psicológico', 'Casa embrujada', 'Criaturas extrañas', 'Historias del chat'] },
  { id: 'cozy', label: 'el stream cozy', pollOptions: ['Juego de granjita', 'Decoramos juntas', 'Charla con cafecito', 'Aventura relajada'] },
  { id: 'gaming', label: 'el próximo reto gaming', pollOptions: ['Una partida cooperativa', 'Modo difícil', 'Juego indie sorpresa', 'El chat decide el juego'] },
  { id: 'anime', label: 'la noche de anime', pollOptions: ['Teorías locas', 'Tier list de personajes', 'Adivina el opening', 'Recomendaciones del chat'] },
  { id: 'comunidad', label: 'el plan de la comunidad', pollOptions: ['Jugar con seguidores', 'Noche de clips', 'Preguntas y respuestas', 'Concurso de dibujos'] },
  { id: 'lore', label: 'el lore de Jatsi y Katsy', pollOptions: ['Una historia de Jatsi', 'Un secreto de Katsy', 'Crossover inesperado', 'Que el chat escriba el final'] },
  { id: 'clips', label: 'la noche de clips', pollOptions: ['Fails legendarios', 'Momentos tiernos', 'Reacciones inesperadas', 'Clips enviados por el chat'] },
  { id: 'roleplay', label: 'la aventura de rol', pollOptions: ['Misterio detectivesco', 'Fantasía mágica', 'Comedia caótica', 'Ciencia ficción'] },
  { id: 'vtuber', label: 'el especial VTuber', pollOptions: ['Preguntas del chat', 'Dibujo de avatar', 'Mímica de emociones', 'Historias del modelo'] },
  { id: 'musica', label: 'la sesión musical', pollOptions: ['Adivina la canción', 'Opening de anime', 'Playlist del chat', 'Karaoke de broma'] },
  { id: 'preguntas', label: 'la charla de preguntas', pollOptions: ['Preguntas divertidas', 'Historias vergonzosas', 'Metas de la comunidad', 'Confesiones ligeras'] },
  { id: 'competencia', label: 'el torneo amistoso', pollOptions: ['Duelo Jatsi contra Katsy', 'Reto por equipos', 'Chat contra streamer', 'Mini campeonato sorpresa'] },
  { id: 'navidad', label: 'el especial de invierno', pollOptions: ['Juego cozy', 'Terror bajo cobija', 'Historias de invierno', 'Reto navideño con el chat'] },
  { id: 'arte', label: 'el taller de arte del chat', pollOptions: ['Dibujar un avatar', 'Diseñar una criatura', 'Hacer fanart en directo', 'Crear un emote nuevo'] },
  { id: 'speedrun', label: 'el speedrun amistoso', pollOptions: ['Récord contrarreloj', 'Ruta sin atajos', 'Reto con una mano', 'Carrera contra el chat'] },
  { id: 'cocina', label: 'la charla de snacks', pollOptions: ['Dulce favorito', 'Snack de madrugada', 'Comida de comfort', 'Receta imposible'] },
  { id: 'moda', label: 'el look del avatar', pollOptions: ['Outfit elegante', 'Pijama cozy', 'Estilo fantasía', 'Accesorio sorpresa'] },
  { id: 'backstage', label: 'los momentos detrás de cámaras', pollOptions: ['Preparativos del directo', 'Fails técnicos', 'Historias del modelo', 'Rutina antes del stream'] },
  { id: 'misterio', label: 'el misterio del portal', pollOptions: ['Pista escondida', 'Acertijo del chat', 'Objeto misterioso', 'Final detectivesco'] },
  { id: 'viajes', label: 'el viaje imaginario', pollOptions: ['Ciudad de fantasía', 'Isla tranquila', 'Museo extraño', 'Plan de carretera'] }
];
const pollFormats = [
  { id: 'plan', question: topic => `¿Qué hacemos en ${topic.label}?`, wheelTitle: topic => `Ruleta: ${topic.label}`, prefix: '', chismeTitle: topic => `Chismógrafo de confesiones · ${topic.label}`, chismeQuestions: topic => [`¿Qué gusto culposo tuyo combina con ${topic.label}?`, `¿Qué anécdota graciosa tuya recuerdas sobre ${topic.label}?`, `¿Qué opinión inofensiva defenderías sobre ${topic.label}?`] },
  { id: 'mood', question: topic => `¿Con qué mood abrimos ${topic.label}?`, wheelTitle: topic => `Reto relámpago: ${topic.label}`, prefix: 'En 30 segundos: ', chismeTitle: topic => `Chismógrafo de moods · ${topic.label}`, chismeQuestions: topic => [`¿Qué mood secreto eliges para ${topic.label}?`, `¿Qué detalle pequeño te emociona de ${topic.label}?`, `¿Qué momento de ${topic.label} te hace reír?`] },
  { id: 'community', question: topic => `¿Cómo quieres participar en ${topic.label}?`, wheelTitle: topic => `La comunidad decide: ${topic.label}`, prefix: 'Con voz de narradora: ', chismeTitle: topic => `Chismógrafo del chat · ${topic.label}`, chismeQuestions: topic => [`¿Qué propuesta del chat te gustaría ver en ${topic.label}?`, `¿Qué rol elegirías para ti en ${topic.label}?`, `¿Qué pregunta divertida le harías al chat sobre ${topic.label}?`] },
  { id: 'twist', question: topic => `¿Qué giro le ponemos a ${topic.label}?`, wheelTitle: topic => `Giro inesperado: ${topic.label}`, prefix: 'Con una regla inventada por el chat: ', chismeTitle: topic => `Chismógrafo de giros · ${topic.label}`, chismeQuestions: topic => [`¿Qué giro inesperado te gustaría para ${topic.label}?`, `¿Qué regla inventada probarías en ${topic.label}?`, `¿Qué final caótico te imaginas para ${topic.label}?`] },
  { id: 'story', question: topic => `¿Qué historia contamos en ${topic.label}?`, wheelTitle: topic => `Historia improvisada: ${topic.label}`, prefix: 'En modo personaje: ', chismeTitle: topic => `Chismógrafo de historias · ${topic.label}`, chismeQuestions: topic => [`¿Qué personaje ficticio serías en ${topic.label}?`, `¿Qué escena divertida inventarías para ${topic.label}?`, `¿Qué título dramático tendría tu historia de ${topic.label}?`] },
  { id: 'prediction', question: topic => `¿Qué predicción hacemos sobre ${topic.label}?`, wheelTitle: topic => `Apuesta amistosa: ${topic.label}`, prefix: 'Narrado como torneo: ', chismeTitle: topic => `Chismógrafo de predicciones · ${topic.label}`, chismeQuestions: topic => [`¿Qué crees que saldrá inesperadamente bien en ${topic.label}?`, `¿Qué predicción graciosa haces sobre ${topic.label}?`, `¿Qué detalle crees que sorprenderá más en ${topic.label}?`] },
  { id: 'combo', question: topic => `¿Qué mezcla probamos en ${topic.label}?`, wheelTitle: topic => `Combo inesperado: ${topic.label}`, prefix: 'Como misión secundaria: ', chismeTitle: topic => `Chismógrafo de combos · ${topic.label}`, chismeQuestions: topic => [`¿Qué dos ideas mezclarías en ${topic.label}?`, `¿Qué crossover ficticio quedaría perfecto con ${topic.label}?`, `¿Qué combinación rara sí te atreverías a probar en ${topic.label}?`] },
  { id: 'finale', question: topic => `¿Cómo cerramos ${topic.label}?`, wheelTitle: topic => `Final sorpresa: ${topic.label}`, prefix: 'Solo tienes una oportunidad: ', chismeTitle: topic => `Chismógrafo final · ${topic.label}`, chismeQuestions: topic => [`¿Qué momento te gustaría repetir de ${topic.label}?`, `¿Qué detalle debería quedarse para la próxima de ${topic.label}?`, `¿Qué frase resumiría tu experiencia con ${topic.label}?`] }
];
const pollAlternatives = [
  ['Caos y risas', 'Misterio y sustos', 'Relajarnos juntas', 'Competencia intensa'],
  ['El chat escoge el reto', 'Jugamos en equipo', 'Votamos por rondas', 'Sorpresa al final'],
  ['Cambio de reglas', 'Ruleta sorpresa', 'Crossover Jatsi × Katsy', 'Final elegido por el chat'],
  ['Confesión divertida', 'Predicción inesperada', 'Opinión impopular', 'Reto exprés'],
  ['Jatsi se sorprende', 'Katsy se ríe', 'El chat cambia el plan', 'Final inesperado'],
  ['Modo detective', 'Modo improvisación', 'Modo equipo', 'Modo caos'],
  ['Final tierno', 'Final caótico', 'Final misterioso', 'Que decida el chat']
];
const wheelChallenges = [
  'Cuenta una anécdota vergonzosa, pero apta para todo público',
  'Di un trabalenguas tres veces, cada vez más rápido',
  'Narra tu siguiente jugada como final de telenovela',
  'Haz una pose dramática de victoria durante cinco segundos',
  'Inventa una excusa absurda para llegar tarde a una misión',
  'Canta una frase inventada con voz de estrella de ópera',
  'Intenta no reír mientras el chat te cuenta un chiste malo',
  'Presenta un objeto cercano como si fuera un premio legendario',
  'Describe tu snack favorito como crítica gastronómica elegante',
  'Improvisa un discurso de agradecimiento por ganar una partida',
  'Cuenta tu fail más inocente con lujo de suspenso',
  'Haz una caminata de pasarela como si entraras a una final',
  'Inventa un comercial de diez segundos para una papa',
  'Explica una regla del juego usando solo tres palabras',
  'Di tu frase más dramática mirando a cámara',
  'Haz una celebración exagerada por una victoria imaginaria',
  'Improvisa un trabalenguas con tres palabras que elija el chat',
  'Describe tu día como si fuera el tráiler de una película',
  'Haz una reverencia solemne a tu objeto más cercano',
  'Inventa un nombre ridículo para tu próxima estrategia',
  'Cuenta una mini historia de terror sobre perder la partida',
  'Lee la siguiente frase como narradora de documental',
  'Responde la siguiente pregunta con una rima improvisada',
  'Haz una cara de sorpresa y mantenla durante cinco segundos'
];
const planCatalog = topics.flatMap((topic, topicIndex) => pollFormats.map((format, formatIndex) => ({
  id: `${topic.id}-${format.id}`,
  poll: { title: format.question(topic), options: formatIndex === 0 ? topic.pollOptions : pollAlternatives[formatIndex - 1] },
  wheel: { title: format.wheelTitle(topic), options: Array.from({ length: 6 }, (_, index) => `${format.prefix}${wheelChallenges[(topicIndex * 5 + index) % wheelChallenges.length]}`) },
  chismografo: { title: format.chismeTitle(topic.label), questions: format.chismeQuestions(topic.label) }
})));
if (planCatalog.length !== 160) throw new Error(`El catálogo debe tener 160 combinaciones; tiene ${planCatalog.length}.`);
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
    description: 'Jatsi gira esta ruleta en directo. Los retos son generales, graciosos y siempre de buen rollo.',
    config: { options: plan.wheel.options, host_only: true, campaign: 'weekly', plan_id: plan.id, week: weekKey }
  },
  {
    slug: `jatsi-semana-${safeWeek}-chismografo`, type: 'question', title: plan.chismografo.title,
    description: 'Responde preguntas ligeras sobre tus gustos y el contenido. Evita compartir secretos o datos privados de otras personas.',
    config: { form_type: 'chismografo', questions: plan.chismografo.questions, campaign: 'weekly', plan_id: plan.id, week: weekKey }
  }
];
const birthdayActivity = {
  slug: 'cumpleanos-del-portal', type: 'question', title: 'Cumpleaños del portal',
  description: 'Comparte solo el día y el mes. Si aceptas, publicaremos tu alias y fecha en el Discord de la comunidad.',
  config: { form_type: 'birthday' }, is_active: true
};
const baseWheel = {
  slug: 'ruleta-cosmica', type: 'wheel', title: 'Ruleta del directo',
  description: 'Jatsi gira la ruleta en directo y acepta un reto general, gracioso y de buen rollo.',
  config: { options: wheelChallenges.slice(0, 6), host_only: true }, is_active: true
};
async function postDiscord() {
  const response = await fetch(process.env.COMMUNITY_WEBHOOK_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `✦ ¡Actividades nuevas en la página de Jatsi y Katsy! ${weekKey}`,
      allowed_mentions: { parse: [] },
      embeds: [{
        title: 'Esta semana: la comunidad decide',
        description: `**Encuesta:** ${plan.poll.title}\n\n**Dinámica:** ${plan.wheel.title}\n\n**Chismógrafo:** ${plan.chismografo.title}\n\nVota, gira y participa con nosotras.`,
        url: pageUrl, color: 0xb879ef,
        footer: { text: 'Jatsi × Katsy · Portal semanal' }
      }]
    })
  });
  if (!response.ok) throw new Error(`Discord no aceptó el aviso (${response.status}).`);
}

const currentPrefix = `jatsi-semana-${safeWeek}-`;
const oldCampaigns = await supabaseRequest('/rest/v1/activities?select=id,slug&slug=like.jatsi-semana-%&is_active=eq.true');
const activeSurveys = await supabaseRequest('/rest/v1/activities?select=id,slug,type,config&type=in.(poll,question)&is_active=eq.true');
await supabaseRequest('/rest/v1/activities?on_conflict=slug', {
  method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify([baseWheel])
});
await supabaseRequest('/rest/v1/activities?on_conflict=slug', {
  method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify(entries.map(activity => ({ ...activity, is_active: true })))
});
await supabaseRequest('/rest/v1/activities?on_conflict=slug', {
  method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
  body: JSON.stringify([birthdayActivity])
});
for (const activity of activeSurveys.filter(item => item.slug !== weekPollSlug && (item.type === 'poll' || (item.type === 'question' && Array.isArray(item.config?.options))))) {
  await supabaseRequest(`/rest/v1/activities?id=eq.${activity.id}`, {
    method: 'PATCH', body: JSON.stringify({ is_active: false })
  });
}
for (const activity of oldCampaigns.filter(item => !item.slug.startsWith(currentPrefix))) {
  await supabaseRequest(`/rest/v1/activities?id=eq.${activity.id}`, {
    method: 'PATCH', body: JSON.stringify({ is_active: false })
  });
}
await postDiscord();
console.log(`Semana ${weekKey}: encuesta única, ruleta para Jatsi y chismógrafo activados; aviso publicado en Discord.`);
