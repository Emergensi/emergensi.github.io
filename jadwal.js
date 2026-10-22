// Jadwal hari ini: dokter & perawat yang bertugas menurut spreadsheet jadwal (dibaca Apps Script ?aksi=jadwal)
(function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzdXDcOLMnBj5kuhINSpVRKpQ1RWwdOhXuPfEOxd11b7s9yRWVjU3f8T744OyaQgxtJUw/exec';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tz = 'Asia/Jakarta';
  const hariIni = () => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  const jamIni = () => +new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date());
  const geser = (tgl, n) => new Date(Date.parse(tgl + 'T12:00:00+07:00') + n * 864e5).toISOString().slice(0, 10);
  const teksTgl = (tgl) => new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(tgl + 'T12:00:00+07:00'));
  const SHIFT = [['Pagi', '07.00–14.00', 7, 14], ['Siang', '14.00–21.00', 14, 21], ['Malam', '21.00–07.00', 21, 31]];
  let tanggal = hariIni();

  // Foto & nama lengkap dari daftar staf situs (data.js); jadwal kadang hanya menulis nama panggilan
  const root = document.body.dataset.root || '../';
  const bersih = (n) => String(n || '').toLowerCase().replace(/^dr\.?\s*/, '').split(',')[0].replace(/[^a-z\s]/g, ' ').trim();
  const STAF = (window.IGD_STAFF_PHOTOS || []).map((x) => ({ nama: x.name, foto: x.photo, kata: bersih(x.name).split(/\s+/) }));
  function cariStaf(nama) {
    const k = bersih(nama).split(/\s+/).filter((w) => w.length > 2 && !/^(hd|ns|amd|kep|amk|skep)$/.test(w));
    if (!k.length) return null;
    return STAF.find((x) => k.every((w) => x.kata.includes(w))) || STAF.find((x) => x.kata.includes(k[0]) && k.length === 1) || null;
  }
  function pisahGelar(n) {
    const i = n.indexOf(',');
    return i < 0 ? [n.trim(), ''] : [n.slice(0, i).trim(), n.slice(i + 1).trim()];
  }
  const inisial = (n) => bersih(n).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
  function orang(nama, ket) {
    const st = cariStaf(nama);
    const [utama, gelar] = pisahGelar(st && !nama.includes(',') && /^dr\b/i.test(nama) ? st.nama : nama);   // dokter: tampilkan nama lengkap
    const foto = st && st.foto ? `<img src="${esc(root + st.foto)}" alt="" loading="lazy">` : `<span>${esc(inisial(nama))}</span>`;
    return `<li class="jd-org"><span class="jd-av">${foto}</span><span class="jd-nm"><b>${esc(utama)}</b>${gelar || ket ? `<small>${esc([gelar, ket].filter(Boolean).join(' · '))}</small>` : ''}</span></li>`;
  }

  function pilah(d) {
    const grid = { Pagi: { dokter: [], perawat: [] }, Siang: { dokter: [], perawat: [] }, Malam: { dokter: [], perawat: [] } };
    const lain = [], libur = [];
    ((d.dokter && d.dokter.orang) || []).forEach((o) => o.tugas.forEach((t) => {
      if (t.tempat === 'IGD' && grid[t.shift]) grid[t.shift].dokter.push(o.nama);
      else lain.push({ nama: o.nama.replace(/\s+HD$/i, ''), label: /\s+HD$/i.test(o.nama) ? 'Hemodialisa' : t.shift === 'Hiperbarik' ? 'Hiperbarik' : t.shift + (t.tempat ? ' · ' + t.tempat : ''), jam: t.jam });
    }));
    ((d.perawat && d.perawat.orang) || []).forEach((o) => o.tugas.forEach((t) => {
      if (grid[t.shift]) grid[t.shift].perawat.push(o.nama);
      else if (/^(Libur|Cuti)$/.test(t.shift)) libur.push({ nama: o.nama, cuti: t.shift === 'Cuti' });
      else lain.push({ nama: o.nama, label: t.shift, jam: t.jam });
    }));
    return { grid, lain, libur };
  }

  // shift yang sedang berjalan (hanya untuk tampilan hari ini)
  function shiftKini() {
    if (tanggal !== hariIni()) return null;
    const now = new Date(), j = jamIni() + (+new Intl.DateTimeFormat('en-GB', { timeZone: tz, minute: '2-digit' }).format(now)) / 60;
    const sisa = (akhir) => { const m = Math.round((akhir - j) * 60); return 'berakhir dalam ' + (m >= 60 ? Math.floor(m / 60) + ' j ' + (m % 60) + ' mnt' : m + ' mnt'); };
    if (j < 7) return { nama: 'Malam', kemarin: true, persen: Math.round(((j + 24 - 21) / 10) * 100), sisa: sisa(7) };
    const s = SHIFT.find((x) => j >= x[2] && j < x[3]);
    return { nama: s[0], kemarin: false, persen: Math.round(((j - s[2]) / (s[3] - s[2])) * 100), sisa: sisa(s[3] > 24 ? 31 : s[3]) };
  }

  function tampil(d) {
    const p = pilah(d), kini = shiftKini();
    const kosong = (!d.dokter || d.dokter.kosong) && (!d.perawat || d.perawat.kosong);
    const daftar = (arr, jenis) => arr.length ? `<ul class="jd-list">${arr.map((n) => orang(n)).join('')}</ul>` : `<p class="jd-nihil">Tidak ada ${jenis} terjadwal</p>`;
    let html = '';
    if (kosong) html = '<p class="jd-kosong">Jadwal untuk tanggal ini belum tersedia di spreadsheet.</p>';
    else {
      if (kini) {
        const g = kini.kemarin ? pilah({ dokter: d.dokterKemarin, perawat: d.perawatKemarin }).grid.Malam : p.grid[kini.nama];
        const sh = SHIFT.find((x) => x[0] === kini.nama);
        html += `<div class="jd-kini">
          <div class="jd-kini-kepala"><span class="jd-live"></span><b>Sedang bertugas</b><span class="jd-badge jd-${kini.nama.toLowerCase()}">${kini.nama} · ${sh[1]}</span>${kini.kemarin ? '<small>shift malam sejak kemarin</small>' : ''}
            <span class="jd-sisa">${kini.sisa}</span><span class="jd-prog" title="${kini.persen}% shift berjalan"><i style="width:${kini.persen}%"></i></span></div>
          <div class="jd-kini-isi"><div><h4>Dokter jaga</h4>${daftar(g.dokter, 'dokter')}</div><div><h4>Perawat / bidan</h4>${daftar(g.perawat, 'perawat')}</div></div></div>`;
      }
      html += `<div class="jd-grid">${SHIFT.map(([s, jam, mulai, akhir]) => {
        let status = '';
        if (kini && !kini.kemarin) status = s === kini.nama ? 'aktif' : (SHIFT.findIndex((x) => x[0] === s) < SHIFT.findIndex((x) => x[0] === kini.nama) ? 'lewat' : '');
        const g = p.grid[s];
        return `<section class="jd-kol jd-${s.toLowerCase()} ${status}">
          <header><h3>${s}</h3><span>${jam}</span>${status === 'aktif' ? '<em>Berlangsung</em>' : status === 'lewat' ? '<em class="sel">Selesai</em>' : ''}</header>
          <h4>Dokter IGD <small>${g.dokter.length}</small></h4>${daftar(g.dokter, 'dokter')}
          <h4>Perawat / bidan <small>${g.perawat.length}</small></h4>${daftar(g.perawat, 'perawat')}</section>`;
      }).join('')}</div>`;
      if (p.lain.length || p.libur.length) {
        html += `<div class="jd-bawah">`;
        if (p.lain.length) html += `<div><h4>Tugas di luar IGD</h4><div class="jd-chips">${p.lain.map((x) => `<span class="jd-chip"><b>${esc(x.label)}</b>${esc(pisahGelar(x.nama)[0])}${x.jam ? `<small>${esc(x.jam)}</small>` : ''}</span>`).join('')}</div></div>`;
        if (p.libur.length) html += `<div><h4>Libur / cuti</h4><div class="jd-chips">${p.libur.map((x) => `<span class="jd-chip redup">${esc(pisahGelar(x.nama)[0])}${x.cuti ? '<small>cuti</small>' : ''}</span>`).join('')}</div></div>`;
        html += `</div>`;
      }
    }
    html += `<footer class="jd-sumber"><span>Sumber: ${d.dokterUrl ? `<a href="${esc(d.dokterUrl)}" target="_blank" rel="noopener">Jadwal Dokter</a>` : 'Jadwal Dokter'} (tab ${esc((d.dokter && d.dokter.tab) || '-')}) · ${d.perawatUrl ? `<a href="${esc(d.perawatUrl)}" target="_blank" rel="noopener">Jadwal Perawat</a>` : 'Jadwal Perawat'} (tab ${esc((d.perawat && d.perawat.tab) || '-')})</span><span>Diperbarui ${esc((d.dibuat || '').slice(11))} WIB</span></footer>`;
    if ((d.catatan || []).length) html += `<p class="pt-error">${esc(d.catatan.join(' '))}</p>`;
    $('jdIsi').innerHTML = html;
  }

  async function muat() {
    $('jdTgl').textContent = teksTgl(tanggal);
    $('jdHari').classList.toggle('aktif', tanggal === hariIni());
    const kunci = 'jadwal_' + tanggal;
    let ada = null;
    try { ada = JSON.parse(localStorage.getItem(kunci) || 'null'); } catch (e) {}
    if (ada) tampil(ada); else $('jdIsi').innerHTML = '<p class="jd-kosong"><span class="proses-putar"></span>Memuat jadwal…</p>';
    try {
      const res = await fetch(API_URL + '?aksi=jadwal&tanggal=' + tanggal + '&_=' + Date.now());
      const d = JSON.parse(await res.text());
      if (d.error) throw new Error(/aksi tidak dikenal/.test(d.error) ? 'Server Apps Script belum diperbarui: tempel JadwalIGD.gs + file utama terbaru, lalu Deploy → New version.' : d.error);
      try { localStorage.setItem(kunci, JSON.stringify(d)); } catch (e) {}
      if (d.tanggal === tanggal) tampil(d);
    } catch (e) {
      if (!ada) $('jdIsi').innerHTML = '<p class="pt-error">' + esc(e.message) + '</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('jdIsi')) return;
    $('jdPrev').addEventListener('click', () => { tanggal = geser(tanggal, -1); muat(); });
    $('jdNext').addEventListener('click', () => { tanggal = geser(tanggal, 1); muat(); });
    $('jdHari').addEventListener('click', () => { tanggal = hariIni(); muat(); });
    muat();
  });
})();
