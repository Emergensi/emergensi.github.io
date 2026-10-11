// Service worker sederhana agar Jejak Waktu bisa dipasang sebagai aplikasi.
// Data selalu diambil langsung dari server (tidak disimpan offline).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
