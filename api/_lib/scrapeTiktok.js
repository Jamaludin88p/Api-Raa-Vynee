const axios = require('axios');

const headers = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function resolveUrl(url) {
  try {
    const res = await axios.head(url, {
      maxRedirects: 5,
      headers
    });
    return res.request?.res?.responseUrl || url;
  } catch {
    return url;
  }
}

async function scrapeTikTok(targetUrl) {
  try {
    const finalUrl = await resolveUrl(targetUrl);

    const { data } = await axios.get('https://www.tikwm.com/api/', {
      params: {
        url: finalUrl,
        hd: 1
      },
      headers
    });

    const r = data?.data;
    if (!r) {
      return {
        status: false,
        message: 'Gagal mengambil data video TikTok'
      };
    }

    const video = r.hdplay || r.play || r.wmplay || '';
    const images = Array.isArray(r.images) ? r.images : [];
    const audio = r.music || r.music_info?.play || r.music_info?.url || r.music_info?.play_url || '';

    return {
      status: true,
      creator: 'Web API Scraper',
      result: {
        title: r.title || 'TikTok Video',
        author: r.author?.nickname || 'Unknown',
        username: r.author?.unique_id ? `@${r.author.unique_id}` : '',
        type: images.length ? 'image' : 'video',
        video,
        audio,
        ...(images.length > 0 && { images })
      }
    };
  } catch (e) {
    return {
      status: false,
      message: e.message || 'Error scraping TikTok'
    };
  }
}

module.exports = scrapeTikTok;
