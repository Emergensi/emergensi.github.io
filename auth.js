// Akses dashboard IGD SGH.
// Catatan: pemeriksaan ini berjalan di browser dan hanya mengatur tampilan.
// Keamanan file sebenarnya diatur lewat izin berbagi Google Drive.
(function () {
  const SESSION_KEY = 'igd_sgh_session_v3';
  const USERNAME = 'IGD';
  // SHA-256 dari password Akses Pimpinan. Ganti nilai ini untuk mengganti password.
  const PASSWORD_SHA256 = '8d23cf6c86e834a7aa6eded54c26ce2bb2e74903538c61bdd5d2197997ab2f72';
  const MAX_AGE = { pimpinan: 12 * 60 * 60 * 1000, staf: 30 * 24 * 60 * 60 * 1000 };

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
      if (!s || !MAX_AGE[s.role] || Date.now() - Number(s.loggedInAt) > MAX_AGE[s.role]) {
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

  function login(username, password) {
    return sha256(password).then((hash) => {
      const ok = String(username || '').trim().toUpperCase() === USERNAME && hash === PASSWORD_SHA256;
      if (ok) save('pimpinan');
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
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
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
