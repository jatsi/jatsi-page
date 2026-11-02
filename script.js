const {
  SUPABASE_URL = '',
  SUPABASE_PUBLISHABLE_KEY = ''
} = window.JATSI_CONFIG || {};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const configured = Boolean(
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  !SUPABASE_URL.includes('TU-PROYECTO') &&
  !SUPABASE_PUBLISHABLE_KEY.includes('TU-CLAVE')
);

const defaultWheelOptions = [
  'Cuenta una anécdota vergonzosa, pero apta para todo público',
  'Di un trabalenguas tres veces, cada vez más rápido',
  'Narra tu siguiente jugada como final de telenovela',
  'Haz una pose dramática de victoria durante cinco segundos',
  'Inventa una excusa absurda para llegar tarde a una misión',
  'Canta una frase inventada con voz de estrella de ópera'
];

const chismografoQuestions = [
  ['Crushes, likes y mariposas', [
    '¿Quién te gusta actualmente? Puedes decir solo una inicial o pasar.',
    '¿Te ha gustado alguien que conociste en un directo? ¿Qué te llamó la atención?',
    '¿Has conocido a alguien por TikTok y luego te cayó muy bien? Cuenta la anécdota sin nombres.',
    '¿Cuál ha sido tu crush más inesperado?',
    '¿Qué hiciste para llamar la atención de alguien que te gustaba?',
    '¿Alguna vez mandaste un mensaje y te arrepentiste al segundo?',
    '¿Te has declarado alguna vez? ¿Cómo te fue?',
    '¿Qué canción dedicarías en secreto?',
    '¿Qué green flag te conquista rapidísimo?',
    '¿Qué red flag ya no dejarías pasar?'
  ]],
  ['Exes, citas y corazones rotos', [
    '¿Has tenido ex? Sin nombres: ¿qué aprendiste de esa relación?',
    '¿Has vuelto a hablar con un ex aunque dijiste “nunca más”? Puedes pasar.',
    '¿Cuál fue tu cita más incómoda o más chistosa?',
    '¿Te han dejado en visto justo cuando más esperabas respuesta?',
    '¿Alguna vez confundiste amabilidad con coqueteo?',
    '¿Cuál fue la excusa más rara que usaste para cancelar una cita?',
    '¿Has stalkeado el perfil de un crush más de lo que admitirías?',
    '¿Cuál es tu gusto culposo en personas que te atraen?',
    '¿Qué consejo le darías a tu yo de su primer amor?',
    '¿Qué detalle romántico te daría muchísima pena recibir en público?'
  ]],
  ['Momentos de tierra trágame', [
    '¿Cuál ha sido tu momento más vergonzoso en público?',
    '¿Te has caído o tropezado justo cuando alguien te estaba viendo?',
    '¿Has saludado con emoción a alguien que no te estaba saludando?',
    '¿Cuál fue el mensaje que mandaste al chat equivocado?',
    '¿Has fingido entender un chiste y te reíste tarde?',
    '¿Qué outfit o peinado de tu pasado te da risa ahora?',
    '¿Alguna vez hablaste solo pensando que nadie te escuchaba?',
    '¿Qué mentira blanca dijiste y luego tuviste que sostener?',
    '¿Qué cosa ridícula haces cuando crees que nadie te ve?',
    '¿Qué palabra pronunciaste mal durante demasiado tiempo?'
  ]],
  ['Confesiones mañosas y travesuras', [
    '¿Alguna vez te llevaste algo pequeño que no era tuyo? Puedes responder sí/no/paso; sin detalles ni nombres.',
    '¿Alguna vez fumaste o tomaste algo? Puedes decir sí, no o paso; sin presión ni detalles.',
    '¿Qué travesura casi te cuesta que te descubrieran?',
    '¿Alguna vez culpaste a alguien más de algo que hiciste? ¿Te arrepentiste?',
    '¿Has hecho trampa en un juego de mesa o videojuego? Confiesa tu nivel de maña.',
    '¿Qué excusa inventaste para llegar tarde?',
    '¿Alguna vez revisaste un regalo antes de que te lo dieran?',
    '¿Qué secreto inocente guardaste por más tiempo del necesario?',
    '¿Cuál fue tu berrinche más absurdo?',
    '¿Qué regla rompiste de pequeña/o y hoy te da risa?'
  ]],
  ['Secretitos, gustos y comunidad', [
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
  ]]
].flatMap(([category, questions]) => questions.map(question => ({ category, question })));

const seedActivities = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'ruleta-cosmica',
    type: 'wheel',
    title: 'Ruleta del directo',
    description: 'Jatsi gira la ruleta en directo y acepta un reto general, gracioso y de buen rollo.',
    config: { options: defaultWheelOptions, host_only: true },
    is_active: true
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'proximo-stream',
    type: 'poll',
    title: '¿Qué hacemos en el próximo stream?',
    description: 'Tu voto ayuda a diseñar la siguiente aventura.',
    config: { options: ['Noche de terror', 'Tier list de anime', 'Just chatting', 'Juego con la comunidad'] },
    is_active: true
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    slug: 'buzon-secreto',
    type: 'message',
    title: 'Buzón secreto',
    description: 'Comparte una confesión, un pensamiento o algo que quieras decirle a Jatsi.',
    config: { placeholder: 'Escribe desde el corazón…', max_length: 600 },
    is_active: true
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    slug: 'esto-o-aquello',
    type: 'either',
    title: 'Esto o aquello',
    description: 'No lo pienses demasiado. Elige tu lado.',
    config: { options: ['Anime toda la noche', 'Gaming hasta el amanecer'] },
    is_active: true
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    slug: 'oraculo-katsy',
    type: 'oracle',
    title: 'Oráculo de Jatsi',
    description: 'Una señal bonita del universo, solo para ti.',
    config: { options: ['Tu ritmo también es progreso.', 'Algo bonito ya viene en camino.', 'Hoy confía en tu intuición.', 'No tienes que poder con todo a la vez.', 'Tu rareza es parte de tu luz.', 'Esa idea merece una oportunidad.'] },
    is_active: true
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    slug: 'pregunta-estelar',
    type: 'question',
    title: 'Pregunta estelar',
    description: 'Deja una pregunta para el próximo Q&A.',
    config: { placeholder: '¿Qué siempre quisiste preguntarle a Jatsi?', max_length: 400 },
    is_active: true
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    slug: 'chismografo-del-portal',
    type: 'question',
    title: 'Chismógrafo del cuaderno',
    description: 'Responde 50 preguntas personales, divertidas y opcionales en el cuaderno de la comunidad.',
    config: { form_type: 'chismografo', notebook_only: true, questions: chismografoQuestions.map(item => item.question) },
    is_active: true
  }
];

const wheelPalette = ['#a96aff', '#42caeb', '#fa75bc', '#7251dc', '#efae66', '#5fe0c3', '#ff8a72', '#9db4ff', '#f1cf5c', '#b989ff', '#69d5a9', '#ee83e7'];

const state = {
  supabase: null,
  user: null,
  profile: null,
  activities: [...seedActivities],
  adminActivities: [...seedActivities],
  interactions: [],
  dataError: '',
  authMode: 'login',
  dashboardTab: 'overview',
  analyticsRange: '30d',
  editingActivitySlug: '',
  realtimeChannel: null
};

const localKey = 'jatsi-universe-interactions';
const localActivitiesKey = 'jatsi-universe-activities';
const visitorKey = 'jatsi-universe-visitor';
const visitorId = localStorage.getItem(visitorKey) || crypto.randomUUID();
localStorage.setItem(visitorKey, visitorId);

function safeJSON(value, fallback) {
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
}

function localInteractions() {
  return safeJSON(localStorage.getItem(localKey), []);
}

function localActivities() {
  const saved = safeJSON(localStorage.getItem(localActivitiesKey), []);
  const bySlug = new Map(saved.map(item => [item.slug, item]));
  return [...seedActivities.map(item => bySlug.get(item.slug) || item), ...saved.filter(item => !seedActivities.some(seed => seed.slug === item.slug))];
}

function saveLocalActivities(activities) {
  const changed = activities.filter(item => {
    const seed = seedActivities.find(original => original.slug === item.slug);
    return !seed || JSON.stringify(seed) !== JSON.stringify(item);
  });
  localStorage.setItem(localActivitiesKey, JSON.stringify(changed));
}

function saveLocalInteraction(interaction) {
  const current = localInteractions();
  current.unshift(interaction);
  localStorage.setItem(localKey, JSON.stringify(current.slice(0, 250)));
}

function activityBySlug(slug) {
  return state.activities.find(item => item.slug === slug) || state.adminActivities.find(item => item.slug === slug);
}

function activityById(id) {
  return state.activities.find(item => item.id === id) || state.adminActivities.find(item => item.id === id);
}

function isNotebookOrHiddenActivity(activity) {
  return Boolean(activity?.config?.notebook_only || activity?.slug === 'cumpleanos-del-portal' || /^jatsi-semana-.*-chismografo$/.test(activity?.slug || ''));
}

function renderActivityCards() {
  const grid = $('#activity-grid');
  if (!grid) return;
  const available = new Set(state.activities.filter(item => !isNotebookOrHiddenActivity(item)).map(item => item.slug));
  $$('.activity-card:not([data-generated-activity])', grid).forEach(card => {
    const button = $('[data-activity]', card);
    if (button) card.hidden = !available.has(button.dataset.activity);
  });
  $$('[data-generated-activity]', grid).forEach(card => card.remove());
  const knownSlugs = new Set($$('.activity-card:not([data-generated-activity]) [data-activity]', grid).map(button => button.dataset.activity));
  state.activities.filter(item => item.is_active !== false && !isNotebookOrHiddenActivity(item) && !knownSlugs.has(item.slug)).forEach((activity, index) => {
    const card = document.createElement('article');
    card.className = 'activity-card reveal visible';
    card.dataset.generatedActivity = activity.slug;
    card.innerHTML = '<span class="card-number">' + String(knownSlugs.size + index + 1).padStart(2, '0') + '</span><div class="motion-emblem generated-activity-art"><i class="' + activityIconClass(activity.type) + '"></i><b>' + escapeHTML(activity.type.toUpperCase()) + ' · ACTIVIDAD</b></div><div class="activity-copy"><span class="activity-status">Nueva actividad</span><h3>' + escapeHTML(activity.title) + '</h3><p>' + escapeHTML(activity.description || 'Participa en esta experiencia de la comunidad.') + '</p><button class="card-action" type="button" data-activity="' + escapeHTML(activity.slug) + '">Participar <i class="iconoir-arrow-up-right"></i></button></div>';
    $('[data-activity]', card).addEventListener('click', () => renderActivity(activity));
    grid.append(card);
  });
}

function escapeHTML(value = '') {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

let toastTimer;
function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2700);
}

async function copyText(text, success = 'Enlace copiado ✦') {
  try {
    await navigator.clipboard.writeText(text);
    toast(success);
  } catch {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    toast(success);
  }
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('modal-open');
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

$$('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => {
    if (!$$('dialog[open]').length) document.body.classList.remove('modal-open');
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog(dialog);
  });
});

$$('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));

function shareActivity(activity) {
  const url = new URL(location.href);
  url.hash = '';
  url.searchParams.set('activity', activity.slug);
  copyText(url.toString(), 'Enlace listo para compartir en Discord ✦');
}

function activityIconClass(kind) {
  return ({
    message: 'iconoir-chat-bubble-empty',
    question: 'iconoir-chat-bubble-question',
    poll: 'iconoir-stats-up-square',
    either: 'iconoir-shuffle',
    wheel: 'iconoir-refresh-double',
    oracle: 'iconoir-magic-wand'
  })[kind] || 'iconoir-sparks';
}

function wheelLegend(options, className = 'wheel-legend') {
  return '<div class="' + className + '" aria-label="Color y resultado de cada espacio">' + options.map((option, index) => '<div class="wheel-key"><i style="--wheel-color:' + wheelPalette[index % wheelPalette.length] + '"></i><b>' + String(index + 1).padStart(2, '0') + '</b><span>' + escapeHTML(option) + '</span></div>').join('') + '</div>';
}

function wheelMarkup(options) {
  const count = Math.max(1, options.length);
  const step = 360 / count;
  const gradient = 'conic-gradient(from 0deg,' + options.map((_, index) => wheelPalette[index % wheelPalette.length] + ' ' + (index * step) + 'deg ' + ((index + 1) * step) + 'deg').join(',') + ')';
  const labels = options.map((_, index) => {
    const angle = (index + .5) * step - 90;
    const radians = angle * Math.PI / 180;
    const left = (50 + Math.cos(radians) * 32).toFixed(2);
    const top = (50 + Math.sin(radians) * 32).toFixed(2);
    return '<span class="wheel-label" style="left:' + left + '%;top:' + top + '%;--wheel-color:' + wheelPalette[index % wheelPalette.length] + '">' + String(index + 1).padStart(2, '0') + '</span>';
  }).join('');
  return '<div class="wheel-shell"><div class="wheel" id="active-wheel" style="--wheel-gradient:' + gradient + '">' + labels + '<span class="wheel-hub"><i class="iconoir-sparks"></i></span></div><span class="wheel-pointer" aria-label="Indicador del resultado"><i class="iconoir-arrow-left"></i></span></div>';
}

function chismografoFormMarkup(activity, intro, share) {
  const questions = chismografoQuestions.map(item => item.question);
  const groups = [...new Set(chismografoQuestions.map(item => item.category))];
  const questionMarkup = groups.map((category, categoryIndex) => {
    const indices = chismografoQuestions.map((item, index) => item.category === category ? index : -1).filter(index => index >= 0);
    const first = String(categoryIndex * 10 + 1).padStart(2, '0');
    const last = String((categoryIndex + 1) * 10).padStart(2, '0');
    return '<details class="chisme-question-group"' + (categoryIndex === 0 ? ' open' : '') + '><summary><span><i class="iconoir-book"></i>' + escapeHTML(category) + '</span><small>' + first + '—' + last + ' <b>＋</b></small></summary><div class="chisme-question-grid">' + indices.map(index => '<label class="chisme-question"><span><i class="iconoir-chat-bubble-question"></i>' + String(index + 1).padStart(2, '0') + ' / ' + escapeHTML(questions[index] || chismografoQuestions[index].question) + '</span><textarea name="answer_' + index + '" maxlength="300" placeholder="Puedes contestar o saltarla…"></textarea></label>').join('') + '</div></details>';
  }).join('');
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const zodiac = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
  const zodiacOptions = zodiac.map(sign => '<option>' + sign + '</option>').join('');
  return intro + '<div class="chisme-form-intro"><span class="chisme-form-sticker">✿</span><div><b>50 PREGUNTAS · 5 PÁGINAS DE CHISMECITO</b><p>Crushes, exes, vergüenzas y confesiones mañosas. Contesta solo las que quieras; puedes pasar cualquier pregunta.</p></div></div><form class="activity-form chisme-form" id="chisme-form"><div class="chisme-profile-card"><div class="chisme-profile-heading"><span>ANTES DE EMPEZAR</span><small>Tu información nunca sale en el mural</small></div><label class="consent-label chisme-anonymous"><input name="anonymous" type="checkbox"><span>Quiero responder anónimamente: no pedir nombre ni cumpleaños.</span></label><div class="chisme-identity-fields"><label><span><i class="iconoir-user"></i>Tu nombre o apodo</span><input name="display_name" type="text" maxlength="40" autocomplete="nickname" placeholder="¿Cómo te conoce la comunidad?" required></label><div class="chisme-birthday-fields"><div class="birthday-grid"><label><span>Mi cumpleaños <small>(opcional)</small></span><select name="day"><option value="">Día</option>' + Array.from({ length: 31 }, (_, index) => '<option value="' + (index + 1) + '">' + (index + 1) + '</option>').join('') + '</select></label><label><span>&nbsp;</span><select name="month"><option value="">Mes</option>' + months.map((month, index) => '<option value="' + (index + 1) + '">' + month + '</option>').join('') + '</select></label></div><label class="consent-label chisme-birthday-consent"><input name="announce_birthday" type="checkbox"><span>Autorizo que mi apodo y día/mes se anuncien en el Discord de la comunidad.</span></label></div></div><div class="chisme-profile-grid"><label><span>Edad <small>(opcional)</small></span><input name="age" type="number" min="1" max="120" inputmode="numeric" placeholder="Sin fecha de nacimiento"></label><label><span>Signo zodiacal <small>(opcional)</small></span><select name="zodiac"><option value="">Prefiero no decir</option>' + zodiacOptions + '</select></label></div><p class="chisme-data-note"><i class="iconoir-shield-check"></i> Edad y signo son opcionales y privados. El cumpleaños solo se envía a Discord si lo eliges y das permiso. No pedimos el año.</p></div>' + questionMarkup + '<label class="consent-label chisme-consent"><input name="allow_public" type="checkbox"><span>Autorizo que Jatsi pueda aprobar y publicar mis respuestas juntas, siempre anónimamente.</span></label><p class="message-privacy-note"><i class="iconoir-eye-closed"></i> Jatsi verá las respuestas y tu apodo solo en su panel privado. El mural nunca muestra tu nombre, edad, signo ni cumpleaños. Evita nombres reales, usuarios, datos de contacto o detalles que identifiquen a alguien.</p><button class="button button-primary" type="submit"><i class="iconoir-send-diagonal"></i> Guardar mi chismógrafo</button><p class="form-status" role="status"></p></form>' + share + '</div>';
}

function renderActivity(activity) {
  if (activity.config?.form_type === 'birthday') {
    toast('El cumpleaños ahora se comparte dentro del cuaderno del chismógrafo.');
    const notebook = activityBySlug('chismografo-del-portal');
    if (notebook) return renderActivity(notebook);
  }
  const container = $('#activity-modal-content');
  const options = activity.config?.options || [];
  const icon = activityIconClass(activity.type);
  const intro = '<div class="activity-shell"><div class="activity-modal-heading"><span><i class="' + icon + '"></i></span><div><p class="kicker">ENTRETENIMIENTO · ' + escapeHTML(activity.type) + '</p><h2>' + escapeHTML(activity.title) + '</h2></div></div><p>' + escapeHTML(activity.description || '') + '</p>';
  const share = '<div class="share-row"><button class="button button-glass" type="button" data-share-current><i class="iconoir-send-diagonal"></i> Copiar enlace para Discord</button></div>';

  if (activity.type === 'wheel') {
    const hostOnly = activity.config?.host_only === true;
    const canSpin = !hostOnly || state.profile?.role === 'admin';
    const hostNote = hostOnly && !canSpin ? '<p class="message-privacy-note"><i class="iconoir-lock"></i>Esta ruleta la gira Jatsi durante el directo. Inicia sesión con su cuenta administradora para activarla.</p>' : '';
    container.innerHTML = intro + '<div class="roulette-card"><div class="roulette-card-heading"><span><i class="iconoir-sparks"></i>RETO PARA EL DIRECTO</span><small>' + options.length + ' RETOS · HUMOR DE BUEN ROLLO</small></div><div class="wheel-stage">' + wheelMarkup(options) + '</div>' + wheelLegend(options) + hostNote + '<button class="button button-primary" id="spin-wheel" type="button" ' + (canSpin ? '' : 'disabled') + '><i class="iconoir-refresh-double"></i> ' + (hostOnly ? 'Girar en directo' : 'Girar la ruleta') + '</button><div id="activity-result"></div></div>' + share + '</div>';
    if (canSpin) $('#spin-wheel').addEventListener('click', () => spinWheel(activity));
  } else if (activity.type === 'poll' || activity.type === 'either') {
    container.innerHTML = intro + '<div class="choice-list">' + options.map((option, index) => '<button class="choice-button" type="button" data-choice="' + index + '"><i class="' + icon + '"></i><span>' + escapeHTML(option) + '</span><b>' + String(index + 1).padStart(2, '0') + '</b></button>').join('') + '</div><div id="activity-result"></div>' + share + '</div>';
    $$('[data-choice]', container).forEach(button => button.addEventListener('click', () => vote(activity, Number(button.dataset.choice), button)));
  } else if (activity.type === 'question' && activity.config?.form_type === 'chismografo') {
    container.innerHTML = chismografoFormMarkup(activity, intro, share);
    const form = $('#chisme-form');
    $('[name="anonymous"]', form).addEventListener('change', event => {
      const anonymous = event.target.checked;
      $('.chisme-identity-fields', form).hidden = anonymous;
      $('[name="display_name"]', form).required = !anonymous;
      if (anonymous) {
        $('[name="display_name"]', form).value = '';
        $('[name="day"]', form).value = '';
        $('[name="month"]', form).value = '';
        $('[name="announce_birthday"]', form).checked = false;
      }
    });
    form.addEventListener('submit', event => sendChismografo(event, activity));
  } else if (activity.type === 'question' && activity.config?.form_type === 'birthday') {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    container.innerHTML = intro + '<form class="activity-form birthday-form" id="birthday-form"><label><span><i class="iconoir-user"></i>Tu alias para Discord</span><input name="display_name" type="text" maxlength="40" autocomplete="nickname" placeholder="¿Cómo te conoce la comunidad?"></label><div class="birthday-grid"><label><span>Día</span><select name="day" required><option value="">Día</option>' + Array.from({ length: 31 }, (_, index) => '<option value="' + (index + 1) + '">' + (index + 1) + '</option>').join('') + '</select></label><label><span>Mes</span><select name="month" required><option value="">Mes</option>' + months.map((month, index) => '<option value="' + (index + 1) + '">' + month + '</option>').join('') + '</select></label></div><label class="consent-label"><input name="consent" type="checkbox" required><span>Autorizo que publiquen mi alias y mi cumpleaños (día y mes) en el servidor de Discord de la comunidad.</span></label><p class="message-privacy-note"><i class="iconoir-shield-check"></i>No pedimos ni guardamos el año de nacimiento. La publicación se procesa automáticamente en unos minutos.</p><button class="button button-primary" type="submit"><i class="iconoir-gift"></i> Compartir mi cumpleaños</button><p class="form-status" role="status"></p></form>' + share + '</div>';
    $('#birthday-form').addEventListener('submit', event => sendBirthday(event, activity));
  } else if (activity.type === 'message' || activity.type === 'question') {
    container.innerHTML = intro + '<div class="message-portal"><div class="message-portal-backdrop" aria-hidden="true"><span></span><span></span><span></span></div><div class="message-portal-envelope" aria-hidden="true"><i class="iconoir-mail"></i><span class="envelope-seal"><i class="iconoir-heart"></i></span></div><div class="message-portal-caption"><i class="iconoir-lock"></i><span>Tu señal llega a un buzón privado</span></div></div><form class="activity-form" id="message-form"><label><span><i class="iconoir-user"></i>Tu nombre <small>(opcional)</small></span><input name="display_name" type="text" maxlength="40" autocomplete="nickname" placeholder="Si quieres, firma tu mensaje"></label><label><span><i class="iconoir-edit"></i>Tu mensaje</span><textarea name="message" maxlength="' + (activity.config?.max_length || 600) + '" placeholder="' + escapeHTML(activity.config?.placeholder || 'Escribe desde el corazón…') + '" required></textarea></label><p class="message-privacy-note"><i class="iconoir-eye-closed"></i> Si dejas el nombre vacío, tu mensaje aparecerá como anónimo.</p><button class="button button-primary" type="submit"><i class="iconoir-send-diagonal"></i> Enviar al universo</button><p class="form-status" role="status"></p></form>' + share + '</div>';
    $('#message-form').addEventListener('submit', event => sendMessage(event, activity));
  } else if (activity.type === 'oracle') {
    container.innerHTML = intro + '<div class="oracle-stage" aria-hidden="true"><i class="oracle-particle p1"></i><i class="oracle-particle p2"></i><i class="oracle-particle p3"></i><div class="oracle-sigil"><i class="iconoir-magic-wand"></i><span>ORACLE / READY</span></div></div><button class="button button-primary" id="ask-oracle" type="button"><i class="iconoir-sparks"></i> Recibir mi señal</button><div id="activity-result"></div>' + share + '</div>';
    $('#ask-oracle').addEventListener('click', () => consultOracle(activity));
  }
  $('[data-share-current]', container)?.addEventListener('click', () => shareActivity(activity));
  openDialog($('#activity-modal'));
}

async function recordInteraction(activity, kind, payload) {
  const interaction = {
    id: crypto.randomUUID(),
    activity_id: activity.id,
    user_id: state.user?.id || null,
    visitor_id: visitorId,
    kind,
    payload,
    created_at: new Date().toISOString()
  };

  if (state.supabase) {
    const row = {
      activity_id: interaction.activity_id,
      user_id: interaction.user_id,
      visitor_id: interaction.visitor_id,
      kind: interaction.kind,
      payload: interaction.payload
    };
    // Anonymous visitors may insert messages, but RLS intentionally prevents
    // them from selecting interactions. Requesting .select() here made a valid
    // insert fail as soon as PostgREST tried to return the private row.
    const { error } = await state.supabase.from('interactions').insert(row);
    if (error) throw error;
    return interaction;
  }

  saveLocalInteraction(interaction);
  state.interactions.unshift(interaction);
  return interaction;
}

async function spinWheel(activity) {
  const wheel = $('#active-wheel');
  const button = $('#spin-wheel');
  if (button.disabled) return;
  button.disabled = true;
  const options = activity.config?.options || [];
  if (!options.length) {
    $('#activity-result').innerHTML = '<div class="result-card">Esta ruleta todavía no tiene opciones.</div>';
    button.disabled = false;
    return;
  }
  const index = Math.floor(Math.random() * options.length);
  const turns = 5 + Math.floor(Math.random() * 3);
  const targetAngle = (90 - ((index + .5) * (360 / options.length)) + 360) % 360;
  const currentRotation = Number(wheel.dataset.rotation || 0);
  const currentAngle = ((currentRotation % 360) + 360) % 360;
  const rotation = currentRotation + turns * 360 + ((targetAngle - currentAngle + 360) % 360);
  wheel.dataset.rotation = String(rotation);
  wheel.style.transform = 'rotate(' + rotation + 'deg)';
  setTimeout(async () => {
    const result = options[index] || 'Sorpresa del cosmos';
    const color = wheelPalette[index % wheelPalette.length];
    $('#activity-result').innerHTML = '<div class="result-card wheel-result" style="--result-color:' + color + '"><span class="wheel-result-number">' + String(index + 1).padStart(2, '0') + '</span><small>EL UNIVERSO ELIGIÓ</small><br><strong>' + escapeHTML(result) + '</strong></div>';
    try { await recordInteraction(activity, 'wheel', { result, option_index: index, color }); } catch { toast('No pudimos guardar el giro. Intenta otra vez.'); }
    button.disabled = false;
  }, prefersReducedMotion.matches ? 50 : 4350);
}

async function vote(activity, index, button) {
  $$('.choice-button', button.parentElement).forEach(item => item.disabled = true);
  button.classList.add('selected');
  const option = activity.config.options[index];
  try {
    await recordInteraction(activity, activity.type === 'either' ? 'either' : 'poll', { option, option_index: index });
    $('#activity-result').innerHTML = '<div class="result-card">Tu voto por <strong>' + escapeHTML(option) + '</strong> ya brilla en la constelación.</div>';
  } catch {
    $$('.choice-button', button.parentElement).forEach(item => item.disabled = false);
    toast('No pudimos guardar tu voto. Intenta otra vez.');
  }
}

async function sendMessage(event, activity) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = $('.form-status', form);
  const data = new FormData(form);
  const text = String(data.get('message') || '').trim();
  if (!text) return;
  status.textContent = 'Enviando entre las estrellas…';
  try {
    const displayName = String(data.get('display_name') || '').trim().slice(0, 40);
    await recordInteraction(activity, activity.type, { text, display_name: displayName || null, anonymous: !displayName });
    form.reset();
    status.textContent = state.supabase
      ? 'Mensaje enviado al buzón privado. Gracias por compartir ♡'
      : 'Guardado solo en este navegador de demostración; conecta Supabase para enviarlo al buzón de Jatsi.';
  } catch (error) {
    console.error('No se pudo guardar el mensaje del buzón:', error);
    status.textContent = writeErrorMessage(error, 'el mensaje');
  }
}

async function sendChismografo(event, activity) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const questions = chismografoQuestions.map(item => item.question);
  const answers = questions.map((question, index) => ({ question, answer: String(data.get('answer_' + index) || '').trim().slice(0, 300) })).filter(item => item.answer);
  const status = $('.form-status', form);
  if (!answers.length) { status.textContent = 'Responde al menos una pregunta para participar.'; return; }
  const anonymous = Boolean(data.get('anonymous'));
  const displayName = anonymous ? '' : String(data.get('display_name') || '').trim().slice(0, 40);
  const ageValue = String(data.get('age') || '').trim();
  const age = ageValue ? Number(ageValue) : null;
  if (age !== null && (!Number.isInteger(age) || age < 1 || age > 120)) { status.textContent = 'Escribe una edad válida o deja ese campo vacío.'; return; }
  const month = anonymous ? 0 : Number(data.get('month'));
  const day = anonymous ? 0 : Number(data.get('day'));
  const announceBirthday = !anonymous && Boolean(data.get('announce_birthday'));
  if ((day && !month) || (!day && month)) { status.textContent = 'Completa día y mes, o deja ambos sin seleccionar.'; return; }
  if (announceBirthday && (!day || !month || day > new Date(2000, month, 0).getDate())) { status.textContent = 'Para anunciarlo, elige un día y un mes válidos.'; return; }
  status.textContent = 'Guardando tus respuestas…';
  try {
    await recordInteraction(activity, 'question', { form_type: 'chismografo', answers, display_name: displayName || null, anonymous, age, zodiac: String(data.get('zodiac') || '').slice(0, 20) || null, allow_public: Boolean(data.get('allow_public')), public_status: data.get('allow_public') ? 'pending' : 'private' });
    let birthdayQueued = false;
    if (announceBirthday) {
      try {
        await recordInteraction(activity, 'question', { form_type: 'birthday', month, day, display_name: displayName, consent: true, discord_status: 'pending' });
        birthdayQueued = true;
      } catch (error) {
        console.error('No se pudo encolar el cumpleaños para Discord:', error);
      }
    }
    form.reset();
    $('.chisme-identity-fields', form).hidden = false;
    $('[name="display_name"]', form).required = true;
    $('.chisme-question-group', form)?.setAttribute('open', '');
    status.textContent = announceBirthday && !birthdayQueued
      ? 'Tus respuestas se guardaron, pero el aviso de cumpleaños no pudo registrarse. Jatsi podrá añadirlo desde el panel.'
      : state.supabase
        ? '¡Listo! Tus respuestas quedaron en el panel privado de Jatsi.' + (birthdayQueued ? ' El cumpleaños autorizado se anunciará automáticamente en Discord.' : '')
        : 'Guardado solo en este navegador de demostración; conecta Supabase para enviarlo al panel.';
  } catch (error) {
    console.error('No se pudo guardar el chismógrafo:', error);
    status.textContent = writeErrorMessage(error, 'tus respuestas');
  }
}

async function sendBirthday(event, activity) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const day = Number(data.get('day'));
  const month = Number(data.get('month'));
  const status = $('.form-status', form);
  const maxDay = month >= 1 && month <= 12 ? new Date(2000, month, 0).getDate() : 0;
  if (!day || !month || day > maxDay) { status.textContent = 'Elige un día válido para ese mes.'; return; }
  if (!data.get('consent')) { status.textContent = 'Necesitamos tu autorización para publicarlo en Discord.'; return; }
  const displayName = String(data.get('display_name') || '').trim().slice(0, 40) || 'Anónim@';
  status.textContent = 'Guardando tu cumpleaños…';
  try {
    await recordInteraction(activity, 'question', { form_type: 'birthday', month, day, display_name: displayName, consent: true, discord_status: 'pending' });
    form.reset();
    status.textContent = state.supabase ? '¡Cumpleaños registrado! Se anunciará en Discord automáticamente en unos minutos.' : 'Guardado solo en este navegador de demostración; no se enviará a Discord hasta conectar Supabase.';
  } catch (error) {
    console.error('No se pudo registrar el cumpleaños:', error);
    status.textContent = writeErrorMessage(error, 'tu cumpleaños');
  }
}

function writeErrorMessage(error, itemName) {
  const code = String(error?.code || '');
  const message = String(error?.message || 'Error desconocido');
  if (code === '42501' || /row-level security|permission denied/i.test(message)) {
    return 'Supabase rechazó el guardado por permisos. Revisa que ejecutaste el esquema completo y que la actividad siga activa.';
  }
  if (code === '23503' || /foreign key/i.test(message)) {
    return 'La actividad no está sincronizada con la base de datos. Actualiza la página y vuelve a intentarlo.';
  }
  if (/failed to fetch|network|fetch error/i.test(message)) {
    return 'No pudimos conectar con Supabase. Revisa tu conexión e intenta otra vez.';
  }
  return 'No se pudo guardar ' + itemName + ': ' + message;
}

async function consultOracle(activity) {
  const button = $('#ask-oracle');
  button.disabled = true;
  const options = activity.config?.options || [];
  const result = options[Math.floor(Math.random() * options.length)] || 'Tu luz sabe encontrar el camino.';
  $('#activity-result').innerHTML = '<div class="oracle-result">“' + escapeHTML(result) + '”</div>';
  try { await recordInteraction(activity, 'oracle', { result }); } catch { /* The reading still works locally. */ }
  button.disabled = false;
}

$$('[data-activity]').forEach(button => button.addEventListener('click', () => {
  const activity = activityBySlug(button.dataset.activity);
  if (activity) renderActivity(activity);
}));

function setAuthMode(mode) {
  state.authMode = mode;
  const register = mode === 'register';
  $('#auth-title').textContent = register ? 'Crea tu constelación.' : 'Qué bonito verte.';
  $('#auth-subtitle').textContent = register ? 'Tu historia en este universo comienza aquí.' : 'Entra para volver a tu historia.';
  $('[name="display_name"]').closest('label').style.display = register ? 'grid' : 'none';
  $('[name="password"]').autocomplete = register ? 'new-password' : 'current-password';
  $('#auth-form button[type="submit"]').innerHTML = register ? 'Crear mi cuenta <b>↗</b>' : 'Entrar al universo <b>↗</b>';
  $('#auth-mode-toggle').textContent = register ? 'Ya tengo constelación: quiero entrar' : '¿Primera vez? Crea tu constelación';
  $('#auth-status').textContent = '';
  $('#resend-confirmation').hidden = true;
}

function openAuth() {
  setAuthMode('login');
  openDialog($('#auth-modal'));
}

function getEmailRedirectUrl() {
  if (location.protocol === 'http:' || location.protocol === 'https:') return new URL('./', location.href).href;
  return 'https://jatsi.github.io/jatsi-page/';
}

function readableAuthError(error) {
  const message = String(error?.message || 'No pudimos completar el registro.');
  if (/email_address_not_authorized/i.test(message)) return 'Supabase bloqueó el envío: su correo de prueba solo entrega a miembros de tu organización. Configura SMTP personalizado en Supabase para enviar a otros correos.';
  if (/over_email_send_rate_limit|email rate limit/i.test(message)) return 'Supabase alcanzó el límite temporal de correos. Espera antes de solicitar otro o configura SMTP personalizado.';
  if (/redirect.*not allowed|redirect_to/i.test(message)) return 'Supabase rechazó la redirección. Agrega ' + getEmailRedirectUrl() + ' en Authentication → URL Configuration → Redirect URLs.';
  if (/otp_expired|link is invalid or has expired/i.test(message)) return 'El enlace de confirmación venció o ya se usó. Solicita un correo nuevo e intenta abrirlo una sola vez.';
  return message;
}

$$('[data-open-auth]').forEach(button => button.addEventListener('click', openAuth));
$('#account-button').addEventListener('click', () => state.user ? openDashboard() : openAuth());
$('#auth-mode-toggle').addEventListener('click', () => setAuthMode(state.authMode === 'login' ? 'register' : 'login'));

$('#auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const email = String(data.get('email') || '').trim();
  const password = String(data.get('password') || '');
  const displayName = String(data.get('display_name') || '').trim();
  const status = $('#auth-status');
  status.textContent = 'Abriendo el portal…';
  $('#resend-confirmation').hidden = true;

  if (!state.supabase) {
    status.textContent = 'El acceso real aún no está conectado. Tus datos no llegarán a la base de datos; usa “Continuar en modo demostración” para probar el sitio.';
    return;
  }

  try {
    if (state.authMode === 'register') {
      const { data: result, error } = await state.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: getEmailRedirectUrl()
        }
      });
      if (error) throw error;
      if (!result.session) {
        status.textContent = 'Te enviamos un enlace a ' + email + '. Revisa también spam y promociones; al confirmarlo volverás a esta página.';
        $('#resend-confirmation').hidden = false;
        return;
      }
    } else {
      const { error } = await state.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
    closeDialog($('#auth-modal'));
    toast('Portal abierto. Bienvenid@ ✦');
  } catch (error) {
    status.textContent = readableAuthError(error);
  }
});

$('#resend-confirmation').addEventListener('click', async () => {
  const email = String(new FormData($('#auth-form')).get('email') || '').trim();
  const status = $('#auth-status');
  if (!email || !state.supabase) {
    status.textContent = 'Escribe tu correo y vuelve a intentarlo cuando la conexión esté activa.';
    return;
  }
  status.textContent = 'Enviando otro enlace…';
  try {
    const { error } = await state.supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: getEmailRedirectUrl() } });
    if (error) throw error;
    status.textContent = 'Solicitamos otro enlace para ' + email + '. Revisa también spam y promociones.';
  } catch (error) {
    status.textContent = readableAuthError(error);
  }
});

$('#demo-login').addEventListener('click', () => {
  state.user = { id: 'demo-admin', email: 'jatsi@demo.local' };
  state.profile = { display_name: 'Jatsi', role: 'admin' };
  updateAccountUI();
  closeDialog($('#auth-modal'));
  toast('Panel administrativo en modo demostración');
  openDashboard();
});

function updateAccountUI() {
  $('#account-label').textContent = state.user ? (state.profile?.display_name || state.user.email?.split('@')[0] || 'Mi cuenta') : 'Entrar';
}

async function loadProfile() {
  if (!state.supabase || !state.user) return;
  const { data } = await state.supabase.from('profiles').select('id, display_name, role').eq('id', state.user.id).maybeSingle();
  state.profile = data || { display_name: state.user.user_metadata?.display_name || state.user.email?.split('@')[0], role: 'user' };
}

async function loadActivities() {
  if (!state.supabase) {
    state.adminActivities = localActivities();
    state.activities = state.adminActivities.filter(item => item.is_active !== false);
    renderActivityCards();
    return;
  }
  let query = state.supabase.from('activities').select('*').order('created_at', { ascending: true });
  if (state.profile?.role !== 'admin') query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) {
    console.error('No se pudieron cargar las actividades de Supabase:', error);
    state.dataError = 'No se pudieron cargar las actividades. Revisa la conexión y permisos de Supabase.';
    return;
  }
  state.adminActivities = data || [];
  state.activities = state.adminActivities.filter(item => item.is_active !== false);
  state.dataError = '';
  renderActivityCards();
}

async function loadInteractions(all = false) {
  if (!state.supabase) {
    const local = localInteractions();
    state.interactions = state.profile?.role === 'admin' && all ? local : local.filter(item => item.user_id === state.user?.id || item.visitor_id === visitorId);
    return;
  }
  const pageSize = 1000;
  const interactions = [];
  let from = 0;
  while (true) {
    let query = state.supabase.from('interactions').select('*')
      .order('created_at', { ascending: false }).order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (!all) query = query.eq('user_id', state.user.id);
    const { data, error } = await query;
    if (error) {
      console.error('No se pudieron cargar las interacciones de Supabase:', error);
      state.dataError = 'No se pudieron leer los mensajes y estadísticas. Confirma que el usuario tenga rol de administrador y que las políticas RLS estén instaladas.';
      state.interactions = [];
      return;
    }
    interactions.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  state.interactions = interactions;
  state.dataError = '';
}

function dashboardNav() {
  const admin = state.profile?.role === 'admin';
  const items = admin
    ? [['overview', 'iconoir-dashboard', 'Resumen'], ['messages', 'iconoir-chat-lines', 'Mensajes'], ['chismografo', 'iconoir-book', 'Chismógrafo'], ['activities', 'iconoir-playlist-play', 'Actividades'], ['create', 'iconoir-plus', 'Crear actividad'], ['analytics', 'iconoir-stats-report', 'Analíticas'], ['schedule', 'iconoir-calendar', 'Programación']]
    : [['overview', 'iconoir-dashboard', 'Mi inicio'], ['history', 'iconoir-clock', 'Mi historial']];
  $('#dashboard-nav').innerHTML = items.map(([id, icon, label]) => '<button type="button" data-dashboard-tab="' + id + '" class="' + (state.dashboardTab === id ? 'active' : '') + '"><i class="' + icon + '"></i>' + label + '</button>').join('');
  $$('[data-dashboard-tab]').forEach(button => button.addEventListener('click', () => {
    state.dashboardTab = button.dataset.dashboardTab;
    renderDashboard();
  }));
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

function typeIcon(kind) {
  return '<i class="' + activityIconClass(kind) + '"></i>';
}

function interactionLabel(item) {
  if (item.payload?.form_type === 'birthday' && item.payload.discord_status === 'invalid') return 'Registro inválido: pedir que vuelva a compartirlo';
  if (item.payload?.form_type === 'birthday') return item.payload.discord_status === 'sent' ? 'Cumpleaños publicado en Discord' : item.payload.discord_status === 'duplicate' ? 'Ya había un cumpleaños publicado' : 'Cumpleaños pendiente de publicar en Discord';
  if (item.payload?.form_type === 'chismografo') return (item.payload.display_name || 'Anónimo') + ': ' + (item.payload.answers || []).map(answer => answer.question + ' — ' + answer.answer).join(' · ');
  if (item.payload?.text) return (item.payload.display_name || 'Anónimo') + ': ' + item.payload.text;
  if (item.payload?.option) return 'Elegiste: ' + item.payload.option;
  if (item.payload?.result) return 'Resultado: ' + item.payload.result;
  return 'Interacción registrada';
}

let publicChismeBooks = [];
const chismeBookEmotes = ['jatsi_love_112.gif', 'jatsi_lurk_112.gif', 'jatsi_heh_112.gif', 'jatsi_yepp_aprobacion_112.gif', 'jatsi_rave_corregido_112.gif'];
let activePublicBookIndex = 0;
let activePublicBookPage = 0;
let publicBookPageTurning = false;

function renderPublicChisme(items, wallSelector = '#chisme-public-wall') {
  const wall = $(wallSelector);
  if (!wall) return;
  const booksById = new Map();
  items.forEach((item, index) => {
    const bookId = item.payload ? item.id : item.interaction_id || 'respuesta-' + index;
    if (!booksById.has(bookId)) booksById.set(bookId, { id: bookId, created_at: item.created_at, answers: [] });
    const book = booksById.get(bookId);
    if (item.payload) {
      book.answers.push(...(item.payload.answers || []).map((entry, answerIndex) => ({ ...entry, answer_index: answerIndex, created_at: item.created_at })));
    } else {
      book.answers.push({ question: item.question, answer: item.answer, answer_index: item.answer_index ?? book.answers.length, created_at: item.created_at });
    }
  });
  publicChismeBooks = [...booksById.values()].map(book => ({
    ...book,
    answers: book.answers.sort((a, b) => Number(a.answer_index) - Number(b.answer_index))
  })).filter(book => book.answers.length).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (!publicChismeBooks.length) {
    wall.innerHTML = '<div class="chisme-wall-empty"><span>✎</span><strong>Este cuadernito todavía está en blanco.</strong><small>Responde al chismógrafo. Si autorizas que se comparta, Jatsi puede aprobar tu respuesta para el mural.</small></div>';
    return;
  }
  wall.innerHTML = publicChismeBooks.map((book, index) => {
    const preview = book.answers[0] || {};
    const emote = chismeBookEmotes[index % chismeBookEmotes.length];
    return '<button class="chisme-public-book" type="button" data-open-public-book="' + index + '" style="--book-tilt:' + (index % 2 ? '1deg' : '-1deg') + '"><span class="chisme-public-book-shine" aria-hidden="true">✧</span><img class="chisme-public-book-emote" src="' + emote + '" alt="Emote de Jatsi" loading="lazy"><span class="chisme-public-book-copy"><small>CUADERNO ANÓNIMO · ' + book.answers.length + (book.answers.length === 1 ? ' RESPUESTA' : ' RESPUESTAS') + '</small><b>Confesiones de la comunidad</b><span>' + escapeHTML(preview.answer || '') + '</span><em>Abrir el cuadernito <i class="iconoir-arrow-up-right"></i></em></span><span class="chisme-public-book-spine" aria-hidden="true"></span></button>';
  }).join('');
  $$('[data-open-public-book]', wall).forEach(button => button.addEventListener('click', () => openPublicChismeBook(Number(button.dataset.openPublicBook))));
}

function renderPublicChismeBookPage() {
  const book = publicChismeBooks[activePublicBookIndex];
  const content = $('#public-chisme-book-content');
  if (!book || !content) return;
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(book.answers.length / pageSize));
  activePublicBookPage = Math.min(Math.max(0, activePublicBookPage), pageCount - 1);
  const start = activePublicBookPage * pageSize;
  const pageAnswers = book.answers.slice(start, start + pageSize);
  const progress = ((activePublicBookPage + 1) / pageCount) * 100;
  const emote = chismeBookEmotes[(activePublicBookIndex + activePublicBookPage) % chismeBookEmotes.length];
  content.innerHTML = '<div class="chisme-book-modal-heading"><span><i class="iconoir-book"></i> CUADERNITO ANÓNIMO · JATSI × KATSY</span></div><div class="chisme-book-modal-shell" id="chisme-book-modal-shell"><span class="chisme-book-corner-emote emote-left"><img src="' + chismeBookEmotes[activePublicBookIndex % chismeBookEmotes.length] + '" alt="" aria-hidden="true"></span><span class="chisme-book-corner-emote emote-right"><img src="' + emote + '" alt="" aria-hidden="true"></span><article class="chisme-modal-paper"><header><small>JATSI ✿ KATSY · CONFESIONES BONITAS</small><b>HOJA ' + String(activePublicBookPage + 1).padStart(2, '0') + '</b></header><div class="chisme-modal-paper-title"><span>✧</span><strong>Un poquito de<br>chismecito</strong><span>♡</span></div><div class="chisme-modal-answers">' + pageAnswers.map((entry, index) => '<section class="chisme-modal-answer"><small>' + String(start + index + 1).padStart(2, '0') + ' · PREGUNTA ANÓNIMA</small><h3>' + escapeHTML(entry.question) + '</h3><p>' + escapeHTML(entry.answer) + '</p></section>').join('') + '</div><footer><span>JATSI <b>✿</b> KATSY</span><small>' + new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' }).format(new Date(book.created_at)) + '</small></footer></article></div><div class="chisme-book-page-controls"><button type="button" id="chisme-book-prev" ' + (activePublicBookPage === 0 ? 'disabled' : '') + '><i class="iconoir-arrow-left"></i> Hoja anterior</button><div class="chisme-book-progress"><span>HOJA ' + (activePublicBookPage + 1) + ' DE ' + pageCount + '</span><i><b style="width:' + progress + '%"></b></i></div><button type="button" id="chisme-book-next" ' + (activePublicBookPage >= pageCount - 1 ? 'disabled' : '') + '>Siguiente hoja <i class="iconoir-arrow-right"></i></button></div>';
  $('#chisme-book-prev').addEventListener('click', () => turnPublicBookPage(-1));
  $('#chisme-book-next').addEventListener('click', () => turnPublicBookPage(1));
}

function turnPublicBookPage(direction) {
  if (publicBookPageTurning) return;
  const shell = $('#chisme-book-modal-shell');
  if (prefersReducedMotion.matches) {
    activePublicBookPage += direction;
    renderPublicChismeBookPage();
    return;
  }
  publicBookPageTurning = true;
  $('#chisme-book-prev').disabled = true;
  $('#chisme-book-next').disabled = true;
  shell?.classList.add(direction > 0 ? 'is-turning-forward' : 'is-turning-back');
  setTimeout(() => {
    activePublicBookPage += direction;
    publicBookPageTurning = false;
    renderPublicChismeBookPage();
  }, 160);
}

function openPublicChismeBook(index) {
  if (!publicChismeBooks[index]) return;
  activePublicBookIndex = index;
  activePublicBookPage = 0;
  publicBookPageTurning = false;
  renderPublicChismeBookPage();
  openDialog($('#public-chisme-book-modal'));
}

async function loadPublicChisme(wallSelector = '#chisme-public-wall') {
  const wall = $(wallSelector);
  if (!wall) return;
  if (state.supabase) {
    let { data, error } = await state.supabase.from('published_chismografo').select('interaction_id,answer_index,question,answer,created_at')
      .order('created_at', { ascending: false }).limit(1000);
    if (error) {
      console.warn('No se pudo cargar el mural del chismógrafo:', error);
      const fallback = await state.supabase.from('published_chismografo').select('question,answer,created_at')
        .order('created_at', { ascending: false }).limit(1000);
      if (fallback.error) {
        renderPublicChisme([], wallSelector);
        return;
      }
      data = (fallback.data || []).map(entry => ({ ...entry, interaction_id: 'legacy-' + entry.created_at, answer_index: chismografoQuestions.findIndex(question => question.question === entry.question) }));
    }
    renderPublicChisme(data || [], wallSelector);
    return;
  }
  renderPublicChisme(localInteractions().filter(item => item.payload?.form_type === 'chismografo' && item.payload?.public_status === 'published'), wallSelector);
}

function historyHTML(items, emptyMessage = 'Todavía no hay estrellas por aquí.') {
  if (!items.length) return '<div class="empty-state"><span><i class="iconoir-sparks"></i></span>' + emptyMessage + '</div>';
  return '<div class="history-list">' + items.map(item => {
    const activity = activityById(item.activity_id);
    return '<div class="history-item"><span>' + typeIcon(item.kind) + '</span><div><strong>' + escapeHTML(activity?.title || item.kind) + '</strong><small>' + escapeHTML(interactionLabel(item)) + '</small></div><small>' + formatDate(item.created_at) + '</small></div>';
  }).join('') + '</div>';
}

function metricCard(icon, label, value, detail) {
  return '<div class="metric"><div class="metric-top"><small>' + label + '</small><i class="' + icon + '"></i></div><strong>' + value + '</strong><em>' + detail + '</em></div>';
}

function adminOverview() {
  const messages = state.interactions.filter(item => ['message', 'question'].includes(item.kind));
  const votes = state.interactions.filter(item => ['poll', 'either'].includes(item.kind));
  const spins = state.interactions.filter(item => item.kind === 'wheel');
  const community = new Set(state.interactions.map(item => item.user_id || item.visitor_id).filter(Boolean)).size;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const trendDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today); date.setDate(today.getDate() - 6 + index);
    const key = date.toLocaleDateString('en-CA');
    return { date, key, count: state.interactions.filter(item => new Date(item.created_at).toLocaleDateString('en-CA') === key).length };
  });
  const trendMax = Math.max(1, ...trendDays.map(day => day.count));
  const pulseActivities = state.activities.filter(activity => ['poll', 'either', 'wheel'].includes(activity.type)).map(activity => {
    const rows = state.interactions.filter(item => item.activity_id === activity.id);
    const tallies = new Map();
    rows.forEach(item => {
      const label = item.payload?.option || item.payload?.result;
      if (label) tallies.set(label, (tallies.get(label) || 0) + 1);
    });
    const top = [...tallies.entries()].sort((a, b) => b[1] - a[1])[0];
    return { count: rows.length, html: '<div class="pulse-activity-row"><span class="pulse-activity-icon">' + typeIcon(activity.type) + '</span><div><strong>' + escapeHTML(activity.title) + '</strong><small>' + rows.length + ' ' + (activity.type === 'wheel' ? 'giros' : 'votos') + (top ? ' · más elegido: ' + escapeHTML(top[0]) : ' · esperando participación') + '</small></div><b>' + rows.length + '</b></div>' };
  }).sort((a, b) => b.count - a.count).slice(0, 4).map(item => item.html).join('');
  const databaseLabel = !configured ? 'No conectada · datos locales' : (state.dataError || 'Conectada');
  const weekMessages = messages.filter(item => Date.now() - new Date(item.created_at) < 7 * 86400000).length;
  const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  return '<section class="admin-welcome"><div><span><i class="iconoir-sparks"></i> CENTRO DE CONTROL · JATSI × KATSY</span><h3>La comunidad, en un vistazo.</h3><p>Un resumen de lo que está pasando en tus actividades.</p></div><div class="admin-welcome-actions"><button type="button" data-dashboard-tab="analytics"><i class="iconoir-stats-report"></i> Ver estadísticas</button><button type="button" data-dashboard-tab="create"><i class="iconoir-plus"></i> Nueva actividad</button></div></section><div class="metric-grid admin-metric-grid">' + metricCard('iconoir-graph-up', 'INTERACCIONES', state.interactions.length, 'Todos los registros') + metricCard('iconoir-group', 'COMUNIDAD', community, 'Participantes únicos') + metricCard('iconoir-chat-lines', 'MENSAJES', messages.length, weekMessages + ' esta semana') + metricCard('iconoir-stats-up-square', 'VOTOS + GIROS', votes.length + spins.length, votes.length + ' votos · ' + spins.length + ' giros') + '</div><div class="admin-overview-grid"><section class="panel admin-trend-panel"><div class="panel-heading-row"><div><span class="panel-overline">ÚLTIMOS 7 DÍAS</span><h3>Ritmo de la comunidad</h3></div><span class="trend-total">' + trendDays.reduce((sum, day) => sum + day.count, 0) + ' <small>interacciones</small></span></div><div class="admin-week-chart" role="img" aria-label="Interacciones diarias durante los últimos siete días">' + trendDays.map(day => '<div class="admin-week-day" title="' + day.count + ' interacciones"><span>' + day.count + '</span><i style="--bar-height:' + (day.count ? Math.max(5, day.count / trendMax * 100) : 2) + '%"></i><small>' + dayLabels[day.date.getDay()] + '</small></div>').join('') + '</div></section><section class="panel admin-health-panel"><div class="panel-heading-row"><div><span class="panel-overline">ESTADO DEL SITIO</span><h3>Todo en órbita</h3></div><i class="iconoir-shield-check admin-health-icon"></i></div><div class="health-row"><span><i class="iconoir-database-check"></i> Base de datos</span><b class="' + (configured && !state.dataError ? 'is-healthy' : 'is-pending') + '"><i></i>' + (configured && !state.dataError ? 'Conectada' : 'Revisar') + '</b></div><div class="health-row"><span><i class="iconoir-playlist-play"></i> Actividades activas</span><b>' + state.activities.length + '</b></div><div class="health-row"><span><i class="iconoir-chat-lines"></i> Mensajes esta semana</span><b>' + weekMessages + '</b></div></section></div><section class="panel admin-pulse-panel"><div class="panel-heading-row"><div><span class="panel-overline">VOTOS, RETOS Y PARTICIPACIÓN</span><h3>Lo que mueve a la comunidad</h3></div><button class="text-button-inline" type="button" data-dashboard-tab="analytics">Ver desglose <i class="iconoir-arrow-up-right"></i></button></div><div class="pulse-activity-list">' + (pulseActivities || '<div class="analytics-empty">Publica una encuesta o una ruleta para empezar a ver resultados.</div>') + '</div></section><div class="dashboard-grid admin-lower-grid"><section class="panel"><div class="panel-heading-row"><div><span class="panel-overline">SEÑALES RECIENTES</span><h3>Actividad reciente</h3></div><button class="text-button-inline" type="button" data-dashboard-tab="messages">Ver mensajes <i class="iconoir-arrow-up-right"></i></button></div>' + historyHTML(state.interactions.slice(0, 6)) + '</section><section class="panel admin-action-panel"><span class="panel-overline">SIGUIENTE PASO</span><h3>Mantén vivo el portal</h3><p>Prueba una pregunta nueva, rota la encuesta semanal o abre una dinámica para el próximo stream.</p><button class="button button-primary" type="button" data-dashboard-tab="create">Crear actividad <i class="iconoir-arrow-up-right"></i></button></section></div>';
}

function userOverview() {
  const messages = state.interactions.filter(item => ['message', 'question'].includes(item.kind));
  const votes = state.interactions.filter(item => ['poll', 'either'].includes(item.kind));
  const quickActivities = state.activities.filter(item => !isNotebookOrHiddenActivity(item)).slice(0, 4);
  return '<div class="metric-grid">' + metricCard('iconoir-chat-lines', 'MIS MENSAJES', messages.length, 'Guardados') + metricCard('iconoir-stats-up-square', 'MIS VOTOS', votes.length, 'Decisiones') + metricCard('iconoir-refresh-double', 'GIROS', state.interactions.filter(item => item.kind === 'wheel').length, 'Destinos') + metricCard('iconoir-magic-wand', 'SEÑALES', state.interactions.filter(item => item.kind === 'oracle').length, 'Del oráculo') + '</div><div class="dashboard-grid"><section class="panel"><h3>Tu historia reciente</h3>' + historyHTML(state.interactions.slice(0, 8), 'Participa en una actividad y aparecerá aquí.') + '</section><section class="panel"><h3>Portal rápido</h3>' + quickActivities.map(item => '<div class="history-item"><span>' + typeIcon(item.type) + '</span><div><strong>' + escapeHTML(item.title) + '</strong><small>' + escapeHTML(item.description) + '</small></div><button class="share-icon" type="button" data-open-activity="' + item.slug + '"><i class="iconoir-arrow-up-right"></i></button></div>').join('') + '</section></div>';
}

function messagesPanel() {
  const messages = state.interactions.filter(item => ['message', 'question'].includes(item.kind) && !['chismografo', 'birthday'].includes(item.payload?.form_type));
  return '<section class="panel"><h3>Mensajes recibidos</h3>' + historyHTML(messages, 'Aún no han llegado mensajes.') + '</section>';
}

function chismografoPanel() {
  const chismes = state.interactions.filter(item => item.payload?.form_type === 'chismografo');
  const respondentLabels = new Map();
  let userNumber = 0;
  let anonymousNumber = 0;
  [...chismes].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).forEach(item => {
    const anonymous = item.payload.anonymous === true || !String(item.payload.display_name || '').trim();
    respondentLabels.set(item.id, anonymous ? 'Anónimo ' + (++anonymousNumber) : 'Usuario ' + (++userNumber) + ' · ' + String(item.payload.display_name).trim());
  });
  const cards = chismes.map(item => {
    const canPublish = item.payload.allow_public === true;
    const published = item.payload.public_status === 'published';
    const stateLabel = published ? 'Publicado en el mural' : canPublish ? 'Privado · esperando revisión' : 'Privado · sin permiso de publicación';
    const pageGroups = new Map();
    (item.payload.answers || []).forEach(answer => {
      const questionIndex = chismografoQuestions.findIndex(question => question.question === answer.question);
      const pageIndex = questionIndex >= 0 ? Math.floor(questionIndex / 10) : 0;
      const category = chismografoQuestions[pageIndex * 10]?.category || 'Otras respuestas';
      if (!pageGroups.has(pageIndex)) pageGroups.set(pageIndex, { category, answers: [] });
      pageGroups.get(pageIndex).answers.push(answer);
    });
    const pagesMarkup = [...pageGroups.entries()].sort(([a], [b]) => a - b).map(([pageIndex, page]) =>
      '<details class="chisme-admin-page"' + (pageIndex === [...pageGroups.keys()].sort((a, b) => a - b)[0] ? ' open' : '') + '><summary><span>PÁGINA ' + String(pageIndex + 1).padStart(2, '0') + ' · ' + escapeHTML(page.category) + '</span><small>' + page.answers.length + ' respuestas <b>＋</b></small></summary><div class="chisme-admin-page-content">' + page.answers.map(answer => '<article class="chisme-admin-answer"><small>' + escapeHTML(answer.question) + '</small><p>' + escapeHTML(answer.answer) + '</p></article>').join('') + '</div></details>'
    ).join('');
    const action = published
      ? '<button class="admin-table-action" type="button" data-hide-chisme="' + item.id + '"><i class="iconoir-eye-closed"></i>Desaprobar y ocultar</button>'
      : canPublish
        ? '<button class="admin-table-action" type="button" data-publish-chisme="' + item.id + '"><i class="iconoir-eye"></i>Aprobar y publicar</button>'
        : '<span class="chisme-private-lock"><i class="iconoir-lock"></i> No autorizó</span>';
    const profile = [item.payload.age ? 'Edad: ' + item.payload.age : '', item.payload.zodiac ? 'Signo: ' + item.payload.zodiac : ''].filter(Boolean).join(' · ');
    return '<details class="chisme-admin-card chisme-admin-book"><summary><span class="chisme-book-cover"><i class="iconoir-book"></i><b>' + escapeHTML(respondentLabels.get(item.id)) + '</b>' + (profile ? '<small>' + escapeHTML(profile) + '</small>' : '') + '</span><span class="chisme-book-meta"><small>' + escapeHTML(stateLabel) + '</small><b>' + (item.payload.answers || []).length + ' / 50 <i class="iconoir-book"></i></b><i class="iconoir-plus"></i></span></summary><div class="chisme-admin-book-inside"><div class="chisme-admin-book-heading"><span>✎ CUADERNITO DE ' + escapeHTML(respondentLabels.get(item.id).toUpperCase()) + '</span><small>' + escapeHTML(formatDate(item.created_at)) + '</small></div>' + (pagesMarkup || '<p class="chisme-admin-note">No hay respuestas escritas en este cuaderno.</p>') + '<div class="chisme-admin-foot">' + action + '</div></div></details>';
  }).join('');
  return '<section class="panel chisme-admin-panel"><div class="panel-heading-row"><div><span class="panel-overline">ESTACIÓN DEL CHISMÓGRAFO</span><h3>Un cuadernito por persona</h3></div><span class="chisme-admin-count">' + chismes.length + ' cuadernitos</span></div><p class="chisme-admin-note">Abre cada cuaderno para pasar por sus páginas temáticas. Los nombres y los datos de perfil solo aparecen en este panel; el mural siempre es anónimo.</p><p class="chisme-action-status" id="chisme-admin-status" role="status" hidden></p>' + (cards || '<div class="empty-state">Todavía no hay respuestas del chismógrafo.</div>') + '</section><section class="chisme-notebook chisme-dashboard-notebook"><span class="chisme-sticker chisme-sticker-jatsi" aria-hidden="true"><b>J</b><i>✦</i></span><span class="chisme-sticker chisme-sticker-katsy" aria-hidden="true"><b>K</b><i>♡</i></span><div class="chisme-notebook-heading"><div><span>VISTA PÚBLICA</span><h3>El cuadernito<br><em>que ve la comunidad.</em></h3></div><p>Así se verán las respuestas aprobadas. Siempre aparecen anónimas.</p></div><div class="chisme-public-wall" id="dashboard-chisme-wall" aria-live="polite"><div class="chisme-wall-empty"><span>✎</span><strong>Cargando el cuadernito…</strong></div></div><div class="chisme-notebook-footer"><span>VISTA PREVIA DEL MURAL</span><span>JATSI <b>×</b> KATSY</span></div></section>';
}

async function setChismePublication(id, publish) {
  const current = state.interactions.find(item => item.id === id);
  if (!current || (publish && current.payload.allow_public !== true)) return;
  const buttons = $$('[data-publish-chisme="' + id + '"], [data-hide-chisme="' + id + '"]', $('#dashboard-content'));
  buttons.forEach(button => { button.disabled = true; button.dataset.originalLabel = button.textContent.trim(); button.textContent = publish ? 'Publicando…' : 'Retirando…'; });
  const statusNode = $('#chisme-admin-status');
  if (statusNode) { statusNode.hidden = false; statusNode.className = 'chisme-action-status is-working'; statusNode.textContent = publish ? 'Publicando la respuesta en el cuadernito…' : 'Retirando la respuesta del mural…'; }
  let payload = {
    ...current.payload,
    public_status: publish ? 'published' : 'private',
    ...(publish ? { discord_status: 'pending' } : { discord_status: 'withdrawn' })
  };
  try {
    if (state.supabase) {
      if (publish) {
        const rows = (current.payload.answers || []).map((answer, answerIndex) => ({ interaction_id: id, answer_index: answerIndex, question: answer.question, answer: answer.answer }));
        if (!rows.length) throw new Error('No hay respuestas para publicar.');
        const { error: publicError } = await state.supabase.from('published_chismografo').upsert(rows, { onConflict: 'interaction_id,answer_index' });
        if (publicError) throw publicError;
      } else {
        const { data: removed, error: publicError } = await state.supabase.from('published_chismografo').delete().eq('interaction_id', id).select('interaction_id');
        if (publicError) throw publicError;
        if (!removed?.length) throw new Error('No encontramos una publicación activa para retirar. Recarga la página y vuelve a intentarlo.');
      }
      const { data: updatedInteraction, error } = await state.supabase.from('interactions').update({ payload }).eq('id', id).select('id').maybeSingle();
      if (error) throw error;
      if (!updatedInteraction) throw new Error('Supabase no actualizó la respuesta. Confirma que tu cuenta tenga el rol de administradora.');
      if (publish) {
        try {
          const { data: notice, error: noticeError } = await state.supabase.functions.invoke('chismografo-discord', { body: { interaction_id: id } });
          if (noticeError) throw noticeError;
          if (notice?.sent) payload = { ...payload, discord_status: 'sent', discord_posted_at: notice.discord_posted_at || new Date().toISOString() };
        } catch (noticeError) {
          console.error('El cuadernito se publicó, pero el aviso inmediato de Discord quedó pendiente:', noticeError);
        }
      }
    } else {
      const local = localInteractions().map(item => item.id === id ? { ...item, payload } : item);
      localStorage.setItem(localKey, JSON.stringify(local));
    }
    state.interactions = state.interactions.map(item => item.id === id ? { ...item, payload } : item);
    if (!state.supabase) localStorage.setItem(localKey, JSON.stringify(state.interactions));
    await loadPublicChisme();
    await renderDashboard();
    const discordSent = publish && payload.discord_status === 'sent';
    const discordPending = publish && state.supabase && !discordSent;
    const refreshedStatus = $('#chisme-admin-status');
    if (refreshedStatus && discordPending) {
      refreshedStatus.hidden = false;
      refreshedStatus.className = 'chisme-action-status is-error';
      refreshedStatus.textContent = 'El cuadernito ya está publicado, pero Discord no confirmó el aviso inmediato. Quedó pendiente para el proceso automático.';
    }
    toast(publish
      ? discordSent ? 'Cuadernito publicado y anunciado en Discord.' : discordPending ? 'Cuadernito publicado; aviso de Discord pendiente.' : 'Respuesta publicada anónimamente en el cuadernito.'
      : 'Respuesta retirada del mural público.');
  } catch (error) {
    console.error('No se pudo actualizar la publicación del chismógrafo:', error);
    const needsSchema = /published_chismografo|permission|row.level|relation .* does not exist|check constraint|violates|42501|42P01/i.test(String(error?.message || '') + ' ' + String(error?.code || ''));
    const message = !state.supabase
      ? 'No hay una base de datos conectada; solo se puede guardar en este navegador.'
      : needsSchema
        ? 'Supabase rechazó la publicación. Ejecuta el archivo supabase/schema.sql completo en Supabase → SQL Editor y confirma que tu cuenta siga como administradora.'
        : 'No se pudo publicar: ' + String(error?.message || 'error de conexión con Supabase');
    if (statusNode) { statusNode.hidden = false; statusNode.className = 'chisme-action-status is-error'; statusNode.textContent = message; }
    buttons.forEach(button => { button.disabled = false; button.textContent = button.dataset.originalLabel || 'Intentar de nuevo'; });
    toast('No se actualizó el mural. Revisa el aviso del panel.');
  }
}

function activitiesPanel() {
  return '<section class="panel table-wrap"><h3>Actividades publicadas</h3><table class="data-table"><thead><tr><th>TÍTULO</th><th>TIPO</th><th>ESTADO</th><th>ADMINISTRAR</th></tr></thead><tbody>' + state.adminActivities.filter(item => !isNotebookOrHiddenActivity(item)).map(item => '<tr><td>' + escapeHTML(item.title) + '</td><td>' + escapeHTML(item.type) + '</td><td><span class="status-pill">' + (item.is_active ? 'Activa' : 'Pausada') + '</span></td><td class="activity-admin-actions">' + (['wheel', 'poll', 'either'].includes(item.type) ? '<button class="admin-table-action" type="button" data-edit-activity="' + item.slug + '"><i class="iconoir-edit"></i>Editar</button>' : '') + '<button class="admin-table-action" type="button" data-toggle-activity="' + item.slug + '" aria-label="' + (item.is_active ? 'Pausar ' : 'Activar ') + escapeHTML(item.title) + '"><i class="iconoir-' + (item.is_active ? 'pause' : 'play') + '"></i>' + (item.is_active ? 'Pausar' : 'Activar') + '</button><button class="share-icon" type="button" data-share-activity="' + item.slug + '" aria-label="Compartir ' + escapeHTML(item.title) + '"><i class="iconoir-link"></i></button></td></tr>').join('') + '</tbody></table></section>';
}

async function toggleActivity(slug) {
  const activity = state.adminActivities.find(item => item.slug === slug);
  if (!activity) return;
  const updated = { ...activity, is_active: !activity.is_active };
  try {
    if (state.supabase) {
      const { data, error } = await state.supabase.from('activities').update({ is_active: updated.is_active }).eq('id', activity.id).select().single();
      if (error) throw error;
      Object.assign(updated, data);
    }
    state.adminActivities = state.adminActivities.map(item => item.id === activity.id ? updated : item);
    state.activities = state.adminActivities.filter(item => item.is_active);
    if (!state.supabase) saveLocalActivities(state.adminActivities);
    renderActivityCards();
    renderDashboard();
    toast(updated.is_active ? 'Actividad activada.' : 'Actividad pausada.');
  } catch (error) {
    console.error('No se pudo cambiar el estado de la actividad:', error);
    toast('No pudimos cambiar el estado. Revisa tu conexión e inténtalo otra vez.');
  }
}

function createPanel() {
  const activity = state.editingActivitySlug ? activityBySlug(state.editingActivitySlug) : null;
  const options = activity?.config?.options || [];
  const selectedType = activity?.type || 'poll';
  const optionsMarkup = '<div class="wheel-admin-guidance" id="wheel-admin-guidance" ' + (selectedType === 'wheel' ? '' : 'hidden') + '><small class="field-hint">Cada renglón ocupa el color que ves aquí:</small><div class="admin-wheel-preview" id="admin-wheel-preview"></div></div>';
  return '<section class="panel create-panel"><div class="create-panel-intro"><span id="activity-type-preview"><i class="' + activityIconClass(selectedType) + '"></i></span><div><small>' + (activity ? 'AJUSTES DE ACTIVIDAD' : 'COMPOSITOR DE EXPERIENCIAS') + '</small><h3>' + (activity ? 'Editar actividad' : 'Nueva actividad') + '</h3><p>' + (activity ? 'Actualiza las opciones, el título o la descripción.' : 'Crea una experiencia y recibe un enlace listo para compartir en Discord.') + '</p></div></div><form class="admin-create" id="admin-create-form"><input type="hidden" name="editing_slug" value="' + (activity?.slug || '') + '"><div class="admin-form-grid"><label><span><i class="iconoir-list-select"></i>Tipo de actividad</span><select id="activity-type-select" name="type" ' + (activity ? 'disabled' : '') + '><option value="poll" ' + (selectedType === 'poll' ? 'selected' : '') + '>Encuesta</option><option value="wheel" ' + (selectedType === 'wheel' ? 'selected' : '') + '>Ruleta</option><option value="message" ' + (selectedType === 'message' ? 'selected' : '') + '>Buzón de mensajes</option><option value="question" ' + (selectedType === 'question' ? 'selected' : '') + '>Caja de preguntas</option><option value="either" ' + (selectedType === 'either' ? 'selected' : '') + '>Esto o aquello</option><option value="oracle" ' + (selectedType === 'oracle' ? 'selected' : '') + '>Oráculo</option></select>' + (activity ? '<input type="hidden" name="type" value="' + escapeHTML(selectedType) + '">' : '') + '</label><label><span><i class="iconoir-edit"></i>Título</span><input name="title" required placeholder="Ej. ¿Qué jugamos el viernes?" value="' + escapeHTML(activity?.title || '') + '"></label></div><label><span><i class="iconoir-message-text"></i>Descripción</span><textarea name="description" placeholder="Cuéntale a la comunidad qué debe hacer">' + escapeHTML(activity?.description || '') + '</textarea></label><label class="options-label"><span><i class="iconoir-list"></i>Opciones <small>(una por línea)</small></span><textarea name="options" placeholder="Una acción por renglón; hasta 12 opciones">' + escapeHTML(options.join('\n')) + '</textarea>' + optionsMarkup + '</label><button class="button button-primary" type="submit"><i class="iconoir-sparks"></i> ' + (activity ? 'Guardar cambios' : 'Publicar actividad') + '</button><p class="form-status" role="status"></p></form></section>';
}

function analyticsPanel() {
  const rangeDays = state.analyticsRange === '7d' ? 7 : state.analyticsRange === '30d' ? 30 : null;
  const cutoff = rangeDays ? Date.now() - rangeDays * 86400000 : 0;
  const reportInteractions = state.interactions.filter(item => !cutoff || new Date(item.created_at).getTime() >= cutoff);
  const byKind = ['message', 'question', 'poll', 'either', 'wheel', 'oracle'].map(kind => ({ kind, count: reportInteractions.filter(item => item.kind === kind).length }));
  const votes = reportInteractions.filter(item => ['poll', 'either'].includes(item.kind));
  const spins = reportInteractions.filter(item => item.kind === 'wheel');
  const countsFor = (activity, items) => {
    const options = activity.config?.options || [];
    const rows = options.map((label, index) => ({ label, count: 0, index }));
    items.filter(item => item.activity_id === activity.id).forEach(item => {
      const index = Number(item.payload?.option_index);
      const label = item.payload?.option || item.payload?.result;
      let row = label ? rows.find(option => option.label === label) : null;
      if (!row && Number.isInteger(index) && index >= 0) row = rows[index];
      if (!row) {
        if (label) {
          rows.push(row = { label, count: 0, index: rows.length });
        }
      }
      if (row) row.count++;
    });
    return rows;
  };
  const distribution = (rows, total, empty) => {
    if (!rows.length) return '<div class="analytics-empty">' + empty + '</div>';
    const maxCount = Math.max(1, ...rows.map(row => row.count));
    const leader = rows.reduce((best, row) => row.count > best.count ? row : best, rows[0]);
    return '<div class="analytics-options">' + rows.map((row, index) => {
      const percent = total ? Math.round(row.count / total * 100) : 0;
      return '<div class="analytics-option' + (row.count && row.count === leader.count ? ' is-leader' : '') + '"><div class="analytics-option-meta"><span><i>' + String(index + 1).padStart(2, '0') + '</i>' + escapeHTML(row.label) + (row.count && row.count === leader.count ? '<b class="analytics-leader">' + (total ? 'LÍDER' : 'EMPATE') + '</b>' : '') + '</span><strong>' + row.count + ' <small>· ' + percent + '%</small></strong></div><div class="analytics-track"><i style="width:' + (row.count ? Math.max(3, row.count / maxCount * 100) : 0) + '%"></i></div></div>';
    }).join('') + '</div>';
  };
  const reportActivities = state.profile?.role === 'admin' ? state.adminActivities : state.activities;
  const pollActivities = reportActivities.filter(activity => ['poll', 'either'].includes(activity.type));
  const wheelActivities = reportActivities.filter(activity => activity.type === 'wheel');
  const pollPanels = pollActivities.map(activity => {
    const rows = countsFor(activity, votes);
    const total = votes.filter(item => item.activity_id === activity.id).length;
    return '<article class="analytics-card"><header><span class="analytics-icon poll-icon"><i class="iconoir-stats-up-square"></i></span><div><small>ENCUESTA · ' + total + ' ' + (total === 1 ? 'VOTO' : 'VOTOS') + '</small><h4>' + escapeHTML(activity.title) + '</h4></div></header>' + distribution(rows, total, 'Aún no hay votos en esta encuesta.') + '</article>';
  }).join('');
  const wheelPanels = wheelActivities.map(activity => {
    const rows = countsFor(activity, spins);
    const total = spins.filter(item => item.activity_id === activity.id).length;
    const top = [...rows].filter(row => row.count).sort((a, b) => b.count - a.count)[0];
    return '<article class="analytics-card"><header><span class="analytics-icon wheel-icon"><i class="iconoir-refresh-double"></i></span><div><small>RULETA · ' + total + ' ' + (total === 1 ? 'GIRO' : 'GIROS') + '</small><h4>' + escapeHTML(activity.title) + '</h4></div>' + (top ? '<span class="wheel-top-result"><small>MÁS ELEGIDA</small><b>' + escapeHTML(top.label) + '</b><em>' + top.count + ' ' + (top.count === 1 ? 'vez' : 'veces') + '</em></span>' : '') + '</header>' + distribution(rows, total, 'Aún no hay giros registrados.') + '</article>';
  }).join('');
  const totalPolls = pollActivities.reduce((sum, activity) => sum + votes.filter(item => item.activity_id === activity.id).length, 0);
  const totalSpins = wheelActivities.reduce((sum, activity) => sum + spins.filter(item => item.activity_id === activity.id).length, 0);
  const rangeButtons = [['7d', '7 días'], ['30d', '30 días'], ['all', 'Todo el tiempo']].map(([value, label]) => '<button type="button" data-analytics-range="' + value + '" class="' + (state.analyticsRange === value ? 'active' : '') + '">' + label + '</button>').join('');
  const participants = new Set(reportInteractions.map(item => item.user_id || item.visitor_id).filter(Boolean)).size;
  return '<div class="analytics-toolbar"><div><span class="panel-overline">REPORTE DE LA COMUNIDAD</span><p>Compara votos, retos, mensajes y participación única.</p></div><div class="analytics-range" role="group" aria-label="Periodo del reporte">' + rangeButtons + '</div></div><div class="metric-grid analytics-summary">' + metricCard('iconoir-stats-up-square', 'VOTOS RECIBIDOS', totalPolls, pollActivities.length + ' encuestas') + metricCard('iconoir-refresh-double', 'GIROS DE RULETA', totalSpins, wheelActivities.length + ' ruletas') + metricCard('iconoir-group', 'PARTICIPANTES', participants, 'Cuentas y visitantes') + metricCard('iconoir-graph-up', 'INTERACCIONES', reportInteractions.length, state.analyticsRange === 'all' ? 'Desde el inicio' : 'En este periodo') + '</div><section class="analytics-section"><div class="analytics-section-heading"><span>01 / LA COMUNIDAD DECIDE</span><h3>Votos por encuesta</h3><p>Reparto y porcentaje de cada opción, con la favorita resaltada.</p></div><div class="analytics-card-grid">' + (pollPanels || '<div class="analytics-empty">Todavía no hay encuestas publicadas.</div>') + '</div></section><section class="analytics-section"><div class="analytics-section-heading"><span>02 / EL AZAR DEL COSMOS</span><h3>Resultados de las ruletas</h3><p>Cuántas veces salió cada resultado y cuál aparece más.</p></div><div class="analytics-card-grid">' + (wheelPanels || '<div class="analytics-empty">Todavía no hay ruletas publicadas.</div>') + '</div></section><section class="panel analytics-activity"><h3>Actividad por tipo</h3><div class="analytics-kind-list">' + byKind.map(item => '<div><span>' + escapeHTML(item.kind === 'either' ? 'Esto o aquello' : item.kind === 'wheel' ? 'Ruletas' : item.kind === 'poll' ? 'Encuestas' : item.kind === 'message' ? 'Buzón' : item.kind === 'question' ? 'Preguntas' : 'Oráculo') + '</span><strong>' + item.count + '</strong><i><b style="width:' + Math.round(item.count / Math.max(1, reportInteractions.length) * 100) + '%"></b></i></div>').join('') + '</div></section>';
}

function programmingPanel() {
  const nextMonday = new Date();
  nextMonday.setHours(0, 0, 0, 0);
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  const nextLabel = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(nextMonday);
  return '<section class="schedule-hero"><div class="schedule-hero-copy"><span class="panel-overline"><i class="iconoir-calendar"></i> RITMO SEMANAL DE LA COMUNIDAD</span><h3>Un portal nuevo.<br><em>Cada lunes.</em></h3><p>Cada lunes se activa una encuesta y una ruleta nuevas. El chismógrafo permanece fijo en su sección de cuaderno con 50 preguntas; no se cuenta como actividad semanal.</p><div class="schedule-next"><i class="iconoir-clock"></i><span>PRÓXIMA ROTACIÓN<strong>' + escapeHTML(nextLabel) + ' · 6:00 a. m. (CDMX)</strong></span></div></div><div class="schedule-clock-art" aria-hidden="true"><span class="clock-orbit orbit-a"></span><span class="clock-orbit orbit-b"></span><span class="clock-face"><i class="iconoir-clock"></i><b>06:00</b><small>LUNES · CDMX</small></span><i class="clock-star star-a">✦</i><i class="clock-star star-b">✧</i><i class="clock-star star-c">✦</i></div></section><div class="schedule-flow"><article><span class="schedule-step-number">01</span><span class="schedule-step-icon"><i class="iconoir-stats-up-square"></i></span><small>VOTA</small><h4>Una encuesta activa</h4><p>La encuesta de la semana anterior se pausa cuando entra la nueva.</p></article><article><span class="schedule-step-number">02</span><span class="schedule-step-icon"><i class="iconoir-refresh-double"></i></span><small>EN DIRECTO</small><h4>Retos para Jatsi</h4><p>Jatsi gira la ruleta durante el stream: humor y retos generales, sin imitaciones.</p></article><article><span class="schedule-step-number">03</span><span class="schedule-step-icon"><i class="iconoir-book"></i></span><small>EN EL CUADERNO</small><h4>50 preguntas para conocernos</h4><p>Crushes, confesiones y anécdotas. Participación opcional; cumpleaños solo con permiso explícito.</p></article></div><section class="panel schedule-setup"><div><span class="panel-overline">AUTOMATIZACIÓN ACTIVA</span><h3>Encuesta, ruleta y avisos de Discord</h3><p>La rotación usa los secretos configurados en GitHub Actions. Los cumpleaños se comparten desde el mismo formulario del cuaderno, solo con apodo, día/mes y permiso explícito. Los cuadernitos aprobados avisan al instante; GitHub revisa la cola cada cinco minutos como respaldo. Después del anuncio, el apodo y la fecha del cumpleaños se borran de esa fila.</p></div><div class="schedule-secret-list"><span><i class="iconoir-database-check"></i> SUPABASE_URL</span><span><i class="iconoir-lock"></i> SUPABASE_SERVICE_ROLE_KEY</span><span><i class="iconoir-link"></i> COMMUNITY_WEBHOOK_URL</span></div><div class="schedule-footnote"><i class="iconoir-info-circle"></i><span>Solo se activa una encuesta semanal. Las respuestas del cuaderno son privadas y tú eliges cuáles autorizaron publicación para aprobarlas anónimamente.</span></div></section>';
}

async function renderDashboard() {
  const admin = state.profile?.role === 'admin';
  if (!admin && ['messages', 'chismografo', 'activities', 'create', 'analytics', 'schedule'].includes(state.dashboardTab)) state.dashboardTab = 'overview';
  dashboardNav();
  $('#dashboard-avatar').textContent = (state.profile?.display_name || '✦').charAt(0).toUpperCase();
  $('#dashboard-name').textContent = state.profile?.display_name || 'Explorador';
  $('#dashboard-role').textContent = admin ? 'Administradora' : 'Explorador';
  $('#dashboard-eyebrow').textContent = admin ? 'CENTRO DE COMANDO' : 'MI CONSTELACIÓN';
  const titles = { overview: admin ? 'El universo, de un vistazo.' : 'Bienvenid@ de vuelta.', messages: 'Mensajes del cosmos.', chismografo: 'El cuadernito de la comunidad.', activities: 'Portales publicados.', create: 'Abre un nuevo portal.', analytics: 'Pulso de la comunidad.', schedule: 'Siempre hay algo nuevo.', history: 'Tu historia en el universo.' };
  $('#dashboard-heading').textContent = titles[state.dashboardTab];
  const views = {
    overview: admin ? adminOverview() : userOverview(),
    messages: messagesPanel(),
    chismografo: chismografoPanel(),
    activities: activitiesPanel(),
    create: createPanel(),
    analytics: analyticsPanel(),
    schedule: programmingPanel(),
    history: '<section class="panel"><h3>Todo tu historial</h3>' + historyHTML(state.interactions, 'Aún no has enviado nada.') + '</section>'
  };
  const localNotice = !configured
    ? '<div class="database-notice" role="status"><i class="iconoir-warning-triangle"></i><span><strong>La base de datos no está conectada.</strong> Los mensajes y actividades de prueba se guardan solo en este navegador; no recibimos ni mostramos los mensajes de otras personas. Configura Supabase en <code>config.js</code> y aplica <code>supabase/schema.sql</code>.</span></div>'
    : (state.dataError ? '<div class="database-notice" role="alert"><i class="iconoir-warning-triangle"></i><span><strong>Problema al consultar Supabase.</strong> ' + escapeHTML(state.dataError) + '</span></div>' : '');
  $('#dashboard-content').innerHTML = localNotice + (views[state.dashboardTab] || views.overview);
  if (admin && state.dashboardTab === 'chismografo') loadPublicChisme('#dashboard-chisme-wall');
  $$('[data-dashboard-tab]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => {
    state.dashboardTab = button.dataset.dashboardTab;
    renderDashboard();
  }));
  $$('[data-analytics-range]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => {
    state.analyticsRange = button.dataset.analyticsRange;
    renderDashboard();
  }));
  $$('[data-open-activity]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => {
    closeDialog($('#dashboard'));
    renderActivity(activityBySlug(button.dataset.openActivity));
  }));
  $$('[data-share-activity]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => shareActivity(activityBySlug(button.dataset.shareActivity))));
  $$('[data-toggle-activity]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => toggleActivity(button.dataset.toggleActivity)));
  $$('[data-publish-chisme]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => setChismePublication(button.dataset.publishChisme, true)));
  $$('[data-hide-chisme]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => setChismePublication(button.dataset.hideChisme, false)));
  $$('[data-edit-activity]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => {
    state.editingActivitySlug = button.dataset.editActivity;
    state.dashboardTab = 'create';
    renderDashboard();
  }));
  $('#admin-create-form')?.addEventListener('submit', createActivity);
  const activityTypeSelect = $('#activity-type-select');
  activityTypeSelect?.addEventListener('change', () => {
    const preview = $('#activity-type-preview i');
    preview.className = activityIconClass(activityTypeSelect.value);
    $('#wheel-admin-guidance').hidden = activityTypeSelect.value !== 'wheel';
    updateWheelPreview();
  });
  $('#admin-create-form [name="options"]')?.addEventListener('input', updateWheelPreview);
  updateWheelPreview();
}

function updateWheelPreview() {
  const preview = $('#admin-wheel-preview');
  if (!preview) return;
  const options = String($('#admin-create-form [name="options"]')?.value || '').split('\n').map(item => item.trim()).filter(Boolean).slice(0, wheelPalette.length);
  preview.innerHTML = options.length ? wheelLegend(options, 'wheel-legend admin-wheel-legend') : '<p class="wheel-preview-empty">Agrega opciones para asignarles un color.</p>';
}

async function createActivity(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const title = String(data.get('title') || '').trim();
  const type = String(data.get('type') || 'poll');
  const options = String(data.get('options') || '').split('\n').map(item => item.trim()).filter(Boolean);
  const editingSlug = String(data.get('editing_slug') || '');
  if (['wheel', 'poll', 'either', 'oracle'].includes(type) && options.length < 2) {
    $('.form-status', form).textContent = 'Agrega al menos dos opciones para esta actividad.';
    return;
  }
  if (type === 'wheel' && options.length > wheelPalette.length) {
    $('.form-status', form).textContent = 'La ruleta admite hasta ' + wheelPalette.length + ' opciones.';
    return;
  }
  if (editingSlug) {
    const existing = activityBySlug(editingSlug);
    if (!existing) return;
    const update = { ...existing, title, description: String(data.get('description') || '').trim(), config: { ...existing.config, options } };
    const status = $('.form-status', form);
    status.textContent = 'Guardando cambios…';
    try {
      if (state.supabase) {
        const { data: saved, error } = await state.supabase.from('activities').update({ title: update.title, description: update.description, config: update.config }).eq('id', existing.id).select().single();
        if (error) throw error;
        Object.assign(update, saved);
      }
      state.activities = state.activities.map(item => item.slug === editingSlug ? update : item);
      state.adminActivities = state.adminActivities.map(item => item.slug === editingSlug ? update : item);
      if (!state.supabase) saveLocalActivities(state.adminActivities);
      renderActivityCards();
      state.editingActivitySlug = '';
      state.dashboardTab = 'activities';
      await renderDashboard();
      toast(state.supabase ? 'Actividad actualizada en la base de datos.' : 'Actividad actualizada en este navegador.');
    } catch (error) {
      status.textContent = error.message || 'No pudimos guardar los cambios.';
    }
    return;
  }
  const baseSlug = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const activity = {
    id: crypto.randomUUID(),
    slug: baseSlug + '-' + Math.random().toString(36).slice(2, 6),
    type,
    title,
    description: String(data.get('description') || ''),
    config: { options },
    is_active: true,
    created_by: state.user?.id || null,
    created_at: new Date().toISOString()
  };
  const status = $('.form-status', form);
  status.textContent = 'Publicando…';
  try {
    if (state.supabase) {
      const { data: saved, error } = await state.supabase.from('activities').insert(activity).select().single();
      if (error) throw error;
      state.activities.push(saved);
      state.adminActivities.push(saved);
    } else {
      state.activities.push(activity);
      state.adminActivities.push(activity);
      saveLocalActivities(state.adminActivities);
    }
    renderActivityCards();
    form.reset();
    status.textContent = state.supabase ? 'Actividad guardada en la base de datos. Ya puedes compartir su enlace ✦' : 'Actividad guardada solo en este navegador. Para compartirla con todos, conecta Supabase.';
  } catch (error) {
    status.textContent = error.message || 'No pudimos publicar la actividad.';
  }
}

async function openDashboard() {
  if (!state.user) {
    openAuth();
    return;
  }
  const admin = state.profile?.role === 'admin';
  await loadInteractions(admin);
  renderDashboard();
  openDialog($('#dashboard'));
}

$$('[data-open-dashboard]').forEach(button => button.addEventListener('click', openDashboard));
$$('[data-close-dashboard]').forEach(button => button.addEventListener('click', () => closeDialog($('#dashboard'))));

$('#logout-button').addEventListener('click', async () => {
  if (state.supabase) await state.supabase.auth.signOut();
  state.user = null;
  state.profile = null;
  state.interactions = [];
  closeDialog($('#dashboard'));
  updateAccountUI();
  toast('Sesión cerrada');
});

async function initSupabase() {
  if (!configured) {
    await loadActivities();
    return;
  }
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    state.supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data } = await state.supabase.auth.getSession();
    const callbackParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    const callbackError = callbackParams.get('error_description') || callbackParams.get('error_code');
    if (callbackError) {
      setAuthMode('login');
      $('#auth-status').textContent = readableAuthError({ message: callbackError });
      openDialog($('#auth-modal'));
      history.replaceState(null, '', location.pathname + location.search);
    } else if (callbackParams.get('type') === 'signup' && data.session) {
      toast('Correo confirmado. Tu cuenta ya está activa ✦');
      history.replaceState(null, '', location.pathname + location.search);
    }
    state.user = data.session?.user || null;
    if (state.user) await loadProfile();
    await loadActivities();
    updateAccountUI();
    state.supabase.auth.onAuthStateChange(async (_event, session) => {
      state.user = session?.user || null;
      state.profile = null;
      if (state.user) await loadProfile();
      await loadActivities();
      updateAccountUI();
      if ($('#dashboard').open) {
        await loadInteractions(state.profile?.role === 'admin');
        renderDashboard();
      }
    });
    state.realtimeChannel = state.supabase.channel('jatsi-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interactions' }, payload => {
        if (state.profile?.role === 'admin') {
          state.interactions.unshift(payload.new);
          if ($('#dashboard').open) renderDashboard();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'interactions' }, payload => {
        if (state.profile?.role === 'admin') {
          state.interactions = state.interactions.map(item => item.id === payload.new.id ? payload.new : item);
          if ($('#dashboard').open) renderDashboard();
        }
        if (payload.new.payload?.form_type === 'chismografo') loadPublicChisme();
      })
      .subscribe();
  } catch (error) {
    console.warn('Supabase no disponible; se conserva el modo demo.', error);
    state.supabase = null;
  }
}

// Visual motion and progressive reveals.
const header = $('#site-header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30), { passive: true });

const menuButton = $('#menu-button');
const mobileMenu = $('#mobile-menu');
menuButton.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
$$('a', mobileMenu).forEach(link => link.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .13 });
$$('.reveal').forEach(element => revealObserver.observe(element));

const hero = $('.hero');
if (!prefersReducedMotion.matches) {
  hero.addEventListener('pointermove', event => {
    const x = (event.clientX / innerWidth - .5) * 10;
    const y = (event.clientY / innerHeight - .5) * 8;
    $('.hero-art').style.transform = 'scale(1.055) translate3d(' + x + 'px,' + y + 'px,0)';
    const hud = $('.portal-hud');
    if (hud) hud.style.transform = 'translate3d(' + (-x * 1.4) + 'px,' + (-y * 1.4) + 'px,0) rotateX(' + (y * -.18) + 'deg) rotateY(' + (x * .18) + 'deg)';
  });
  hero.addEventListener('pointerleave', () => {
    $('.hero-art').style.transform = '';
    const hud = $('.portal-hud');
    if (hud) hud.style.transform = '';
  });
}

// Technical HUD navigation and tactile portal cards.
const sectorLinks = $$('.sector-rail a');
const trackedSections = sectorLinks.map(link => document.getElementById(link.dataset.sector)).filter(Boolean);
let interfaceFrame = 0;
function updateInterface() {
  interfaceFrame = 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  document.documentElement.style.setProperty('--scroll-progress', Math.min(100, (scrollY / maxScroll) * 100) + '%');
  const focusLine = scrollY + innerHeight * .42;
  let activeId = trackedSections[0]?.id;
  trackedSections.forEach(section => {
    if (section.offsetTop <= focusLine) activeId = section.id;
  });
  sectorLinks.forEach(link => link.classList.toggle('active', link.dataset.sector === activeId));
}
addEventListener('scroll', () => {
  if (!interfaceFrame) interfaceFrame = requestAnimationFrame(updateInterface);
}, { passive: true });
addEventListener('resize', updateInterface);
updateInterface();

if (!prefersReducedMotion.matches && matchMedia('(pointer:fine)').matches) {
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--rx', ((.5 - py) * 5).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((px - .5) * 6).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '15%');
    });
  });
}

const signalMap = $('#signal-map');
const signalTitle = $('#signal-readout-title');
if (signalMap) {
  $$('.signal-node', signalMap).forEach(node => {
    const selectNode = () => {
      $$('.signal-node', signalMap).forEach(item => item.classList.toggle('active', item === node));
      signalTitle.textContent = node.dataset.label;
    };
    node.addEventListener('pointerenter', selectNode);
    node.addEventListener('focus', selectNode);
  });
  if (!prefersReducedMotion.matches && matchMedia('(pointer:fine)').matches) {
    signalMap.addEventListener('pointermove', event => {
      const rect = signalMap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      $('svg', signalMap).style.transform = 'translate3d(' + (x * 14) + 'px,' + (y * 14) + 'px,0) rotate(' + (x * .8) + 'deg)';
    });
    signalMap.addEventListener('pointerleave', () => { $('svg', signalMap).style.transform = ''; });
  }
}

// Lightweight particle field.
const canvas = $('#star-canvas');
const context = canvas.getContext('2d');
let stars = [];
let pointer = { x: -1000, y: -1000 };
function resizeCanvas() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(100, Math.floor(innerWidth / 13));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.3 + .25,
    speed: Math.random() * .09 + .025,
    phase: Math.random() * Math.PI * 2
  }));
}
function drawStars(time = 0) {
  context.clearRect(0, 0, innerWidth, innerHeight);
  stars.forEach(star => {
    star.y -= star.speed;
    if (star.y < -5) star.y = innerHeight + 5;
    const dx = pointer.x - star.x;
    const dy = pointer.y - star.y;
    const distance = Math.hypot(dx, dy);
    const pull = distance < 130 ? (130 - distance) / 130 : 0;
    const renderX = star.x - dx * pull * .025;
    const renderY = star.y - dy * pull * .025;
    context.beginPath();
    context.arc(renderX, renderY, star.r, 0, Math.PI * 2);
    context.fillStyle = 'rgba(229,214,255,' + (.32 + Math.sin(time * .001 + star.phase) * .2) + ')';
    context.fill();
  });
  if (!prefersReducedMotion.matches) requestAnimationFrame(drawStars);
}
resizeCanvas();
drawStars();
addEventListener('resize', resizeCanvas);
addEventListener('pointermove', event => { pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });

// Reproductor real: comienza solo cuando la persona lo activa.
const backgroundMusic = $('#background-music');
const musicButton = $('#site-header .sound-toggle');
const musicVolume = $('#music-volume');
backgroundMusic.volume = Number(musicVolume.value);
musicVolume.addEventListener('input', () => { backgroundMusic.volume = Number(musicVolume.value); });
musicButton.addEventListener('click', async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
      musicButton.parentElement.classList.add('is-playing');
      musicButton.setAttribute('aria-pressed', 'true');
      musicButton.innerHTML = '<i class="iconoir-pause"></i><span class="music-label">Música</span>';
      musicButton.setAttribute('aria-label', 'Pausar música de violín');
      musicButton.title = 'Pausar música de violín';
    } catch {
      toast('No se pudo cargar la música. Comprueba tu conexión e inténtalo de nuevo.');
    }
  } else {
    backgroundMusic.pause();
    musicButton.parentElement.classList.remove('is-playing');
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.innerHTML = '<i class="iconoir-play"></i><span class="music-label">Música</span>';
    musicButton.setAttribute('aria-label', 'Reproducir música de violín');
    musicButton.title = 'Reproducir música de violín';
  }
});
backgroundMusic.addEventListener('error', () => {
  musicButton.parentElement.classList.remove('is-playing');
  musicButton.setAttribute('aria-pressed', 'false');
  musicButton.innerHTML = '<i class="iconoir-play"></i><span class="music-label">Música</span>';
  toast('No se pudo cargar la pista de violín.');
});
let resumeMusicWhenVisible = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    resumeMusicWhenVisible = !backgroundMusic.paused;
    if (resumeMusicWhenVisible) backgroundMusic.pause();
  } else if (resumeMusicWhenVisible) {
    resumeMusicWhenVisible = false;
    backgroundMusic.play().catch(() => {});
  }
});
// A small dismissible invitation makes the holiday registry visible without
// covering the page. It stays dismissed for the current browsing session.
const giftFloat = $('#gift-float');
const giftFloatClose = $('#gift-float-close');
if (giftFloat && giftFloatClose && !sessionStorage.getItem('gift-float-dismissed')) {
  setTimeout(() => {
    if (!document.querySelector('.dashboard[open]')) giftFloat.hidden = false;
  }, 2600);
  giftFloatClose.addEventListener('click', () => {
    giftFloat.hidden = true;
    sessionStorage.setItem('gift-float-dismissed', '1');
  });
  giftFloat.querySelector('a').addEventListener('click', () => { giftFloat.hidden = true; });
}

$('#copy-clabe').addEventListener('click', () => copyText('012272015568267840', 'CLABE copiada ♡'));

// Curated public highlights from Twitch and YouTube, plus TikTok links supplied by Jatsi.
const clipItems = [
  { platform:'youtube', id:'s8aVMa9STcY', title:'¡Doblaje de Lily! ¿Rescatarás a los huérfanos?', views:'6.7 mil vistas', image:'s8aVMa9STcY.jpg' },
  { platform:'youtube', id:'bOy8bmq7SdY', title:'Doblaje divertido con Mommy y Miss Poppy', views:'5.8 mil vistas', image:'bOy8bmq7SdY.jpg' },
  { platform:'youtube', id:'88_W7AG0AT0', title:'¡Corre! Streamer confundido por su equipo', views:'1.2 mil vistas', image:'88_W7AG0AT0.jpg' },
  { platform:'tiktok', handle:'jatsi_vt', id:'7668451724335598869', title:'Clip de Jatsi en TikTok' },
  { platform:'tiktok', handle:'jatsi_vt', id:'7684423239497420050', title:'Clip de Jatsi en TikTok' },
  { platform:'tiktok', handle:'jatsi_vt', id:'7695680160225365254', title:'Clip de Jatsi en TikTok' },
  { platform:'tiktok', handle:'katsyvt', id:'7684396430290603284', title:'Clip de Katsy en TikTok' },
  { platform:'tiktok', handle:'katsyvt', id:'7664735968825560338', title:'Clip de Katsy en TikTok' },
  { platform:'tiktok', handle:'katsyvt', id:'7637387920063597831', title:'Clip de Katsy en TikTok' },
  { platform:'twitch', id:'HappyAbstruseSmoothieYouDontSay-dq9HpfLzcPRLvSwz', title:'Por mala clip', views:'78 vistas', image:'HappyAbstruseSmoothieYouDontSay-dq9HpfLzcPRLvSwz.jpg' },
  { platform:'twitch', id:'TriangularSillyTrayCorgiDerp-jgECmmStqzUxYvvi', title:'Modo transformers', views:'59 vistas', image:'TriangularSillyTrayCorgiDerp-jgECmmStqzUxYvvi.jpg' },
  { platform:'twitch', id:'LovelyBoredRamenThunBeast-fGy3XGdXnNnWIoI-', title:'Onichan', views:'43 vistas', image:'LovelyBoredRamenThunBeast-fGy3XGdXnNnWIoI-.jpg' },
  { platform:'twitch', id:'AthleticMagnificentNigiriPogChamp-BrZDTXp9YIdUKZXO', title:'Jatsi siento Jatsi', views:'25 vistas', image:'AthleticMagnificentNigiriPogChamp-BrZDTXp9YIdUKZXO.jpg' },
  { platform:'twitch', id:'ObliviousBlazingLasagnaChocolateRain-k4cYuEl-vl49tAIT', title:'Manqueando con seguidores', views:'21 vistas', image:'ObliviousBlazingLasagnaChocolateRain-k4cYuEl-vl49tAIT.jpg' },
  { platform:'twitch', id:'DarkShinyAlmondMikeHogu-HL82hWirWUvr1wV_', title:'Uy, una obra de arte', views:'13 vistas', image:'DarkShinyAlmondMikeHogu-HL82hWirWUvr1wV_.jpg' },
  { platform:'twitch', id:'GloriousDeterminedFalconAsianGlow-hh17OPaB6_G_IkZ7', title:'Valiste', views:'11 vistas', image:'GloriousDeterminedFalconAsianGlow-hh17OPaB6_G_IkZ7.jpg' },
  { platform:'twitch', id:'CuteSnappyFlyCmonBruh-V6GbhgWuVXiszXa7', title:'Hola amor', views:'7 vistas', image:'CuteSnappyFlyCmonBruh-V6GbhgWuVXiszXa7.jpg' },
  { platform:'twitch', id:'TardyStupidChinchillaJKanStyle-a_VAU2WA6Wu-8g_y', title:'Repo interactivo, platiquita y Genshin', views:'6 vistas', image:'TardyStupidChinchillaJKanStyle-a_VAU2WA6Wu-8g_y.jpg' },
  { platform:'twitch', id:'MistyIronicGoatStrawBeary-zlt53xJqPd_2TfTq', title:'La sumisa complaciente', views:'6 vistas', image:'MistyIronicGoatStrawBeary-zlt53xJqPd_2TfTq.jpg' },
  { platform:'twitch', id:'RenownedFlirtyAmazonVoteNay-om_0v9KkFS7gZHOi', title:'¿Se la qué?', views:'5 vistas', image:'RenownedFlirtyAmazonVoteNay-om_0v9KkFS7gZHOi.jpg' },
  { platform:'twitch', id:'KathishVibrantTardigradeRedCoat-KrrjvNowk-QmUUK-', title:'XD', views:'4 vistas', image:'KathishVibrantTardigradeRedCoat-KrrjvNowk-QmUUK-.jpg' },
  { platform:'twitch', id:'SteamyUnusualStinkbugMikeHogu-WHHKhZZcM8mVlph3', title:'Sumisa', views:'4 vistas', image:'SteamyUnusualStinkbugMikeHogu-WHHKhZZcM8mVlph3.jpg' }
];

const clipTrack = $('#clip-track');
if (clipTrack) {
  const labels = { twitch:'TWITCH CLIP', youtube:'YOUTUBE SHORT', tiktok:'TIKTOK' };
  const links = {
    twitch: id => 'https://www.twitch.tv/jatsi25/clip/' + id,
    youtube: id => 'https://www.youtube.com/shorts/' + id,
    tiktok: (id, clip) => 'https://www.tiktok.com/@' + clip.handle + '/video/' + id
  };
  clipItems.forEach((clip, index) => {
    const url = links[clip.platform](clip.id, clip);
    const card = document.createElement('article');
    card.className = 'clip-card';
    const frame = document.createElement('div');
    frame.className = 'clip-frame' + (clip.image ? '' : ' clip-art-poster clip-art-' + clip.platform);
    frame.dataset.clipPlatform = clip.platform;
    frame.dataset.clipId = clip.id;
    frame.dataset.clipTitle = clip.title;
    const poster = document.createElement('img');
    poster.className = 'clip-poster';
    poster.alt = 'Vista previa: ' + clip.title;
    poster.loading = index < 3 ? 'eager' : 'lazy';
    if (clip.image) poster.src = 'assets/clips/curated/' + clip.image;
    else poster.hidden = true;
    const badge = document.createElement('span');
    badge.className = 'clip-platform-pill';
    badge.textContent = labels[clip.platform];
    const play = document.createElement('button');
    play.className = 'clip-launch'; play.type = 'button';
    play.innerHTML = '<i aria-hidden="true">▶</i> Reproducir';
    const open = document.createElement('a');
    open.className = 'clip-open'; open.href = url; open.target = '_blank'; open.rel = 'noopener noreferrer';
    open.setAttribute('aria-label', 'Abrir clip en ' + labels[clip.platform]); open.textContent = '↗';
    frame.append(poster);
    if (!clip.image) {
      const artwork = document.createElement('div');
      artwork.className = 'clip-art-copy';
      artwork.innerHTML = '<i aria-hidden="true">' + (clip.platform === 'youtube' ? '▶' : '♪') + '</i><strong>' + (clip.platform === 'youtube' ? 'YOUTUBE SHORT' : 'MOMENTO TIKTOK') + '</strong>';
      frame.append(artwork);
    }
    frame.append(badge, play, open);
    const caption = document.createElement('div');
    caption.className = 'clip-caption';
    const eyebrow = document.createElement('span'); eyebrow.textContent = clip.views ? labels[clip.platform] + ' · ' + clip.views : labels[clip.platform] + ' · DESTACADO';
    const title = document.createElement('h4'); title.textContent = clip.title;
    const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.innerHTML = 'Abrir clip <b>↗</b>';
    caption.append(eyebrow, title, link); card.append(frame, caption); clipTrack.append(card);
  });

  const position = $('#clip-position');
  const progress = $('#clip-progress');
  const updateClipCarousel = () => {
    const maxScroll = clipTrack.scrollWidth - clipTrack.clientWidth;
    const first = Math.min(clipItems.length, Math.max(1, Math.round(clipTrack.scrollLeft / (clipTrack.querySelector('.clip-card').getBoundingClientRect().width + 18)) + 1));
    if (position) position.textContent = String(first).padStart(2, '0') + ' / ' + String(clipItems.length).padStart(2, '0');
    if (progress) progress.style.width = (maxScroll > 0 ? Math.max(8, clipTrack.scrollLeft / maxScroll * 100) : 100) + '%';
  };
  $('.clip-prev')?.addEventListener('click', () => clipTrack.scrollBy({ left: -clipTrack.clientWidth * .82, behavior: 'smooth' }));
  $('.clip-next')?.addEventListener('click', () => clipTrack.scrollBy({ left: clipTrack.clientWidth * .82, behavior: 'smooth' }));
  clipTrack.addEventListener('scroll', updateClipCarousel, { passive: true });
  addEventListener('resize', updateClipCarousel);
  updateClipCarousel();

  // Create an embedded player only after explicit click to keep the page quick and quiet.
  $$('[data-clip-platform]', clipTrack).forEach(frame => {
    const button = $('.clip-launch', frame);
    const directLink = $('.clip-open', frame);
    button.addEventListener('click', () => {
      // YouTube requires a web origin for its player, and Twitch requires a
      // valid parent domain. TikTok's official iframe player also works from
      // this static-file preview, so keep it embedded there.
      if ((location.protocol === 'file:' && frame.dataset.clipPlatform !== 'tiktok') ||
          (frame.dataset.clipPlatform === 'twitch' && frame.clientWidth < 400)) {
        window.open(directLink.href, '_blank', 'noopener,noreferrer'); return;
      }
      let playerUrl;
      if (frame.dataset.clipPlatform === 'twitch') {
        const parents = new Set();
        if (location.hostname) parents.add(location.hostname);
        try { for (const origin of Array.from(location.ancestorOrigins || [])) { const hostname = new URL(origin).hostname; if (hostname) parents.add(hostname); } } catch { /* optional browser capability */ }
        parents.add('jatsi.github.io');
        playerUrl = new URL('https://clips.twitch.tv/embed');
        playerUrl.searchParams.set('clip', frame.dataset.clipId);
        for (const parent of parents) playerUrl.searchParams.append('parent', parent);
        playerUrl.searchParams.set('autoplay', 'false'); playerUrl.searchParams.set('muted', 'true');
      } else if (frame.dataset.clipPlatform === 'youtube') {
        playerUrl = new URL('https://www.youtube.com/embed/' + frame.dataset.clipId);
        playerUrl.searchParams.set('autoplay', '1'); playerUrl.searchParams.set('rel', '0');
        if (location.origin && location.origin !== 'null') playerUrl.searchParams.set('origin', location.origin);
      } else {
        playerUrl = new URL('https://www.tiktok.com/player/v1/' + frame.dataset.clipId);
        playerUrl.searchParams.set('music_info', '0'); playerUrl.searchParams.set('description', '0');
      }
      const player = document.createElement('iframe');
      player.className = 'clip-embed'; player.title = frame.dataset.clipTitle + ' — reproductor';
      player.width = '640'; player.height = '360'; player.loading = 'eager';
      player.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture'; player.allowFullscreen = true;
      player.referrerPolicy = 'strict-origin-when-cross-origin'; player.src = playerUrl.toString();
      frame.replaceChildren(player, directLink); frame.classList.add('is-playing');
      if (frame.dataset.clipPlatform === 'twitch') frame.classList.add('is-twitch-player');
      if (frame.dataset.clipPlatform === 'tiktok') frame.classList.add('is-tiktok-player');
    });
  });
}

// Initial deep link and startup. Keeping this as a regular script also lets the
// static page open directly from disk without browsers blocking ES modules.
initSupabase().finally(() => {
  loadPublicChisme();
  setTimeout(() => $('#portal-intro').classList.add('done'), prefersReducedMotion.matches ? 0 : 950);
  const deepLink = new URL(location.href).searchParams.get('activity');
  if (deepLink) {
    const activity = activityBySlug(deepLink);
    if (activity) setTimeout(() => renderActivity(activity), 1150);
  }
});
