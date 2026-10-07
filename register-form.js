// Form penulisan Register IGD lewat Apps Script: melengkapi kolom kosong dan input pasien baru.
// Dipakai halaman Pantau IGD (pimpinan) dan halaman Input Register (staf).
(function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzdXDcOLMnBj5kuhINSpVRKpQ1RWwdOhXuPfEOxd11b7s9yRWVjU3f8T744OyaQgxtJUw/exec';
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const jamSekarang = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());

  async function get(aksi, token) {
    const res = await fetch(API_URL + '?aksi=' + aksi + '&token=' + encodeURIComponent(token || ''));
    return res.json();
  }
  async function post(body) {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
    return res.json();
  }

  let opsiCache = null;
  async function opsi(token) {
    if (opsiCache) return opsiCache;
    const d = await get('opsi', token);
    if (d.error) throw new Error(d.error);
    opsiCache = d;
    return d;
  }

  function isianHtml(k, def, pilihan, nilai) {
    const id = 'rf-' + k + '-' + Math.random().toString(36).slice(2, 7);
    const lab = `<label for="${id}">${esc(def.label)}</label>`;
    if (def.tipe === 'pilihan') {
      return `<div class="rf-f">${lab}<select id="${id}" name="${k}"><option value="">Pilih…</option>${(pilihan || []).map((o) =>
        `<option${o === nilai ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
    }
    if (def.tipe === 'jam') {
      return `<div class="rf-f">${lab}<div class="rf-jam"><input id="${id}" name="${k}" type="time" value="${esc(nilai || '')}">
        <button type="button" class="rf-now" data-target="${id}">Sekarang</button></div></div>`;
    }
    if (def.tipe === 'cek') {
      return `<div class="rf-f rf-cek"><label><input type="checkbox" name="${k}"${nilai ? ' checked' : ''}> ${esc(def.label)}</label></div>`;
    }
    const panjang = k === 'diagnosis' || k === 'alamat';
    return `<div class="rf-f">${lab}${panjang ? `<textarea id="${id}" name="${k}" rows="2">${esc(nilai || '')}</textarea>`
      : `<input id="${id}" name="${k}" type="text" value="${esc(nilai || '')}">`}</div>`;
  }

  function pasangTombolSekarang(root) {
    root.querySelectorAll('.rf-now').forEach((b) => b.addEventListener('click', () => {
      const inp = root.querySelector('#' + b.dataset.target);
      if (inp) inp.value = jamSekarang();
    }));
  }

  function baca(form) {
    const o = {};
    form.querySelectorAll('[name]').forEach((el) => {
      if (el.type === 'checkbox') o[el.name] = el.checked;
      else if (String(el.value).trim()) o[el.name] = el.value.trim();
    });
    return o;
  }

  // Form kecil untuk melengkapi satu baris (hanya kolom yang kosong)
  async function bukaLengkapi(wadah, item, token, selesai) {
    wadah.innerHTML = '<p class="rf-info">Memuat pilihan…</p>';
    let o;
    try { o = await opsi(token); } catch (e) { wadah.innerHTML = '<p class="rf-err">Gagal memuat pilihan: ' + esc(e.message) + '</p>'; return; }
    const kolom = (item.kosong || []).filter((k) => o.isian[k]);
    if (!kolom.length) { wadah.innerHTML = '<p class="rf-info">Kolom ini perlu diperbaiki langsung di spreadsheet.</p>'; return; }
    wadah.innerHTML = `<form class="rf-form">${kolom.map((k) => isianHtml(k, o.isian[k], o.opsi[k])).join('')}
      <div class="rf-aksi"><button class="primary-btn" type="submit">Simpan ke register</button><button type="button" class="rf-batal">Batal</button></div>
      <p class="rf-err" role="alert"></p></form>`;
    const form = wadah.querySelector('form');
    pasangTombolSekarang(form);
    form.querySelector('.rf-batal').addEventListener('click', () => { wadah.innerHTML = ''; });
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const isian = baca(form);
      const err = form.querySelector('.rf-err');
      if (!Object.keys(isian).length) { err.textContent = 'Isi minimal satu kolom.'; return; }
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Menyimpan…'; err.textContent = '';
      try {
        const r = await post({ aksi: 'lengkapi', token, baris: item.baris, isian });
        if (r.error) throw new Error(r.error === 'token' ? 'Sesi login habis, silakan masuk lagi.' : r.error);
        wadah.innerHTML = `<p class="rf-ok">Tersimpan di baris ${r.baris}: ${esc(r.terisi.join(', ') || '-')}${r.dilewati.length ? '. Sudah terisi sebelumnya (tidak ditimpa): ' + esc(r.dilewati.join(', ')) : ''}.</p>`;
        if (selesai) selesai(r);
      } catch (e) {
        err.textContent = e.message; btn.disabled = false; btn.textContent = 'Simpan ke register';
      }
    });
  }

  // Form lengkap pasien baru
  async function formPasienBaru(wadah, token, selesai) {
    wadah.innerHTML = '<p class="rf-info">Memuat form…</p>';
    let o;
    try { o = await opsi(token); } catch (e) { wadah.innerHTML = '<p class="rf-err">Gagal memuat form: ' + esc(e.message) + '</p>'; return; }
    const kelompok = [
      ['Identitas', ['rm', 'nama', 'jk', 'umur', 'status', 'alamat', 'jaminan']],
      ['Kedatangan', ['jamDatang', 'caraDatang', 'rujukanDari', 'kll', 'gadar', 'triase', 'jamTangani']],
      ['Pemeriksaan', ['diagnosis', 'kasus', 'dokter', 'perawat', 'tindakan']]
    ];
    wadah.innerHTML = `<form class="rf-form rf-baru">${kelompok.map(([judul, ks]) => `<fieldset><legend>${judul}</legend>${ks.filter((k) => o.isian[k])
      .map((k) => isianHtml(k, Object.assign({}, o.isian[k], { label: o.isian[k].label + (k === 'rm' || k === 'nama' ? ' *' : '') }), o.opsi[k], k === 'jamDatang' ? jamSekarang() : '')).join('')}</fieldset>`).join('')}
      <p class="rf-info">Tanggal terisi otomatis hari ini. Rencana tindak lanjut dan jam keluar diisi nanti lewat menu Lengkapi data.</p>
      <button class="primary-btn" type="submit">Simpan pasien baru</button>
      <p class="rf-err" role="alert"></p></form>`;
    const form = wadah.querySelector('form');
    pasangTombolSekarang(form);
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const data = baca(form);
      const err = form.querySelector('.rf-err');
      if (!data.rm || !data.nama) { err.textContent = 'No. RM dan nama wajib diisi.'; return; }
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Menyimpan…'; err.textContent = '';
      try {
        const r = await post({ aksi: 'pasienBaru', token, data });
        if (r.error) throw new Error(r.error === 'token' ? 'Sesi login habis, silakan masuk lagi.' : r.error);
        form.reset();
        form.querySelector('[name=jamDatang]').value = jamSekarang();
        err.innerHTML = `<span class="rf-ok">Tersimpan di register baris ${r.baris} (No. ${r.no}).</span>`;
        if (selesai) selesai(r);
      } catch (e) {
        err.textContent = e.message;
      } finally {
        btn.disabled = false; btn.textContent = 'Simpan pasien baru';
      }
    });
  }

  // Perangkat IGD yang didaftarkan pimpinan: staf memakai Jejak Waktu & Input Register tanpa password
  const PERANGKAT = 'perangkat_token_v1';
  function perangkat() { try { return JSON.parse(localStorage.getItem(PERANGKAT) || 'null'); } catch (e) { return null; } }
  async function daftarPerangkat(tokenPimpinan, nama) {
    const r = await post({ aksi: 'daftarPerangkat', token: tokenPimpinan, nama });
    if (r.error) throw new Error(r.error);
    localStorage.setItem(PERANGKAT, JSON.stringify({ token: r.token, peran: 'staf', sampai: 9e15, perangkat: r.perangkat }));
    return r;
  }
  function lupakanPerangkat() { try { localStorage.removeItem(PERANGKAT); } catch (e) {} }
  function htmlPerangkat(peran) {
    const p = perangkat();
    if (p) return `<p class="pt-sub">📱 Perangkat terdaftar untuk IGD (${esc(p.perangkat || '')}): staf dapat memakai halaman ini tanpa password.</p>`;
    if (peran === 'pimpinan') return `<p class="pt-sub"><button type="button" class="rf-tombol rf-daftar">📱 Daftarkan perangkat ini untuk staf IGD</button>
      <br><small>Untuk komputer atau HP di IGD: staf bisa memakai Jejak Waktu dan Input Register tanpa password, juga setelah Anda keluar.</small></p>`;
    return '';
  }
  function pasangDaftar(root, tokenPimpinan, selesai) {
    const b = root.querySelector('.rf-daftar');
    if (!b) return;
    b.addEventListener('click', async () => {
      const nama = prompt('Nama perangkat ini (misalnya: Komputer meja perawat):', 'Komputer IGD');
      if (!nama) return;
      b.disabled = true;
      try { await daftarPerangkat(tokenPimpinan, nama); alert('Perangkat terdaftar. Staf kini bisa memakai halaman ini tanpa password.'); if (selesai) selesai(); }
      catch (e) { alert('Gagal: ' + e.message); b.disabled = false; }
    });
  }

  window.RegForm = { API_URL, get, post, opsi, bukaLengkapi, formPasienBaru, esc, perangkat, lupakanPerangkat, htmlPerangkat, pasangDaftar };
})();
