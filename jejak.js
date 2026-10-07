// Jejak Waktu IGD: petugas mengetuk tombol saat kejadian; waktu diambil dari server Apps Script.
(function () {
  const KEY = 'input_token_v1';                       // satu login dengan halaman Input Register
  const R = () => window.RegForm;
  const esc = (v) => R().esc(v);
  const root = () => document.getElementById('jejakRoot');
  const ambil = () => {
    try { const t = JSON.parse(localStorage.getItem(KEY) || 'null'); if (t && t.sampai > Date.now()) return t; } catch (e) {}
    return R().perangkat();     // perangkat IGD terdaftar: tanpa password
  };
  const simpan = (t) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} };
  const hapus = () => {
    try {
      const t = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (t) { R().post({ aksi: 'logout', token: t.token }).catch(() => {}); localStorage.removeItem(KEY); }
      else R().lupakanPerangkat();   // token perangkat ditolak server (sudah dicabut)
    } catch (e) {}
  };
  const ms = (t) => (t ? new Date(String(t).replace(' ', 'T') + '+07:00').getTime() : null);
  const jam = (t) => String(t || '').slice(11, 16);
  let data = null, selisihServer = 0, formTerbuka = false;

  const TITIK = [
    ['dokter', '👨‍⚕️', 'Dokter mulai memeriksa', true],
    ['konsul', '📞', 'Konsul DPJP', false],
    ['advis', '✅', 'Advis DPJP', false],
    ['keputusan', '🩺', 'Keputusan (RTL)', true],
    ['keluar', '🏁', 'Keluar IGD', true]
  ];
  const JENIS = [['RAWAT INAP', 'Rawat inap'], ['PULANG', 'Pulang'], ['RUJUK', 'Rujuk'], ['APS', 'APS'], ['MENINGGAL', 'Meninggal']];
  const WARNA = { MERAH: 'merah', KUNING: 'kuning', HIJAU: 'hijau', HITAM: 'hitam' };

  function menit(a, b) { if (a == null || b == null) return null; return Math.round((b - a) / 60000); }
  function lamaTeks(m) { if (m == null) return '-'; if (m < 60) return m + ' mnt'; return Math.floor(m / 60) + 'j ' + (m % 60) + 'm'; }

  function login() {
    root().innerHTML = `<div class="pt-card"><h2>Masuk</h2>
      <p class="pt-sub">Gunakan password staf IGD (atau password pimpinan). Tetap masuk sampai menekan keluar.</p>
      <form class="pt-login"><input type="password" autocomplete="current-password" placeholder="Password" required>
      <button class="primary-btn" type="submit">Masuk</button><p class="pt-error" role="alert"></p></form></div>`;
    const f = root().querySelector('form');
    f.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const err = f.querySelector('.pt-error'); const btn = f.querySelector('button');
      btn.disabled = true; err.textContent = '';
      try {
        const r = await R().post({ aksi: 'login', password: f.querySelector('input').value });
        if (r.error) throw new Error(r.error === 'password salah' ? 'Password salah.' : r.error);
        simpan({ token: r.token, peran: r.peran, sampai: r.berlakuJam ? Date.now() + r.berlakuJam * 3600e3 : 9e15 });
        muat(true);
      } catch (e) { err.textContent = e.message; btn.disabled = false; }
    });
  }

  async function kirim(body) {
    const t = ambil();
    if (!t) { login(); throw new Error('Silakan masuk lagi'); }
    const r = await R().post(Object.assign({ aksi: 'jejak', token: t.token }, body));
    if (r.error === 'token') { hapus(); login(); throw new Error('Sesi habis, silakan masuk lagi'); }
    return r;
  }

  async function muat(paksa) {
    const t = ambil();
    if (!t) return login();
    if (!paksa && formTerbuka) return;
    try {
      const d = await R().get('jejakAktif', t.token);
      if (d.error === 'token') { hapus(); return login(); }
      if (d.error) throw new Error(d.error);
      data = d; selisihServer = ms(d.sekarang) - Date.now();
      render();
    } catch (e) {
      if (!data) root().innerHTML = '<p class="pt-error">Gagal memuat: ' + esc(e.message) + '</p>';
    }
  }

  function kartu(o) {
    const now = Date.now() + selisihServer;
    const tDatang = ms(o.datang);
    const berikut = !o.dokter ? 'dokter' : !o.keputusan ? 'keputusan' : !o.keluar ? 'keluar' : '';
    const baris = TITIK.map(([k, ikon, label, wajib]) => {
      const t = o[k];
      if (t) {
        const dari = k === 'advis' ? ms(o.konsul) : tDatang;
        const sel = menit(dari, ms(t));
        return `<li class="jw-step done"><span>${ikon} ${label}${k === 'keputusan' && o.jenis ? ': <b>' + esc((JENIS.find((j) => j[0] === o.jenis) || [0, o.jenis])[1]) + '</b>' : ''}</span>
          <span class="jw-t">${jam(t)}<small>${sel != null ? (k === 'advis' ? '+' + lamaTeks(sel) + ' dari konsul' : '+' + lamaTeks(sel)) : ''}</small>
          <button type="button" class="jw-batal" data-id="${o.id}" data-titik="${k}" data-waktu="${esc(t)}">batal</button></span></li>`;
      }
      if (k === 'advis' && !o.konsul) return `<li class="jw-step opsi"><span>${ikon} ${label}</span><span class="jw-t"><small>setelah konsul</small></span></li>`;
      if (k === 'keputusan') {
        return `<li class="jw-step ${berikut === k ? 'next' : ''}"><span>${ikon} ${label}</span>
          <span class="jw-jenis">${JENIS.map(([v, l]) => `<button type="button" data-id="${o.id}" data-titik="keputusan" data-jenis="${v}">${l}</button>`).join('')}</span></li>`;
      }
      return `<li class="jw-step ${berikut === k ? 'next' : ''} ${wajib ? '' : 'opsi'}"><span>${ikon} ${label}${wajib ? '' : ' <small>(bila ada)</small>'}</span>
        <button type="button" class="jw-ketuk" data-id="${o.id}" data-titik="${k}">Ketuk</button></li>`;
    }).join('');
    return `<div class="jw-card jw-${WARNA[o.triase] || 'kosong'}">
      <div class="jw-head"><div><b>${esc(o.penanda)}</b>${o.nama ? `<small>${esc(o.nama)}${o.rm ? ' · ' + esc(o.rm) : ''}</small>` : ''}</div>
        <span class="jw-badge">${esc(o.triase || '-')}</span></div>
      <p class="jw-sub">🚪 Datang ${jam(o.datang)} · <b>${lamaTeks(menit(tDatang, now))}</b> di IGD
        <button type="button" class="jw-batal" data-id="${o.id}" data-titik="datang" data-waktu="${esc(o.datang)}">hapus</button></p>
      <ul class="jw-steps">${baris}</ul>
      ${o.baris ? `<p class="jw-reg">Register baris ${esc(o.baris)}</p>` : `<details class="jw-id"><summary>Belum masuk register · isi nama & No. RM</summary>
        <form data-id="${o.id}"><input name="nama" placeholder="Nama pasien" required><input name="rm" placeholder="No. RM / registrasi" required>
        <button class="primary-btn" type="submit">Catat ke register</button></form></details>`}
    </div>`;
  }

  function render() {
    const t = ambil();
    const aktif = data.aktif || [], selesai = data.selesai || [];
    const ringkas = (o) => {
      const d = ms(o.datang);
      const isi = [['Datang→dokter', menit(d, ms(o.dokter))], ['Datang→keputusan', menit(d, ms(o.keputusan))],
        ['Keputusan→keluar', menit(ms(o.keputusan), ms(o.keluar))], ['Konsul→advis', menit(ms(o.konsul), ms(o.advis))], ['Total', menit(d, ms(o.keluar))]]
        .filter((x) => x[1] != null).map((x) => `${x[0]} <b>${lamaTeks(x[1])}</b>`).join(' · ');
      return `<div class="pt-row"><i class="pt-t-${WARNA[o.triase] || 'kosong'}"></i><div><b>${esc(o.nama || o.penanda)}</b>
        <small>${jam(o.datang)}–${jam(o.keluar)}${o.jenis ? ' · ' + esc((JENIS.find((j) => j[0] === o.jenis) || [0, o.jenis])[1]) : ''}</small><span>${isi}</span></div><strong></strong></div>`;
    };
    root().innerHTML = `
      <div class="jw-top"><button type="button" class="primary-btn jw-datang">🚪 Pasien datang</button>
        <button type="button" class="jw-refresh" title="Muat ulang">↻</button></div>
      <div class="jw-form-datang" hidden></div>
      <h2 class="jw-h">Pasien di IGD <span>${aktif.length}</span></h2>
      ${aktif.length ? `<div class="jw-grid">${aktif.map(kartu).join('')}</div>` : '<p class="pt-sub">Belum ada pasien aktif. Ketuk "Pasien datang" saat pasien tiba.</p>'}
      ${selesai.length ? `<h2 class="jw-h">Selesai 12 jam terakhir <span>${selesai.length}</span></h2><div class="pt-list jw-selesai">${selesai.map(ringkas).join('')}</div>` : ''}
      ${t && t.perangkat ? R().htmlPerangkat('staf') : `<p class="pt-sub">Masuk sebagai ${t && t.peran === 'pimpinan' ? 'pimpinan' : 'staf IGD'} · <a href="#" class="jw-keluar">keluar</a></p>` + R().htmlPerangkat(t && t.peran)}`;
    pasang();
    R().pasangDaftar(root(), t && t.token, () => muat(true));
  }

  function pesan(teks, gagal) {
    let el = document.querySelector('.jw-toast');
    if (!el) { el = document.createElement('div'); el.className = 'jw-toast'; document.body.appendChild(el); }
    el.textContent = teks; el.classList.toggle('gagal', !!gagal); el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 3000);
  }

  async function aksi(body, tombol) {
    if (tombol) tombol.disabled = true;
    try {
      const r = await kirim(body);
      if (r.perluAlasan) {
        const alasan = prompt('Sudah lewat 2 menit. Tulis alasan koreksi:');
        if (!alasan) { if (tombol) tombol.disabled = false; return; }
        return aksi(Object.assign({}, body, { alasan }), tombol);
      }
      if (r.error) throw new Error(r.error);
      pesan(r.peringatan || (body.sub === 'batal' ? 'Dibatalkan' : r.waktu ? 'Tercatat pukul ' + jam(r.waktu) : 'Tersimpan'), !!r.peringatan);
      formTerbuka = false;
      muat(true);
    } catch (e) {
      pesan(e.message, true);
      if (tombol) tombol.disabled = false;
    }
  }

  function pasang() {
    const r = root();
    r.querySelector('.jw-refresh').addEventListener('click', () => { formTerbuka = false; muat(true); });
    const kl = r.querySelector('.jw-keluar');
    if (kl) kl.addEventListener('click', (e) => { e.preventDefault(); hapus(); login(); });
    r.querySelector('.jw-datang').addEventListener('click', () => {
      const w = r.querySelector('.jw-form-datang');
      if (!w.hidden) { w.hidden = true; formTerbuka = false; return; }
      formTerbuka = true; w.hidden = false;
      w.innerHTML = `<form class="pt-card jw-fd">
        <label>Penanda pasien *<input name="penanda" placeholder="contoh: Bed 2, Tn. A, kaos merah" required></label>
        <div class="jw-triase" role="radiogroup" aria-label="Triase">${['MERAH', 'KUNING', 'HIJAU', 'HITAM'].map((v) =>
          `<label class="jw-tr jw-${WARNA[v]}"><input type="radio" name="triase" value="${v}" required><span>${v.charAt(0) + v.slice(1).toLowerCase()}</span></label>`).join('')}</div>
        <details><summary>Isi nama & No. RM sekarang (opsional)</summary>
          <input name="nama" placeholder="Nama pasien"><input name="rm" placeholder="No. RM / registrasi"></details>
        <button class="primary-btn" type="submit">Catat datang sekarang</button></form>`;
      const f = w.querySelector('form');
      f.querySelector('[name=penanda]').focus();
      f.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const fd = new FormData(f);
        aksi({ sub: 'datang', penanda: fd.get('penanda'), triase: fd.get('triase'), nama: fd.get('nama'), rm: fd.get('rm') }, f.querySelector('[type=submit]'));
      });
    });
    r.querySelectorAll('.jw-ketuk').forEach((b) => b.addEventListener('click', () => aksi({ sub: 'ketuk', id: b.dataset.id, titik: b.dataset.titik }, b)));
    r.querySelectorAll('[data-jenis]').forEach((b) => b.addEventListener('click', () => {
      if (!confirm('Catat keputusan: ' + b.textContent + '?')) return;
      aksi({ sub: 'ketuk', id: b.dataset.id, titik: 'keputusan', jenis: b.dataset.jenis }, b);
    }));
    r.querySelectorAll('.jw-batal').forEach((b) => b.addEventListener('click', () => {
      const lewat = (Date.now() + selisihServer - ms(b.dataset.waktu)) / 60000 > 2;
      const tanya = b.dataset.titik === 'datang' ? 'Hapus pasien ini dari Jejak Waktu?' : 'Batalkan catatan ini?';
      if (!confirm(tanya)) return;
      const body = { sub: 'batal', id: b.dataset.id, titik: b.dataset.titik };
      if (lewat) { const alasan = prompt('Sudah lewat 2 menit. Tulis alasan koreksi:'); if (!alasan) return; body.alasan = alasan; }
      aksi(body, b);
    }));
    r.querySelectorAll('.jw-id').forEach((d) => d.addEventListener('toggle', () => { formTerbuka = d.open; }));
    r.querySelectorAll('.jw-id form').forEach((f) => f.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(f);
      aksi({ sub: 'identitas', id: f.dataset.id, nama: fd.get('nama'), rm: fd.get('rm') }, f.querySelector('button'));
    }));
  }

  document.addEventListener('DOMContentLoaded', () => { muat(true); setInterval(() => muat(false), 30000); });
})();
