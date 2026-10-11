// Halaman Input Register IGD: pasien baru + lengkapi data (staf dan pimpinan)
(function () {
  const KEY = 'input_token_v1';
  const esc = (v) => window.RegForm.esc(v);
  const ambil = () => {
    try { const t = JSON.parse(localStorage.getItem(KEY) || 'null'); if (t && t.sampai > Date.now()) return t; } catch (e) {}
    return { token: '', peran: 'publik' };   // tanpa password: identitas pasien tampil sebagai inisial
  };
  const hapus = () => { try { localStorage.removeItem(KEY); } catch (e) {} };
  const root = () => document.getElementById('inputRoot');

  function login() { hapus(); tampil('baru'); }   // tidak ada password: kembali ke mode tanpa login

  function tampil(tab) {
    const t = ambil();
        root().innerHTML = `<div class="rf-tabs" role="tablist">
        <button role="tab" data-tab="baru" aria-selected="${tab === 'baru'}">Pasien baru</button>
        <button role="tab" data-tab="lengkapi" aria-selected="${tab === 'lengkapi'}">Lengkapi data</button></div>
      <div class="pt-card" id="rfIsi"></div>
      ${t.peran === 'pimpinan' ? '<p class="pt-sub">Akses pimpinan: nama dan No. RM tampil lengkap.</p>' : ''}`;
    root().querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => tampil(b.dataset.tab)));
    const isi = root().querySelector('#rfIsi');
    if (tab === 'baru') {
      isi.innerHTML = '<h2>Pasien baru</h2><div id="rfBaru"></div>';
      window.RegForm.formPasienBaru(isi.querySelector('#rfBaru'), t.token);
    } else {
      daftar(isi, t);
    }
  }

  // Daftar terakhir ditampilkan dulu dari perangkat, lalu diperbarui dari server
  const kunciDaftar = (t) => 'rf_lengkapi_' + (t.token ? 'p' : 's');
  async function daftar(isi, t) {
    let tampilCache = false;
    try {
      const c = JSON.parse(localStorage.getItem(kunciDaftar(t)) || 'null');
      if (c && c.d && Date.now() - c.waktu < 6 * 3600e3) { tulisDaftar(isi, t, c.d, true); tampilCache = true; }
    } catch (e) {}
    if (!tampilCache) isi.innerHTML = '<h2>Lengkapi data</h2><p class="pt-sub">Memuat pasien yang datanya belum lengkap…</p>';
    let d;
    try { d = await window.RegForm.get('perluLengkapi', t.token); } catch (e) { d = { error: e.message }; }
    if (!d.error) { try { localStorage.setItem(kunciDaftar(t), JSON.stringify({ d, waktu: Date.now() })); } catch (e) {} }
    if (isi.querySelector('.rf-form')) return;          // sedang mengisi formulir: jangan ditimpa
    tulisDaftar(isi, t, d, false);
  }

  function tulisDaftar(isi, t, d, dariCache) {
    if (d.error === 'token') { if (t.token && !dariCache) { hapus(); return login(); } d = { error: 'Server Apps Script belum diperbarui: buka Apps Script → Deploy → Manage deployments → Edit → New version → Deploy.' }; }
    if (d.error) { isi.innerHTML = '<h2>Lengkapi data</h2><p class="pt-error">' + esc(d.error) + '</p>'; return; }
    const label = { jk: 'jenis kelamin', umur: 'umur', status: 'pasien lama/baru', alamat: 'alamat', jaminan: 'jaminan', gadar: 'gawat darurat', kll: 'KLL', caraDatang: 'cara datang', rujukanDari: 'rujukan dari', kasus: 'kasus', perawat: 'perawat', tindakan: 'tindakan', jamDatang: 'jam datang', jamTangani: 'jam ditangani', jamKeluar: 'jam keluar', triase: 'triase', diagnosis: 'diagnosis',
      dokter: 'dokter', rencana: 'rencana tindak lanjut', ruang: 'ruang', dpjp: 'DPJP', indikasiRujuk: 'indikasi rujuk', rsRujukan: 'RS rujukan' };
    isi.innerHTML = `<h2>Lengkapi data</h2><p class="pt-sub">${d.temuan.length ? d.temuan.length + ' pasien perlu dilengkapi, terbaru di atas.' : 'Semua data sudah lengkap. 🎉'}</p>
      <div class="pt-list">${d.temuan.map((x) => `<div class="pt-row rf-item"><i class="pt-t-kosong"></i><div>
        <b>${esc(x.nama)}</b> <small>RM ${esc(x.rm)} · ${+x.tanggal.slice(8)}/${+x.tanggal.slice(5, 7)} · baris ${x.baris}</small>
        <span>Belum diisi: ${x.kosong.map((k) => label[k] || k).join(', ')}</span>
        <button type="button" class="rf-tombol" data-baris="${x.baris}">Lengkapi</button><div class="rf-wadah"></div></div><strong></strong></div>`).join('')}</div>`;
    isi.querySelectorAll('[data-baris]').forEach((b) => b.addEventListener('click', () => {
      const item = d.temuan.find((x) => x.baris === +b.dataset.baris);
      window.RegForm.bukaLengkapi(b.nextElementSibling, item, t.token, () => setTimeout(() => daftar(isi, t), 2500));
    }));
  }

  window.IGDInput = { buka: (tab) => tampil(tab || 'lengkapi') };
  let dimuat = false;
  window.IGDInput.buka = (tab) => { dimuat = true; tampil(tab || 'lengkapi'); };
  window.IGDInput.siap = () => { if (!dimuat) { dimuat = true; tampil('baru'); } };
  document.addEventListener('DOMContentLoaded', () => {
    const r = root();
    if (r && r.hidden) return;            // aplikasi Respon Time: tab Input Data dimuat saat dibuka, agar Respon Time lebih cepat
    dimuat = true; tampil(location.hash === '#lengkapi' ? 'lengkapi' : 'baru');
  });
})();
