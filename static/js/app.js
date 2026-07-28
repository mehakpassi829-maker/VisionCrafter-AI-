// ============================================================================
// VisionCrafter AI — frontend logic
// ============================================================================

const els = {
  landingScreen: document.getElementById('landingScreen'),
  appShell: document.getElementById('appShell'),
  navItems: document.querySelectorAll('.nav-item'),

  views: {
    dashboard: document.getElementById('view-dashboard'),
    studio: document.getElementById('view-studio'),
    img2img: document.getElementById('view-img2img'),
    gallery: document.getElementById('view-gallery'),
    favorites: document.getElementById('view-favorites'),
    history: document.getElementById('view-history'),
    downloads: document.getElementById('view-downloads'),
    settings: document.getElementById('view-settings'),
    help: document.getElementById('view-help'),
  },

  getStartedBtn: document.getElementById('getStartedBtn'),
  landingImageCount: document.getElementById('landingImageCount'),

  prompt: document.getElementById('prompt'),
  negativePrompt: document.getElementById('negativePrompt'),
  randomPromptBtn: document.getElementById('randomPromptBtn'),

  sizeToggle: document.getElementById('sizeToggle'),
  cfgScale: document.getElementById('cfgScale'),
  cfgVal: document.getElementById('cfgVal'),
  steps: document.getElementById('steps'),
  stepsVal: document.getElementById('stepsVal'),
  seed: document.getElementById('seed'),
  numImagesToggle: document.getElementById('numImagesToggle'),
  numImagesVal: document.getElementById('numImagesVal'),
  qualityToggle: document.getElementById('qualityToggle'),

  styleGrid: document.getElementById('styleGrid'),
  styleSelectedLabel: document.getElementById('styleSelectedLabel'),

  generateBtn: document.getElementById('generateBtn'),
  errorMsg: document.getElementById('errorMsg'),

  promptFlow: document.getElementById('promptFlow'),
  flowOriginal: document.getElementById('flowOriginal'),
  flowEnhanced: document.getElementById('flowEnhanced'),
  denoiser: document.getElementById('denoiser'),
  denoiserStatus: document.getElementById('denoiserStatus'),
  denoiserProgressFill: document.getElementById('denoiserProgressFill'),
  studioResults: document.getElementById('studioResults'),
  emptyCanvas: document.getElementById('emptyCanvas'),

  galleryFull: document.getElementById('galleryFull'),
  galleryEmptyHint: document.getElementById('galleryEmptyHint'),
  favoritesGrid: document.getElementById('favoritesGrid'),
  favoritesEmptyHint: document.getElementById('favoritesEmptyHint'),
  historyList: document.getElementById('historyList'),
  historyEmptyHint: document.getElementById('historyEmptyHint'),
  historySearch: document.getElementById('historySearch'),
  historyStyleFilter: document.getElementById('historyStyleFilter'),
  historyDateFilter: document.getElementById('historyDateFilter'),

  themeToggle: document.getElementById('themeToggle'),
  themeToggleIcon: document.getElementById('themeToggleIcon'),
  themeToggleLabel: document.getElementById('themeToggleLabel'),

  lightbox: document.getElementById('lightbox'),
  lightboxImg: document.getElementById('lightboxImg'),
  lightboxMeta: document.getElementById('lightboxMeta'),
  lightboxClose: document.getElementById('lightboxClose'),

  statTotalImages: document.getElementById('statTotalImages'),
  statTotalBatches: document.getElementById('statTotalBatches'),
  statMostUsedStyle: document.getElementById('statMostUsedStyle'),
  statAvgTime: document.getElementById('statAvgTime'),
  statToday: document.getElementById('statToday'),
  statFavorites: document.getElementById('statFavorites'),
  statStorage: document.getElementById('statStorage'),
};

const favorites = new Map(); // filename -> image object
const state = { batches: [] }; // each: {prompt, enhanced_prompt, negative_prompt, style, timestamp, images}

// ---------------------------------------------------------------------------
// Theme toggle (persisted)
// ---------------------------------------------------------------------------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  els.themeToggleIcon.textContent = isDark ? '☀' : '☾';
  els.themeToggleLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
  localStorage.setItem('vc-theme', theme);
}
(function initTheme() {
  const saved = localStorage.getItem('vc-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
})();
els.themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ---------------------------------------------------------------------------
// Sidebar navigation (views + jump-links)
// ---------------------------------------------------------------------------
els.navItems.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.view) {
      switchView(btn.dataset.view);
    } else if (btn.dataset.jump) {
      switchView('studio');
      requestAnimationFrame(() => {
        const target = document.getElementById(btn.dataset.jump);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('jump-highlight');
          setTimeout(() => target.classList.remove('jump-highlight'), 900);
        }
      });
    }
  });
});

function switchView(name) {
  Object.entries(els.views).forEach(([key, section]) => { if (section) section.hidden = key !== name; });
  els.navItems.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === name));
  if (name === 'dashboard') renderStatistics();
  if (name === 'favorites') renderFavorites();
}

els.getStartedBtn.addEventListener('click', () => {
  els.landingScreen.hidden = true;
  els.appShell.hidden = false;
  switchView('studio');
  els.prompt.focus();
});

// ---------------------------------------------------------------------------
// Toggle-button groups (size, images, quality) — shared helper
// ---------------------------------------------------------------------------
function wireToggleGroup(container, onSelect) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    [...container.children].forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    if (onSelect) onSelect(btn.dataset.value);
  });
}
function getActiveToggleValue(container) {
  const active = container.querySelector('.toggle-btn.active');
  return active ? active.dataset.value : null;
}

wireToggleGroup(els.sizeToggle);
wireToggleGroup(els.qualityToggle);
wireToggleGroup(els.numImagesToggle, (val) => (els.numImagesVal.textContent = val));

// ---------------------------------------------------------------------------
// Style icon-grid selection
// ---------------------------------------------------------------------------
els.styleGrid.addEventListener('click', (e) => {
  const tile = e.target.closest('.style-tile');
  if (!tile) return;
  [...els.styleGrid.children].forEach((t) => t.classList.remove('active'));
  tile.classList.add('active');
  const label = tile.querySelector('.style-tile__label').textContent;
  els.styleSelectedLabel.textContent = `${label} selected`;
});
function getActiveStyle() {
  const active = els.styleGrid.querySelector('.style-tile.active');
  return active ? active.dataset.value : 'realistic';
}

// ---------------------------------------------------------------------------
// Live range labels + random prompt + seed
// ---------------------------------------------------------------------------
els.cfgScale.addEventListener('input', () => (els.cfgVal.textContent = els.cfgScale.value));
els.steps.addEventListener('input', () => (els.stepsVal.textContent = els.steps.value));

els.randomPromptBtn.addEventListener('click', async () => {
  const res = await fetch('/api/random-prompt');
  const data = await res.json();
  els.prompt.value = data.prompt;
});

// ---------------------------------------------------------------------------
// Denoising visualizer + progress bar
// ---------------------------------------------------------------------------
let denoiseAnimId = null;
function runDenoiserAnimation(durationMs = 4000) {
  const canvas = document.getElementById('denoiserCanvas');
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cell = 12;
  const cols = Math.floor(size / cell);
  const start = performance.now();
  const colorA = [139, 92, 246]; // purple
  const colorB = [236, 72, 153]; // pink

  function frame(now) {
    const t = Math.min((now - start) / durationMs, 1);
    const noiseAmount = 1 - t;
    ctx.clearRect(0, 0, size, size);
    els.denoiserProgressFill.style.width = `${Math.round(t * 100)}%`;
    for (let y = 0; y < cols; y++) {
      for (let x = 0; x < cols; x++) {
        const mix = (x + y) / (cols * 2);
        const r = colorA[0] + (colorB[0] - colorA[0]) * mix;
        const g = colorA[1] + (colorB[1] - colorA[1]) * mix;
        const b = colorA[2] + (colorB[2] - colorA[2]) * mix;
        const jitter = noiseAmount * cell * 1.6;
        const jx = x * cell + (Math.random() - 0.5) * jitter;
        const jy = y * cell + (Math.random() - 0.5) * jitter;
        const alpha = 0.2 + t * 0.6 + Math.random() * noiseAmount * 0.4;
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${Math.min(alpha, 0.9)})`;
        ctx.fillRect(jx, jy, cell - 2, cell - 2);
      }
    }
    if (t < 1) denoiseAnimId = requestAnimationFrame(frame);
  }
  denoiseAnimId = requestAnimationFrame(frame);
}

const statusMessages = ['sampling from noise…', 'running denoising steps…', 'resolving latent space…', 'decoding to pixel space…', 'almost there…'];
let statusIdx = 0;
let statusTimer = null;
function startStatusCycle() {
  statusIdx = 0;
  els.denoiserStatus.textContent = statusMessages[0];
  statusTimer = setInterval(() => {
    statusIdx = (statusIdx + 1) % statusMessages.length;
    els.denoiserStatus.textContent = statusMessages[statusIdx];
  }, 1400);
}
function stopStatusCycle() { clearInterval(statusTimer); }

// ---------------------------------------------------------------------------
// Generation flow
// ---------------------------------------------------------------------------
els.generateBtn.addEventListener('click', generate);

async function generate() {
  const prompt = els.prompt.value.trim();
  hideError();
  if (!prompt) { showError('Write a prompt first — even one word works, the enhancer will expand it.'); return; }

  const payload = {
    prompt,
    negative_prompt: els.negativePrompt.value.trim(),
    style: getActiveStyle(),
    size: getActiveToggleValue(els.sizeToggle) || '1:1',
    num_images: parseInt(getActiveToggleValue(els.numImagesToggle) || '1', 10),
    quality: getActiveToggleValue(els.qualityToggle) || 'standard',
    cfg_scale: parseFloat(els.cfgScale.value),
    steps: parseInt(els.steps.value, 10),
    seed: els.seed.value.trim() || null,
  };

  setLoading(true);
  els.studioResults.innerHTML = '';
  els.emptyCanvas.hidden = true;
  els.denoiser.hidden = false;
  els.denoiserProgressFill.style.width = '0%';
  runDenoiserAnimation(4500);
  startStatusCycle();

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Generation failed.');

    showPromptFlow(data.original_prompt, data.enhanced_prompt);
    recordBatch(payload, data);
    renderStudioResults(data.images);
    renderGalleryFull();
    renderHistoryList();
    updateLandingCount();
  } catch (err) {
    showError(err.message);
    els.emptyCanvas.hidden = false;
  } finally {
    setLoading(false);
    stopStatusCycle();
    cancelAnimationFrame(denoiseAnimId);
    els.denoiser.hidden = true;
  }
}

function setLoading(isLoading) {
  els.generateBtn.disabled = isLoading;
  els.generateBtn.querySelector('span').textContent = isLoading ? 'Generating…' : 'Generate Image';
}
function showError(msg) { els.errorMsg.textContent = msg; els.errorMsg.hidden = false; }
function hideError() { els.errorMsg.hidden = true; }
function showPromptFlow(original, enhanced) {
  els.flowOriginal.textContent = original;
  els.flowEnhanced.textContent = enhanced;
  els.promptFlow.hidden = false;
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------
function recordBatch(payload, data) {
  state.batches.unshift({
    prompt: payload.prompt,
    enhanced_prompt: data.enhanced_prompt,
    negative_prompt: payload.negative_prompt,
    style: payload.style,
    timestamp: new Date(),
    images: data.images,
  });
}
function allImages() { return state.batches.flatMap((b) => b.images); }

function renderStudioResults(images) {
  els.studioResults.innerHTML = '';
  images.forEach((img) => els.studioResults.appendChild(buildCard(img)));
  els.emptyCanvas.hidden = images.length > 0;
}

function renderGalleryFull() {
  const images = allImages();
  els.galleryFull.innerHTML = '';
  images.forEach((img) => els.galleryFull.appendChild(buildCard(img)));
  els.galleryEmptyHint.hidden = images.length > 0;
}

function renderFavorites() {
  els.favoritesGrid.innerHTML = '';
  favorites.forEach((img) => els.favoritesGrid.appendChild(buildCard(img)));
  els.favoritesEmptyHint.hidden = favorites.size > 0;
}

function updateLandingCount() {
  const total = allImages().length;
  if (total > 0) {
    els.landingImageCount.textContent = `${total} image${total > 1 ? 's' : ''} generated this session`;
  }
}

// ---------------------------------------------------------------------------
// History: search + filter
// ---------------------------------------------------------------------------
[els.historySearch, els.historyStyleFilter, els.historyDateFilter].forEach((el) =>
  el.addEventListener('input', renderHistoryList)
);

function filteredBatches() {
  const query = els.historySearch.value.trim().toLowerCase();
  const styleFilter = els.historyStyleFilter.value;
  const dateFilter = els.historyDateFilter.value;
  const now = new Date();

  return state.batches.filter((batch) => {
    if (query && !batch.prompt.toLowerCase().includes(query)) return false;
    if (styleFilter !== 'all' && batch.style !== styleFilter) return false;
    if (dateFilter === 'today') {
      if (batch.timestamp.toDateString() !== now.toDateString()) return false;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      if (batch.timestamp < weekAgo) return false;
    }
    return true;
  });
}

function renderHistoryList() {
  const batches = filteredBatches();
  els.historyList.innerHTML = '';
  batches.forEach((batch) => {
    const entry = document.createElement('div');
    entry.className = 'history-entry';

    const text = document.createElement('div');
    text.style.minWidth = '0';
    const p = document.createElement('p');
    p.className = 'history-entry__prompt';
    p.textContent = batch.prompt;
    const meta = document.createElement('p');
    meta.className = 'history-entry__meta';
    meta.textContent = `${batch.style.replace('_', ' ')} · ${batch.images.length} image${batch.images.length > 1 ? 's' : ''} · ${formatRelativeTime(batch.timestamp)}`;
    text.appendChild(p);
    text.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'history-entry__actions';
    const regenBtn = document.createElement('button');
    regenBtn.textContent = '↻ Regenerate';
    regenBtn.type = 'button';
    regenBtn.addEventListener('click', () => regenerateFromBatch(batch));
    actions.appendChild(regenBtn);

    entry.appendChild(text);
    entry.appendChild(actions);
    els.historyList.appendChild(entry);
  });
  els.historyEmptyHint.hidden = batches.length > 0;
  els.historyEmptyHint.textContent = state.batches.length === 0 ? 'No generations yet.' : 'No generations match your search/filter.';
}

function regenerateFromBatch(batch) {
  switchView('studio');
  els.prompt.value = batch.prompt;
  els.negativePrompt.value = batch.negative_prompt;
  const tile = els.styleGrid.querySelector(`[data-value="${batch.style}"]`);
  if (tile) {
    [...els.styleGrid.children].forEach((t) => t.classList.remove('active'));
    tile.classList.add('active');
    els.styleSelectedLabel.textContent = `${tile.querySelector('.style-tile__label').textContent} selected`;
  }
  els.seed.value = '';
  generate();
}

function formatRelativeTime(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Statistics dashboard
// ---------------------------------------------------------------------------
function renderStatistics() {
  const images = allImages();
  els.statTotalImages.textContent = images.length;
  els.statTotalBatches.textContent = state.batches.length;

  const styleCounts = {};
  state.batches.forEach((b) => { styleCounts[b.style] = (styleCounts[b.style] || 0) + b.images.length; });
  const topStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];
  els.statMostUsedStyle.textContent = topStyle ? topStyle[0].replace('_', ' ') : '—';

  const avgTime = images.length ? (images.reduce((sum, img) => sum + img.inference_time, 0) / images.length).toFixed(2) : null;
  els.statAvgTime.textContent = avgTime ? `${avgTime}s` : '—';

  const today = new Date().toDateString();
  const todayCount = state.batches.filter((b) => b.timestamp.toDateString() === today).reduce((sum, b) => sum + b.images.length, 0);
  els.statToday.textContent = todayCount;
  els.statFavorites.textContent = favorites.size;

  const estimatedBytes = images.reduce((sum, img) => {
    const [w, h] = (img.metadata.size || '768x768').split('x').map(Number);
    return sum + w * h * 0.5;
  }, 0);
  els.statStorage.textContent = `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Card building (shared: Studio results, Gallery, Favorites)
// ---------------------------------------------------------------------------
function buildCard(img) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.filename = img.filename;

  const image = document.createElement('img');
  image.src = img.url;
  image.alt = img.metadata.enhanced_prompt;
  image.loading = 'lazy';
  card.appendChild(image);

  const overlay = document.createElement('div');
  overlay.className = 'card__overlay';

  const meta = document.createElement('div');
  meta.className = 'card__meta mono';
  meta.textContent = `seed ${img.seed} · ${img.metadata.size} · cfg ${img.metadata.cfg_scale} · ${img.inference_time}s`;
  overlay.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'card__actions';
  actions.appendChild(makeActionBtn('⤓ Download', () => downloadImage(img)));
  actions.appendChild(makeActionBtn('⛶ Fullscreen', () => openLightbox(img)));
  actions.appendChild(makeActionBtn('↻ Regenerate', () => regenerateFromImage(img)));
  actions.appendChild(makeActionBtn('⧉ Copy prompt', () => copyPrompt(img)));
  actions.appendChild(makeActionBtn('🔗 Share', () => shareImage(img)));
  const favBtn = makeActionBtn('★ Favorite', () => toggleFavorite(img, favBtn));
  if (favorites.has(img.filename)) favBtn.classList.add('active');
  actions.appendChild(favBtn);
  actions.appendChild(makeActionBtn('🗑 Delete', () => card.remove()));

  overlay.appendChild(actions);
  card.appendChild(overlay);
  return card;
}

function makeActionBtn(label, onClick) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.type = 'button';
  btn.addEventListener('click', onClick);
  return btn;
}

function downloadImage(img) {
  const a = document.createElement('a');
  a.href = img.url;
  a.download = img.filename;
  a.click();
}
function openLightbox(img) {
  els.lightboxImg.src = img.url;
  els.lightboxMeta.textContent = JSON.stringify(img.metadata, null, 2);
  els.lightbox.hidden = false;
}
els.lightboxClose.addEventListener('click', () => (els.lightbox.hidden = true));
els.lightbox.addEventListener('click', (e) => { if (e.target === els.lightbox) els.lightbox.hidden = true; });

function regenerateFromImage(img) {
  switchView('studio');
  els.prompt.value = img.metadata.prompt;
  const tile = els.styleGrid.querySelector(`[data-value="${img.metadata.style}"]`);
  if (tile) {
    [...els.styleGrid.children].forEach((t) => t.classList.remove('active'));
    tile.classList.add('active');
    els.styleSelectedLabel.textContent = `${tile.querySelector('.style-tile__label').textContent} selected`;
  }
  els.seed.value = '';
  generate();
}
function copyPrompt(img) { navigator.clipboard.writeText(img.metadata.enhanced_prompt); }
function shareImage(img) {
  const url = window.location.origin + img.url;
  if (navigator.share) navigator.share({ title: 'VisionCrafter AI generation', text: img.metadata.prompt, url });
  else navigator.clipboard.writeText(url);
}
function toggleFavorite(img, btn) {
  if (favorites.has(img.filename)) { favorites.delete(img.filename); btn.classList.remove('active'); }
  else { favorites.set(img.filename, img); btn.classList.add('active'); }
}
