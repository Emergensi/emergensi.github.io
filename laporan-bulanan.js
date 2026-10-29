// Laporan Bulanan IGD (Akses Pimpinan): data dari Apps Script, kirim ke Telegram, unduh gambar, cetak.
(function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzdXDcOLMnBj5kuhINSpVRKpQ1RWwdOhXuPfEOxd11b7s9yRWVjU3f8T744OyaQgxtJUw/exec';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f = (x) => (x == null ? '-' : String(x).replace('.', ','));
  let data = null;
  const namaPanjang = (t) => t.label.split(' ')[0] + ' ' + t.tahun;

  function token() {
    try { const t = JSON.parse(localStorage.getItem('pantau_token_v1') || 'null'); if (t && t.sampai > Date.now()) return t.token; } catch (e) {}
    return '';
  }
  async function bacaJson(res) {
    const teks = await res.text();
    try { return JSON.parse(teks); } catch (e) { throw new Error('Server Apps Script membalas error. Coba lagi sebentar; bila tetap, deploy ulang (New version).'); }
  }
  function pesan(t, gagal) { const el = $('lbPesan'); el.textContent = t || ''; el.classList.toggle('pt-error', !!gagal); }
  function cekToken(d) {
    if (d.error === 'token' || d.error === 'khusus pimpinan') throw new Error('Sesi pimpinan untuk data register belum tersambung. Klik Keluar, lalu masuk lagi lewat Akses Pimpinan.');
    if (d.error) throw new Error(d.error);
  }

  async function buat() {
    const [th, bl] = $('lbBulan').value.split('-').map(Number);
    if (!th || !bl) return pesan('Pilih bulan dulu.', true);
    $('lbBuat').disabled = true; pesan('Menghitung dari register…'); $('lbAksi').hidden = true;
    try {
      const d = await bacaJson(await fetch(API_URL + '?aksi=bulanan&tahun=' + th + '&bulan=' + bl + '&token=' + encodeURIComponent(token()) + '&_=' + Date.now()));
      cekToken(d);
      data = d; tampil(d); pesan('Dibuat ' + d.dibuat.slice(11) + ' dari register terbaru.'); $('lbAksi').hidden = false;
    } catch (e) { pesan(e.message, true); }
    $('lbBuat').disabled = false;
  }

  function tampil(d) {
    const warna = { hijau: '#2e9e5b', kuning: '#e3b505', merah: '#c62828', hitam: '#222', 'belum diisi': '#cbd5e1' };
    const baris = d.tabel.filter((t) => t.triase !== 'belum diisi' || t.total).map((t) => `<tr><td><span class="lb-chip" style="background:${warna[t.triase]}"></span>${esc(t.triase.charAt(0).toUpperCase() + t.triase.slice(1))}</td>
      <td>${t.total}</td><td>${t.pulang ?? t.jalan}</td><td>${t.aps ?? '-'}</td><td>${t.rujuk ?? '-'}</td><td>${t.inap}</td><td>${t.meninggal}</td></tr>`).join('');
    const tot = d.tabel.reduce((a, t) => ({ pulang: a.pulang + (t.pulang ?? t.jalan), aps: a.aps + (t.aps || 0), rujuk: a.rujuk + (t.rujuk || 0), inap: a.inap + t.inap, m: a.m + t.meninggal }), { pulang: 0, aps: 0, rujuk: 0, inap: 0, m: 0 });
    const maks = Math.max(25, ...d.tren.map((t) => t.konversi || 0));
    const lebar = 100 / Math.max(d.tren.length, 1);
    const batang = d.tren.map((t, i) => {
      const terakhir = i === d.tren.length - 1, h = (t.konversi || 0) / maks * 100;
      return `<div class="lb-bar" style="width:${lebar}%" title="${esc(t.label)}: ${t.kunjungan} kunjungan, ${t.inap} rawat inap">
        <span class="lb-nilai${terakhir ? ' kini' : ''}">${f(t.konversi)}%</span><i style="height:${h}%;background:${terakhir ? '#b42330' : '#9aa6b0'}"></i>
        <b>${esc(t.label.split(' ')[0])}</b><small>${t.kunjungan}</small></div>`;
    }).join('');
    const j = d.jumlah;
    const catatan = [];
    if (j.kosong) catatan.push(j.kosong + ' pasien belum diisi rencana tindak lanjut');
    const tanpaTriase = (d.tabel.find((t) => t.triase === 'belum diisi') || {}).total;
    if (tanpaTriase) catatan.push(tanpaTriase + ' pasien belum diisi triase');
    $('lbHasil').innerHTML = `<article class="lb-lembar" id="lbLembar">
      <header class="lb-kop"><div><small>INSTALASI GAWAT DARURAT · SEDAYU GENERAL HOSPITAL</small><h2>Laporan Bulanan IGD · ${esc(d.namaBulan)} ${d.tahun}</h2></div>
        <p>Periode ${esc(d.periode)}<br>Sumber: Register Pasien IGD RS SGH</p></header>
      <div class="lb-grid">
        <section class="lb-kartu"><h3>Kunjungan menurut triase dan disposisi</h3>
          <table class="lb-tabel"><tr><th>Triase</th><th>Total</th><th>Pulang</th><th>APS</th><th>Rujuk</th><th>Rawat inap</th><th>Meninggal / DOA</th></tr>${baris}
          <tr class="tot"><td>Total</td><td>${d.total}</td><td>${tot.pulang}</td><td>${tot.aps}</td><td>${tot.rujuk}</td><td>${tot.inap}</td><td>${tot.m}</td></tr></table>
          <div class="lb-besar"><div><b>${f(d.konversi)}%</b><span>Konversi IGD → rawat inap<br>${j.inap} dari ${d.total} kunjungan</span></div>
            <div class="m"><b>${f(d.kuningInap)}%</b><span>Pasien kuning dirawat inap<br>${d.kuningInapJumlah} dari ${d.kuningTotal}</span></div></div>
          <p class="lb-cat">Meninggal ${j.meninggal} · DOA ${j.doa} · KLL ${d.kll} kunjungan.
            APS = pulang atas permintaan sendiri; rujuk = rujuk keluar ke RS lain.${catatan.length ? ' Catatan: ' + esc(catatan.join('; ')) + '.' : ''}</p>
        </section>
        <section class="lb-kartu"><h3>Konversi IGD → rawat inap, ${d.tren.length ? esc(namaPanjang(d.tren[0])) + ' – ' + esc(namaPanjang(d.tren[d.tren.length - 1])) : ''}</h3>
          <div class="lb-grafik" role="img" aria-label="Grafik batang konversi IGD ke rawat inap per bulan">${batang}</div>
          <p class="lb-cat">Angka di bawah bulan = jumlah kunjungan.</p>
        </section>
      </div></article>`;
  }

  async function gambarLaporan() {
    if (!window.html2canvas) throw new Error('Pembuat gambar belum termuat; muat ulang halaman.');
    const c = await window.html2canvas($('lbLembar'), { scale: 2, backgroundColor: '#f5f3ee', windowWidth: 1240 });
    return { jpg: c.toDataURL('image/jpeg', 0.92), w: c.width, h: c.height };
  }

  // PDF A4 mendatar berisi gambar laporan yang sama (jsPDF)
  function pdfDari(g) {
    const PDF = window.jspdf && window.jspdf.jsPDF;
    if (!PDF) return null;
    const doc = new PDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210, m = 10;
    const skala = Math.min((W - 2 * m) / g.w, (H - 2 * m) / g.h);
    const w = g.w * skala, h = g.h * skala;
    doc.addImage(g.jpg, 'JPEG', (W - w) / 2, (H - h) / 2, w, h);
    return doc;
  }

  // Ke Telegram: PDF A4 yang dibuat server (sama dengan /bulanan dan kiriman otomatis)
  async function kirimTele() {
    if (!data) return;
    const b = $('lbTele'); b.disabled = true; pesan('Membuat PDF dan mengirim ke Telegram…');
    try {
      const d = await bacaJson(await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ aksi: 'kirimBulanan', token: token(), tahun: data.tahun, bulan: data.bulan }) }));
      cekToken(d);
      pesan('Terkirim ke Telegram sebagai PDF (' + d.penerima + ' penerima).');
    } catch (e) { pesan(e.message, true); }
    b.disabled = false;
  }

  async function unduh() {
    if (!data) return;
    try {
      const a = document.createElement('a');
      a.href = (await gambarLaporan()).jpg; a.download = 'Laporan_Bulanan_IGD_' + data.namaBulan + '_' + data.tahun + '.jpg'; a.click();
    } catch (e) { pesan(e.message, true); }
  }

  // Unduh PDF: memakai PDF buatan server (sama persis dengan yang dikirim ke Telegram)
  async function unduhPdf() {
    if (!data) return;
    const b = $('lbCetak'); b.disabled = true; const label = b.textContent; b.textContent = '⏳ Menyiapkan PDF…';
    const nama = 'Laporan_Bulanan_IGD_' + data.namaBulan + '_' + data.tahun + '.pdf';
    try {
      const d = await bacaJson(await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ aksi: 'pdfBulanan', token: token(), tahun: data.tahun, bulan: data.bulan }) }));
      if (cekToken(d)) return;
      if (!d.pdf) throw new Error(d.error || 'PDF server belum tersedia');
      const bin = atob(d.pdf); const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = d.nama || nama; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      pesan('');
    } catch (e) {
      // cadangan bila server belum diperbarui: PDF dari gambar halaman
      try { const doc = pdfDari(await gambarLaporan()); if (!doc) throw e; doc.save(nama);
        pesan('PDF server belum tersedia (' + e.message + '); diunduh versi gambar.', true); } catch (e2) { pesan(e2.message, true); }
    } finally { b.disabled = false; b.textContent = label; }
  }

  // PDF periode: PDF server tiap bulan (sama dengan Unduh PDF / Telegram) digabung jadi satu file, satu halaman per bulan
  const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function daftarBulan(dari, sampai) {
    const [t1, b1] = dari.split('-').map(Number), [t2, b2] = sampai.split('-').map(Number);
    if (!t1 || !t2) throw new Error('Pilih bulan awal dan akhir periode.');
    const out = []; let t = t1, b = b1;
    while (t * 12 + b <= t2 * 12 + b2) { out.push([t, b]); if (++b > 12) { b = 1; t++; } }
    if (!out.length) throw new Error('Bulan akhir harus sama atau sesudah bulan awal.');
    if (out.length > 24) throw new Error('Periode paling panjang 24 bulan.');
    return out;
  }
  async function unduhPeriode() {
    if (!window.PDFLib) return pesan('Penggabung PDF belum termuat; muat ulang halaman.', true);
    const b = $('lbPeriodeBtn'); if (b.disabled) return;
    let bulan; try { bulan = daftarBulan($('lbDari').value, $('lbSampai').value); } catch (e) { return pesan(e.message, true); }
    b.disabled = true; const label0 = b.textContent; b.textContent = '⏳ Memproses…';
    try {
      const gabung = await window.PDFLib.PDFDocument.create();
      for (let i = 0; i < bulan.length; i++) {
        const [th, bl] = bulan[i];
        pesan('Menyiapkan ' + NAMA_BULAN[bl - 1] + ' ' + th + ' (' + (i + 1) + '/' + bulan.length + ')…');
        const d = await bacaJson(await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ aksi: 'pdfBulanan', token: token(), tahun: th, bulan: bl }) }));
        cekToken(d);
        if (!d.pdf) throw new Error(NAMA_BULAN[bl - 1] + ' ' + th + ': ' + (d.error || 'PDF server belum tersedia'));
        const satu = await window.PDFLib.PDFDocument.load(Uint8Array.from(atob(d.pdf), (c) => c.charCodeAt(0)));
        (await gabung.copyPages(satu, satu.getPageIndices())).forEach((h) => gabung.addPage(h));
      }
      const [ta, ba] = bulan[0], [tz, bz] = bulan[bulan.length - 1];
      const label = NAMA_BULAN[ba - 1] + (ta !== tz ? ' ' + ta : '') + '–' + NAMA_BULAN[bz - 1] + ' ' + tz;
      gabung.setTitle('Laporan Bulanan IGD ' + label); gabung.setCreator('Emergency Unit SGH');
      const url = URL.createObjectURL(new Blob([await gabung.save()], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = 'Laporan_Bulanan_IGD_' + label.replace(/[ –]/g, '_') + '.pdf';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
      pesan('PDF periode ' + label + ' diunduh (' + gabung.getPageCount() + ' halaman).');
    } catch (e) { pesan('Gagal membuat PDF periode: ' + e.message, true); }
    b.disabled = false; b.textContent = label0;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const now = new Date(); const lalu = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    $('lbBulan').value = lalu.getFullYear() + '-' + String(lalu.getMonth() + 1).padStart(2, '0');
    $('lbBulan').max = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    $('lbBuat').addEventListener('click', buat);
    $('lbTele').addEventListener('click', kirimTele);
    $('lbGambar').addEventListener('click', unduh);
    $('lbCetak').addEventListener('click', unduhPdf);
    $('lbDari').value = lalu.getFullYear() + '-01'; $('lbSampai').value = $('lbBulan').value;
    $('lbDari').max = $('lbSampai').max = $('lbBulan').max;
    $('lbPeriodeBtn').addEventListener('click', unduhPeriode);
  });
})();
