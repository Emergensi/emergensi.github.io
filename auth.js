// Akses dashboard IGD SGH.
// Catatan: pemeriksaan ini berjalan di browser dan hanya mengatur tampilan.
// Keamanan file sebenarnya diatur lewat izin berbagi Google Drive.
(function () {
  const SESSION_KEY = 'igd_sgh_session_v3';
  const USERNAME = 'IGD';
  // SHA-256 dari password Akses Pimpinan. Ganti nilai ini untuk mengganti password.
  const PASSWORD_SHA256 = '8d23cf6c86e834a7aa6eded54c26ce2bb2e74903538c61bdd5d2197997ab2f72';
  // Apps Script Pantau IGD: login pimpinan sekaligus membuka data server (password harus sama)
  const API_URL = 'https://script.google.com/macros/s/AKfycbzdXDcOLMnBj5kuhINSpVRKpQ1RWwdOhXuPfEOxd11b7s9yRWVjU3f8T744OyaQgxtJUw/exec';
  const TOKEN_KEYS = ['pantau_token_v1', 'input_token_v1'];
  const MAX_AGE = { pimpinan: true, staf: true }; // peran yang dikenal; sesi tidak punya batas waktu

  const scriptUrl = new URL(document.currentScript ? document.currentScript.src : 'auth.js', window.location.href);
  const rootUrl = new URL('./', scriptUrl);

  function appUrl(path) {
    return new URL(path || '', rootUrl).toString();
  }

  async function sha256(message) {
    const data = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function save(role) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ role, loggedInAt: Date.now() })); } catch (e) {}
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !MAX_AGE[s.role]) {   // tidak ada batas waktu: sesi berakhir hanya saat Keluar
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch (e) {
      try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
      return null;
    }
  }

  function getRole() {
    const s = getSession();
    return s ? s.role : null;
  }

  function isAuthenticated() { return Boolean(getRole()); }
  function isPimpinan() { return getRole() === 'pimpinan'; }

  function enterStaf() { save('staf'); return true; }

  async function loginServer(password) {
    try {
      const ctrl = new AbortController();
      const batas = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ aksi: 'login', password }), signal: ctrl.signal });
      clearTimeout(batas);
      const r = await res.json();
      if (!r.token) return false;
      const sampai = r.berlakuJam ? Date.now() + r.berlakuJam * 3600e3 : 9e15;
      localStorage.setItem('pantau_token_v1', JSON.stringify({ token: r.token, sampai }));
      localStorage.setItem('input_token_v1', JSON.stringify({ token: r.token, peran: r.peran || 'pimpinan', sampai }));
      return true;
    } catch (e) {
      return false; // server tidak terjangkau: halaman data akan meminta password sendiri
    }
  }

  function login(username, password) {
    return sha256(password).then(async (hash) => {
      const ok = String(username || '').trim().toUpperCase() === USERNAME && hash === PASSWORD_SHA256;
      if (ok) {
        save('pimpinan');
        await loginServer(password);
      }
      return ok;
    });
  }

  function chooserUrl(extra) {
    const target = new URL(appUrl('login.html'));
    target.searchParams.set('next', window.location.href);
    if (extra) target.searchParams.set('akses', extra);
    return target.toString();
  }

  function requireAuth() {
    if (!isAuthenticated()) window.location.replace(chooserUrl());
  }

  function requirePimpinan() {
    if (!isPimpinan()) window.location.replace(chooserUrl('pimpinan'));
  }

  function logout() {
    // cabut token di server juga, lalu hapus semua sesi di perangkat ini
    try {
      TOKEN_KEYS.forEach((k) => {
        const t = JSON.parse(localStorage.getItem(k) || 'null');
        if (t && t.token) fetch(API_URL, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ aksi: 'logout', token: t.token }) }).catch(() => {});
      });
    } catch (e) {}
    try { localStorage.removeItem(SESSION_KEY); TOKEN_KEYS.forEach((k) => localStorage.removeItem(k)); } catch (e) {}
    window.location.href = appUrl('login.html');
  }

  function safeNextUrl(next) {
    try {
      const url = new URL(next, window.location.href);
      if (url.origin === window.location.origin && url.pathname.startsWith(new URL(rootUrl).pathname)) return url.toString();
    } catch (e) {}
    return appUrl('index.html');
  }

  function goNext() {
    const next = new URLSearchParams(window.location.search).get('next');
    window.location.replace(next ? safeNextUrl(next) : appUrl('index.html'));
  }

  window.IGDAuth = { getRole, isAuthenticated, isPimpinan, enterStaf, login, requireAuth, requirePimpinan, logout, goNext, appUrl };
})();
