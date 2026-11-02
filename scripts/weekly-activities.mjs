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
  { id: 'navidad', label: 'el especial de invierno', pollOptions: ['Juego cozy', 'Terror bajo cobija', 'Historias de invierno', 'Reto navideño con el chat'], wheelOptions: ['Saluda como duende', 'Cuenta un recuerdo bonito', 'Elige un reto bajo el árbol', 'Haz una pose de postal', 'Inventa un regalo para el chat', 'Brinda virtualmente con la comunidad'] },
  { id: 'arte', label: 'el taller de arte del chat', pollOptions: ['Dibujar un avatar', 'Diseñar una criatura', 'Hacer fanart en directo', 'Crear un emote nuevo'], wheelOptions: ['Dibuja con la mano no dominante', 'Inventa un emote en 30 segundos', 'Ponle nombre a una criatura', 'El chat elige tres colores', 'Haz un boceto a ciegas', 'Describe tu obra como museo'] },
  { id: 'speedrun', label: 'el speedrun amistoso', pollOptions: ['Récord contrarreloj', 'Ruta sin atajos', 'Reto con una mano', 'Carrera contra el chat'], wheelOptions: ['Intenta la ruta más segura', 'Juega una ronda sin correr', 'El chat elige tu equipo', 'Repite el nivel con reto', 'Haz una predicción de tiempo', 'Celebra cualquier récord'] },
  { id: 'cocina', label: 'la charla de snacks', pollOptions: ['Dulce favorito', 'Snack de madrugada', 'Comida de comfort', 'Receta imposible'], wheelOptions: ['Inventa un snack para Jatsi', 'Describe tu antojo en tres pistas', 'El chat mezcla dos sabores', 'Ponle nombre a una receta', 'Defiende una combinación rara', 'Elige el snack del próximo stream'] },
  { id: 'moda', label: 'el look del avatar', pollOptions: ['Outfit elegante', 'Pijama cozy', 'Estilo fantasía', 'Accesorio sorpresa'], wheelOptions: ['Diseña un accesorio para Katsy', 'Elige un color para Jatsi', 'Inventa un outfit de villana', 'Combina dos estilos al azar', 'Describe un look de gala', 'El chat elige el detalle final'] },
  { id: 'backstage', label: 'los momentos detrás de cámaras', pollOptions: ['Preparativos del directo', 'Fails técnicos', 'Historias del modelo', 'Rutina antes del stream'], wheelOptions: ['Cuenta un fail inofensivo', 'Describe tu ritual pre-stream', 'Inventa un nombre para el backstage', 'Recrea una reacción del directo', 'El chat propone una pregunta', 'Comparte un detalle del setup'] },
  { id: 'misterio', label: 'el misterio del portal', pollOptions: ['Pista escondida', 'Acertijo del chat', 'Objeto misterioso', 'Final detectivesco'], wheelOptions: ['Inventa una pista falsa divertida', 'Describe un objeto en clave', 'El chat elige al sospechoso ficticio', 'Resuelve una adivinanza', 'Crea una contraseña cósmica', 'Narra la revelación final'] },
  { id: 'viajes', label: 'el viaje imaginario', pollOptions: ['Ciudad de fantasía', 'Isla tranquila', 'Museo extraño', 'Plan de carretera'], wheelOptions: ['Inventa un destino para el chat', 'Elige un souvenir absurdo', 'Describe un viaje en tres emojis', 'Ponle nombre a una nave', 'El chat escoge la parada', 'Cuenta una aventura ficticia'] }
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
const planCatalog = topics.flatMap((topic, topicIndex) => pollFormats.map((format, formatIndex) => ({
  id: `${topic.id}-${format.id}`,
  poll: { title: format.question(topic), options: formatIndex === 0 ? topic.pollOptions : pollAlternatives[formatIndex - 1] },
  wheel: { title: format.wheelTitle(topic), options: topic.wheelOptions.map(option => `${format.prefix}${option}`) },
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
    description: 'Gira la ruleta: el chat propone el destino y Jatsi o Katsy acepta el reto en directo.',
    config: { options: plan.wheel.options, campaign: 'weekly', plan_id: plan.id, week: weekKey }
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
await supabaseRequest('/rest/v1/activities?on_conflict=slug', {
  method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify(entries.map(activity => ({ ...activity, is_active: true })))
});
await supabaseRequest('/rest/v1/activities?on_conflict=slug', {
  method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
  body: JSON.stringify([birthdayActivity])
});
for (const activity of oldCampaigns.filter(item => !item.slug.startsWith(currentPrefix))) {
  await supabaseRequest(`/rest/v1/activities?id=eq.${activity.id}`, {
    method: 'PATCH', body: JSON.stringify({ is_active: false })
  });
}
await postDiscord();
console.log(`Semana ${weekKey}: encuesta, ruleta y chismógrafo activados; aviso publicado en Discord.`);
