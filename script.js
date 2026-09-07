const button = document.querySelector('#copy-clabe');
button.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('012272015568267840');
    status.textContent = 'CLABE copiada ♡';
  } catch {
    status.textContent = 'Selecciona la CLABE de arriba para copiarla manualmente.';
  }
});

// Bounded parallax works on touch devices without fixed-background support.
const cosmosImage = document.querySelector('.cosmos-image');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let parallaxFrame = 0;
function updateGalaxy() {
  parallaxFrame = 0;
  if (reducedMotion.matches || document.body.classList.contains('effects-paused')) {
    cosmosImage.style.setProperty('--galaxy-y', '0px');
    return;
  }
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  const travel = window.innerWidth <= 700 ? 44 : 70;
  cosmosImage.style.setProperty('--galaxy-y', `${(progress * 2 - 1) * travel}px`);
}
function queueGalaxyUpdate() {
  if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateGalaxy);
}
window.addEventListener('scroll', queueGalaxyUpdate, { passive: true });
window.addEventListener('resize', queueGalaxyUpdate);
window.addEventListener('load', queueGalaxyUpdate);
reducedMotion.addEventListener('change', queueGalaxyUpdate);
updateGalaxy();

// Decorative stars are created once; only opacity/transform animate.
const starfield = document.querySelector('.starfield');
const starFragment = document.createDocumentFragment();
for (let i = 0; i < 42; i++) {
  const star = document.createElement('span');
  star.className = i % 7 === 0 ? 'cosmic-star flare' : 'cosmic-star';
  star.style.cssText = `--x:${(i * 37.17 + 3) % 100}%;--y:${(i * 23.41 + 7) % 100}%;--size:${i % 7 === 0 ? 12 : 2 + i % 3}px;--duration:${5 + i % 6}s;--delay:-${i * 0.73}s;--drift:${12 + i % 16}px`;
  if (i % 7 === 0) star.textContent = '✦';
  starFragment.appendChild(star);
}
starfield.appendChild(starFragment);
const motionToggle = document.querySelector('.motion-toggle');
let userPaused = false;
function syncMotion() {
  const paused = userPaused || reducedMotion.matches;
  document.body.classList.toggle('effects-paused', paused);
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.textContent = reducedMotion.matches ? 'Movimiento reducido' : paused ? 'Activar efectos' : 'Pausar efectos';
  motionToggle.setAttribute('aria-label', reducedMotion.matches ? 'Efectos desactivados por la preferencia de movimiento reducido del dispositivo' : paused ? 'Activar efectos animados' : 'Pausar efectos animados');
  motionToggle.disabled = reducedMotion.matches;
  queueGalaxyUpdate();
}
motionToggle.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
reducedMotion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('tab-hidden', document.hidden);
});
syncMotion();

// Native dialog supplies focus containment and Escape-to-close behavior.
const viewer = document.querySelector('.image-viewer');
const viewerImage = viewer.querySelector('.viewer-image');
const viewerCanvas = viewer.querySelector('.viewer-canvas');
const viewerCaption = viewer.querySelector('.viewer-caption');
const zoomIn = viewer.querySelector('[data-zoom-in]');
const zoomOut = viewer.querySelector('[data-zoom-out]');
const zoomScale = viewer.querySelector('.viewer-scale');
let imageZoom = 1;
let viewerOpener;
function fitViewerImage() {
  if (!viewer.open || !viewerImage.naturalWidth) return;
  const base = Math.min(viewerImage.naturalWidth, viewerCanvas.clientWidth - 32,
    (viewerCanvas.clientHeight - 32) * viewerImage.naturalWidth / viewerImage.naturalHeight);
  viewerImage.style.width = `${Math.max(1, base) * imageZoom}px`;
  zoomScale.textContent = `${Math.round(imageZoom * 100)}%`;
  zoomOut.disabled = imageZoom <= 1;
  zoomIn.disabled = imageZoom >= 3;
  viewerImage.style.cursor = imageZoom < 3 ? 'zoom-in' : 'zoom-out';
}
function openArtwork(source, opener = source) {
  viewerOpener = opener;
  imageZoom = 1;
  viewerImage.alt = source.alt;
  viewerCaption.textContent = source.alt;
  viewerImage.src = source.currentSrc || source.src;
  viewer.showModal();
  document.documentElement.classList.add('viewer-lock');
  viewerCanvas.scrollTop = 0;
  viewerCanvas.scrollLeft = 0;
  fitViewerImage();
}
document.querySelectorAll('[data-zoomable]').forEach(source => {
  source.setAttribute('aria-label', `Ampliar: ${source.alt}`);
  source.addEventListener('click', () => openArtwork(source));
  source.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openArtwork(source); }
  });
});
const wallpaperButton = document.querySelector('.wallpaper-zoom');
wallpaperButton.addEventListener('click', () => openArtwork(document.querySelector('.hero-wallpaper img'), wallpaperButton));
document.querySelector('.hero').addEventListener('click', event => {
  if (!event.target.closest('a, button, .hero-copy, [data-zoomable]')) openArtwork(document.querySelector('.hero-wallpaper img'), wallpaperButton);
});
viewerImage.addEventListener('load', fitViewerImage);
zoomIn.addEventListener('click', () => { imageZoom = Math.min(3, imageZoom + .5); fitViewerImage(); });
zoomOut.addEventListener('click', () => { imageZoom = Math.max(1, imageZoom - .5); fitViewerImage(); });
viewerImage.addEventListener('click', () => { imageZoom = imageZoom < 3 ? Math.min(3, imageZoom + .5) : 1; fitViewerImage(); });
viewer.querySelector('[data-viewer-close]').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => {
  if (event.target === viewer || event.target === viewerCanvas) viewer.close();
});
viewer.addEventListener('close', () => {
  document.documentElement.classList.remove('viewer-lock');
  viewerOpener?.focus({ preventScroll: true });
});
window.addEventListener('resize', fitViewerImage);
