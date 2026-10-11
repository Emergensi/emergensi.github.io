// Respon Time IGD: petugas mengetuk tombol saat kejadian; waktu diambil dari server Apps Script.
(function () {
  const KEY = 'input_token_v1';                       // satu login dengan halaman Input Register
  const R = () => window.RegForm;
  const esc = (v) => R().esc(v);
  const root = () => document.getElementById('jejakRoot');
  const ambil = () => {
    try { const t = JSON.parse(localStorage.getItem(KEY) || 'null'); if (t && t.sampai > Date.now()) return t; } catch (e) {}
    return { token: '', peran: 'publik' };   // tanpa password: identitas pasien tampil sebagai inisial
  };
  const hapus = () => { try { localStorage.removeItem(KEY); } catch (e) {} };
  const ms = (t) => (t ? new Date(String(t).replace(' ', 'T') + '+07:00').getTime() : null);
  const jam = (t) => String(t || '').slice(11, 16);
  let data = null, selisihServer = 0, formTerbuka = false, tertunda = false;

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

  function login() { hapus(); muat(true); }   // tidak ada password: kembali ke mode tanpa login

  async function kirim(body) {
    const t = ambil();
    const r = await R().post(Object.assign({ aksi: 'jejak', token: t.token }, body));
    if (r.error === 'token') { if (t.token) { hapus(); throw new Error('Coba ketuk sekali lagi'); } throw new Error('Server Apps Script belum diperbarui: buka Apps Script → Deploy → Manage deployments → Edit → New version → Deploy.'); }
    return r;
  }

  // Tampilkan data terakhir yang tersimpan di perangkat lebih dulu (langsung muncul), lalu segarkan dari server
  const kunciCache = () => 'rt_cache_' + (ambil().token ? 'p' : 's');
  function dariCache() {
    try {
      const c = JSON.parse(localStorage.getItem(kunciCache()) || 'null');
      if (c && c.d && Date.now() - c.waktu < 12 * 3600e3) { data = c.d; selisihServer = c.selisih || 0; render(); }
    } catch (e) {}
  }
  function keCache(d) { try { localStorage.setItem(kunciCache(), JSON.stringify({ d, selisih: selisihServer, waktu: Date.now() })); } catch (e) {} }

  async function muat(paksa) {
    const t = ambil();
    if (!paksa && formTerbuka) return;
    if (!data) dariCache();
    try {
      const d = await R().get('jejakAktif', t.token);
      if (d.error === 'token') { if (t.token) { hapus(); return login(); } throw new Error('Server Apps Script belum diperbarui: buka Apps Script → Deploy → Manage deployments → Edit → New version → Deploy.'); }
      if (d.error) throw new Error(d.error);
      data = d; selisihServer = ms(d.sekarang) - Date.now();
      keCache(d);
      if (formTerbuka) { tertunda = true; return; }   // jangan tutup formulir yang sedang diisi; tampilkan setelah selesai
      tertunda = false;
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
      ${o.baris ? `<p class="jw-reg">Register baris ${esc(o.baris)} · <a href="../input/#lengkapi" class="jw-lengkapi">📝 lengkapi data</a></p>` : `<details class="jw-id"><summary>Belum masuk register · isi nama & No. RM</summary>
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
        <small>${jam(o.datang)}–${jam(o.keluar)}${o.jenis ? ' · ' + esc((JENIS.find((j) => j[0] === o.jenis) || [0, o.jenis])[1]) : ''}
        · <button type="button" class="jw-batal" data-id="${o.id}" data-titik="datang" data-waktu="${esc(o.datang)}">hapus</button></small><span>${isi}</span></div><strong></strong></div>`;
    };
    root().innerHTML = `
      <div class="jw-top"><button type="button" class="primary-btn jw-datang">🚪 Pasien datang</button>
        <button type="button" class="jw-refresh" title="Muat ulang">↻</button></div>
      <div class="jw-form-datang" hidden></div>
      <h2 class="jw-h">Pasien di IGD <span>${aktif.length}</span></h2>
      ${aktif.length ? `<div class="jw-grid">${aktif.map(kartu).join('')}</div>` : '<p class="pt-sub">Belum ada pasien aktif. Ketuk "Pasien datang" saat pasien tiba.</p>'}
      ${selesai.length ? `<h2 class="jw-h">Selesai 12 jam terakhir <span>${selesai.length}</span></h2><div class="pt-list jw-selesai">${selesai.map(ringkas).join('')}</div>` : ''}
      ${t.peran === 'pimpinan' ? '<p class="pt-sub">Akses pimpinan: nama dan No. RM tampil lengkap.</p>' : ''}`;
    pasang();
  }

  function pesan(teks, gagal) {
    let el = document.querySelector('.jw-toast');
    if (!el) { el = document.createElement('div'); el.className = 'jw-toast'; document.body.appendChild(el); }
    el.textContent = teks; el.classList.toggle('gagal', !!gagal); el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 3000);
  }

  // Waktu server perkiraan (WIB) untuk tampilan sementara sebelum server menjawab
  function sekarangTeks() {
    const d = new Date(Date.now() + selisihServer);
    const f = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    return f.format(d).replace('T', ' ');
  }
  // Tampilkan hasil ketukan seketika; server mengonfirmasi di belakang
  function tampilSementara(body) {
    if (!data) return false;
    const t = sekarangTeks();
    if (body.sub === 'datang') {
      data.aktif = [{ id: 'sementara', penanda: body.penanda, triase: body.triase, datang: t, nama: body.nama || '', rm: body.rm || '', sementara: true }].concat(data.aktif || []);
    } else if (body.sub === 'ketuk') {
      const o = (data.aktif || []).find((x) => x.id === body.id);
      if (!o) return false;
      o[body.titik] = t; if (body.titik === 'keputusan') o.jenis = body.jenis;
      if (body.titik === 'keluar') { data.aktif = data.aktif.filter((x) => x !== o); data.selesai = [Object.assign({}, o, { keluar: t })].concat(data.selesai || []); }
    } else return false;
    formTerbuka = false; render();
    return true;
  }

  let antre = 0, janjiDatang = null;      // jumlah simpanan yang belum dijawab server; id pasien baru yang masih disimpan

  async function aksi(body, tombol) {
    if (tombol) tombol.disabled = true;
    const cepat = tampilSementara(body);
    if (cepat) pesan('Menyimpan…');
    if (body.id === 'sementara') {                  // diketuk sebelum pasien baru selesai disimpan: tunggu id aslinya
      const id = janjiDatang ? await janjiDatang : null;
      if (!id) { pesan('Pasien belum tersimpan, coba ketuk lagi.', true); muat(true); return; }
      body = Object.assign({}, body, { id });
    }
    let selesaiDatang = null;
    if (body.sub === 'datang') janjiDatang = new Promise((ok) => { selesaiDatang = ok; });
    antre++;
    try {
      const r = await kirim(body).finally(() => { antre--; });
      if (selesaiDatang) selesaiDatang(r && r.id ? r.id : null);
      if (r.perluSemua) {
        const teks = 'Pasien ini sudah punya catatan lanjutan' + (r.baris ? ' dan sudah masuk Register baris ' + r.baris : '') +
          '.\n\nHapus SEMUA catatannya' + (r.baris ? ', termasuk mengosongkan baris register tersebut' : '') + '?\nGunakan hanya untuk data uji/simulasi atau salah input.';
        if (!confirm(teks)) { if (tombol) tombol.disabled = false; return; }
        const alasan = prompt('Alasan penghapusan (misalnya: simulasi):', 'simulasi');
        if (!alasan) { if (tombol) tombol.disabled = false; return; }
        return aksi(Object.assign({}, body, { semua: true, alasan }), tombol);
      }
      if (r.perluAlasan) {
        const alasan = prompt('Sudah lewat 2 menit. Tulis alasan koreksi:');
        if (!alasan) { if (tombol) tombol.disabled = false; return; }
        return aksi(Object.assign({}, body, { alasan }), tombol);
      }
      if (r.error) throw new Error(r.error);
      pesan(r.peringatan || (r.dihapus ? 'Pasien dihapus' + (r.register ? ' · ' + r.register : '') : body.sub === 'batal' ? 'Dibatalkan' : r.waktu ? 'Tercatat pukul ' + jam(r.waktu) : 'Tersimpan'), !!r.peringatan);
      formTerbuka = false;
      if (antre > 0) return;                         // masih ada ketukan lain yang disimpan: tunggu jawaban terakhir
      if (r.daftar && r.daftar.aktif) { data = r.daftar; selisihServer = ms(r.daftar.sekarang) - Date.now(); keCache(data); tertunda = false; render(); }
      else muat(true);
    } catch (e) {
      if (selesaiDatang) selesaiDatang(null);
      pesan(e.message, true);
      if (tombol) tombol.disabled = false;
      if (cepat) muat(true);       // kembalikan tampilan sesuai server
    }
  }

  function pasang() {
    const r = root();
    r.querySelector('.jw-refresh').addEventListener('click', async (ev) => {
      const t = ev.currentTarget; t.disabled = true; t.classList.add('berputar'); formTerbuka = false;
      await muat(true);
      t.disabled = false; t.classList.remove('berputar');
      pesan('Diperbarui pukul ' + new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()));
    });
    r.querySelector('.jw-datang').addEventListener('click', () => {
      const w = r.querySelector('.jw-form-datang');
      if (!w.hidden) { w.hidden = true; formTerbuka = false; if (tertunda) { tertunda = false; render(); } return; }
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
      const tanya = b.dataset.titik === 'datang' ? 'Hapus pasien ini dari Respon Time?' : 'Batalkan catatan ini?';
      if (!confirm(tanya)) return;
      const body = { sub: 'batal', id: b.dataset.id, titik: b.dataset.titik };
      if (lewat) { const alasan = prompt('Sudah lewat 2 menit. Tulis alasan koreksi:'); if (!alasan) return; body.alasan = alasan; }
      aksi(body, b);
    }));
    r.querySelectorAll('.jw-lengkapi').forEach((x) => x.addEventListener('click', (e) => {
      const tab = document.querySelector('.jw-tab [data-panel=input]');
      if (tab && window.IGDInput) { e.preventDefault(); tab.click(); window.IGDInput.buka('lengkapi'); window.scrollTo(0, 0); }
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
