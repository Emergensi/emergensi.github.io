(function () {
  const SESSION_KEY = 'igd_sgh_session_v2';
  const USERNAME = 'IGD';
  const PASSWORD_SHA256 = '8d23cf6c86e834a7aa6eded54c26ce2bb2e74903538c61bdd5d2197997ab2f72';
  const MAX_AGE_MS = 12 * 60 * 60 * 1000;

  const scriptUrl = new URL(document.currentScript ? document.currentScript.src : 'auth.js', window.location.href);
  const rootUrl = new URL('./', scriptUrl);

  function appUrl(path) {
    return new URL(path || '', rootUrl).toString();
  }

  async function sha256(message) {
    const data = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || !session.loggedInAt) return null;
      if (Date.now() - Number(session.loggedInAt) > MAX_AGE_MS) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function isAuthenticated() {
    return Boolean(getSession());
  }

  function login(username, password) {
    return sha256(password).then((hash) => {
      const usernameOk = String(username || '').trim().toUpperCase() === USERNAME;
      const passwordOk = hash === PASSWORD_SHA256;
      if (!usernameOk || !passwordOk) return false;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedInAt: Date.now(), user: USERNAME }));
      return true;
    });
  }

  function getLoginUrl() {
    const target = new URL(appUrl('login.html'));
    target.searchParams.set('next', window.location.href);
    return target.toString();
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.replace(getLoginUrl());
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = appUrl('login.html');
  }

  function safeNextUrl(next) {
    try {
      const url = new URL(next, window.location.href);
      const rootPath = new URL(rootUrl).pathname;
      if (url.origin === window.location.origin && url.pathname.startsWith(rootPath)) {
        return url.toString();
      }
    } catch (error) {}
    return appUrl('index.html');
  }

  function goNext() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    window.location.replace(next ? safeNextUrl(next) : appUrl('index.html'));
  }

  window.IGDAuth = { isAuthenticated, login, requireAuth, logout, goNext, appUrl };
})();
