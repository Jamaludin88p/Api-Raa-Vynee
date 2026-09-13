const getYoutubeJson = require('./_lib/getYoutubeJson');

const YOUTUBE_REGEX = /(youtube\.com|youtu\.be)/i;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.query?.url;

  if (!url) {
    res.status(400).json({ status: false, message: 'Parameter url wajib diisi' });
    return;
  }
  if (!YOUTUBE_REGEX.test(url)) {
    res.status(400).json({ status: false, message: 'URL bukan link YouTube yang valid' });
    return;
  }

  try {
    const data = await getYoutubeJson(url);
    if (!data.status) {
      res.status(500).json(data);
      return;
    }

    res.status(200).json({
      status: true,
      creator: data.creator,
      result: {
        title: data.result.title,
        duration: data.result.duration,
        channel: data.result.channel,
        thumbnail: data.result.thumbnail,
        quality: data.result.quality,
        type: 'video',
        url: data.result.video
      }
    });
  } catch (e) {
    res.status(500).json({ status: false, message: e.message || 'Internal server error' });
  }
};
