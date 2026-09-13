# zuradev.tools — All-in-One (Vercel)

Website downloader TikTok & YouTube, semuanya jadi satu project di Vercel:
frontend statis + backend serverless function, tanpa perlu panel/VPS terpisah.

## Struktur folder

```
zuradev-tools/
├── api/
│   ├── tiktok.js        → GET /api/tiktok?url=
│   ├── ytmp4.js          → GET /api/ytmp4?url=
│   ├── ytmp3.js          → GET /api/ytmp3?url=
│   └── _lib/
│       ├── scrapeTiktok.js
│       └── getYoutubeJson.js
├── index.html
├── style.css
├── script.js
├── package.json
├── vercel.json
└── README.md
```

Setiap file di `api/` otomatis jadi serverless function oleh Vercel — tidak perlu server
yang nyala terus, tidak perlu panel Pterodactyl lagi.

## Deploy

**Lewat dashboard:**
1. Push folder ini ke repo GitHub/GitLab.
2. Buka [vercel.com/new](https://vercel.com/new), import repo tersebut.
3. Framework preset: **Other** (zero-config, Vercel otomatis kenali `/api/*.js` sebagai function).
4. Deploy.

**Lewat CLI:**
```bash
npm i -g vercel
cd zuradev-tools
vercel --prod
```

## Perlu diketahui soal versi serverless ini

- **Timeout**: `vercel.json` sudah diset `maxDuration: 30` detik per function. Di plan **Hobby**,
  Vercel biasanya membatasi ini ke 10 detik meski di-set lebih tinggi — kalau scraping sering
  timeout, upgrade ke plan **Pro** supaya batas 30–60 detik benar-benar berlaku.
- **Tidak ada rate limiter bawaan**: versi panel sebelumnya punya rate limiter in-memory, tapi
  di serverless itu tidak reliable (tiap invocation bisa dapat instance baru, memory tidak
  selalu nyambung). Kalau butuh rate limit yang beneran, pakai Vercel Firewall / Upstash Redis.
- **Cold start**: request pertama setelah lama idle bisa terasa sedikit lebih lambat — ini
  normal untuk serverless functions.
- **APIKEY**: versi ini tidak pakai proteksi API key supaya frontend publik bisa langsung akses.
  Kalau mau proteksi, tambahkan pengecekan header di masing-masing file `api/*.js` dan set
  environment variable di dashboard Vercel (Settings → Environment Variables).

## Endpoint

### `GET /api/tiktok?url=<link_tiktok>`
### `GET /api/ytmp4?url=<link_youtube>`
### `GET /api/ytmp3?url=<link_youtube>`

Semua mengembalikan JSON:
```json
{
  "status": true,
  "creator": "Web API Scraper",
  "result": { ... }
}
```

## Kustomisasi cepat

- **Ganti nama brand**: cari `zuradev.tools` di `index.html`.
- **Ganti warna aksen**: variabel `--accent` di baris atas `style.css`.
- **Ganti provider scraper**: edit `api/_lib/scrapeTiktok.js` atau `api/_lib/getYoutubeJson.js`
  saja — tidak perlu sentuh `api/tiktok.js`, `api/ytmp4.js`, `api/ytmp3.js`, atau frontend.
