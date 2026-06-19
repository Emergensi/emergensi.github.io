const LINK_GROUPS = [
  {
    id: 'operasional',
    title: 'Beranda Operasional',
    subtitle: 'Tautan harian IGD untuk register, billing, laporan, dan sistem kerja.',
    icon: '⚡',
    items: [
      { title: 'Medical Duty Schedule', desc: 'Halaman jadwal tugas medis IGD.', url: 'https://sites.google.com/view/emergencyunit/medical-duty-schedule', type: 'GSite', tag: 'gsite' },
      { title: 'Formulir IGD', desc: 'Folder Google Drive formulir UGD/IGD.', url: 'https://drive.google.com/drive/u/1/folders/1gDY3QqhHOh5GT_JRnwYLC69R5sRR11wZ', type: 'Drive', tag: 'drive' },
      { title: 'Patient Registration', desc: 'REGISTER PASIEN IGD RS SGH.', url: 'https://docs.google.com/spreadsheets/d/1nGQOl939xO-qo5IoXhhFSsfARX0m3d2e4A61on2F4d4/edit?gid=0', type: 'Sheets', tag: 'sheet', sensitive: true },
      { title: 'Billing Pasien', desc: 'Nota tindakan/manual pasien IGD.', url: 'https://docs.google.com/spreadsheets/d/1-XNkQFoD4jiRzKBqbok7cCmAp2fXvedEDBBXa4y3ivY/edit?usp=drivesdk', type: 'Sheets', tag: 'sheet', sensitive: true },
      { title: 'AVIAT In Hospital', desc: 'Akses sistem AVIAT dari jaringan internal rumah sakit.', url: 'http://192.168.30.1/LIVE', type: 'Sistem', tag: 'system', sensitive: true },
      { title: 'AVIAT Out Hospital', desc: 'Akses sistem AVIAT dari luar jaringan rumah sakit.', url: 'http://103.105.252.26:8090/LIVE4/Login/Login.aspx', type: 'Sistem', tag: 'system', sensitive: true },
      { title: 'Room Temperature Monitoring Form', desc: 'Form monitoring suhu ruangan IGD.', url: 'https://docs.google.com/spreadsheets/d/1ZsYjDGx_zfm6hKRXqO7IiR7qO1vcbfWp-2cwR0QeGOY/edit?gid=2055685808', type: 'Sheets', tag: 'sheet' },
      { title: 'Meeting', desc: 'Folder notulen dan dokumen meeting IGD.', url: 'https://drive.google.com/drive/u/0/folders/1JFvOm19Rct65OqY9J9FG-bggsaHM2GYT', type: 'Drive', tag: 'drive' },
      { title: 'In House Training', desc: 'Pengajuan dan monitoring pelatihan IHT per unit.', url: 'https://docs.google.com/spreadsheets/d/1w6doKENmyzpjmF3WvqpFIOqqPKZKPBKn66OwHFiqG2s/edit?gid=1681802920', type: 'Sheets', tag: 'sheet' },
      { title: 'Inventaris IGD', desc: 'Daftar inventaris dan alat medis IGD.', url: 'https://docs.google.com/spreadsheets/d/1W5rmQ6pNs6GGLbU-kqOLeCXxm8tiUI8l3tgD1MIA5tw/edit?usp=sharing', type: 'Sheets', tag: 'sheet' },
      { title: 'Official Report', desc: 'Halaman berita acara dan laporan resmi.', url: 'https://sites.google.com/view/emergencyunit/berita-acara', type: 'GSite', tag: 'gsite' },
      { title: 'Morning Report', desc: 'Halaman morning report IGD.', url: 'https://sites.google.com/view/emergencyunit/morning-report', type: 'GSite', tag: 'gsite' },
      { title: 'Laporan Bulanan Pelayanan', desc: 'Spreadsheet laporan kunjungan/pelayanan IGD.', url: 'https://docs.google.com/spreadsheets/d/1Lzsf7r-Qgu0dQQ_QMq8tNiCASQX3-ocilMLSvErOP80/edit?gid=0&hl=id', type: 'Sheets', tag: 'sheet', sensitive: true },
      { title: 'Nurse Daily Logbook', desc: 'Log book kerja perawat RS Sedayu General Hospital.', url: 'https://docs.google.com/spreadsheets/d/1Cwn8mRk92_I0IaQO1TpvqVAAwViry9Bc/edit?gid=537945572&pli=1', type: 'Sheets', tag: 'sheet' },
      { title: 'Akreditasi', desc: 'Halaman pusat dokumen akreditasi.', url: 'https://sites.google.com/view/emergencyunit/akreditasi', type: 'GSite', tag: 'gsite' },
      { title: 'Patient Registration HomeCare', desc: 'Register pasien HomeCare.', url: 'https://docs.google.com/spreadsheets/d/1dLFISy0AZ46HDScCAzUaQ54g9ifNcXn7UUvbtchnPBk/edit?gid=0', type: 'Sheets', tag: 'sheet', sensitive: true },
      { title: 'Claim BPJS TK', desc: 'Folder foto kondisi pasien BPJS Ketenagakerjaan.', url: 'https://drive.google.com/drive/folders/1BqG8d_EixAMk_5tH0gDiHn-OYOxDaAkr?usp=drive_link', type: 'Drive', tag: 'drive', sensitive: true },
      { title: 'GDrive UGD File', desc: 'Folder utama file UGD.', url: 'https://drive.google.com/drive/folders/1AOTRHYVs-whgqcu0orfASOT1FTyzoANH?usp=sharing', type: 'Drive', tag: 'drive' }
    ]
  },
  {
    id: 'jadwal',
    title: 'Jadwal Medis',
    subtitle: 'Jadwal dokter, perawat, dan on-call DPJP IGD.',
    icon: '📅',
    items: [
      { title: 'Jadwal On Call DPJP IGD', desc: 'File jadwal on-call DPJP IGD.', url: 'https://drive.google.com/file/d/1l_Q2ezeL6LaJtFBoKh46Qdtuuz_tanzC/view?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'Jadwal Dokter Umum', desc: 'Spreadsheet jadwal dokter umum SGH.', url: 'https://docs.google.com/spreadsheets/d/1ZUctcT-ivLDZKItQV1MmFRKpGBymmS8_lRioD7qnARY/edit?gid=1779060015', type: 'Sheets', tag: 'sheet' },
      { title: 'Jadwal Perawat', desc: 'Spreadsheet jadwal perawat IGD RS SGH 2026.', url: 'https://docs.google.com/spreadsheets/d/1RHwYk8x6YfzlgUieSNN6FhAk6Me1Ae25rqsqdT0nWzE/edit?usp=drive_link', type: 'Sheets', tag: 'sheet' }
    ]
  },
  {
    id: 'struktur',
    title: 'Struktur Organisasi',
    subtitle: 'Halaman struktur dan pembagian peran dalam unit emergensi.',
    icon: '👥',
    items: [
      { title: 'Organizational Structure', desc: 'Struktur organisasi dan daftar tim IGD.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure', type: 'GSite', tag: 'gsite' },
      { title: 'Head of Emergency Department', desc: 'Kepala Instalasi/Unit Emergensi.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure/head-of-emergency-department', type: 'GSite', tag: 'gsite' },
      { title: 'Emergency Room Manager', desc: 'Manajer ruang IGD dan link manajemen.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure/emergency-room-manager', type: 'GSite', tag: 'gsite' },
      { title: 'Secretary', desc: 'Sekretaris IGD dan dokumen meeting.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure/secretary', type: 'GSite', tag: 'gsite' },
      { title: 'Finance Manager', desc: 'Manajer keuangan unit IGD.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure/finance-manager', type: 'GSite', tag: 'gsite' },
      { title: 'EMR Division', desc: 'Divisi EMR IGD.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure/emr-division', type: 'GSite', tag: 'gsite' },
      { title: 'Training and Development Division', desc: 'Divisi pelatihan dan pengembangan.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure/training-and-development-division', type: 'GSite', tag: 'gsite' },
      { title: 'Inventory Division', desc: 'Divisi inventaris unit IGD.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure/inventory-division', type: 'GSite', tag: 'gsite' },
      { title: 'Equipment Maintenance Division', desc: 'Divisi pemeliharaan alat.', url: 'https://sites.google.com/view/emergencyunit/organizational-structure/equipment-maintenance-division', type: 'GSite', tag: 'gsite' }
    ]
  },
  {
    id: 'manajemen',
    title: 'Manajemen Unit',
    subtitle: 'Dokumen pendukung manajemen, SDM, meeting, inventaris, dan maintenance.',
    icon: '🧭',
    items: [
      { title: 'Laporan Kunjungan IGD', desc: 'Laporan kunjungan/pelayanan IGD RS SGH.', url: 'https://docs.google.com/spreadsheets/d/1Lzsf7r-Qgu0dQQ_QMq8tNiCASQX3-ocilMLSvErOP80/edit?gid=0&hl=id', type: 'Sheets', tag: 'sheet', sensitive: true },
      { title: 'SPK RKK', desc: 'Folder SPK dan RKK tenaga kesehatan RS SGH 2026.', url: 'https://drive.google.com/drive/folders/1JAnpqMQb9Nag5YhhiKlBk8h1RhP2515j', type: 'Drive', tag: 'drive' },
      { title: 'Data Ambulance', desc: 'Folder data ambulans.', url: 'https://drive.google.com/drive/u/1/folders/18x-MZ-tksmhZd2FN7kjeUianIdFb4UfD', type: 'Drive', tag: 'drive' },
      { title: 'Notulen Meeting', desc: 'Folder meeting IGD.', url: 'https://drive.google.com/drive/u/0/folders/1JFvOm19Rct65OqY9J9FG-bggsaHM2GYT', type: 'Drive', tag: 'drive' },
      { title: 'SIP Perawat & Bidan', desc: 'Spreadsheet SIP perawat dan bidan IGD SGH.', url: 'https://docs.google.com/spreadsheets/d/1mILZ0LbHp8Fa7KmOy3KHCSGQznwJk4JZz2hgh_9Q7fw/edit?usp=drive_link', type: 'Sheets', tag: 'sheet' },
      { title: 'IHT', desc: 'Rencana dan bukti pelaksanaan pelatihan IHT.', url: 'https://docs.google.com/spreadsheets/d/1w6doKENmyzpjmF3WvqpFIOqqPKZKPBKn66OwHFiqG2s/edit?gid=1681802920', type: 'Sheets', tag: 'sheet' },
      { title: 'Maintenance Schedule', desc: 'Jadwal pemeliharaan peralatan IGD.', url: 'https://docs.google.com/spreadsheets/d/1ir63D8GB5FQvTUrhXc2Zcxy0pzMqRVtemPWEY7pJtZA/edit?usp=sharing', type: 'Sheets', tag: 'sheet' },
      { title: 'Berita Acara Serah Terima Barang', desc: 'Folder berita acara serah terima barang.', url: 'https://drive.google.com/drive/folders/1naefLJjpFaEwlOZcfWsew8l6YZ6pvVBJ?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'Berita Acara Perbaikan & Permintaan', desc: 'Folder BA perbaikan dan permintaan.', url: 'https://drive.google.com/drive/folders/1YjwgSk9B-Y7XXslVKqcdxasmhBD2o9Lr?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'Notulensi Morning Report', desc: 'Spreadsheet notulen morning report.', url: 'https://docs.google.com/spreadsheets/d/18Ac9z5tJaeNu_GZhMGtop0rwHIvZFqqzg3UC_xcX4R8/edit?usp=sharing', type: 'Sheets', tag: 'sheet' },
      { title: 'Stok Obat', desc: 'Database farmasi/stok obat SGH.', url: 'https://docs.google.com/spreadsheets/d/1wjbyoVb2a19boCgN4BTqGNI_xfvWa9ZNj3Y5cSbRkF0/edit?usp=drivesdk', type: 'Sheets', tag: 'sheet' }
    ]
  },
  {
    id: 'kebijakan',
    title: 'Policies & Regulasi',
    subtitle: 'Kumpulan regulasi nasional dan kebijakan terkait pelayanan kegawatdaruratan.',
    icon: '📚',
    items: [
      { title: 'Emergency Department Policies', desc: 'Halaman induk kebijakan IGD.', url: 'https://sites.google.com/view/emergencyunit/policies', type: 'GSite', tag: 'gsite' },
      { title: 'PMK No 129 Tahun 2008', desc: 'Regulasi standar pelayanan minimal rumah sakit.', url: 'https://drive.google.com/file/d/1PL3mronK1LCDNUMxICEmV4osf7atY9mL/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'Permenkes No. 290 Tahun 2009', desc: 'Persetujuan tindakan kedokteran.', url: 'https://drive.google.com/file/d/1txjX6x39CFFeyCQbZdU8_ZkPGWKpQMOl/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'PMK No. 308 Tahun 2017', desc: 'Keselamatan pasien.', url: 'https://drive.google.com/file/d/1VY0gkoCWP84uEdyJ7fVYJDHISVcHZHoe/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'PMK 47 Tahun 2018', desc: 'Pelayanan kegawatdaruratan.', url: 'https://drive.google.com/file/d/1H1OVIauld4Cxq96rbRL7uNKByMkM6OPG/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'Permenkes Nomor 4 Tahun 2018', desc: 'Regulasi rumah sakit.', url: 'https://drive.google.com/file/d/1I9A2ezg7rbf1Hc6_2yP5jBjOwuoz7Oh_/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'Permenkes Nomor 4 Tahun 2019', desc: 'Regulasi standar teknis mutu pelayanan dasar.', url: 'https://drive.google.com/file/d/1dVFGsyqIvcCgVz1BeSUKGhs7EeS7XFbL/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'Permenkes Nomor 24 Tahun 2022', desc: 'Rekam medis.', url: 'https://drive.google.com/file/d/1t69qkdgGLoTfBJwy40PapwEqVi0ZN72s/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'Undang-Undang Nomor 17 Tahun 2023', desc: 'Undang-undang kesehatan.', url: 'https://drive.google.com/file/d/1ggIxaWKHAyX-NBnpVwcvrUAIHofau69S/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'KMK No.HK.01.07/MENKES/1596/2024', desc: 'Keputusan Menteri Kesehatan.', url: 'https://drive.google.com/file/d/1x6ZFWX79aCrqzPlGtjk_rmuRD3f10-v0/view?usp=drive_link', type: 'Regulasi', tag: 'policy' },
      { title: 'PP Nomor 28 Tahun 2024', desc: 'Peraturan Pemerintah bidang kesehatan.', url: 'https://drive.google.com/file/d/1HT8X2Z0dO_mLsUer6e13pwBeb5HohY62/view?usp=drive_link', type: 'Regulasi', tag: 'policy' }
    ]
  },
  {
    id: 'pedoman',
    title: 'Pedoman, SPO & Form',
    subtitle: 'Pedoman pelayanan, pengorganisasian, triage, SPO, formulir, dan employee file.',
    icon: '📝',
    items: [
      { title: 'Emergency Department Guidelines', desc: 'Halaman pedoman IGD.', url: 'https://sites.google.com/view/emergencyunit/policies/guidelines', type: 'GSite', tag: 'gsite' },
      { title: 'Pedoman Pelayanan IGD', desc: 'Pedoman pelayanan UGD RS SGH.', url: 'https://drive.google.com/file/d/1q2UvC1CmIDcx5crCz_jrupnPeH5an_po/view?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'Pedoman Pengorganisasian IGD', desc: 'Pedoman pengorganisasian unit IGD.', url: 'https://drive.google.com/file/d/1OEYocDn5a27mGt9Ryjx4CN_g5-yJpbHg/view?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'Panduan Triage', desc: 'Panduan triase IGD.', url: 'https://drive.google.com/file/d/1yho-rIrcwMwaU2Aq1AuXr9SXiTlgFDBz/view?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'Emergency Department SOP', desc: 'Halaman SPO IGD.', url: 'https://sites.google.com/view/emergencyunit/policies/standard-operating-procedures', type: 'GSite', tag: 'gsite' },
      { title: 'SPO IGD', desc: 'Folder SPO Pelayanan IGD.', url: 'https://drive.google.com/drive/folders/1nohEj1Nyxq_pMrglIyy_Otpk0L3vRi-p?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'SPO PONEX', desc: 'Folder SPO PONEX.', url: 'https://drive.google.com/drive/u/1/folders/1uzvl3Ho0ju8w2rS8RgYo3oF8FYw4o76Q', type: 'Drive', tag: 'drive' },
      { title: 'SPO Pemulasaran', desc: 'Folder SPO pemulasaran.', url: 'https://drive.google.com/drive/u/1/folders/1cz6eqcV9RZgz4KNj95Q0ve4jY0UGmfSR', type: 'Drive', tag: 'drive' },
      { title: 'Assessment Form', desc: 'Halaman assessment form.', url: 'https://sites.google.com/view/emergencyunit/policies/assessment-form', type: 'GSite', tag: 'gsite' },
      { title: 'Form IGD', desc: 'Folder formulir IGD/UGD.', url: 'https://drive.google.com/drive/u/1/folders/1gDY3QqhHOh5GT_JRnwYLC69R5sRR11wZ', type: 'Drive', tag: 'drive' },
      { title: 'Employee File', desc: 'Halaman employee file.', url: 'https://sites.google.com/view/emergencyunit/policies/employee-file', type: 'GSite', tag: 'gsite' },
      { title: 'Dokter', desc: 'Folder employee file dokter.', url: 'https://drive.google.com/drive/u/1/folders/1r2hr3g-1NP6f00YG6yDrPLn4aSkOoqiM', type: 'Drive', tag: 'drive' },
      { title: 'Perawat', desc: 'Folder employee file perawat.', url: 'https://drive.google.com/drive/u/1/folders/16-mNpfXIiMrkP6yLGj4Pg5lfHxntRRAC', type: 'Drive', tag: 'drive' },
      { title: 'Bidan', desc: 'Folder employee file bidan.', url: 'https://drive.google.com/drive/u/1/folders/1VktmNNEwgDjZX-sMwCCMLVU5C5zQk4YJ', type: 'Drive', tag: 'drive' },
      { title: 'Driver', desc: 'Folder employee file driver.', url: 'https://drive.google.com/drive/u/1/folders/1il-5fH5raVCJ-QyYoZYtPSXXaL71_zjO', type: 'Drive', tag: 'drive' }
    ]
  },
  {
    id: 'akreditasi',
    title: 'Akreditasi',
    subtitle: 'Dashboard dokumen akreditasi, regulasi, jadwal, instrumen, dan PPS.',
    icon: '🏥',
    items: [
      { title: 'PIC Per Elemen', desc: 'Pembagian PIC per elemen akreditasi.', url: 'https://docs.google.com/spreadsheets/d/17Ua28p-JfhNmndYfURVg_UlpFJowVOHjS4g_tsItV8M/edit?usp=sharing', type: 'Sheets', tag: 'sheet' },
      { title: 'Web Akreditasi', desc: 'Website akreditasi.', url: 'https://www.akreditasi.rf.gd/', type: 'Website', tag: 'gsite' },
      { title: 'AKP Akreditasi', desc: 'Folder AKP Akreditasi SGH.', url: 'https://drive.google.com/drive/folders/1OnWWMqgkjTD74k0rObD6o6c62wG9D0de?usp=sharing', type: 'Drive', tag: 'drive' },
      { title: 'Daftar Regulasi', desc: 'Daftar regulasi SGH.', url: 'https://docs.google.com/spreadsheets/d/1d8GBfogitrZat-FSbKrkufnIpCrsEE3syNK0NH-TCsY/edit?usp=sharing', type: 'Sheets', tag: 'sheet' },
      { title: 'Time Line & Tim Akreditasi', desc: 'Timeline dan tim persiapan akreditasi.', url: 'https://docs.google.com/spreadsheets/d/1lqYTxiTeDTukonoyZTdAyl5j9jeq3kKEZ9-Jb1RWjHw/edit?gid=1857104022', type: 'Sheets', tag: 'sheet' },
      { title: 'GDrive Akreditasi', desc: 'Folder akreditasi RS SGH 2025.', url: 'https://drive.google.com/drive/folders/1Ux9EJhwMV6p2lgBgKRSvDkukvXJlkvS9', type: 'Drive', tag: 'drive' },
      { title: 'Jadwal Karantina', desc: 'Spreadsheet jadwal karantina akreditasi.', url: 'https://docs.google.com/spreadsheets/d/1EusR9tOuizy26OvuqZ4oso6inkw4ZjRbpYlu-z-46nA/edit?usp=sharing', type: 'Sheets', tag: 'sheet' },
      { title: 'Daftar Pertanyaan', desc: 'Daftar pertanyaan akreditasi.', url: 'https://docs.google.com/spreadsheets/d/1ZvVzZddY1Ls8bFZkacPbQqBPyV7qq0Yh-jnb-MhBVjw/edit?usp=drivesdk', type: 'Sheets', tag: 'sheet' },
      { title: 'Instrumen Akreditasi RS', desc: 'PDF instrumen akreditasi rumah sakit.', url: 'https://drive.google.com/file/d/16wNS5wQHn-lSBEo-_kVRgQM1mWX0-bhl/view?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'Standar Akreditasi Rumah Sakit', desc: 'PDF standar akreditasi rumah sakit.', url: 'https://drive.google.com/file/d/1wyC5KLYoZna1U3BmMA_Sp_IwM3JjLg_o/view?usp=drive_link', type: 'Drive', tag: 'drive' },
      { title: 'Form RM', desc: 'Daftar formulir rekam medis SGH.', url: 'https://docs.google.com/spreadsheets/d/1uGAN3c5rSUDEJT3N_POTf-i09fxOrj_G8yZTDFrC-uQ/edit?gid=382917113', type: 'Sheets', tag: 'sheet' },
      { title: 'Daftar Nomor Regulasi', desc: 'Daftar penomoran RS SGH.', url: 'https://docs.google.com/spreadsheets/d/1X4cge_zt1birOYIrZiXf_r6F23sMXlK6JIRhVRvSe18/edit?gid=2062175656&pli=1', type: 'Sheets', tag: 'sheet' },
      { title: 'PPS', desc: 'Perencanaan Perbaikan Strategis RS SGH.', url: 'https://docs.google.com/spreadsheets/d/1zzD7n9zNwK9PK8rcNrvQwI2pfdu9vW0oUUOInS19CNw/edit?gid=1018308196', type: 'Sheets', tag: 'sheet' },
      { title: 'Pemenuhan PPS', desc: 'Folder pemenuhan PPS.', url: 'https://drive.google.com/drive/folders/1BRf_7ei73SRtK1p34HSiFn-G7ZMSKsmf', type: 'Drive', tag: 'drive' }
    ]
  }
];

let activeGroup = 'semua';

function allItems() {
  return LINK_GROUPS.flatMap((group) => group.items.map((item) => ({ ...item, groupTitle: group.title, groupId: group.id })));
}

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function itemMatches(item, query) {
  if (!query) return true;
  const haystack = normalize([item.title, item.desc, item.type, item.groupTitle, item.url].join(' '));
  return haystack.includes(normalize(query));
}

function filteredGroups() {
  const query = document.getElementById('searchInput').value.trim();
  return LINK_GROUPS
    .filter((group) => activeGroup === 'semua' || group.id === activeGroup)
    .map((group) => ({ ...group, items: group.items.filter((item) => itemMatches({ ...item, groupTitle: group.title }, query)) }))
    .filter((group) => group.items.length > 0);
}

function createFilterRow() {
  const row = document.getElementById('filterRow');
  const groups = [{ id: 'semua', title: 'Semua' }, ...LINK_GROUPS.map(({ id, title }) => ({ id, title }))];
  row.innerHTML = groups.map((group) => `<button class="filter-pill ${group.id === activeGroup ? 'active' : ''}" type="button" data-filter="${group.id}">${group.title}</button>`).join('');
  row.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      activeGroup = button.dataset.filter;
      createFilterRow();
      renderGroups();
    });
  });
}

function cardTemplate(item) {
  const sensitiveTag = item.sensitive ? '<span class="tag sensitive">Sensitif</span>' : '';
  return `
    <a class="link-card" href="${item.url}" target="_blank" rel="noopener" data-title="${item.title}">
      <div class="card-top">
        <div class="tags"><span class="tag ${item.tag || ''}">${item.type}</span>${sensitiveTag}</div>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
      <span class="card-action">Buka link <span>↗</span></span>
    </a>`;
}

function groupTemplate(group) {
  return `
    <section class="group-section" id="${group.id}">
      <div class="group-head">
        <div class="group-title">
          <span class="group-icon">${group.icon}</span>
          <div>
            <h3>${group.title}</h3>
            <p>${group.subtitle}</p>
          </div>
        </div>
        <span class="count-badge">${group.items.length} link</span>
      </div>
      <div class="card-grid">
        ${group.items.map(cardTemplate).join('')}
      </div>
    </section>`;
}

function renderGroups() {
  const root = document.getElementById('contentRoot');
  const groups = filteredGroups();
  if (groups.length === 0) {
    root.innerHTML = '<div class="empty-state">Tidak ada link yang cocok dengan pencarian.</div>';
    return;
  }
  root.innerHTML = groups.map(groupTemplate).join('');
}

function init() {
  const logout = document.getElementById('logoutBtn');
  if (logout) logout.addEventListener('click', window.IGDAuth.logout);

  const total = allItems().length;
  document.getElementById('totalLinks').textContent = total;

  createFilterRow();
  renderGroups();

  document.getElementById('searchInput').addEventListener('input', renderGroups);
}

document.addEventListener('DOMContentLoaded', init);
