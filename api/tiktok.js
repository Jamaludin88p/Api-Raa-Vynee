const scrapeTikTok = require('./_lib/scrapeTiktok');

const TIKTOK_REGEX = /(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/i;

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
  if (!TIKTOK_REGEX.test(url)) {
    res.status(400).json({ status: false, message: 'URL bukan link TikTok yang valid' });
    return;
  }

  try {
    const data = await scrapeTikTok(url);
    res.status(data.status ? 200 : 500).json(data);
  } catch (e) {
    res.status(500).json({ status: false, message: e.message || 'Internal server error' });
  }
};
