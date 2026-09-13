// Semua request API ditembak ke /api/... (same-origin) lalu diteruskan
// oleh rewrite di vercel.json ke backend yang jalan di panel Pterodactyl.
// Ganti domain tujuan di vercel.json, bukan di file ini.

const form = document.getElementById('grabberForm');
const urlInput = document.getElementById('urlInput');
const formatRow = document.getElementById('formatRow');
const ctaButton = document.getElementById('ctaButton');
const consolePanel = document.querySelector('.console-panel');
const consoleBody = document.getElementById('consoleBody');
const resultCard = document.getElementById('resultCard');
const resultThumb = document.getElementById('resultThumb');
const resultTitle = document.getElementById('resultTitle');
const resultMeta = document.getElementById('resultMeta');
const downloadBtn = document.getElementById('downloadBtn');

const TIKTOK_REGEX = /(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/i;
const YOUTUBE_REGEX = /(youtube\.com|youtu\.be)/i;

function detectPlatform(url) {
  if (TIKTOK_REGEX.test(url)) return 'tiktok';
  if (YOUTUBE_REGEX.test(url)) return 'youtube';
  return null;
}

urlInput.addEventListener('input', () => {
  const platform = detectPlatform(urlInput.value.trim());
  formatRow.hidden = platform !== 'youtube';
});

function resetConsole() {
  consoleBody.innerHTML = '';
  consolePanel.classList.remove('is-error', 'is-active');
  resultCard.hidden = true;
  resultThumb.hidden = true;
}

function log(tag, text, isError = false) {
  const line = document.createElement('p');
  line.className = 'console-line' + (isError ? ' err' : '');
  line.innerHTML = `<span class="tag">${tag}</span> ${text}`;
  consoleBody.appendChild(line);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = urlInput.value.trim();
  const platform = detectPlatform(url);

  resetConsole();
  consolePanel.classList.add('is-active');

  if (!platform) {
    consolePanel.classList.add('is-error');
    log('gagal', 'tautan tidak dikenali — pastikan link TikTok atau YouTube', true);
    return;
  }

  const format = document.querySelector('input[name="format"]:checked')?.value || 'mp4';

  ctaButton.disabled = true;
  ctaButton.textContent = 'Memproses…';

  log('info', `tautan ${platform} terdeteksi`);
  await wait(250);

  let endpoint = '';
  if (platform === 'tiktok') endpoint = `/api/tiktok?url=${encodeURIComponent(url)}`;
  else endpoint = format === 'mp3'
    ? `/api/ytmp3?url=${encodeURIComponent(url)}`
    : `/api/ytmp4?url=${encodeURIComponent(url)}`;

  log('info', 'menghubungi server…');

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (!data.status) {
      throw new Error(data.message || 'server menolak permintaan');
    }

    await wait(200);
    log('ok', 'data ditemukan, menyiapkan unduhan…');
    await wait(200);

    renderResult(platform, format, data.result);
  } catch (err) {
    consolePanel.classList.add('is-error');
    log('gagal', err.message || 'terjadi kesalahan saat memproses tautan', true);
  } finally {
    ctaButton.disabled = false;
    ctaButton.textContent = 'Proses tautan';
  }
});

function renderResult(platform, format, result) {
  let title = result.title || 'Media';
  let meta = '';
  let downloadUrl = '';
  let thumb = '';

  if (platform === 'tiktok') {
    meta = [result.author, result.username].filter(Boolean).join(' · ');
    downloadUrl = result.type === 'image'
      ? (result.images && result.images[0]) || result.video
      : result.video;
  } else {
    meta = [result.channel, result.duration].filter(Boolean).join(' · ');
    downloadUrl = result.url;
    thumb = result.thumbnail;
  }

  resultTitle.textContent = title;
  resultMeta.textContent = meta || (format === 'mp3' ? 'audio' : 'video');
  downloadBtn.href = downloadUrl || '#';

  if (thumb) {
    resultThumb.src = thumb;
    resultThumb.hidden = false;
  } else {
    resultThumb.hidden = true;
  }

  resultCard.hidden = false;
  log('siap', 'klik tombol unduh di bawah untuk menyimpan file');
}
