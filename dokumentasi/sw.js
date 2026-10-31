// Service worker aplikasi Dokumentasi Klinis: panduan & master ICD disimpan di perangkat agar tetap bisa dibuka offline.
// Simpan episode, rekap, dan masukan selalu langsung ke server (tidak disimpan offline).
const CACHE = 'dokumentasi-20261031121500';
const INTI = ['./', '../style.css?v=20261029140000', '../panduan-dokumentasi/pd.css?v=20261031121500',
  '../panduan-dokumentasi/pd-data.js?v=20261031121500', '../panduan-dokumentasi/pd-app.js?v=20261031121500',
  '../assets/emergency-logo.png', '../assets/favicon.ico'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(INTI)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('dokumentasi-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // server Apps Script tidak di-cache
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const lama = await c.match(req, { ignoreSearch: req.mode === 'navigate' });
    const baru = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => lama);
    return lama || baru;   // tampilkan versi tersimpan dulu, perbarui di belakang
  }));
});
