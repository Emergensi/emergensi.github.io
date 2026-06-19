(function () {
  const GROUPS = window.IGD_LINK_GROUPS || [];
  const ROOT = document.body ? (document.body.dataset.root || '') : '';
  const page = document.body ? document.body.dataset.page : '';
  const groupId = document.body ? document.body.dataset.group : '';

  function $(id) {
    return document.getElementById(id);
  }

  function allItems() {
    return GROUPS.flatMap((group) => group.items.map((item) => ({ ...item, groupTitle: group.title, groupId: group.id })));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function itemMatches(item, query) {
    if (!query) return true;
    const haystack = normalize([item.title, item.desc, item.type, item.groupTitle, item.url].join(' '));
    return haystack.includes(normalize(query));
  }

  function internalUrl(path) {
    return ROOT + path;
  }

  function groupUrl(group) {
    return internalUrl(group.id + '/');
  }

  function tagHtml(item) {
    const sensitiveTag = item.sensitive ? '<span class="tag sensitive">Sensitif</span>' : '';
    return `<div class="tags"><span class="tag ${item.tag || ''}">${item.type}</span>${sensitiveTag}</div>`;
  }

  function linkCard(item) {
    return `
      <a class="link-card" href="${item.url}" target="_blank" rel="noopener" data-title="${item.title}">
        <div class="card-top">
          ${tagHtml(item)}
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
        <span class="card-action">Buka link <span>↗</span></span>
      </a>`;
  }

  function categoryCard(group) {
    return `
      <a class="category-card" href="${groupUrl(group)}">
        <div class="category-icon">${group.icon}</div>
        <div>
          <h3>${group.title}</h3>
          <p>${group.subtitle}</p>
        </div>
        <div class="category-foot">
          <span>${group.items.length} link</span>
          <strong>Buka halaman →</strong>
        </div>
      </a>`;
  }

  function navLinks() {
    const nav = $('navLinks');
    if (!nav) return;
    nav.innerHTML = GROUPS.map((group) => {
      const active = group.id === groupId ? 'active' : '';
      return `<a class="nav-chip ${active}" href="${groupUrl(group)}">${group.title}</a>`;
    }).join('');
  }

  function setupLogout() {
    const logout = $('logoutBtn');
    if (logout) logout.addEventListener('click', window.IGDAuth.logout);
  }

  function renderHome() {
    const total = allItems().length;
    const totalLinks = $('totalLinks');
    const totalCategories = $('totalCategories');
    if (totalLinks) totalLinks.textContent = total;
    if (totalCategories) totalCategories.textContent = GROUPS.length;

    const categoryRoot = $('categoryRoot');
    if (categoryRoot) categoryRoot.innerHTML = GROUPS.map(categoryCard).join('');

    const priorityTitles = [
      'Patient Registration', 'Billing Pasien', 'Medical Duty Schedule', 'Jadwal Dokter Umum',
      'Jadwal Perawat', 'AVIAT Out Hospital', 'Room Temperature Monitoring Form', 'Morning Report',
      'Akreditasi'
    ];
    const priority = priorityTitles
      .map((title) => allItems().find((item) => item.title === title))
      .filter(Boolean);
    const priorityRoot = $('priorityRoot');
    if (priorityRoot) priorityRoot.innerHTML = priority.map(linkCard).join('');

    const searchInput = $('globalSearchInput');
    const searchRoot = $('globalSearchRoot');
    function renderSearch() {
      if (!searchInput || !searchRoot) return;
      const query = searchInput.value.trim();
      if (!query) {
        searchRoot.innerHTML = '';
        searchRoot.classList.add('is-empty');
        return;
      }
      const matches = allItems().filter((item) => itemMatches(item, query));
      searchRoot.classList.remove('is-empty');
      searchRoot.innerHTML = matches.length
        ? `<div class="result-head"><strong>${matches.length} hasil</strong><span>Klik kartu untuk membuka URL.</span></div><div class="card-grid">${matches.map(linkCard).join('')}</div>`
        : '<div class="empty-state">Tidak ada link yang cocok dengan pencarian.</div>';
    }
    if (searchInput) searchInput.addEventListener('input', renderSearch);
  }

  function renderGroupPage() {
    const group = GROUPS.find((item) => item.id === groupId);
    if (!group) return;

    const title = $('pageTitle');
    const subtitle = $('pageSubtitle');
    const icon = $('pageIcon');
    const count = $('pageCount');
    if (title) title.textContent = group.title;
    if (subtitle) subtitle.textContent = group.subtitle;
    if (icon) icon.textContent = group.icon;
    if (count) count.textContent = group.items.length + ' link';

    const root = $('groupPageRoot');
    const input = $('pageSearchInput');
    function render() {
      if (!root) return;
      const query = input ? input.value.trim() : '';
      const items = group.items.map((item) => ({ ...item, groupTitle: group.title, groupId: group.id })).filter((item) => itemMatches(item, query));
      root.innerHTML = items.length
        ? `<div class="card-grid">${items.map(linkCard).join('')}</div>`
        : '<div class="empty-state">Tidak ada link yang cocok dengan pencarian.</div>';
    }
    if (input) input.addEventListener('input', render);
    render();
  }

  function init() {
    setupLogout();
    navLinks();
    if (page === 'home') renderHome();
    if (page === 'group') renderGroupPage();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
