const axios = require('axios');

const API = 'https://be-video-downloader.qbyte.web.id';
const WEB = 'https://video.downloader.qbyte.web.id/';
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36';

const http = axios.create({
  timeout: 30000,
  validateStatus: () => true
});

function cleanName(text) {
  return String(text || 'media').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
}

function getHeight(format) {
  if (format.height) return Number(format.height);
  const resolution = String(format.resolution || '');
  const wxh = resolution.match(/(\d+)\s*x\s*(\d+)/i);
  if (wxh) return Number(wxh[2]);
  const p = resolution.match(/(\d+)\s*p/i);
  if (p) return Number(p[1]);
  const any = resolution.match(/\d+/);
  return any ? Number(any[0]) : 0;
}

async function getYoutubeJson(url) {
  try {
    const res = await http.get(`${API}/api/info`, {
      params: { url },
      headers: {
        'user-agent': UA,
        accept: 'application/json, text/plain, */*',
        origin: WEB.slice(0, -1),
        referer: WEB
      }
    });

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Gagal ambil data (HTTP ${res.status})`);
    }

    const info = res.data;
    const formats = Array.isArray(info.formats) ? info.formats : [];
    const title = cleanName(info.title || 'video');

    const videoFormats = formats.filter(f => f.vcodec !== 'none');
    videoFormats.sort((a, b) => getHeight(b) - getHeight(a));
    const bestVideo = videoFormats[0] || {};

    const audioFormats = formats.filter(f => f.vcodec === 'none' && f.acodec !== 'none');
    audioFormats.sort((a, b) => Number(b.abr || 0) - Number(a.abr || a.tbr || 0));
    const bestAudio = audioFormats[0] || {};

    const videoId = bestVideo.format_id || bestVideo.itag || bestVideo.id || '';
    const audioId = bestAudio.format_id || bestAudio.itag || bestAudio.id || '';

    const videoExt = bestVideo.ext || 'mp4';
    const audioExt = bestAudio.ext || 'm4a';

    const videoUrl = videoId
      ? `${API}/api/download?url=${encodeURIComponent(url)}&format=${videoId}&filename=${encodeURIComponent(title + '.' + videoExt)}`
      : '';

    const audioUrl = audioId
      ? `${API}/api/download?url=${encodeURIComponent(url)}&format=${audioId}&filename=${encodeURIComponent(title + '.' + audioExt)}`
      : '';

    return {
      status: true,
      creator: 'Web API Scraper',
      result: {
        title: info.title || 'YouTube Video',
        duration: info.duration ? `${info.duration} detik` : 'Unknown',
        channel: info.uploader || info.channel || 'Unknown',
        thumbnail: info.thumbnail || '',
        quality: bestVideo.height ? `${bestVideo.height}p` : 'HD',
        video: videoUrl,
        videoFormat: videoId ? videoExt : '',
        audio: audioUrl,
        audioFormat: audioId ? audioExt : ''
      }
    };
  } catch (error) {
    return {
      status: false,
      message: error.message
    };
  }
}

module.exports = getYoutubeJson;
