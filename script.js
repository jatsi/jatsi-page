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

const seedActivities = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'ruleta-cosmica',
    type: 'wheel',
    title: 'Ruleta cósmica',
    description: 'El universo elige el reto del próximo stream.',
    config: { options: ['Cantar una canción', 'Reto sin reír', 'Chat elige el juego', 'Historia vergonzosa', 'Imitar a Katsy', 'Sorpresa del cosmos'] },
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
    title: 'Oráculo de Katsy',
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
  }
];

const wheelPalette = ['#a96aff', '#42caeb', '#fa75bc', '#7251dc', '#efae66', '#5fe0c3', '#ff8a72', '#9db4ff', '#f1cf5c', '#b989ff', '#69d5a9', '#ee83e7'];

const demoMessages = [
  { id: 'demo-1', activity_id: seedActivities[2].id, user_id: null, kind: 'message', payload: { text: 'Tu comunidad se siente como un lugar seguro. Gracias por crearla ♡', anonymous: true }, created_at: new Date(Date.now() - 18 * 60000).toISOString(), demo: true },
  { id: 'demo-2', activity_id: seedActivities[5].id, user_id: 'demo-fan', kind: 'question', payload: { text: '¿Qué personaje de anime te inspiró a empezar?', anonymous: false }, created_at: new Date(Date.now() - 74 * 60000).toISOString(), demo: true },
  { id: 'demo-3', activity_id: seedActivities[2].id, user_id: null, kind: 'message', payload: { text: '¿Harías un stream dibujando con la comunidad?', anonymous: true }, created_at: new Date(Date.now() - 142 * 60000).toISOString(), demo: true }
];

const state = {
  supabase: null,
  user: null,
  profile: null,
  activities: [...seedActivities],
  interactions: [],
  authMode: 'login',
  dashboardTab: 'overview',
  editingActivitySlug: '',
  realtimeChannel: null
};

const localKey = 'jatsi-universe-interactions';
const visitorKey = 'jatsi-universe-visitor';
const visitorId = localStorage.getItem(visitorKey) || crypto.randomUUID();
localStorage.setItem(visitorKey, visitorId);

function safeJSON(value, fallback) {
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
}

function localInteractions() {
  return safeJSON(localStorage.getItem(localKey), []);
}

function saveLocalInteraction(interaction) {
  const current = localInteractions();
  current.unshift(interaction);
  localStorage.setItem(localKey, JSON.stringify(current.slice(0, 250)));
}

function activityBySlug(slug) {
  return state.activities.find(item => item.slug === slug) || seedActivities.find(item => item.slug === slug);
}

function activityById(id) {
  return state.activities.find(item => item.id === id) || seedActivities.find(item => item.id === id);
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

function renderActivity(activity) {
  const container = $('#activity-modal-content');
  const options = activity.config?.options || [];
  const icon = activityIconClass(activity.type);
  const intro = '<div class="activity-shell"><div class="activity-modal-heading"><span><i class="' + icon + '"></i></span><div><p class="kicker">ENTRETENIMIENTO · ' + escapeHTML(activity.type) + '</p><h2>' + escapeHTML(activity.title) + '</h2></div></div><p>' + escapeHTML(activity.description || '') + '</p>';
  const share = '<div class="share-row"><button class="button button-glass" type="button" data-share-current><i class="iconoir-send-diagonal"></i> Copiar enlace para Discord</button></div>';

  if (activity.type === 'wheel') {
    container.innerHTML = intro + '<div class="roulette-card"><div class="roulette-card-heading"><span><i class="iconoir-sparks"></i>DESTINO ALEATORIO</span><small>' + options.length + ' OPCIONES · TODAS LAS FORTUNAS</small></div><div class="wheel-stage">' + wheelMarkup(options) + '</div>' + wheelLegend(options) + '<button class="button button-primary" id="spin-wheel" type="button"><i class="iconoir-refresh-double"></i> Girar la ruleta</button><div id="activity-result"></div></div>' + share + '</div>';
    $('#spin-wheel').addEventListener('click', () => spinWheel(activity));
  } else if (activity.type === 'poll' || activity.type === 'either') {
    container.innerHTML = intro + '<div class="choice-list">' + options.map((option, index) => '<button class="choice-button" type="button" data-choice="' + index + '"><i class="' + icon + '"></i><span>' + escapeHTML(option) + '</span><b>' + String(index + 1).padStart(2, '0') + '</b></button>').join('') + '</div><div id="activity-result"></div>' + share + '</div>';
    $$('[data-choice]', container).forEach(button => button.addEventListener('click', () => vote(activity, Number(button.dataset.choice), button)));
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
    const { data, error } = await state.supabase.from('interactions').insert(row).select().single();
    if (error) throw error;
    state.interactions.unshift(data);
    return data;
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
    status.textContent = 'Llegó al universo de Jatsi. Gracias por compartir ♡';
  } catch {
    status.textContent = 'No pudimos enviarlo. Revisa tu conexión e intenta otra vez.';
  }
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
}

function openAuth() {
  setAuthMode('login');
  openDialog($('#auth-modal'));
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

  if (!state.supabase) {
    state.user = { id: 'demo-' + btoa(email).replace(/=/g, '').slice(0, 12), email };
    state.profile = { display_name: displayName || email.split('@')[0] || 'Explorador', role: email.toLowerCase().startsWith('jatsi') || email.toLowerCase().includes('admin') ? 'admin' : 'user' };
    updateAccountUI();
    closeDialog($('#auth-modal'));
    toast('Entraste en modo demostración');
    openDashboard();
    return;
  }

  try {
    if (state.authMode === 'register') {
      const { data: result, error } = await state.supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
      if (error) throw error;
      if (!result.session) {
        status.textContent = 'Revisa tu correo para confirmar la cuenta ✦';
        return;
      }
    } else {
      const { error } = await state.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
    closeDialog($('#auth-modal'));
    toast('Portal abierto. Bienvenid@ ✦');
  } catch (error) {
    status.textContent = error.message || 'No pudimos abrir el portal.';
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
  if (!state.supabase) return;
  const { data, error } = await state.supabase.from('activities').select('*').eq('is_active', true).order('created_at', { ascending: true });
  if (!error && data?.length) state.activities = data;
}

async function loadInteractions(all = false) {
  if (!state.supabase) {
    const local = localInteractions();
    state.interactions = state.profile?.role === 'admin' && all ? [...local, ...demoMessages] : local.filter(item => item.user_id === state.user?.id || item.visitor_id === visitorId);
    return;
  }
  let query = state.supabase.from('interactions').select('*').order('created_at', { ascending: false }).limit(500);
  if (!all) query = query.eq('user_id', state.user.id);
  const { data, error } = await query;
  state.interactions = error ? [] : data;
}

function dashboardNav() {
  const admin = state.profile?.role === 'admin';
  const items = admin
    ? [['overview', 'iconoir-dashboard', 'Resumen'], ['messages', 'iconoir-chat-lines', 'Mensajes'], ['activities', 'iconoir-playlist-play', 'Actividades'], ['create', 'iconoir-plus', 'Crear actividad'], ['analytics', 'iconoir-stats-report', 'Analíticas']]
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
  if (item.payload?.text) return (item.payload.display_name || 'Anónimo') + ': ' + item.payload.text;
  if (item.payload?.option) return 'Elegiste: ' + item.payload.option;
  if (item.payload?.result) return 'Resultado: ' + item.payload.result;
  return 'Interacción registrada';
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
  return '<div class="metric-grid">' + metricCard('iconoir-graph-up', 'INTERACCIONES', state.interactions.length, 'Datos disponibles') + metricCard('iconoir-chat-lines', 'MENSAJES', messages.length, messages.filter(item => Date.now() - new Date(item.created_at) < 86400000).length + ' hoy') + metricCard('iconoir-stats-up-square', 'VOTOS', votes.length, 'Encuestas activas') + metricCard('iconoir-playlist-play', 'ACTIVIDADES', state.activities.length, 'Publicadas') + '</div><div class="dashboard-grid"><section class="panel"><h3>Actividad reciente</h3>' + historyHTML(state.interactions.slice(0, 8)) + '</section><section class="panel"><h3>Estado del universo</h3><div class="history-item"><span><i class="iconoir-database-check"></i></span><div><strong>Base de datos</strong><small>' + (configured ? 'Conectada y protegida' : 'Modo demo local') + '</small></div><small class="status-pill">Activa</small></div><div class="history-item"><span><i class="iconoir-link"></i></span><div><strong>Enlaces</strong><small>Listos para Discord</small></div><small class="status-pill">OK</small></div></section></div>';
}

function userOverview() {
  const messages = state.interactions.filter(item => ['message', 'question'].includes(item.kind));
  const votes = state.interactions.filter(item => ['poll', 'either'].includes(item.kind));
  return '<div class="metric-grid">' + metricCard('iconoir-chat-lines', 'MIS MENSAJES', messages.length, 'Guardados') + metricCard('iconoir-stats-up-square', 'MIS VOTOS', votes.length, 'Decisiones') + metricCard('iconoir-refresh-double', 'GIROS', state.interactions.filter(item => item.kind === 'wheel').length, 'Destinos') + metricCard('iconoir-magic-wand', 'SEÑALES', state.interactions.filter(item => item.kind === 'oracle').length, 'Del oráculo') + '</div><div class="dashboard-grid"><section class="panel"><h3>Tu historia reciente</h3>' + historyHTML(state.interactions.slice(0, 8), 'Participa en una actividad y aparecerá aquí.') + '</section><section class="panel"><h3>Portal rápido</h3>' + state.activities.slice(0, 4).map(item => '<div class="history-item"><span>' + typeIcon(item.type) + '</span><div><strong>' + escapeHTML(item.title) + '</strong><small>' + escapeHTML(item.description) + '</small></div><button class="share-icon" type="button" data-open-activity="' + item.slug + '"><i class="iconoir-arrow-up-right"></i></button></div>').join('') + '</section></div>';
}

function messagesPanel() {
  const messages = state.interactions.filter(item => ['message', 'question'].includes(item.kind));
  return '<section class="panel"><h3>Mensajes recibidos</h3>' + historyHTML(messages, 'Aún no han llegado mensajes.') + '</section>';
}

function activitiesPanel() {
  return '<section class="panel table-wrap"><h3>Actividades publicadas</h3><table class="data-table"><thead><tr><th>TÍTULO</th><th>TIPO</th><th>ESTADO</th><th>ADMINISTRAR</th></tr></thead><tbody>' + state.activities.map(item => '<tr><td>' + escapeHTML(item.title) + '</td><td>' + escapeHTML(item.type) + '</td><td><span class="status-pill">' + (item.is_active ? 'Activa' : 'Pausada') + '</span></td><td class="activity-admin-actions">' + (item.type === 'wheel' ? '<button class="admin-table-action" type="button" data-edit-activity="' + item.slug + '"><i class="iconoir-edit"></i>Editar opciones</button>' : '') + '<button class="share-icon" type="button" data-share-activity="' + item.slug + '" aria-label="Compartir ' + escapeHTML(item.title) + '"><i class="iconoir-link"></i></button></td></tr>').join('') + '</tbody></table></section>';
}

function createPanel() {
  const activity = state.editingActivitySlug ? activityBySlug(state.editingActivitySlug) : null;
  const options = activity?.config?.options || [];
  const selectedType = activity?.type || 'poll';
  const optionsMarkup = '<div class="wheel-admin-guidance" id="wheel-admin-guidance" ' + (selectedType === 'wheel' ? '' : 'hidden') + '><small class="field-hint">Cada renglón ocupa el color que ves aquí:</small><div class="admin-wheel-preview" id="admin-wheel-preview"></div></div>';
  return '<section class="panel create-panel"><div class="create-panel-intro"><span id="activity-type-preview"><i class="' + activityIconClass(selectedType) + '"></i></span><div><small>' + (activity ? 'AJUSTES DE ACTIVIDAD' : 'COMPOSITOR DE EXPERIENCIAS') + '</small><h3>' + (activity ? 'Editar ruleta' : 'Nueva actividad') + '</h3><p>' + (activity ? 'Actualiza las acciones, el título o la descripción de esta ruleta.' : 'Crea una experiencia y recibe un enlace listo para compartir en Discord.') + '</p></div></div><form class="admin-create" id="admin-create-form"><input type="hidden" name="editing_slug" value="' + (activity?.slug || '') + '"><div class="admin-form-grid"><label><span><i class="iconoir-list-select"></i>Tipo de actividad</span><select id="activity-type-select" name="type" ' + (activity ? 'disabled' : '') + '><option value="poll" ' + (selectedType === 'poll' ? 'selected' : '') + '>Encuesta</option><option value="wheel" ' + (selectedType === 'wheel' ? 'selected' : '') + '>Ruleta</option><option value="message" ' + (selectedType === 'message' ? 'selected' : '') + '>Buzón de mensajes</option><option value="question" ' + (selectedType === 'question' ? 'selected' : '') + '>Caja de preguntas</option><option value="either" ' + (selectedType === 'either' ? 'selected' : '') + '>Esto o aquello</option><option value="oracle" ' + (selectedType === 'oracle' ? 'selected' : '') + '>Oráculo</option></select>' + (activity ? '<input type="hidden" name="type" value="wheel">' : '') + '</label><label><span><i class="iconoir-edit"></i>Título</span><input name="title" required placeholder="Ej. ¿Qué jugamos el viernes?" value="' + escapeHTML(activity?.title || '') + '"></label></div><label><span><i class="iconoir-message-text"></i>Descripción</span><textarea name="description" placeholder="Cuéntale a la comunidad qué debe hacer">' + escapeHTML(activity?.description || '') + '</textarea></label><label class="options-label"><span><i class="iconoir-list"></i>Opciones <small>(una por línea)</small></span><textarea name="options" placeholder="Una acción por renglón; hasta 12 opciones">' + escapeHTML(options.join('\n')) + '</textarea>' + optionsMarkup + '</label><button class="button button-primary" type="submit"><i class="iconoir-sparks"></i> ' + (activity ? 'Guardar cambios' : 'Publicar actividad') + '</button><p class="form-status" role="status"></p></form></section>';
}

function analyticsPanel() {
  const byKind = ['message', 'question', 'poll', 'either', 'wheel', 'oracle'].map(kind => ({ kind, count: state.interactions.filter(item => item.kind === kind).length }));
  const max = Math.max(1, ...byKind.map(item => item.count));
  return '<div class="metric-grid">' + byKind.slice(0, 4).map(item => '<div class="metric"><small>' + item.kind.toUpperCase() + '</small><strong>' + item.count + '</strong><em>' + Math.round((item.count / Math.max(1, state.interactions.length)) * 100) + '% del total</em></div>').join('') + '</div><section class="panel" style="margin-top:15px"><h3>Actividad por experiencia</h3><div class="poll-visual" style="height:260px;justify-content:flex-start;align-items:end">' + byKind.map(item => '<i title="' + item.kind + ': ' + item.count + '" style="--value:' + Math.max(8, (item.count / max) * 100) + '%"></i>').join('') + '</div></section>';
}

async function renderDashboard() {
  const admin = state.profile?.role === 'admin';
  if (!admin && ['messages', 'activities', 'create', 'analytics'].includes(state.dashboardTab)) state.dashboardTab = 'overview';
  dashboardNav();
  $('#dashboard-avatar').textContent = (state.profile?.display_name || '✦').charAt(0).toUpperCase();
  $('#dashboard-name').textContent = state.profile?.display_name || 'Explorador';
  $('#dashboard-role').textContent = admin ? 'Administradora' : 'Explorador';
  $('#dashboard-eyebrow').textContent = admin ? 'CENTRO DE COMANDO' : 'MI CONSTELACIÓN';
  const titles = { overview: admin ? 'El universo, de un vistazo.' : 'Bienvenid@ de vuelta.', messages: 'Mensajes del cosmos.', activities: 'Portales publicados.', create: 'Abre un nuevo portal.', analytics: 'Pulso de la comunidad.', history: 'Tu historia en el universo.' };
  $('#dashboard-heading').textContent = titles[state.dashboardTab];
  const views = {
    overview: admin ? adminOverview() : userOverview(),
    messages: messagesPanel(),
    activities: activitiesPanel(),
    create: createPanel(),
    analytics: analyticsPanel(),
    history: '<section class="panel"><h3>Todo tu historial</h3>' + historyHTML(state.interactions, 'Aún no has enviado nada.') + '</section>'
  };
  $('#dashboard-content').innerHTML = views[state.dashboardTab] || views.overview;
  $$('[data-open-activity]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => {
    closeDialog($('#dashboard'));
    renderActivity(activityBySlug(button.dataset.openActivity));
  }));
  $$('[data-share-activity]', $('#dashboard-content')).forEach(button => button.addEventListener('click', () => shareActivity(activityBySlug(button.dataset.shareActivity))));
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
      state.editingActivitySlug = '';
      state.dashboardTab = 'activities';
      await renderDashboard();
      toast('La ruleta y su leyenda ya están actualizadas.');
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
    } else {
      state.activities.push(activity);
    }
    form.reset();
    status.textContent = 'Actividad publicada. Ya puedes compartir su enlace ✦';
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
    state.user = data.session?.user || null;
    if (state.user) await loadProfile();
    await loadActivities();
    updateAccountUI();
    state.supabase.auth.onAuthStateChange(async (_event, session) => {
      state.user = session?.user || null;
      state.profile = null;
      if (state.user) await loadProfile();
      updateAccountUI();
    });
    state.realtimeChannel = state.supabase.channel('jatsi-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interactions' }, payload => {
        if (state.profile?.role === 'admin') {
          state.interactions.unshift(payload.new);
          if ($('#dashboard').open) renderDashboard();
        }
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

// Optional soundscape starts only after a deliberate user action.
let audioContext;
let audioNodes = [];
$('#site-header .sound-toggle').addEventListener('click', async event => {
  const button = event.currentTarget;
  const active = button.getAttribute('aria-pressed') === 'true';
  if (active) {
    audioNodes.forEach(node => { try { node.stop(); } catch { /* already stopped */ } });
    audioNodes = [];
    audioContext?.close();
    audioContext = null;
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<i class="iconoir-sound-low"></i>';
    button.setAttribute('aria-label', 'Activar sonido ambiental');
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    toast('El sonido ambiental no está disponible en este navegador.');
    return;
  }
  audioContext = new AudioContextClass();
  const master = audioContext.createGain();
  master.gain.value = .025;
  master.connect(audioContext.destination);
  [110, 164.81, 220].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index === 1 ? 'sine' : 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 1 ? .25 : .12;
    oscillator.connect(gain).connect(master);
    oscillator.start();
    audioNodes.push(oscillator);
  });
  button.setAttribute('aria-pressed', 'true');
  button.innerHTML = '<i class="iconoir-sound-high"></i>';
  button.setAttribute('aria-label', 'Desactivar sonido ambiental');
});

$('#copy-clabe').addEventListener('click', () => copyText('012272015568267840', 'CLABE copiada ♡'));

// Initial deep link and startup. Keeping this as a regular script also lets the
// static page open directly from disk without browsers blocking ES modules.
initSupabase().finally(() => {
  setTimeout(() => $('#portal-intro').classList.add('done'), prefersReducedMotion.matches ? 0 : 950);
  const deepLink = new URL(location.href).searchParams.get('activity');
  if (deepLink) {
    const activity = activityBySlug(deepLink);
    if (activity) setTimeout(() => renderActivity(activity), 1150);
  }
});
