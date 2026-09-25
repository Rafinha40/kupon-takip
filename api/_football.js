// API-Football ile konuşan ortak yardımcı.
// Anahtar koda yazılmaz: Vercel'de "API_FOOTBALL_KEY" adlı gizli ayardan okunur.
const BASE = 'https://v3.football.api-sports.io';

async function callApi(path) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    const err = new Error('API anahtarı tanımlı değil. Vercel > Settings > Environment Variables bölümüne API_FOOTBALL_KEY ekle.');
    err.status = 500;
    throw err;
  }
  const r = await fetch(BASE + path, { headers: { 'x-apisports-key': key } });
  const remaining = r.headers.get('x-ratelimit-requests-remaining');
  const data = await r.json();
  const apiErrors = data && data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
  if (!r.ok || (apiErrors && apiErrors.length)) {
    const err = new Error('API-Football hata verdi: ' + (apiErrors && apiErrors.length ? apiErrors.join(' ') : r.status));
    err.status = 502;
    throw err;
  }
  return { data, remaining: remaining == null ? null : Number(remaining) };
}

function send(res, status, body, cacheSeconds) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Vercel önbelleği: aynı isteği kısa süre tekrar API'ye göndermez, günlük hakkını korur.
  if (cacheSeconds) res.setHeader('Cache-Control', `s-maxage=${cacheSeconds}, stale-while-revalidate=30`);
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

module.exports = { callApi, send };
