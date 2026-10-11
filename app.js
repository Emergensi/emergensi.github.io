(function () {
  const ROLE = window.IGDAuth ? window.IGDAuth.getRole() : null;
  // Tautan bertanda akses "pimpinan" hanya ditampilkan untuk Akses Pimpinan.
  // Grup dengan "refs" (misalnya Laporan) menampilkan ulang tautan dari grup lain berdasarkan slug.
  const RAW_GROUPS = window.IGD_LINK_GROUPS || [];
  const BY_SLUG = {};
  RAW_GROUPS.forEach((group) => group.items.forEach((item) => { BY_SLUG[item.slug] = item; }));
  const GROUPS = RAW_GROUPS
    .filter((group) => group.akses !== 'pimpinan' || ROLE === 'pimpinan')
    .map((group) => ({ ...group, items: (group.refs ? group.refs.map((slug) => BY_SLUG[slug]).filter(Boolean) : group.items)
      .filter((item) => (item.akses !== 'pimpinan' || ROLE === 'pimpinan') && !item.arsip) }))   // "arsip": tidak dipakai lagi, disembunyikan
    .filter((group) => group.items.length);
  const ROOT = document.body ? (document.body.dataset.root || '') : '';
  const page = document.body ? document.body.dataset.page : '';
  const groupId = document.body ? document.body.dataset.group : '';

  function $(id) {
    return document.getElementById(id);
  }

  function allItems() {
    return sortByTitle(GROUPS.filter((group) => !group.refs).flatMap((group) => group.items.map((item) => ({ ...item, groupTitle: group.title, groupId: group.id }))));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function itemMatches(item, query) {
    if (!query) return true;
    const haystack = normalize([item.title, item.desc, item.type, item.groupTitle, item.url, item.externalUrl].join(' '));
    return haystack.includes(normalize(query));
  }

  function sortKey(value) {
    return normalize(value).replace(/^(the|a|an)\s+/, '').trim();
  }

  function sortByTitle(items) {
    return [...items].sort((a, b) => sortKey(a.title || a.name).localeCompare(sortKey(b.title || b.name), 'id', { sensitivity: 'base', numeric: true }));
  }

  function sortStaff(items) {
    return [...items].sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), 'id', { sensitivity: 'base', numeric: true }));
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
    // Satu klik: bila ada URL Drive/Sheets/sistem, kartu langsung membuka URL tersebut.
    if (item.externalUrl) return item.externalUrl;
    if (item.localPath) return internalUrl(item.localPath);
    if (!item.url) return '#';
    return isExternal(item.url) ? item.url : internalUrl(item.url);
  }

  function tagHtml(item) {
    const sensitiveTag = item.sensitive ? '<span class="tag sensitive">Sensitif</span>' : '';
    const pimpinanTag = item.akses === 'pimpinan' ? '<span class="tag sensitive">Pimpinan</span>' : '';
    return `<div class="tags"><span class="tag ${item.tag || ''}">${item.type}</span>${sensitiveTag}${pimpinanTag}</div>`;
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
    return `<div class="${className}"><img src="${safeAttr(src)}" alt="Foto ${safeAttr(name)}" loading="lazy" onerror="this.closest('.${className}').classList.add('photo-failed'); this.remove();"><span>${initials(name)}</span></div>`;
  }

  function linkCard(item) {
    const href = itemHref(item);
    const external = isExternal(href);
    const target = external ? ' target="_blank" rel="noopener"' : '';
    const actionText = external ? 'Buka langsung' : 'Buka halaman';
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

  // Bagan struktur organisasi IGD dari data kartu Struktur (nama & jabatan diambil dari data.js)
  function baganStruktur(items) {
    const cari = (slug) => items.find((i) => i.slug === slug) || RAW_GROUPS.flatMap((g) => g.items).find((i) => i.slug === slug);
    const kotak = (slug, jabatan, kelas) => {
      const it = cari(slug);
      const peran = { 'struktur-head-of-emergency-department': 'kain', 'struktur-emergency-room-manager': 'karu', 'struktur-secretary': 'staf', 'struktur-finance-manager': 'staf' }[slug] || 'divisi';
      if (!it) return '';
      const nama = it.personName || '-';
      const foto = it.photo ? photoBlock({ ...it, personName: nama }, 'bagan-foto') : `<div class="bagan-foto photo-failed"><span>${initials(nama.replace(/^dr\.\s*/i, ''))}</span></div>`;
      return `<a class="bagan-kotak ${kelas || ''}" data-bagan="${peran}" href="${itemHref(it)}">${foto}<span class="bagan-teks"><span class="bagan-jabatan">${jabatan}</span><strong>${nama}</strong></span></a>`;
    };
    const divisi = [
      ['struktur-emr-division', 'EMR (Ambulans)'],
      ['struktur-training-and-development-division', 'Pendidikan & Pelatihan'], ['struktur-inventory-division', 'Inventaris'],
      ['struktur-equipment-maintenance-division', 'Pemeliharaan Alat']
    ];
    return `<section class="bagan" id="bagan" aria-label="Bagan struktur organisasi IGD">
      <h2 class="bagan-judul">Bagan Struktur Organisasi IGD</h2>
      <div class="bagan-level">${kotak('struktur-head-of-emergency-department', 'Kepala Instalasi IGD', 'utama')}</div>
      <div class="bagan-garis"></div>
      <div class="bagan-samping">
        <div></div>
        <div class="bagan-pusat"><span class="bagan-vgaris-atas"></span>${kotak('struktur-emergency-room-manager', 'Kepala Ruang IGD')}<span class="bagan-vgaris"></span></div>
        <div class="bagan-kanan"><span class="bagan-hgaris"></span>
          <div class="bagan-tumpuk">${kotak('struktur-secretary', 'Sekretaris')}${kotak('struktur-finance-manager', 'Keuangan')}</div>
        </div>
      </div>
      <div class="bagan-garis"></div>
      <div class="bagan-anak">${divisi.map(([s, j]) => `<div class="bagan-cabang">${kotak(s, j)}</div>`).join('')}</div>
      <p class="bagan-cat">Klik kotak untuk melihat detail. Perubahan nama pemegang jabatan diperbarui lewat data struktur.</p>
    </section>`;
  }

  // Garis & panah bagan digambar dari posisi kotak yang sebenarnya, jadi selalu rapi di semua ukuran layar
  function gambarPanah() {
    const bagan = document.getElementById('bagan');
    if (!bagan) return;
    let svg = bagan.querySelector('svg.bagan-svg');
    if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'bagan-svg'); svg.setAttribute('aria-hidden', 'true'); bagan.prepend(svg); }
    const B = bagan.getBoundingClientRect();
    svg.setAttribute('width', B.width); svg.setAttribute('height', B.height);
    const r = (el) => { const x = el.getBoundingClientRect(); return { l: x.left - B.left, r: x.right - B.left, t: x.top - B.top, b: x.bottom - B.top, cx: (x.left + x.right) / 2 - B.left, cy: (x.top + x.bottom) / 2 - B.top }; };
    const q = (s) => [...bagan.querySelectorAll('[data-bagan="' + s + '"]')].map(r);
    const [kain] = q('kain'), [karu] = q('karu'), staf = q('staf'), divisi = q('divisi');
    if (!kain || !karu) return;
    const p = [];
    const garis = (d) => p.push(`<path d="${d}" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#ujung)"/>`);
    const tanpa = (d) => p.push(`<path d="${d}" fill="none" stroke="#94a3b8" stroke-width="2"/>`);
    garis(`M${kain.cx},${kain.b} V${karu.t - 2}`);
    const lebar = window.innerWidth > 860;
    if (lebar && staf.length) {
      const xBus = karu.r + (Math.min(...staf.map((s) => s.l)) - karu.r) / 2;
      tanpa(`M${karu.r},${karu.cy} H${xBus}`);
      tanpa(`M${xBus},${Math.min(...staf.map((s) => s.cy))} V${Math.max(...staf.map((s) => s.cy))}`);
      staf.forEach((s) => garis(`M${xBus},${s.cy} H${s.l - 2}`));
    } else if (staf.length) {
      const yBus = karu.b + (Math.min(...staf.map((s) => s.t)) - karu.b) / 2;
      tanpa(`M${karu.cx},${karu.b} V${yBus}`);
      if (staf.length > 1) tanpa(`M${Math.min(...staf.map((s) => s.cx))},${yBus} H${Math.max(...staf.map((s) => s.cx))}`);
      staf.forEach((s) => garis(`M${s.cx},${yBus} V${s.t - 2}`));
    }
    if (divisi.length) {
      // kelompokkan per baris; tiap baris punya garis datar sendiri, tersambung lewat garis tegak di tengah
      const barisList = [];
      divisi.slice().sort((m, n) => m.t - n.t).forEach((d) => {
        const b = barisList.find((x) => Math.abs(x[0].t - d.t) < 4);
        if (b) b.push(d); else barisList.push([d]);
      });
      const asal = karu;                                   // garis induk selalu dari Kepala Ruang (di HP lewat celah Sekretaris–Keuangan)
      const busTerakhir = barisList[barisList.length - 1][0].t - 18;
      tanpa(`M${asal.cx},${asal.b} V${busTerakhir}`);
      barisList.forEach((baris) => {
        const yBus = baris[0].t - 18;
        const xs = baris.map((d) => d.cx).concat([asal.cx]);
        tanpa(`M${Math.min(...xs)},${yBus} H${Math.max(...xs)}`);
        baris.forEach((d) => garis(`M${d.cx},${yBus} V${d.t - 2}`));
      });
    }
    svg.innerHTML = '<defs><marker id="ujung" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/></marker></defs>' + p.join('');
  }

  // urutan tim di galeri foto: dokter umum, perawat, bidan, driver, lalu lainnya
  const URUTAN_TIM = ['Tim Dokter Umum', 'Tim Perawat', 'Tim Bidan', 'Tim Driver'];
  const urutTim = (t) => { const i = URUTAN_TIM.indexOf(t); return i < 0 ? 99 : i; };

  function staffGallery(filterTeam) {
    const staff = window.IGD_STAFF_PHOTOS || [];
    const people = sortStaff(filterTeam ? staff.filter((p) => p.team === filterTeam) : staff);
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
      ${Object.entries(grouped).sort(([a], [b]) => urutTim(a) - urutTim(b)).map(([team, list]) => `
        <div class="team-section">
          <h3>${team}</h3>
          <div class="staff-grid">${sortStaff(list).map(staffCard).join('')}</div>
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
    const labels = {
      operasional: 'Operasional',
      laporan: 'Laporan',
      jadwal: 'Jadwal',
      struktur: 'Struktur',
      manajemen: 'Manajemen',
      kebijakan: 'Regulasi',
      pedoman: 'SPO & Form',
      akreditasi: 'Akreditasi'
    };
    // Beranda ikut di deretan menu (layar lebar); di HP tetap memakai tombol Beranda tersendiri
    const isBeranda = document.body.dataset.page === 'home' || /\/(index\.html)?$/.test(location.pathname) && !groupId;
    const homeChip = `<a class="nav-chip nav-home ${isBeranda ? 'active' : ''}" href="${internalUrl('index.html')}">Beranda</a>`;
    const pantauChip = ROLE === 'pimpinan'
      ? `<a class="nav-chip nav-pantau ${groupId === 'pantau' ? 'active' : ''}" href="${internalUrl('pantau/')}">Pantau IGD</a>` : '';
    const inputChip = ROLE ? `<a class="nav-chip nav-input ${groupId === 'input' ? 'active' : ''}" href="${internalUrl('input/')}">Input Register</a>` : '';
    const jejakChip = ROLE ? `<a class="nav-chip nav-input ${groupId === 'jejak' ? 'active' : ''}" href="${internalUrl('jejak/')}">Respon Time</a>` : '';
    nav.innerHTML = homeChip + pantauChip + jejakChip + inputChip + GROUPS.map((group) => {
      const active = group.id === groupId ? 'active' : '';
      const label = labels[group.id] || group.title;
      return `<a class="nav-chip ${active}" href="${groupUrl(group)}">${label}</a>`;
    }).join('');
    // Tanda memudar di kanan hanya bila menu memang tidak muat
    // Bila menu tidak muat, tombol dirapatkan bertahap; baru setelah itu bisa digeser
    const bar = nav.closest('.topbar');
    const cekLuap = () => {
      if (bar) bar.classList.remove('rapat', 'rapat2');
      const luap = () => nav.scrollWidth > nav.clientWidth + 2;
      if (bar && window.innerWidth > 640 && luap()) bar.classList.add('rapat');
      if (bar && window.innerWidth > 640 && luap()) bar.classList.add('rapat2');
      nav.classList.toggle('meluap', luap());
    };
    cekLuap();
    window.addEventListener('resize', cekLuap);
    // Di HP, geser menu supaya kategori yang sedang dibuka terlihat.
    const current = nav.querySelector('.nav-chip.active');
    if (current) {
      const right = current.offsetLeft - nav.offsetLeft + current.offsetWidth;
      if (right > nav.clientWidth) nav.scrollLeft = right - nav.clientWidth + 40;
    }
  }

  function setupLogout() {
    const logout = $('logoutBtn');
    if (!logout) return;
    logout.addEventListener('click', window.IGDAuth.logout);
    logout.textContent = 'Keluar';
    // Label jalur akses ditampilkan di bawah nama rumah sakit.
    const brandText = document.querySelector('.topbar .brand > span:last-child');
    if (ROLE && brandText) {
      const badge = document.createElement('em');
      badge.className = 'role-badge' + (ROLE === 'pimpinan' ? ' pimpinan' : '');
      badge.textContent = ROLE === 'pimpinan' ? 'Akses Pimpinan' : 'Akses Staf IGD';
      brandText.appendChild(badge);
    }
  }

  function renderHome() {
    const total = allItems().length;
    const totalLinks = $('totalLinks');
    const totalCategories = $('totalCategories');
    if (totalLinks) totalLinks.textContent = total;
    if (totalCategories) totalCategories.textContent = GROUPS.length;

    const categoryRoot = $('categoryRoot');
    // Beranda: satu grid, urutan tetap (tautan langsung & halaman bagian)
    const ikonLink = { 'Registrasi Pasien': '📋', 'Billing Pasien': '💳', 'AVIAT (Jaringan RS)': '🖥️' };
    const linkKartu = (item) => {
      const href = itemHref(item);
      const external = isExternal(href);
      return `
      <a class="category-card" href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>
        <div class="category-icon">${ikonLink[item.title] || '🔗'}</div>
        <div>
          <h3>${item.title}</h3>
          <p>${item.desc || ''}</p>
        </div>
        <div class="category-foot">
          <span>${item.type || 'Tautan'}</span>
          <strong>${external ? 'Buka langsung ↗' : 'Buka halaman →'}</strong>
        </div>
      </a>`;
    };
    const URUTAN = [['link', 'AVIAT (Jaringan RS)'], ['link', 'Registrasi Pasien'], ['grup', 'jadwal'], ['grup', 'manajemen'], ['grup', 'akreditasi'],
      ['grup', 'laporan'], ['link', 'Billing Pasien'], ['grup', 'pedoman'], ['grup', 'kebijakan'], ['grup', 'struktur']];
    const kartu = URUTAN.map(([jenis, kunci]) => {
      if (jenis === 'link') { const it = allItems().find((x) => x.title === kunci); return it ? linkKartu(it) : ''; }
      const g = GROUPS.find((x) => x.id === kunci); return g ? categoryCard(g) : '';
    });
    // grup lain yang belum ada di urutan (kecuali Operasional) tetap ditampilkan di belakang
    GROUPS.filter((g) => g.id !== 'operasional' && !URUTAN.some(([j, k]) => j === 'grup' && k === g.id)).forEach((g) => kartu.push(categoryCard(g)));
    if (categoryRoot) categoryRoot.innerHTML = kartu.join('');
    const priorityRoot = $('priorityRoot');
    if (priorityRoot) priorityRoot.innerHTML = '';

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
      const matches = sortByTitle(allItems().filter((item) => itemMatches(item, query)));
      searchRoot.classList.remove('is-empty');
      searchRoot.innerHTML = matches.length
        ? `<div class="result-head"><strong>${matches.length} hasil</strong><span>Klik kartu untuk membuka file, sistem, atau halaman.</span></div><div class="card-grid">${matches.map(linkCard).join('')}</div>`
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
      const semua = group.items.map((item) => ({ ...item, groupTitle: group.title, groupId: group.id })).filter((item) => itemMatches(item, query));
      // grup dengan "urutan" (daftar slug) ditampilkan sesuai urutan itu; sisanya menurut abjad
      const items = group.urutan
        ? semua.filter((i) => group.urutan.includes(i.slug)).sort((x, y) => group.urutan.indexOf(x.slug) - group.urutan.indexOf(y.slug))
          .concat(sortByTitle(semua.filter((i) => !group.urutan.includes(i.slug))))
        : sortByTitle(semua);
      const gallery = (groupId === 'struktur' && !query) ? staffGallery() : '';
      const bagan = (groupId === 'struktur' && !query) ? baganStruktur(group.items) : '';
      root.innerHTML = items.length
        ? (bagan ? `${bagan}${gallery}` : `<div class="card-grid">${items.map(linkCard).join('')}</div>${gallery}`)   // Struktur: cukup bagan (kotaknya bisa diklik)
        : '<div class="empty-state">Tidak ada link yang cocok dengan pencarian.</div>';
    }
    if (input) input.addEventListener('input', () => { render(); gambarPanah(); });
    window.addEventListener('resize', gambarPanah);
    setTimeout(gambarPanah, 50);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(gambarPanah);
    render();
  }

  function currentSlug() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    if (last === 'index.html') return parts[parts.length - 2] || '';
    return last;
  }


  function itemBySlug(slug) {
    return allItems().find((item) => item.slug === slug);
  }

  function setupOneClickLinks() {
    // Mengalihkan semua tautan /link/<slug>/ yang punya externalUrl agar langsung membuka Drive/Sheets/sistem.
    document.addEventListener('click', function (event) {
      const anchor = event.target.closest ? event.target.closest('a[href]') : null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      const match = href.match(/(?:^|\/)link\/([^/?#]+)\/?(?:index\.html)?(?:[?#].*)?$/);
      if (!match) return;
      const item = itemBySlug(match[1]);
      if (!item || !item.externalUrl) return;
      event.preventDefault();
      window.open(item.externalUrl, '_blank', 'noopener');
    });
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
    setupOneClickLinks();
    navLinks();
    if (page === 'home') renderHome();
    if (page === 'group') renderGroupPage();
    renderDetailPhotos();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
