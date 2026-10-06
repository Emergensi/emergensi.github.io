// Pantau IGD — panel beranda pimpinan dan halaman /pantau/.
// Selama API_URL kosong, yang ditampilkan adalah DATA CONTOH.
// Setelah Apps Script register IGD di-deploy, isi API_URL dengan link Web App-nya.
(function () {
  const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbzdXDcOLMnBj5kuhINSpVRKpQ1RWwdOhXuPfEOxd11b7s9yRWVjU3f8T744OyaQgxtJUw/exec',
    REFRESH_MS: 5 * 60 * 1000,
    LOS_BATAS_MENIT: 360,   // 6 jam
    RT_TARGET_MENIT: 5
  };

  /* ---------- Bentuk data (sama dengan yang nanti dikirim Apps Script) ----------
  {
    sumber: 'contoh' | 'register',
    diperbarui: ISO string,
    sekarang: [{ inisial, rm, triase: 'merah'|'kuning'|'hijau'|'hitam'|'', kasus, jamDatang: 'HH:MM',
                 menitDiIgd, rencana, ruang, dokter, rtMenit }],
    hariIni: { kunjungan, rtMedian, rtPersenTarget, losLebih, blpl, ranap, rujuk, meninggal, aps,
               gadar, kll, shift: { pagi, siang, malam } },
    tren: [{ tanggal: 'YYYY-MM-DD', kunjungan, rtPersenTarget }],
    peringatan: [{ level: 1|2|3, judul, isi, menitLalu }]
  }
  ------------------------------------------------------------------------------- */

  function dataContoh() {
    let seed = 7;
    const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const pick = (a) => a[Math.floor(r() * a.length)];
    const inisial = ['Tn. A', 'Ny. S', 'An. R', 'Tn. B', 'Ny. W', 'Tn. H', 'Ny. D', 'An. F', 'Tn. M', 'Ny. K', 'Tn. Y'];
    const dokter = ['dr. A', 'dr. B', 'dr. C'];
    const kasus = ['BEDAH', 'NON BEDAH', 'ANAK', 'NON BEDAH'];
    const tri = ['merah', 'kuning', 'kuning', 'kuning', 'hijau', 'hijau', 'hijau', 'hijau', 'hijau', 'kuning', 'merah'];
    const now = new Date();
    const sekarang = inisial.map((nama, i) => {
      const menit = Math.floor(15 + r() * (i < 2 ? 470 : 330));
      const datang = new Date(now.getTime() - menit * 60000);
      const rencana = menit > 240 ? pick(['RAWAT INAP', 'RAWAT INAP', 'RUJUK']) : pick(['', '', 'BLPL', 'RAWAT INAP']);
      return {
        inisial: nama,
        rm: '••' + String(1000 + Math.floor(r() * 8999)),
        triase: tri[i],
        kasus: pick(kasus),
        jamDatang: datang.toTimeString().slice(0, 5),
        menitDiIgd: menit,
        rencana,
        ruang: rencana === 'RAWAT INAP' ? pick(['ASTER', 'ICU', 'MELATI', '']) : '',
        dokter: pick(dokter),
        rtMenit: tri[i] === 'merah' ? 1 + Math.floor(r() * 3) : 1 + Math.floor(r() * 9)
      };
    });
    const tren = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now.getTime() - (13 - i) * 864e5);
      return { tanggal: d.toISOString().slice(0, 10), kunjungan: Math.round(28 + r() * 20), rtPersenTarget: Math.round(74 + r() * 24) };
    });
    tren[13].kunjungan = 34;
    tren[13].rtPersenTarget = 88;
    return {
      sumber: 'contoh',
      diperbarui: now.toISOString(),
      sekarang,
      hariIni: {
        kunjungan: 34, rtMedian: 4, rtPersenTarget: 88, losLebih: sekarang.filter((p) => p.menitDiIgd > CONFIG.LOS_BATAS_MENIT).length,
        blpl: 19, ranap: 9, rujuk: 2, meninggal: 1, aps: 1, gadar: 11, kll: 4,
        shift: { pagi: 14, siang: 13, malam: 7 }
      },
      tren,
      peringatan: [
        { level: 1, judul: 'Pasien triase merah masuk', isi: 'Tn. A, kasus bedah (KLL). Ditangani 2 menit setelah datang.', menitLalu: 9 },
        { level: 1, judul: 'Lebih dari 6 jam di IGD', isi: 'Ny. S menunggu kamar ICU.', menitLalu: 22 },
        { level: 1, judul: 'Pasien meninggal di IGD', isi: 'Mohon telaah kasus pada rapat mutu.', menitLalu: 180 },
        { level: 2, judul: 'Pulang atas permintaan sendiri', isi: 'An. F, alasan tercatat: biaya.', menitLalu: 240 },
        { level: 2, judul: 'Response time di atas 5 menit', isi: '4 pasien hari ini, terbanyak di shift siang.', menitLalu: 300 }
      ]
    };
  }

  // Token login Pantau IGD disimpan di perangkat ini sampai kedaluwarsa (12 jam).
  const TOKEN_KEY = 'pantau_token_v1';
  function ambilToken() {
    try {
      const t = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
      if (t && t.sampai > Date.now()) return t.token;
    } catch (e) {}
    return '';
  }
  function simpanToken(token, jam) {
    try { localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, sampai: Date.now() + (jam || 12) * 3600e3 })); } catch (e) {}
  }
  function hapusToken() { try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  class PerluLogin extends Error {}

  async function ambilData() {
    if (!CONFIG.API_URL) return dataContoh();
    const token = ambilToken();
    if (!token) throw new PerluLogin('login');
    const res = await fetch(CONFIG.API_URL + '?aksi=ringkasan&token=' + encodeURIComponent(token));
    const json = await res.json();
    if (json.error === 'token') { hapusToken(); throw new PerluLogin('login'); }
    if (json.error) throw new Error(json.error);
    return json;
  }

  async function login(password) {
    // text/plain agar tidak memicu preflight CORS di Apps Script
    const res = await fetch(CONFIG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ aksi: 'login', password }) });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    simpanToken(json.token, json.berlakuJam);
  }

  function renderLogin(el) {
    el.innerHTML = `
      <div class="pt-panel-head"><span class="eyebrow"><span></span> PANTAU IGD</span></div>
      <p class="pt-sub">Masukkan password Pantau IGD untuk membuka data register. Login berlaku 12 jam di perangkat ini.</p>
      <form class="pt-login">
        <input type="password" autocomplete="current-password" placeholder="Password Pantau IGD" required>
        <button class="primary-btn" type="submit">Buka data</button>
        <p class="pt-error" role="alert"></p>
      </form>`;
    const form = el.querySelector('form');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const err = form.querySelector('.pt-error');
      const btn = form.querySelector('button');
      btn.disabled = true; err.textContent = '';
      try { await login(form.querySelector('input').value); muat(); }
      catch (e) { err.textContent = e.message === 'password salah' ? 'Password salah.' : 'Gagal masuk: ' + e.message; btn.disabled = false; }
    });
  }

  /* ---------- Util ---------- */
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lama = (m) => (m >= 60 ? Math.floor(m / 60) + 'j ' : '') + (m % 60) + 'm';
  const TRI = ['merah', 'kuning', 'hijau', 'hitam'];
  const triLabel = { merah: 'Merah', kuning: 'Kuning', hijau: 'Hijau', hitam: 'Hitam', '': 'Belum diisi' };
  const kalimat = (v) => { const t = String(v || '').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); };
  const rencanaTeks = (v) => ({ 'BLPL': 'pulang (BLPL)', 'RAWAT INAP': 'rawat inap', 'RANAP': 'rawat inap', 'RUJUK': 'rujuk' }[String(v).toUpperCase()] || String(v).toLowerCase());
  const waktuLalu = (m) => (m < 1 ? 'baru saja' : m < 60 ? m + ' menit lalu' : Math.floor(m / 60) + ' jam lalu');
  const jamUpdate = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  function hitung(d) {
    const c = { merah: 0, kuning: 0, hijau: 0, hitam: 0, '': 0 };
    d.sekarang.forEach((p) => { c[p.triase in c ? p.triase : '']++; });
    const tunggu = d.sekarang.filter((p) => p.rencana === 'RAWAT INAP').length;
    const lewat = d.sekarang.filter((p) => p.menitDiIgd > CONFIG.LOS_BATAS_MENIT).length;
    return { c, tunggu, lewat };
  }

  function pita(c) {
    const parts = TRI.concat(['']).filter((t) => c[t]);
    if (!parts.length) return '<div class="pt-strip pt-empty">Tidak ada pasien</div>';
    return '<div class="pt-strip" role="img" aria-label="Sebaran triase">' +
      parts.map((t) => `<span class="pt-t-${t || 'kosong'}" style="flex-grow:${c[t]}" title="${triLabel[t]}: ${c[t]}">${c[t]}</span>`).join('') + '</div>';
  }

  function banner(d) {
    return d.sumber === 'contoh' ? '<p class="pt-demo">Data contoh. Angka sungguhan tampil setelah tersambung ke register IGD.</p>' : '';
  }

  /* ---------- Panel beranda pimpinan ---------- */
  function renderPanel(el, d) {
    const h = hitung(d);
    const top = d.peringatan.filter((a) => a.level === 1).slice(0, 2);
    el.innerHTML = `
      <div class="pt-panel-head">
        <span class="eyebrow"><span></span> PANTAU IGD</span>
        <small>Diperbarui ${jamUpdate(d.diperbarui)}</small>
      </div>
      <div class="pt-now"><b>${d.sekarang.length}</b><span>pasien di IGD sekarang</span></div>
      ${pita(h.c)}
      <div class="pt-facts">
        <div class="${h.lewat ? 'pt-bad' : ''}"><b>${h.lewat}</b><span>lebih dari 6 jam</span></div>
        <div class="${h.tunggu ? 'pt-warn' : ''}"><b>${h.tunggu}</b><span>menunggu kamar</span></div>
        <div><b>${d.hariIni.kunjungan}</b><span>kunjungan hari ini</span></div>
        <div class="${d.hariIni.rtPersenTarget < 100 ? 'pt-warn' : ''}"><b>${d.hariIni.rtPersenTarget}%</b><span>response time ≤5 menit</span></div>
      </div>
      ${top.length ? `<ul class="pt-alerts">${top.map((a) => `<li class="pt-l${a.level}"><b>${esc(a.judul)}</b><span>${esc(a.isi)} ${waktuLalu(a.menitLalu)}.</span></li>`).join('')}</ul>` : ''}
      <a class="primary-btn pt-more" href="pantau/">Lihat detail Pantau IGD</a>
      ${banner(d)}`;
  }

  /* ---------- Halaman lengkap ---------- */
  function renderPage(el, d) {
    const h = hitung(d);
    const hi = d.hariIni;
    const list = d.sekarang.slice().sort((a, b) => b.menitDiIgd - a.menitDiIgd);
    const meter = (label, val, unit, ok, note, pct, target) => `
      <div class="pt-ind">
        <div class="pt-ind-head"><span>${label}</span><b class="${ok ? 'pt-ok' : 'pt-badtext'}">${val}${unit}</b></div>
        <div class="pt-meter"><i style="width:${Math.min(100, pct)}%" class="${ok ? 'ok' : 'bad'}"></i>${target != null ? `<em style="left:${target}%"></em>` : ''}</div>
        <p>${note}</p>
      </div>`;
    const maxK = Math.max(...d.tren.map((t) => t.kunjungan), 10);
    const W = 640, H = 220, pl = 30, pr = 36, pt = 12, pb = 28, iw = W - pl - pr, ih = H - pt - pb, bw = iw / d.tren.length;
    let svg = '';
    [0, Math.round(maxK / 2), maxK].forEach((v) => {
      const y = pt + ih - (v / maxK) * ih;
      svg += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" class="pt-grid"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" class="pt-ax">${v}</text>`;
    });
    [50, 75, 100].forEach((v) => { const y = pt + ih - ((v - 50) / 50) * ih; svg += `<text x="${W - pr + 6}" y="${y + 4}" class="pt-ax pt-ax-r">${v}%</text>`; });
    let path = '';
    d.tren.forEach((t, i) => {
      const hgt = (t.kunjungan / maxK) * ih, x = pl + i * bw + bw * 0.18;
      svg += `<rect x="${x}" y="${pt + ih - hgt}" width="${bw * 0.64}" height="${hgt}" rx="3" class="${i === d.tren.length - 1 ? 'pt-bar-now' : 'pt-bar'}"><title>${t.tanggal}: ${t.kunjungan} kunjungan, ${t.rtPersenTarget}% RT ≤5 menit</title></rect>`;
      const cx = pl + i * bw + bw / 2, cy = pt + ih - ((Math.max(50, t.rtPersenTarget) - 50) / 50) * ih;
      path += (i ? 'L' : 'M') + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ';
      if (i % 2 === 1 || i === d.tren.length - 1) svg += `<text x="${cx}" y="${H - 8}" text-anchor="middle" class="pt-ax">${+t.tanggal.slice(8)}/${+t.tanggal.slice(5, 7)}</text>`;
    });
    svg += `<path d="${path}" class="pt-line"/>`;
    const disp = [['Pulang (BLPL)', hi.blpl], ['Rawat inap', hi.ranap], ['Rujuk', hi.rujuk], ['APS', hi.aps], ['Meninggal', hi.meninggal]];
    const dispMax = Math.max(...disp.map((x) => x[1]), 1);

    el.innerHTML = `
      ${banner(d)}
      <section class="pt-card">
        <div class="pt-panel-head"><h2>Kondisi saat ini</h2><small>Diperbarui ${jamUpdate(d.diperbarui)}</small></div>
        <div class="pt-now"><b>${d.sekarang.length}</b><span>pasien di IGD sekarang</span></div>
        ${pita(h.c)}
        <div class="pt-legend">${TRI.map((t) => `<span><i class="pt-t-${t}"></i>${triLabel[t]}</span>`).join('')}</div>
        <div class="pt-facts">
          <div class="${h.lewat ? 'pt-bad' : ''}"><b>${h.lewat}</b><span>lebih dari 6 jam</span></div>
          <div class="${h.tunggu ? 'pt-warn' : ''}"><b>${h.tunggu}</b><span>menunggu kamar</span></div>
          <div><b>${hi.kunjungan}</b><span>kunjungan hari ini</span></div>
          <div><b>${hi.gadar}</b><span>kasus gawat darurat</span></div>
        </div>
      </section>

      <section class="pt-card">
        <h2>Pasien di IGD</h2>
        <p class="pt-sub">Urut dari yang paling lama. Garis merah berarti lebih dari 6 jam.</p>
        <div class="pt-list">${list.map((p) => `
          <div class="pt-row ${p.menitDiIgd > CONFIG.LOS_BATAS_MENIT ? 'late' : ''}">
            <i class="pt-t-${p.triase || 'kosong'}"></i>
            <div><b>${esc(p.nama || p.inisial)}</b> <small>RM ${esc(p.rm)}</small>
              <span>${p.diagnosis ? '<em class="pt-dx">' + esc(p.diagnosis) + '</em> ' : ''}${esc(kalimat(p.kasus))}. Datang ${esc(p.jamDatang)}, response time ${p.rtMenit} menit.${p.rencana ? ' Rencana: ' + esc(rencanaTeks(p.rencana)) + (p.ruang ? ' (' + esc(p.ruang) + ')' : '') + '.' : ' Belum ada rencana.'}</span></div>
            <strong>${lama(p.menitDiIgd)}</strong>
          </div>`).join('')}
        </div>
      </section>

      ${(d.pasienHariIni || []).length ? `<section class="pt-card">
        <h2>Pasien hari ini</h2>
        <p class="pt-sub">${d.pasienHariIni.length} pasien, terbaru di atas.</p>
        <div class="pt-list">${d.pasienHariIni.map((p) => `
          <div class="pt-row">
            <i class="pt-t-${p.triase || 'kosong'}"></i>
            <div><b>${esc(p.nama)}</b> <small>RM ${esc(p.rm)}</small>
              <span>${p.diagnosis ? '<em class="pt-dx">' + esc(p.diagnosis) + '</em> ' : ''}Datang ${esc(p.jamDatang)}${p.jamKeluar ? ', keluar ' + esc(p.jamKeluar) : ', masih di IGD'}.${p.dokter ? ' ' + esc(p.dokter) + '.' : ''}</span></div>
            <strong class="pt-rtl">${p.rencana ? esc(rencanaTeks(p.rencana)) + (p.ruang ? '<small>' + esc(p.ruang) + '</small>' : '') : '<small>belum ada rencana</small>'}</strong>
          </div>`).join('')}
        </div>
      </section>` : ''}

      <section class="pt-card">
        <h2>Indikator mutu hari ini</h2>
        <p class="pt-sub">Garis tegak pada meter adalah target.</p>
        ${meter('Response time ≤5 menit', hi.rtPersenTarget, '%', hi.rtPersenTarget >= 100, 'Standar pelayanan minimal: seluruh pasien gawat darurat dilayani dalam 5 menit.', hi.rtPersenTarget, 99.5)}
        ${meter('Median response time', hi.rtMedian, ' menit', hi.rtMedian <= CONFIG.RT_TARGET_MENIT, 'Selisih jam datang dan jam ditangani di register.', hi.rtMedian / 15 * 100, CONFIG.RT_TARGET_MENIT / 15 * 100)}
        ${meter('Pasien lebih dari 6 jam', hi.losLebih, '', hi.losLebih === 0, 'Dihitung dari jam datang sampai jam keluar IGD.', hi.losLebih / 10 * 100, 0.5)}
      </section>

      <section class="pt-card">
        <h2>Disposisi hari ini</h2>
        <div class="pt-bars">${disp.map(([k, v]) => `<div><span>${k}</span><i><em style="width:${v / dispMax * 100}%"></em></i><b>${v}</b></div>`).join('')}</div>
        <div class="pt-facts pt-facts-3">
          <div><b>${hi.shift.pagi}</b><span>shift pagi</span></div>
          <div><b>${hi.shift.siang}</b><span>shift siang</span></div>
          <div><b>${hi.shift.malam}</b><span>shift malam</span></div>
        </div>
      </section>

      <section class="pt-card">
        <h2>Kunjungan 14 hari terakhir</h2>
        <p class="pt-sub">Batang: jumlah kunjungan. Garis: persentase response time ≤5 menit.</p>
        <div class="pt-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik kunjungan 14 hari">${svg}</svg></div>
      </section>

      <section class="pt-card">
        <h2>Peringatan</h2>
        <ul class="pt-alerts">${d.peringatan.map((a) => `<li class="pt-l${a.level}"><b>${esc(a.judul)}</b><span>${esc(a.isi)} ${waktuLalu(a.menitLalu)}.</span></li>`).join('')}</ul>
      </section>`;
  }

  async function muat() {
    const panel = document.getElementById('pantauPanel');
    const page = document.getElementById('pantauRoot');
    if (!panel && !page) return;
    if (!(window.IGDAuth && window.IGDAuth.isPimpinan())) return;
    if (CONFIG.API_URL && !ambilToken() && document.querySelector('.pt-login')) return; // jangan hapus form login yang sedang diisi
    if (panel) {
      panel.hidden = false;
      document.body.classList.add('has-pantau');
    }
    try {
      const d = await ambilData();
      if (panel) renderPanel(panel, d);
      if (page) renderPage(page, d);
    } catch (e) {
      if (e instanceof PerluLogin) {
        if (panel) renderLogin(panel);
        if (page) renderLogin(page);
        return;
      }
      const msg = '<p class="pt-error">Data Pantau IGD belum bisa dimuat: ' + esc(e.message) + '. Coba muat ulang halaman.</p>';
      if (panel) panel.innerHTML = msg;
      if (page) page.innerHTML = msg;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    muat();
    setInterval(muat, CONFIG.REFRESH_MS);
  });
})();
