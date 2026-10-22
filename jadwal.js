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
  const SHIFT = [['Pagi', '07.00–14.00'], ['Siang', '14.00–21.00'], ['Malam', '21.00–07.00']];
  let tanggal = hariIni();

  function pilah(d) {
    const grid = { Pagi: { dokter: [], perawat: [] }, Siang: { dokter: [], perawat: [] }, Malam: { dokter: [], perawat: [] } };
    const lain = [], libur = [];
    ((d.dokter && d.dokter.orang) || []).forEach((o) => o.tugas.forEach((t) => {
      if (t.tempat === 'IGD' && grid[t.shift]) grid[t.shift].dokter.push(o.nama);
      else lain.push(o.nama + ' — ' + t.shift + (t.tempat ? ' ' + t.tempat : '') + (t.jam ? ' (' + t.jam + ')' : '') + (/ HD$/i.test(o.nama) ? ' · Hemodialisa' : ''));
    }));
    ((d.perawat && d.perawat.orang) || []).forEach((o) => o.tugas.forEach((t) => {
      if (grid[t.shift]) grid[t.shift].perawat.push(o.nama);
      else if (/^(Libur|Cuti)$/.test(t.shift)) libur.push(o.nama + (t.shift === 'Cuti' ? ' (cuti)' : ''));
      else lain.push(o.nama + ' — ' + t.shift);
    }));
    return { grid, lain, libur };
  }

  function sekarang(d) {
    if (tanggal !== hariIni()) return '';
    const j = jamIni();
    let shift, sumber = d;
    if (j < 7) { shift = 'Malam'; sumber = { dokter: d.dokterKemarin, perawat: d.perawatKemarin }; }
    else shift = j < 14 ? 'Pagi' : j < 21 ? 'Siang' : 'Malam';
    const g = pilah(sumber).grid[shift];
    return `<div class="jd-kini"><b>Sedang jaga sekarang · ${shift}${j < 7 ? ' (mulai kemarin)' : ''}</b>
      <span>Dokter: ${esc(g.dokter.join(', ') || '—')}</span><span>Perawat: ${esc(g.perawat.join(', ') || '—')}</span></div>`;
  }

  function tampil(d) {
    const p = pilah(d);
    const kosong = (!d.dokter || d.dokter.kosong) && (!d.perawat || d.perawat.kosong);
    $('jdIsi').innerHTML = (kosong ? '<p class="pt-sub">Jadwal untuk tanggal ini belum tersedia di spreadsheet.</p>' : sekarang(d) +
      `<div class="jd-grid">${SHIFT.map(([s, jam]) => `<div class="jd-kol"><h3>${s} <small>${jam}</small></h3>
        <div class="jd-sub">Dokter IGD</div><ul>${(p.grid[s].dokter.map((n) => `<li>${esc(n)}</li>`).join('') || '<li class="jd-nihil">—</li>')}</ul>
        <div class="jd-sub">Perawat</div><ul>${(p.grid[s].perawat.map((n) => `<li>${esc(n)}</li>`).join('') || '<li class="jd-nihil">—</li>')}</ul></div>`).join('')}</div>
      ${p.lain.length ? `<div class="jd-lain"><b>Tugas lain</b><ul>${p.lain.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      ${p.libur.length ? `<p class="pt-sub">Perawat libur/cuti: ${esc(p.libur.join(', '))}</p>` : ''}`) +
      `<p class="pt-sub jd-sumber">Sumber: tab "${esc((d.dokter && d.dokter.tab) || '-')}" (dokter) dan "${esc((d.perawat && d.perawat.tab) || '-')}" (perawat) · diperbarui ${esc(d.dibuat || '')}` +
      ((d.catatan || []).length ? `<br><span class="pt-error">${esc(d.catatan.join(' '))}</span>` : '') + '</p>';
  }

  async function muat() {
    $('jdTgl').textContent = teksTgl(tanggal) + (tanggal === hariIni() ? ' · hari ini' : '');
    const kunci = 'jadwal_' + tanggal;
    let ada = null;
    try { ada = JSON.parse(localStorage.getItem(kunci) || 'null'); } catch (e) {}
    if (ada) tampil(ada); else $('jdIsi').innerHTML = '<p class="pt-sub"><span class="proses-putar"></span>Memuat jadwal…</p>';
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
