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
    const haystack = normalize([item.title, item.desc, item.type, item.groupTitle, item.url, item.externalUrl].join(' '));
    return haystack.includes(normalize(query));
  }

  function internalUrl(path) {
    return ROOT + path;
  }

  function groupUrl(group) {
    return internalUrl(group.id + '/');
  }

  function isExternal(url) {
    return /^(https?:|mailto:|tel:)/i.test(String(url || ''));
  }

  function itemHref(item) {
    if (item.localPath) return internalUrl(item.localPath);
    if (!item.url) return '#';
    return isExternal(item.url) ? item.url : internalUrl(item.url);
  }

  function tagHtml(item) {
    const sensitiveTag = item.sensitive ? '<span class="tag sensitive">Sensitif</span>' : '';
    return `<div class="tags"><span class="tag ${item.tag || ''}">${item.type}</span>${sensitiveTag}</div>`;
  }

  function safeAttr(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function initials(name) {
    return String(name || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  function photoBlock(item, className = 'card-photo') {
    const name = item.personName || item.title || item.name || '';
    if (!item.photo) return '';
    const src = isExternal(item.photo) ? item.photo : internalUrl(item.photo);
    return `<div class="${className}"><img src="${safeAttr(src)}" alt="Foto ${safeAttr(name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.${className}').classList.add('photo-failed'); this.remove();"><span>${initials(name)}</span></div>`;
  }

  function linkCard(item) {
    const href = itemHref(item);
    const external = isExternal(href);
    const target = external ? ' target="_blank" rel="noopener"' : '';
    const actionText = external ? 'Buka URL' : 'Buka halaman';
    const arrow = external ? '↗' : '→';
    const personLine = item.personName ? `<p class="person-line">${item.personName}</p>` : '';
    return `
      <a class="link-card ${item.photo ? 'has-photo' : ''}" href="${href}"${target} data-title="${safeAttr(item.title)}">
        <div class="card-top">
          ${photoBlock(item)}
          ${tagHtml(item)}
          <h4>${item.title}</h4>
          ${personLine}
          <p>${item.desc}</p>
        </div>
        <span class="card-action">${actionText} <span>${arrow}</span></span>
      </a>`;
  }

  function staffCard(person) {
    const item = { ...person, title: person.name, personName: person.name, photo: person.photo };
    return `<article class="staff-card">
      ${photoBlock(item, 'staff-photo')}
      <div class="staff-text">
        <span>${person.team}</span>
        <h4>${person.name}</h4>
        <p>${person.role || 'Tim IGD'}</p>
      </div>
    </article>`;
  }

  function staffGallery(filterTeam) {
    const staff = window.IGD_STAFF_PHOTOS || [];
    const people = filterTeam ? staff.filter((p) => p.team === filterTeam) : staff;
    const grouped = people.reduce((acc, person) => {
      const key = person.team || 'Tim IGD';
      if (!acc[key]) acc[key] = [];
      acc[key].push(person);
      return acc;
    }, {});
    return `<div class="staff-gallery-wrap">
      <div class="section-head compact">
        <div>
          <span class="eyebrow"><span></span> FOTO TIM</span>
          <h2>Foto Tim IGD</h2>
          <p>Daftar foto lengkap dari halaman struktur organisasi lama.</p>
        </div>
      </div>
      ${Object.entries(grouped).map(([team, list]) => `
        <div class="team-section">
          <h3>${team}</h3>
          <div class="staff-grid">${list.map(staffCard).join('')}</div>
        </div>
      `).join('')}
    </div>`;
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
        ? `<div class="result-head"><strong>${matches.length} hasil</strong><span>Klik kartu untuk membuka halaman GitHub.</span></div><div class="card-grid">${matches.map(linkCard).join('')}</div>`
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
      const gallery = (groupId === 'struktur' && !query) ? staffGallery() : '';
      root.innerHTML = items.length
        ? `<div class="card-grid">${items.map(linkCard).join('')}</div>${gallery}`
        : '<div class="empty-state">Tidak ada link yang cocok dengan pencarian.</div>';
    }
    if (input) input.addEventListener('input', render);
    render();
  }

  function currentSlug() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    if (last === 'index.html') return parts[parts.length - 2] || '';
    return last;
  }

  function renderDetailPhotos() {
    if (page !== 'detail') return;
    const panel = document.querySelector('.detail-panel');
    if (!panel) return;
    const slug = currentSlug();
    const staff = window.IGD_STAFF_BY_SLUG || {};
    const person = staff[slug];
    const gallerySlugs = ['struktur-organizational-structure'];
    if (person) {
      const profile = document.createElement('div');
      profile.className = 'profile-detail';
      profile.innerHTML = `${photoBlock({ ...person, title: person.name, personName: person.name }, 'profile-photo')}
        <div><span class="eyebrow"><span></span> PROFIL</span><h3>${person.name}</h3><p>${person.role || ''}</p></div>`;
      const afterTags = panel.querySelector('.tags');
      if (afterTags) afterTags.insertAdjacentElement('afterend', profile);
      return;
    }
    if (gallerySlugs.includes(slug)) {
      panel.insertAdjacentHTML('beforeend', staffGallery());
    }
  }

  function init() {
    setupLogout();
    navLinks();
    if (page === 'home') renderHome();
    if (page === 'group') renderGroupPage();
    renderDetailPhotos();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
