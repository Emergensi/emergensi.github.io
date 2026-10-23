// Jadwal konsul DPJP RS Sedayu General Hospital (versi terbaru, Okt 2026).
// Nomor HP sengaja tidak dimuat di situs publik; lihat dokumen cetak di IGD.
// Hari Minggu ke-n = Minggu ke-n dalam bulan; pekan ke-n (Bedah Umum) dihitung dari tanggal: tgl 1–7 = ke-1, 8–14 = ke-2, 15–21 = ke-3, 22–28 = ke-4, 29–31 = ke-5.
(function () {
  const PD_W = 'dr. Wulan, Sp.PD', PD_B = 'dr. Bambang, Sp.PD';
  const AN_A = 'dr. Arif, Sp.An', AN_H = 'dr. Hasyim, Sp.An', AN_E = 'dr. Estu, Sp.An';
  const THT_R = 'dr. Rizky, Sp.THT-KL', THT_H = 'dr. Hari Pranoto, Sp.THT-BKL';
  // hari: 0=Minggu … 6=Sabtu; fungsi menerima (hari, mingguKe)
  const KONSUL = [
    { sp: 'Penyakit Dalam', siapa: (h, n) => h === 0 ? (n % 2 ? PD_W : PD_B) : (h % 2 ? PD_W : PD_B),
      catatan: ['Masalah utama paru → dr. Bambang, Sp.PD', 'Masalah utama ginjal → dr. Wulan, Sp.PD', 'Kelainan darah → dr. Agit, Sp.PD', 'Tiga ketentuan ini tidak tergantung jadwal hari itu'] },
    { sp: 'Obstetri & Ginekologi', siapa: () => 'dr. Nungky Nugroho Wibisono, Sp.OG',
      catatan: ['Untuk pasien baru (belum pernah ANC di SGH)', 'Pasien lama kembali ke DPJP sebelumnya'] },
    { sp: 'Bedah Umum', siapa: (h, n) => n % 2 ? 'dr. Nuryasin Kurniawan, Sp.B, FICS, AIFO-K' : 'dr. Ivan Hugo Hadi Saputra, Sp.B',
      catatan: ['Pekan ke-1, 3, 5 (tgl 1–7, 15–21, 29–31): dr. Nuryasin', 'Pekan ke-2, 4 (tgl 8–14, 22–28): dr. Ivan'] },
    { sp: 'Anak', siapa: () => 'dr. Rista, Sp.A',
      catatan: ['Konsultasi rawat inap dan resusitasi bayi SC', 'Pasien lama kembali ke DPJP sebelumnya'] },
    { sp: 'Anestesi', siapa: (h, n) => [n % 2 ? AN_E : AN_A, AN_A, AN_H, AN_H, AN_A, AN_E, AN_E][h] },
    { sp: 'THT-KL', siapa: (h) => [1, 4, 5, 0].includes(h) ? THT_R : THT_H, catatan: ['Kasus trauma THT → dr. Rizky, Sp.THT-KL'] },
    { sp: 'Jantung', siapa: () => 'dr. Ainal Fadly, Sp.JP' },
    { sp: 'Saraf', siapa: () => 'dr. Sofia Fitri Iswari, Sp.N' },
    { sp: 'Mata', siapa: () => 'dr. Sekar Kumalasari, Sp.M', ket: 'SIP dalam proses' },
    { sp: 'Urologi', siapa: () => 'dr. Dwi Prayogo, Sp.U, M.H.' },
    { sp: 'Orthopaedi', siapa: () => 'dr. Arie, Sp.OT' },
    { sp: 'BTKV', siapa: () => '' },
    { sp: 'Kedokteran Jiwa', siapa: () => '' }
  ];
  // Foto dari situs resmi sedayugeneralhospital.com (dimuat langsung dari sana); nama lengkap untuk keterangan
  const F = 'https://sedayugeneralhospital.com/file/doctors/';
  const FOTO = {
    'Wulan': [F + 'TccXKtHsGmMuMWjeffomSfGpMrknKC9nu2f94gDb.png', 'dr. Dwi Wulansih, M.Kes., Sp.PD, Subsp.GH (K), FINASIM'],
    'Bambang': [F + 'c1ktBAufFCWa8K94ZrItpeAoQTkyPfvtnPnygUVn.png', 'dr. Bambang Sigit, Sp.PD-KP (K)'],
    'Nungky': [F + 'WRBiMzgCoAo1nnQjFANSLzDSHQe0lPMjfQIxqgs8.png', 'dr. Nungky Nugroho Wibisono, Sp.OG'],
    'Nuryasin': [F + 'irVFP5gA3RVr5WBQBJfFO6koXkawHicQVZAt8B27.jpg', 'dr. Nuryasin Kurniawan, Sp.B, FINACS, AIFO-K'],
    'Ivan': [F + 'NVDyymohtNxSJaS3Zj1QvW4EfYT4LYeKI8pdkn4B.png', 'dr. Ivan Hugo Hadisaputra, Sp.B'],
    'Rista': [F + '8qsz7GCrg6a3G6sqn7gF4SwdorqDjf4uMsklLxEq.png', 'dr. Rista Ria Febriani, M.Med.Sc, Sp.A'],
    'Estu': [F + 'lGPA3VHJIUOcDqVnUK1fVdOwCAJxmvFxwa63jXrH.png', 'dr. Estu Agung Pambudi, Sp.An-TI'],
    'Rizky': [F + 'cmfsJjnV11aIpGEA6u2folJZiYSv7g2mfqvOLvp6.png', 'dr. Rizky Firmansyah, Sp.THT-KL'],
    'Hari': [F + 'CH37MYMG0K8BDsC6VXf2R9QYKk3rfL8VYmcEtvIv.png', 'dr. Hari Pranoto, Sp.THT-BKL'],
    'Ainal': [F + '7eMtqoP8Il3ang8Rxz1LKm0Dilv6lHsLRrsWMSSw.png', 'dr. Ainal Fadly, Sp.JP, MMR, FIHA'],
    'Sofia': [F + 'KptfFDZK4vOhEXRd8gskcc0iEzIT7zM0bIcCH8Qp.png', 'dr. Sofia Fitri Iswari, Sp.N'],
    'Sekar': [F + 'fhfyHjiZ6FHpxTE9LBO3Zz3KQQoWmJJXKOeQg5yb.png', 'dr. Sekar Kumalasari, Sp.M'],
    'Dwi': [F + 'owfikpZkSn2rJEgIVOOd3COiUUJj9eaGZkH6dbZy.png', 'dr. Dwi Prayogo, Sp.U., M.H.'],
    'Arie': [F + 'wSQxrf37vQfHLErtZFb5nGwJd3TF7uS6z3H79YDu.jpg', 'dr. Arie Nugroho, Sp.OT']
  };
  const cariFoto = (nama) => FOTO[(nama.replace(/^dr\.?\s*/, '').split(/[\s,]/)[0])] || null;
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function untuk(tgl) {
    const d = new Date(tgl + 'T12:00:00+07:00'), h = d.getUTCDay(), n = Math.ceil(+tgl.slice(8, 10) / 7);
    return { hari: HARI[h], n, daftar: KONSUL.map((k) => ({ sp: k.sp, nama: k.siapa(h, n), ket: k.ket, catatan: k.catatan || [] })) };
  }

  function tampil(tgl) {
    const el = document.getElementById('ksIsi'); if (!el) return;
    const r = untuk(tgl);
    const ada = r.daftar.filter((x) => x.nama), tidak = r.daftar.filter((x) => !x.nama);
    const sub = document.getElementById('ksSub');
    if (sub) sub.textContent = '· ' + (r.hari === 'Minggu' ? `Hari Minggu ke-${r.n} bulan ini` : `${r.hari}, pekan ke-${r.n} bulan ini`);
    el.innerHTML = `<div class="ks-grid">${ada.map((x) => {
      const [nm, gelar] = [x.nama.split(',')[0], x.nama.split(',').slice(1).join(',').trim()];
      const f = cariFoto(x.nama), ini = nm.replace(/^dr\.?\s*/, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
      const av = `<span class="ks-av">${f ? `<img src="${esc(f[0])}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<i>${esc(ini)}</i></span>`;
      return `<article class="ks-item"${f ? ` title="${esc(f[1])}"` : ''}>${av}<div class="ks-teks"><span class="ks-sp">${esc(x.sp)}</span><b>${esc(nm)}</b><small>${esc(gelar)}${x.ket ? ' · ' + esc(x.ket) : ''}</small>
        ${x.catatan.length ? `<details><summary>Catatan</summary><ul>${x.catatan.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></details>` : ''}</div></article>`;
    }).join('')}</div>
    ${tidak.length ? `<p class="ks-tidak">Belum ada konsulen: ${tidak.map((x) => esc(x.sp)).join(', ')}. Konsultasi/rujuk sesuai SPO Rujukan.</p>` : ''}
    <p class="ks-nb">Nomor HP konsulen tidak ditampilkan di situs; lihat jadwal konsul cetak di meja IGD.</p>`;
  }
  window.KonsulDPJP = { tampil, untuk, KONSUL };
})();
