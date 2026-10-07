// Halaman Input Register IGD: pasien baru + lengkapi data (staf dan pimpinan)
(function () {
  const KEY = 'input_token_v1';
  const esc = (v) => window.RegForm.esc(v);
  const ambil = () => { try { const t = JSON.parse(localStorage.getItem(KEY) || 'null'); return t && t.sampai > Date.now() ? t : null; } catch (e) { return null; } };
  const simpan = (t) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} };
  const hapus = () => { try { const t = ambil(); if (t) window.RegForm.post({ aksi: 'logout', token: t.token }).catch(() => {}); localStorage.removeItem(KEY); } catch (e) {} };
  const root = () => document.getElementById('inputRoot');

  function login() {
    root().innerHTML = `<div class="pt-card"><h2>Masuk</h2>
      <p class="pt-sub">Gunakan password staf IGD. Pimpinan dapat memakai password Pantau IGD. Tetap masuk sampai menekan keluar.</p>
      <form class="pt-login"><input type="password" autocomplete="current-password" placeholder="Password" required>
      <button class="primary-btn" type="submit">Masuk</button><p class="pt-error" role="alert"></p></form></div>`;
    const f = root().querySelector('form');
    f.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const err = f.querySelector('.pt-error'); const btn = f.querySelector('button');
      btn.disabled = true; err.textContent = '';
      try {
        const r = await window.RegForm.post({ aksi: 'login', password: f.querySelector('input').value });
        if (r.error) throw new Error(r.error === 'password salah' ? 'Password salah.' : r.error);
        simpan({ token: r.token, peran: r.peran, sampai: r.berlakuJam ? Date.now() + r.berlakuJam * 3600e3 : 9e15 });
        tampil('baru');
      } catch (e) { err.textContent = e.message; btn.disabled = false; }
    });
  }

  function tampil(tab) {
    const t = ambil();
    if (!t) return login();
    root().innerHTML = `<div class="rf-tabs" role="tablist">
        <button role="tab" data-tab="baru" aria-selected="${tab === 'baru'}">Pasien baru</button>
        <button role="tab" data-tab="lengkapi" aria-selected="${tab === 'lengkapi'}">Lengkapi data</button></div>
      <div class="pt-card" id="rfIsi"></div>
      <p class="pt-sub">Masuk sebagai ${t.peran === 'pimpinan' ? 'pimpinan' : 'staf IGD'} · <a href="#" id="rfKeluar">keluar</a></p>`;
    root().querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => tampil(b.dataset.tab)));
    root().querySelector('#rfKeluar').addEventListener('click', (e) => { e.preventDefault(); hapus(); login(); });
    const isi = root().querySelector('#rfIsi');
    if (tab === 'baru') {
      isi.innerHTML = '<h2>Pasien baru</h2><div id="rfBaru"></div>';
      window.RegForm.formPasienBaru(isi.querySelector('#rfBaru'), t.token);
    } else {
      daftar(isi, t);
    }
  }

  async function daftar(isi, t) {
    isi.innerHTML = '<h2>Lengkapi data</h2><p class="pt-sub">Memuat pasien yang datanya belum lengkap…</p>';
    let d;
    try { d = await window.RegForm.get('perluLengkapi', t.token); } catch (e) { d = { error: e.message }; }
    if (d.error === 'token') { hapus(); return login(); }
    if (d.error) { isi.innerHTML = '<h2>Lengkapi data</h2><p class="pt-error">' + esc(d.error) + '</p>'; return; }
    const label = { jamDatang: 'jam datang', jamTangani: 'jam ditangani', jamKeluar: 'jam keluar', triase: 'triase', diagnosis: 'diagnosis',
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

  document.addEventListener('DOMContentLoaded', () => tampil('baru'));
})();
