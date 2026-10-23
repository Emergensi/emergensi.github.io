// Widget ringkas: petugas jaga saat ini, shift berikutnya, dan konsulen DPJP hari ini. Diperbarui otomatis tiap 5 menit.
(function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzdXDcOLMnBj5kuhINSpVRKpQ1RWwdOhXuPfEOxd11b7s9yRWVjU3f8T744OyaQgxtJUw/exec';
  const tz = 'Asia/Jakarta', root = '../';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hariIni = () => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  const jamDes = () => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':'); return +p[0] + p[1] / 60; };
  const SHIFT = [['Pagi', '07.00–14.00', 7, 14], ['Siang', '14.00–21.00', 14, 21], ['Malam', '21.00–07.00', 21, 31]];

  const bersih = (n) => String(n || '').toLowerCase().replace(/^dr\.?\s*/, '').split(',')[0].replace(/[^a-z\s]/g, ' ').trim();
  const STAF = (window.IGD_STAFF_PHOTOS || []).map((x) => ({ nama: x.name, foto: x.photo, kata: bersih(x.name).split(/\s+/) }));
  function cariStaf(nama) {
    const k = bersih(nama).split(/\s+/).filter((w) => w.length > 2 && !/^(hd|ns|amd|kep|amk|skep)$/.test(w));
    if (!k.length) return null;
    return STAF.find((x) => k.every((w) => x.kata.includes(w))) || STAF.find((x) => x.kata.includes(k[0]) && k.length === 1) || null;
  }
  const inisial = (n) => bersih(n).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
  function orang(nama) {
    const st = cariStaf(nama);
    const tampil = (st && /^dr\b/i.test(nama) && !nama.includes(',') ? st.nama : nama).split(',')[0];
    const av = st && st.foto ? `<img src="${esc(root + st.foto)}" alt="">` : `<i>${esc(inisial(nama))}</i>`;
    return `<li><span class="w-av">${av}</span><span>${esc(tampil)}</span></li>`;
  }
  function grid(d) {
    const g = { Pagi: { dokter: [], perawat: [] }, Siang: { dokter: [], perawat: [] }, Malam: { dokter: [], perawat: [] } };
    ((d && d.dokter && d.dokter.orang) || []).forEach((o) => o.tugas.forEach((t) => { if (t.tempat === 'IGD' && g[t.shift]) g[t.shift].dokter.push(o.nama); }));
    ((d && d.perawat && d.perawat.orang) || []).forEach((o) => o.tugas.forEach((t) => { if (g[t.shift]) g[t.shift].perawat.push(o.nama); }));
    return g;
  }
  const daftar = (arr) => arr.length ? `<ul class="w-org">${arr.map(orang).join('')}</ul>` : '<p class="w-redup">Belum terjadwal</p>';

  let data = null, tanggal = hariIni();
  function tampil() {
    const j = jamDes();
    $('wJam').textContent = new Intl.DateTimeFormat('id-ID', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date());
    $('wTgl').textContent = new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    if (window.KonsulDPJP) {
      const r = window.KonsulDPJP.untuk(tanggal);
      $('wPekan').textContent = r.hari === 'Minggu' ? `· Minggu ke-${r.n}` : `· pekan ke-${r.n}`;
      $('wKonsul').innerHTML = r.daftar.filter((x) => x.nama).map((x) => `<li><b>${esc(x.sp)}</b><span>${esc(x.nama.split(',')[0])}</span></li>`).join('');
    }
    if (!data) return;
    const kemarin = j < 7;
    const nama = kemarin ? 'Malam' : SHIFT.find((s) => j >= s[2] && j < s[3])[0];
    const sh = SHIFT.find((s) => s[0] === nama);
    const g = kemarin ? grid({ dokter: data.dokterKemarin, perawat: data.perawatKemarin }).Malam : grid(data)[nama];
    const akhir = kemarin ? 7 : (sh[3] > 24 ? 31 : sh[3]);
    const sisa = Math.round((akhir - (kemarin ? j : j)) * 60), persen = Math.round(((kemarin ? j + 3 : j - sh[2]) / (kemarin ? 10 : sh[3] - sh[2])) * 100);
    $('wKini').innerHTML = `<div class="w-kini-kepala"><span class="w-live"></span><b>Sedang bertugas</b><span class="w-badge w-${nama.toLowerCase()}">${nama} · ${sh[1]}</span></div>
      <div class="w-prog"><i style="width:${Math.min(100, persen)}%"></i></div><p class="w-sisa">berakhir dalam ${sisa >= 60 ? Math.floor(sisa / 60) + ' j ' + (sisa % 60) + ' mnt' : sisa + ' mnt'}</p>
      <h3>Dokter jaga</h3>${daftar(g.dokter)}<h3>Perawat / bidan</h3>${daftar(g.perawat)}`;
    const iBerikut = kemarin ? 0 : SHIFT.findIndex((s) => s[0] === nama) + 1;
    if (iBerikut < 3) {
      const b = SHIFT[iBerikut], gb = grid(data)[b[0]];
      $('wBerikut').innerHTML = `<h2>Berikutnya <span class="w-badge w-${b[0].toLowerCase()}">${b[0]} · ${b[1]}</span></h2>
        <p class="w-ringkas"><b>Dokter:</b> ${esc(gb.dokter.map((n) => (cariStaf(n) && /^dr\b/i.test(n) && !n.includes(',') ? cariStaf(n).nama : n).split(',')[0]).join(', ') || '–')}<br>
        <b>Perawat:</b> ${esc(gb.perawat.map((n) => n.split(',')[0]).join(', ') || '–')}</p>`;
    } else $('wBerikut').innerHTML = '<h2>Berikutnya</h2><p class="w-ringkas">Shift pagi besok — lihat jadwal lengkap.</p>';
  }

  async function muat() {
    tanggal = hariIni();
    const kunci = 'jadwal_' + tanggal;
    try { data = JSON.parse(localStorage.getItem(kunci) || 'null'); } catch (e) {}
    tampil();
    try {
      const res = await fetch(API_URL + '?aksi=jadwal&tanggal=' + tanggal + '&_=' + Date.now());
      const d = JSON.parse(await res.text());
      if (d.error) throw new Error(d.error);
      data = d; try { localStorage.setItem(kunci, JSON.stringify(d)); } catch (e) {}
      $('wStatus').textContent = 'Diperbarui ' + new Intl.DateTimeFormat('id-ID', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date());
    } catch (e) {
      $('wStatus').textContent = data ? 'Offline — data terakhir' : 'Jadwal belum terbaca';
      if (!data) $('wKini').innerHTML = '<p class="w-redup">Jadwal jaga belum terbaca. Periksa koneksi.</p>';
    }
    tampil();
  }
  muat();
  setInterval(() => { if (hariIni() !== tanggal) muat(); else tampil(); }, 30000);   // jam & sisa waktu tiap 30 detik
  setInterval(muat, 5 * 60000);                                                       // data tiap 5 menit
})();
