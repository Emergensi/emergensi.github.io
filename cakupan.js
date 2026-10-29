// Laporan Kunjungan & Cakupan IGD (staf & pimpinan): perbarui tab "Cakupan IGD <tahun>" di register lalu tampilkan ringkasan bulan terpilih.
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
    const tb = $('ckBuat'); if (tb.disabled) return;
    tb.disabled = true; tb.dataset.asli = tb.innerHTML; tb.innerHTML = '<span class="proses-putar"></span>Memproses…'; $('ckAksi').hidden = true;
    pesan('Memperbarui tab Cakupan IGD ' + th + ' dari register… (± 10–30 detik)');
    try {
      const d = await bacaJson(await fetch(API_URL + '?aksi=cakupan&tahun=' + th + '&bulan=' + bl + '&token=' + encodeURIComponent(token()) + '&_=' + Date.now()));
      cekToken(d);
      hasil = d; tampil(d);
      $('ckSheet').href = d.url; $('ckAksi').hidden = false;
      $('ckTele').style.display = window.IGDAuth && window.IGDAuth.isPimpinan && window.IGDAuth.isPimpinan() ? '' : 'none';   // kirim Telegram khusus pimpinan
      pesan('Tab "' + d.tab + '" diperbarui pukul ' + d.dibuat.slice(11) + '.');
    } catch (e) { pesan(e.message, true); }
    tb.disabled = false; tb.innerHTML = tb.dataset.asli;
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
    $('ckHasil').innerHTML = `<article class="lb-lembar" id="ckLembar">
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
          ${tabel(['Rujukan', 'Ambulans swasta', 'Diantar polisi'], [tr([o.rujukan, o.ambulans, o.polisi == null ? '<small>-</small>' : o.polisi])], 'ck-rata')}${daftarKet(o.ketMasuk)}</section>
        ${top('10 diagnosis terbanyak', o.dx)}
        ${top('10 tindakan terbanyak', o.tindakan)}
        ${top('Tindakan elektromedis', o.elektro)}
        <section class="lb-kartu ck-lebar"><h3>Rekap ${r.tahun} per bulan</h3>${tabel(['Bulan', 'Kunjungan', 'Lama', 'Baru', 'Ranap', 'Rujuk', 'Pulang', 'APS', 'Mati/DOA'],
          rekap.map((x) => tr([BULAN[x.bulan - 1] + (x.bulan === r.bulan ? ' ◂' : ''), x.jumlah, x.lama, x.baru, x.ranap, x.rujuk, x.pulang, x.aps, x.meninggal]))
            .concat(tr(['Total', totRekap.j, totRekap.l, totRekap.b, totRekap.ri, totRekap.ru, totRekap.p, totRekap.aps, totRekap.m], true)))}</section>
      </div>
      ${r.catatan && r.catatan.length ? `<p class="pt-sub">Catatan: ${esc(r.catatan.join(' | '))}</p>` : ''}
      <p class="pt-sub">Insiden keselamatan pasien diisi manual di tab Google Sheet (sel kuning).</p>
    </article>`;
  }


  // Unduh PDF A4 tegak berbasis teks (jsPDF + autoTable), tata letak meniru tampilan layar:
  // latar krem, kartu membulat dua kolom. Teks bisa diblok, disalin, dan dicari.
  // Satu laporan bulan -> dokumen jsPDF 1 halaman. hal = [nomor, total] untuk kaki halaman PDF periode.
  function pdfCakupan(r, hal) {
    const PDF = window.jspdf.jsPDF;
      const o = r.data, j = o.jaminan, T = o.triase, L = o.lanjut, I = o.indikasi;
      const W = 210, H = 297, M = 10, KAKI = 8, JARAK = 5, PAD = 4;
      const KOL = (W - 2 * M - JARAK) / 2;
      const KREM = [245, 243, 238], KARTU = [251, 250, 247], GARIS = [221, 216, 206], BARIS = [228, 223, 213];
      const MERAH = [180, 35, 48], GELAP = [21, 33, 43], ABU = [95, 107, 117], TANDA = [253, 236, 236];
      const angka = (v) => (v == null ? '-' : v);

      // jarak baris tabel dirapatkan bertahap sampai laporan muat 1 halaman A4
      const bangun = (rapat) => {
        const gaya = { font: 'helvetica', fontSize: 7.6, cellPadding: { top: rapat, bottom: rapat, left: 1.6, right: 1.6 }, textColor: GELAP, lineColor: BARIS, lineWidth: { bottom: 0.2 }, valign: 'middle' };
        const kepala = { fillColor: false, textColor: ABU, fontStyle: 'bold', fontSize: 6.5, lineWidth: { bottom: 0.5 }, lineColor: GELAP };
        const kaki = { fillColor: false, textColor: GELAP, fontStyle: 'bold', lineWidth: { top: 0.5, bottom: 0 }, lineColor: GELAP };
        const tengah = (n) => { const c = {}; for (let i = 0; i < n; i++) c[i] = { halign: 'center' }; return c; };

        // tabel di dalam kartu; judul kolom & total ikut perataan kolomnya
        const tabel = (d, x, y, w, head, body, opsi) => {
          opsi = opsi || {};
          const lain = opsi.didParseCell;
          d.autoTable(Object.assign({ startY: y, head: [head], body, theme: 'plain', margin: { left: x, right: 0, top: 0, bottom: 0 }, tableWidth: w,
            styles: gaya, headStyles: kepala, footStyles: kaki, showFoot: 'lastPage', pageBreak: 'avoid', rowPageBreak: 'avoid' }, opsi, {
            didParseCell: (c) => {
              const cs = (opsi.columnStyles || {})[c.column.index] || {};
              if (c.section !== 'body' && cs.halign) c.cell.styles.halign = cs.halign;
              if (lain) lain(c);
            } }));
          return d.lastAutoTable.finalY;
        };
        const butir = (d, x, y, w, arr) => {
          d.setFont('helvetica', 'normal'); d.setFontSize(7); d.setTextColor(71, 85, 105);
          (arr || []).forEach((t) => { const b = d.splitTextToSize(t, w - 4); d.text('•', x + 1, y + 2.6); d.text(b, x + 4, y + 2.6); y += b.length * 3.2 + 0.8; });
          return y + 1;
        };
        const catatan = (d, x, y, w, t, warna) => {
          d.setFont('helvetica', 'normal'); d.setFontSize(7); d.setTextColor(...(warna || ABU));
          const b = d.splitTextToSize(t, w); d.text(b, x, y + 3); return y + b.length * 3.2 + 1.5;
        };
        const tebalBaris0 = (c) => { if (c.section === 'body' && c.row.index === 0) c.cell.styles.fontStyle = 'bold'; };
        const top10 = (data) => (d, x, y, w) => {
          if (!data.daftar.length) return catatan(d, x, y, w, 'Belum ada data.');
          return tabel(d, x, y, w, ['No', 'Nama', 'Jumlah', '%'], data.daftar.map((v, i) => [i + 1, v[0], v[1], pct(v[1], data.total)]), {
            columnStyles: { 0: { cellWidth: 7, textColor: ABU }, 1: { fontStyle: 'bold' }, 2: { halign: 'right', cellWidth: 14 }, 3: { halign: 'right', cellWidth: 13 } },
            foot: [['', 'Total', data.total, '']] });
        };

        const rekap = r.rekap.filter((x) => x.aktif);
        const tot = rekap.reduce((a, x) => [a[0] + x.jumlah, a[1] + x.lama, a[2] + x.baru, a[3] + x.ranap, a[4] + x.rujuk, a[5] + x.pulang, a[6] + x.aps, a[7] + x.meninggal], [0, 0, 0, 0, 0, 0, 0, 0]);
        const kanan = {}; for (let i = 1; i < 9; i++) kanan[i] = { halign: 'right' };
        kanan[0] = { fontStyle: 'bold', cellWidth: 11 };

        // isi tiap kartu: fungsi (doc, x, y, lebar) -> y akhir
        const kartu = [
          ['Proporsi jaminan', (d, x, y, w) => tabel(d, x, y, w, ['Umum', 'BPJS', 'Asuransi lain', 'JR'],
            [[j.UMUM, j.BPJS, j.ASURANSI, j.JR], [pct(j.UMUM, o.jumlah), pct(j.BPJS, o.jumlah), pct(j.ASURANSI, o.jumlah), pct(j.JR, o.jumlah)]],
            { columnStyles: tengah(4), didParseCell: tebalBaris0 })],
          ['Tingkat kegawatan', (d, x, y, w) => o.triaseTercatat
            ? tabel(d, x, y, w, ['Merah', 'Kuning', 'Hijau', 'Hitam', 'Belum ditriase'], [[T.MERAH, T.KUNING, T.HIJAU, T.HITAM, o.belumTriase]], { columnStyles: tengah(5), didParseCell: tebalBaris0 })
            : catatan(d, x, y, w, 'Belum tercatat (kolom triase diisi sejak ' + r.triaseMulai + ').')],
          ['Tindak lanjut pasien', (d, x, y, w) => {
            y = tabel(d, x, y, w, ['Rawat inap', 'Rujuk', 'Pulang', 'DOA', 'Meninggal'], [[L.RANAP, L.RUJUK, L.PULANG, L.DOA, L.MENINGGAL]], { columnStyles: tengah(5), didParseCell: tebalBaris0 });
            return catatan(d, x, y + 1, w, 'Pulang termasuk APS: ' + o.aps + ' pasien.'); }],
          ['Indikasi rujuk eksternal & cara masuk', (d, x, y, w) => {
            y = tabel(d, x, y, w, ['Fasilitas', 'Kompetensi', 'Jaminan', 'APS'], [[I.FASILITAS, I.KOMPETENSI, I.JAMINAN, o.aps]], { columnStyles: tengah(4), didParseCell: tebalBaris0 });
            y = butir(d, x, y + 1, w, o.ketRujuk) + 1;
            y = tabel(d, x, y, w, ['Rujukan', 'Ambulans swasta', 'Diantar polisi'], [[o.rujukan, o.ambulans, angka(o.polisi)]], { columnStyles: tengah(3), didParseCell: tebalBaris0 });
            return butir(d, x, y + 1, w, o.ketMasuk); }],
          ['10 diagnosis terbanyak', top10(o.dx)],
          ['10 tindakan terbanyak', top10(o.tindakan)],
          ['Tindakan elektromedis', top10(o.elektro)],
          ['Rekap ' + r.tahun + ' per bulan', (d, x, y, w) => tabel(d, x, y, w, ['Bulan', 'Kunjungan', 'Lama', 'Baru', 'Ranap', 'Rujuk', 'Pulang', 'APS', 'Mati/DOA'],
            rekap.map((v) => [BULAN[v.bulan - 1], v.jumlah, v.lama, v.baru, v.ranap, v.rujuk, v.pulang, v.aps, v.meninggal]), {
              styles: Object.assign({}, gaya, { fontSize: 7, cellPadding: { top: rapat, bottom: rapat, left: 0.8, right: 0.8 } }),
              headStyles: Object.assign({}, kepala, { fontSize: 5.8 }),
              columnStyles: kanan, foot: [['Total'].concat(tot)],
              didParseCell: (c) => {
                if (c.section === 'body' && rekap[c.row.index].bulan === r.bulan) c.cell.styles.fillColor = TANDA;
                if (c.section === 'foot' && c.column.index === 0) c.cell.styles.halign = 'left';
              },
              didDrawCell: (c) => {   // penanda segitiga di bulan laporan (pengganti ◂ di layar)
                if (c.section === 'body' && c.column.index === 0 && rekap[c.row.index].bulan === r.bulan) {
                  const tx = c.cell.x + 1.6 + c.doc.getTextWidth(String(c.cell.raw)) + 1.2, ty = c.cell.y + c.cell.height / 2;
                  c.doc.setFillColor(...GELAP); c.doc.triangle(tx, ty, tx + 1.6, ty - 0.9, tx + 1.6, ty + 0.9, 'F');
                }
              } })],
        ];

        // ukur tinggi isi tiap kartu di dokumen sementara (font sama), supaya latar kartu bisa digambar lebih dulu
        const ukur = new PDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const lebarIsi = KOL - 2 * PAD, JUDUL = 9;
        const tinggi = kartu.map((k) => k[1](ukur, M + PAD, 20, lebarIsi) - 20);

        const doc = new PDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const latar = () => { doc.setFillColor(...KREM); doc.rect(0, 0, W, H, 'F'); };
        latar();
        let y = M + 2;

        // kop
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(...MERAH); doc.setCharSpace(0.6);
        doc.text('INSTALASI GAWAT DARURAT · SEDAYU GENERAL HOSPITAL', M, y + 2.5); doc.setCharSpace(0);
        doc.setFontSize(15); doc.setTextColor(...GELAP);
        doc.text('Cakupan Layanan IGD · ' + r.namaBulan + ' ' + r.tahun, M, y + 9);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...ABU);
        doc.text(['Sumber: Register Pasien IGD RS SGH', 'Diperbarui ' + r.dibuat], W - M, y + 4.5, { align: 'right', lineHeightFactor: 1.6 });
        y += 12; doc.setDrawColor(...GELAP); doc.setLineWidth(0.7); doc.line(M, y, W - M, y); y += 4;

        // kotak angka utama
        const kotak = [[String(o.jumlah), 'kunjungan'], [String(o.perHari.toFixed(2)).replace('.', ','), 'rata-rata / hari'],
          [pct(o.baru, o.jumlah), 'pasien baru (' + o.baru + ')'], [pct(o.lama, o.jumlah), 'pasien lama (' + o.lama + ')']];
        const lk = (W - 2 * M - 3 * 3.5) / 4;
        kotak.forEach((k, i) => {
          const x = M + i * (lk + 3.5);
          doc.setDrawColor(...GARIS); doc.setLineWidth(0.3); doc.setFillColor(...KARTU); doc.roundedRect(x, y, lk, 14, 2.5, 2.5, 'FD');
          doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...GELAP); doc.text(k[0], x + 3.5, y + 6.6);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...ABU); doc.text(k[1], x + 3.5, y + 11);
        });
        y += 14 + JARAK;

        // kartu berpasangan dua kolom; satu baris kartu tidak pernah dipotong antarhalaman
        for (let i = 0; i < kartu.length; i += 2) {
          const tb = Math.max(tinggi[i], tinggi[i + 1] || 0) + JUDUL + PAD;
          if (y + tb > H - M - KAKI) { doc.addPage(); latar(); y = M; }
          [i, i + 1].forEach((k, kol) => {
            if (!kartu[k]) return;
            const x = M + kol * (KOL + JARAK);
            doc.setDrawColor(...GARIS); doc.setLineWidth(0.3); doc.setFillColor(...KARTU); doc.roundedRect(x, y, KOL, tb, 3, 3, 'FD');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...GELAP); doc.text(kartu[k][0], x + PAD, y + 6);
            kartu[k][1](doc, x + PAD, y + JUDUL, lebarIsi);
          });
          y += tb + JARAK;
        }

        // catatan akhir
        const akhir = [];
        if (r.catatan && r.catatan.length) akhir.push('Catatan: ' + r.catatan.join(' | '));
        akhir.push('Insiden keselamatan pasien diisi manual di tab Google Sheet (sel kuning).');
        if (y + 10 > H - M - KAKI) { doc.addPage(); latar(); y = M; }
        akhir.forEach((t) => { y = catatan(doc, M, y - 2, W - 2 * M, t) + 1; });

        // kaki halaman
        const n = doc.getNumberOfPages();
        for (let i = 1; i <= n; i++) {
          doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...ABU);
          doc.text('Cakupan Layanan IGD · ' + r.namaBulan + ' ' + r.tahun + ' · RS SGH', M, H - 5);
          doc.text('Hal. ' + (hal ? hal[0] + i - 1 : i) + ' / ' + (hal ? hal[1] : n), W - M, H - 5, { align: 'right' });
        }
        return doc;
      };
      let doc;
      for (const rapat of [1.6, 1.3, 1.05, 0.8, 0.6]) { doc = bangun(rapat); if (doc.getNumberOfPages() === 1) break; }
      doc.setProperties({ title: 'Cakupan Layanan IGD ' + r.namaBulan + ' ' + r.tahun, subject: 'Laporan Kunjungan & Cakupan IGD', creator: 'Emergency Unit SGH' });
      return doc;
  }

  const siapPdf = () => !!(window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable);

  // Unduh PDF bulan yang sedang tampil
  function unduhPdf() {
    if (!hasil || !hasil.data || !hasil.data.jumlah) return;
    if (!siapPdf()) return pesan('Pembuat PDF belum termuat; muat ulang halaman.', true);
    try {
      const doc = pdfCakupan(hasil);
      doc.save('Cakupan_IGD_' + hasil.namaBulan + '_' + hasil.tahun + '.pdf');
      pesan('PDF ' + hasil.namaBulan + ' ' + hasil.tahun + ' diunduh (' + doc.getNumberOfPages() + ' halaman).');
    } catch (e) { pesan('Gagal membuat PDF: ' + e.message, true); }
  }

  // Daftar bulan dari..sampai (boleh lintas tahun), maks 24 bulan
  function daftarBulan(dari, sampai) {
    const [t1, b1] = dari.split('-').map(Number), [t2, b2] = sampai.split('-').map(Number);
    if (!t1 || !t2) throw new Error('Pilih bulan awal dan akhir periode.');
    const out = []; let t = t1, b = b1;
    while (t * 12 + b <= t2 * 12 + b2) { out.push([t, b]); if (++b > 12) { b = 1; t++; } }
    if (!out.length) throw new Error('Bulan akhir harus sama atau sesudah bulan awal.');
    if (out.length > 24) throw new Error('Periode paling panjang 24 bulan.');
    return out;
  }

  // PDF periode: satu halaman per bulan, digabung jadi satu file (pdf-lib)
  async function unduhPeriode() {
    if (!siapPdf() || !window.PDFLib) return pesan('Pembuat PDF belum termuat; muat ulang halaman.', true);
    const b = $('ckPeriodeBtn'); if (b.disabled) return;
    let bulan; try { bulan = daftarBulan($('ckDari').value, $('ckSampai').value); } catch (e) { return pesan(e.message, true); }
    b.disabled = true; b.dataset.asli = b.innerHTML; b.innerHTML = '<span class="proses-putar"></span>Memproses…';
    try {
      const data = [];
      for (let i = 0; i < bulan.length; i++) {
        const [th, bl] = bulan[i];
        pesan('Mengambil ' + BULAN[bl - 1] + ' ' + th + ' (' + (i + 1) + '/' + bulan.length + ')… ± 10–30 detik per bulan');
        const d = await bacaJson(await fetch(API_URL + '?aksi=cakupan&tahun=' + th + '&bulan=' + bl + '&token=' + encodeURIComponent(token()) + '&_=' + Date.now()));
        cekToken(d);
        if (d.data && d.data.aktif && d.data.jumlah) data.push(d);
      }
      if (!data.length) throw new Error('Tidak ada kunjungan pada periode itu.');
      pesan('Menyusun PDF ' + data.length + ' halaman…');
      const gabung = await window.PDFLib.PDFDocument.create();
      for (let i = 0; i < data.length; i++) {
        const satu = await window.PDFLib.PDFDocument.load(pdfCakupan(data[i], [i + 1, data.length]).output('arraybuffer'));
        (await gabung.copyPages(satu, satu.getPageIndices())).forEach((h) => gabung.addPage(h));
      }
      const awal = data[0], akhir = data[data.length - 1];
      const label = awal.namaBulan + (awal.tahun !== akhir.tahun ? ' ' + awal.tahun : '') + '–' + akhir.namaBulan + ' ' + akhir.tahun;
      gabung.setTitle('Cakupan Layanan IGD ' + label); gabung.setCreator('Emergency Unit SGH');
      simpan(await gabung.save(), 'Cakupan_IGD_' + label.replace(/[ –]/g, '_') + '.pdf');
      const kosong = bulan.length - data.length;
      pesan('PDF periode ' + label + ' diunduh (' + data.length + ' halaman' + (kosong ? '; ' + kosong + ' bulan tanpa kunjungan dilewati' : '') + ').');
    } catch (e) { pesan('Gagal membuat PDF periode: ' + e.message, true); }
    b.disabled = false; b.innerHTML = b.dataset.asli;
  }

  function simpan(bytes, nama) {
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const a = document.createElement('a'); a.href = url; a.download = nama; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function kirimTele() {
    if (!hasil) return;
    const b = $('ckTele'); if (b.disabled) return;
    b.disabled = true; b.dataset.asli = b.innerHTML; b.innerHTML = '<span class="proses-putar"></span>Mengirim…'; pesan('Mengirim ringkasan ke Telegram…');
    try {
      const d = await bacaJson(await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ aksi: 'kirimCakupan', token: token(), tahun: hasil.tahun, bulan: hasil.bulan }) }));
      cekToken(d);
      pesan('Ringkasan ' + hasil.namaBulan + ' terkirim ke ' + d.terkirim + ' penerima Telegram.');
    } catch (e) { pesan(e.message, true); }
    b.disabled = false; b.innerHTML = b.dataset.asli;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    $('ckBulan').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    $('ckBulan').max = $('ckBulan').value;
    $('ckBuat').addEventListener('click', perbarui);
    $('ckTele').addEventListener('click', kirimTele);
    $('ckPdf').addEventListener('click', unduhPdf);
    $('ckDari').value = now.getFullYear() + '-01'; $('ckSampai').value = $('ckBulan').value;
    $('ckDari').max = $('ckSampai').max = $('ckBulan').value;
    $('ckPeriodeBtn').addEventListener('click', unduhPeriode);
  });
})();
