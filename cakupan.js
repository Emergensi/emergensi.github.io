// Cakupan Layanan IGD (Akses Pimpinan): perbarui tab "Cakupan IGD <tahun>" di register lalu tampilkan ringkasan bulan terpilih.
(function () {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzdXDcOLMnBj5kuhINSpVRKpQ1RWwdOhXuPfEOxd11b7s9yRWVjU3f8T744OyaQgxtJUw/exec';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pct = (a, b) => (b ? (Math.round((a / b) * 1000) / 10).toString().replace('.', ',') + '%' : '-');
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  let hasil = null;

  function token() {
    try { const t = JSON.parse(localStorage.getItem('pantau_token_v1') || 'null'); if (t && t.sampai > Date.now()) return t.token; } catch (e) {}
    return '';
  }
  async function bacaJson(res) {
    const teks = await res.text();
    try { return JSON.parse(teks); } catch (e) { throw new Error('Server Apps Script membalas error. Coba lagi sebentar; bila tetap, deploy ulang (New version).'); }
  }
  function pesan(t, gagal) { const el = $('ckPesan'); el.textContent = t || ''; el.classList.toggle('pt-error', !!gagal); }
  function cekToken(d) {
    if (d.error === 'token' || d.error === 'khusus pimpinan') throw new Error('Sesi pimpinan untuk data register belum tersambung. Klik Keluar, lalu masuk lagi lewat Akses Pimpinan.');
    if (d.error) throw new Error(/aksi tidak dikenal/.test(d.error) ? 'Server Apps Script belum diperbarui: tempel CakupanIGD.gs + file utama terbaru, lalu Deploy → New version.' : d.error);
  }

  async function perbarui() {
    const [th, bl] = $('ckBulan').value.split('-').map(Number);
    if (!th || !bl) return pesan('Pilih bulan dulu.', true);
    $('ckBuat').disabled = true; $('ckAksi').hidden = true;
    pesan('Memperbarui tab Cakupan IGD ' + th + ' dari register… (± 10–30 detik)');
    try {
      const d = await bacaJson(await fetch(API_URL + '?aksi=cakupan&tahun=' + th + '&bulan=' + bl + '&token=' + encodeURIComponent(token()) + '&_=' + Date.now()));
      cekToken(d);
      hasil = d; tampil(d);
      $('ckSheet').href = d.url; $('ckAksi').hidden = false;
      pesan('Tab "' + d.tab + '" diperbarui pukul ' + d.dibuat.slice(11) + '.');
    } catch (e) { pesan(e.message, true); }
    $('ckBuat').disabled = false;
  }

  const tabel = (kepala, baris, kelas) => `<table class="lb-tabel ${kelas || ''}"><tr>${kepala.map((k) => `<th>${esc(k)}</th>`).join('')}</tr>${baris.join('')}</table>`;
  const tr = (sel, tot) => `<tr${tot ? ' class="tot"' : ''}>${sel.map((v) => `<td>${v}</td>`).join('')}</tr>`;
  const top = (judul, t) => `<section class="lb-kartu"><h3>${judul}</h3>${t.daftar.length
    ? tabel(['No', 'Nama', 'Jumlah', '%'], t.daftar.map((x, i) => tr([i + 1, esc(x[0]), x[1], pct(x[1], t.total)])).concat(tr(['', 'Total', t.total, ''], true)), 'ck-top')
    : '<p class="pt-sub">Belum ada data.</p>'}</section>`;
  const daftarKet = (arr) => (arr && arr.length ? `<ul class="ck-ket">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');

  function tampil(r) {
    const o = r.data;
    if (!o.aktif || !o.jumlah) { $('ckHasil').innerHTML = `<p class="pt-sub">Belum ada kunjungan di ${esc(r.namaBulan)} ${r.tahun}.</p>`; return; }
    const j = o.jaminan, T = o.triase, L = o.lanjut, I = o.indikasi;
    const kegawatan = o.triaseTercatat
      ? tabel(['Merah', 'Kuning', 'Hijau', 'Hitam', 'Belum ditriase'], [tr([T.MERAH, T.KUNING, T.HIJAU, T.HITAM, o.belumTriase])], 'ck-rata')
      : `<p class="pt-sub">Belum tercatat (kolom triase diisi sejak ${esc(r.triaseMulai)}).</p>`;
    const rekap = r.rekap.filter((x) => x.aktif);
    const totRekap = rekap.reduce((a, x) => ({ j: a.j + x.jumlah, l: a.l + x.lama, b: a.b + x.baru, ri: a.ri + x.ranap, ru: a.ru + x.rujuk, p: a.p + x.pulang, aps: a.aps + x.aps, m: a.m + x.meninggal }),
      { j: 0, l: 0, b: 0, ri: 0, ru: 0, p: 0, aps: 0, m: 0 });
    $('ckHasil').innerHTML = `<article class="lb-lembar">
      <header class="lb-kop"><div><small>INSTALASI GAWAT DARURAT · SEDAYU GENERAL HOSPITAL</small><h2>Cakupan Layanan IGD · ${esc(r.namaBulan)} ${r.tahun}</h2></div>
        <p>Sumber: Register Pasien IGD RS SGH<br>Diperbarui ${esc(r.dibuat)}</p></header>
      <div class="ck-angka">
        <div><b>${o.jumlah}</b><span>kunjungan</span></div>
        <div><b>${String(o.perHari.toFixed(2)).replace('.', ',')}</b><span>rata-rata / hari</span></div>
        <div><b>${pct(o.baru, o.jumlah)}</b><span>pasien baru (${o.baru})</span></div>
        <div><b>${pct(o.lama, o.jumlah)}</b><span>pasien lama (${o.lama})</span></div>
      </div>
      <div class="lb-grid">
        <section class="lb-kartu"><h3>Proporsi jaminan</h3>${tabel(['Umum', 'BPJS', 'Asuransi lain', 'JR'], [tr([j.UMUM, j.BPJS, j.ASURANSI, j.JR]), tr([pct(j.UMUM, o.jumlah), pct(j.BPJS, o.jumlah), pct(j.ASURANSI, o.jumlah), pct(j.JR, o.jumlah)])], 'ck-rata')}</section>
        <section class="lb-kartu"><h3>Tingkat kegawatan</h3>${kegawatan}</section>
        <section class="lb-kartu"><h3>Tindak lanjut pasien</h3>${tabel(['Rawat inap', 'Rujuk', 'Pulang', 'DOA', 'Meninggal'], [tr([L.RANAP, L.RUJUK, L.PULANG, L.DOA, L.MENINGGAL])], 'ck-rata')}
          <p class="pt-sub">Pulang termasuk APS: ${o.aps} pasien.</p></section>
        <section class="lb-kartu"><h3>Indikasi rujuk eksternal &amp; cara masuk</h3>
          ${tabel(['Fasilitas', 'Kompetensi', 'Jaminan', 'APS'], [tr([I.FASILITAS, I.KOMPETENSI, I.JAMINAN, o.aps])], 'ck-rata')}${daftarKet(o.ketRujuk)}
          ${tabel(['Rujukan', 'Ambulans swasta', 'Diantar polisi'], [tr([o.rujukan, o.ambulans, '<small>manual</small>'])], 'ck-rata')}${daftarKet(o.ketMasuk)}</section>
        ${top('10 diagnosis terbanyak', o.dx)}
        ${top('10 tindakan terbanyak', o.tindakan)}
        ${top('Tindakan elektromedis', o.elektro)}
        <section class="lb-kartu ck-lebar"><h3>Rekap ${r.tahun} per bulan</h3>${tabel(['Bulan', 'Kunjungan', 'Lama', 'Baru', 'Ranap', 'Rujuk', 'Pulang', 'APS', 'Mati/DOA'],
          rekap.map((x) => tr([BULAN[x.bulan - 1] + (x.bulan === r.bulan ? ' ◂' : ''), x.jumlah, x.lama, x.baru, x.ranap, x.rujuk, x.pulang, x.aps, x.meninggal]))
            .concat(tr(['Total', totRekap.j, totRekap.l, totRekap.b, totRekap.ri, totRekap.ru, totRekap.p, totRekap.aps, totRekap.m], true)))}</section>
      </div>
      ${r.catatan && r.catatan.length ? `<p class="pt-sub">Catatan: ${esc(r.catatan.join(' | '))}</p>` : ''}
      <p class="pt-sub">Insiden keselamatan pasien dan pasien diantar polisi diisi manual di tab Google Sheet (sel kuning).</p>
    </article>`;
  }

  async function kirimTele() {
    if (!hasil) return;
    const b = $('ckTele'); b.disabled = true; pesan('Mengirim ringkasan ke Telegram…');
    try {
      const d = await bacaJson(await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ aksi: 'kirimCakupan', token: token(), tahun: hasil.tahun, bulan: hasil.bulan }) }));
      cekToken(d);
      pesan('Ringkasan ' + hasil.namaBulan + ' terkirim ke ' + d.terkirim + ' penerima Telegram.');
    } catch (e) { pesan(e.message, true); }
    b.disabled = false;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    $('ckBulan').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    $('ckBulan').max = $('ckBulan').value;
    $('ckBuat').addEventListener('click', perbarui);
    $('ckTele').addEventListener('click', kirimTele);
  });
})();
