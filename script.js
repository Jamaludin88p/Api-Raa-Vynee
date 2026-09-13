// Semua request API ditembak ke /api/... (same-origin, serverless function di Vercel).

const form = document.getElementById('grabberForm');
const urlInput = document.getElementById('urlInput');
const formatRow = document.getElementById('formatRow');
const formatSelect = document.getElementById('formatSelect');
const ctaButton = document.getElementById('ctaButton');
const statusText = document.getElementById('statusText');
const resultBox = document.getElementById('resultBox');
const resultThumb = document.getElementById('resultThumb');
const resultTitle = document.getElementById('resultTitle');
const resultMeta = document.getElementById('resultMeta');
const downloadBtn = document.getElementById('downloadBtn');

if (form) {
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

  function setStatus(text, isError = false) {
    statusText.textContent = text;
    statusText.classList.toggle('err', isError);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    const platform = detectPlatform(url);

    resultBox.hidden = true;
    resultThumb.hidden = true;

    if (!platform) {
      setStatus('tautan tidak dikenali — pastikan link TikTok atau YouTube', true);
      return;
    }

    const format = formatSelect?.value || 'mp4';

    ctaButton.disabled = true;
    ctaButton.textContent = 'Memproses…';
    setStatus('menghubungi server…');

    let endpoint = '';
    if (platform === 'tiktok') endpoint = `/api/tiktok?url=${encodeURIComponent(url)}`;
    else endpoint = format === 'mp3'
      ? `/api/ytmp3?url=${encodeURIComponent(url)}`
      : `/api/ytmp4?url=${encodeURIComponent(url)}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      if (!data.status) {
        throw new Error(data.message || 'server menolak permintaan');
      }

      renderResult(platform, format, data.result);
      setStatus('siap diunduh');
    } catch (err) {
      setStatus(err.message || 'terjadi kesalahan saat memproses tautan', true);
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
      const formatLabel = result.format ? `.${result.format}` : '';
      meta = [result.channel, result.duration, formatLabel].filter(Boolean).join(' · ');
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

    resultBox.hidden = false;
  }
}
