// Data tautan IGD. Semua kartu utama diarahkan ke halaman GitHub lokal.
// URL Google Drive/Sheets/sistem eksternal disimpan sebagai externalUrl di halaman detail.
window.IGD_LINK_GROUPS = [
  {
    "id": "operasional",
    "title": "Beranda Operasional",
    "subtitle": "Tautan harian IGD untuk register, billing, laporan, dan sistem kerja.",
    "icon": "⚡",
    "items": [
      {
        "title": "Medical Duty Schedule",
        "desc": "Halaman jadwal tugas medis IGD.",
        "url": "link/operasional-medical-duty-schedule/",
        "type": "Halaman",
        "tag": "page",
        "slug": "operasional-medical-duty-schedule",
        "localPath": "link/operasional-medical-duty-schedule/",
        "externalUrl": ""
      },
      {
        "title": "Formulir IGD",
        "desc": "Folder Google Drive formulir UGD/IGD.",
        "url": "link/operasional-formulir-igd/",
        "type": "Drive",
        "tag": "drive",
        "slug": "operasional-formulir-igd",
        "localPath": "link/operasional-formulir-igd/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/1gDY3QqhHOh5GT_JRnwYLC69R5sRR11wZ"
      },
      {
        "title": "Patient Registration",
        "desc": "REGISTER PASIEN IGD RS SGH.",
        "url": "link/operasional-patient-registration/",
        "type": "Sheets",
        "tag": "sheet",
        "sensitive": true,
        "slug": "operasional-patient-registration",
        "localPath": "link/operasional-patient-registration/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1nGQOl939xO-qo5IoXhhFSsfARX0m3d2e4A61on2F4d4/edit?gid=0"
      },
      {
        "title": "Billing Pasien",
        "desc": "Nota tindakan/manual pasien IGD.",
        "url": "link/operasional-billing-pasien/",
        "type": "Sheets",
        "tag": "sheet",
        "sensitive": true,
        "slug": "operasional-billing-pasien",
        "localPath": "link/operasional-billing-pasien/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1-XNkQFoD4jiRzKBqbok7cCmAp2fXvedEDBBXa4y3ivY/edit?usp=drivesdk"
      },
      {
        "title": "AVIAT In Hospital",
        "desc": "Akses sistem AVIAT dari jaringan internal rumah sakit.",
        "url": "link/operasional-aviat-in-hospital/",
        "type": "Sistem",
        "tag": "system",
        "sensitive": true,
        "slug": "operasional-aviat-in-hospital",
        "localPath": "link/operasional-aviat-in-hospital/",
        "externalUrl": "http://192.168.30.1/LIVE"
      },
      {
        "title": "AVIAT Out Hospital",
        "desc": "Akses sistem AVIAT dari luar jaringan rumah sakit.",
        "url": "link/operasional-aviat-out-hospital/",
        "type": "Sistem",
        "tag": "system",
        "sensitive": true,
        "slug": "operasional-aviat-out-hospital",
        "localPath": "link/operasional-aviat-out-hospital/",
        "externalUrl": "http://103.105.252.26:8090/LIVE4/Login/Login.aspx"
      },
      {
        "title": "Room Temperature Monitoring Form",
        "desc": "Form monitoring suhu ruangan IGD.",
        "url": "link/operasional-room-temperature-monitoring-form/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "operasional-room-temperature-monitoring-form",
        "localPath": "link/operasional-room-temperature-monitoring-form/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1ZsYjDGx_zfm6hKRXqO7IiR7qO1vcbfWp-2cwR0QeGOY/edit?gid=2055685808"
      },
      {
        "title": "Meeting",
        "desc": "Folder notulen dan dokumen meeting IGD.",
        "url": "link/operasional-meeting/",
        "type": "Drive",
        "tag": "drive",
        "slug": "operasional-meeting",
        "localPath": "link/operasional-meeting/",
        "externalUrl": "https://drive.google.com/drive/u/0/folders/1JFvOm19Rct65OqY9J9FG-bggsaHM2GYT"
      },
      {
        "title": "In House Training",
        "desc": "Pengajuan dan monitoring pelatihan IHT per unit.",
        "url": "link/operasional-in-house-training/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "operasional-in-house-training",
        "localPath": "link/operasional-in-house-training/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1w6doKENmyzpjmF3WvqpFIOqqPKZKPBKn66OwHFiqG2s/edit?gid=1681802920"
      },
      {
        "title": "Inventaris IGD",
        "desc": "Daftar inventaris dan alat medis IGD.",
        "url": "link/operasional-inventaris-igd/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "operasional-inventaris-igd",
        "localPath": "link/operasional-inventaris-igd/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1W5rmQ6pNs6GGLbU-kqOLeCXxm8tiUI8l3tgD1MIA5tw/edit?usp=sharing"
      },
      {
        "title": "Official Report",
        "desc": "Halaman berita acara dan laporan resmi.",
        "url": "link/operasional-official-report/",
        "type": "Halaman",
        "tag": "page",
        "slug": "operasional-official-report",
        "localPath": "link/operasional-official-report/",
        "externalUrl": ""
      },
      {
        "title": "Morning Report",
        "desc": "Halaman morning report IGD.",
        "url": "link/operasional-morning-report/",
        "type": "Halaman",
        "tag": "page",
        "slug": "operasional-morning-report",
        "localPath": "link/operasional-morning-report/",
        "externalUrl": ""
      },
      {
        "title": "Laporan Bulanan Pelayanan",
        "desc": "Spreadsheet laporan kunjungan/pelayanan IGD.",
        "url": "link/operasional-laporan-bulanan-pelayanan/",
        "type": "Sheets",
        "tag": "sheet",
        "sensitive": true,
        "slug": "operasional-laporan-bulanan-pelayanan",
        "localPath": "link/operasional-laporan-bulanan-pelayanan/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1Lzsf7r-Qgu0dQQ_QMq8tNiCASQX3-ocilMLSvErOP80/edit?gid=0&hl=id"
      },
      {
        "title": "Nurse Daily Logbook",
        "desc": "Log book kerja perawat RS Sedayu General Hospital.",
        "url": "link/operasional-nurse-daily-logbook/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "operasional-nurse-daily-logbook",
        "localPath": "link/operasional-nurse-daily-logbook/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1Cwn8mRk92_I0IaQO1TpvqVAAwViry9Bc/edit?gid=537945572&pli=1"
      },
      {
        "title": "Akreditasi",
        "desc": "Halaman pusat dokumen akreditasi.",
        "url": "link/operasional-akreditasi/",
        "type": "Halaman",
        "tag": "page",
        "slug": "operasional-akreditasi",
        "localPath": "link/operasional-akreditasi/",
        "externalUrl": ""
      },
      {
        "title": "Patient Registration HomeCare",
        "desc": "Register pasien HomeCare.",
        "url": "link/operasional-patient-registration-homecare/",
        "type": "Sheets",
        "tag": "sheet",
        "sensitive": true,
        "slug": "operasional-patient-registration-homecare",
        "localPath": "link/operasional-patient-registration-homecare/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1dLFISy0AZ46HDScCAzUaQ54g9ifNcXn7UUvbtchnPBk/edit?gid=0"
      },
      {
        "title": "Claim BPJS TK",
        "desc": "Folder foto kondisi pasien BPJS Ketenagakerjaan.",
        "url": "link/operasional-claim-bpjs-tk/",
        "type": "Drive",
        "tag": "drive",
        "sensitive": true,
        "slug": "operasional-claim-bpjs-tk",
        "localPath": "link/operasional-claim-bpjs-tk/",
        "externalUrl": "https://drive.google.com/drive/folders/1BqG8d_EixAMk_5tH0gDiHn-OYOxDaAkr?usp=drive_link"
      },
      {
        "title": "GDrive UGD File",
        "desc": "Folder utama file UGD.",
        "url": "link/operasional-gdrive-ugd-file/",
        "type": "Drive",
        "tag": "drive",
        "slug": "operasional-gdrive-ugd-file",
        "localPath": "link/operasional-gdrive-ugd-file/",
        "externalUrl": "https://drive.google.com/drive/folders/1AOTRHYVs-whgqcu0orfASOT1FTyzoANH?usp=sharing"
      }
    ]
  },
  {
    "id": "jadwal",
    "title": "Jadwal Medis",
    "subtitle": "Jadwal dokter, perawat, dan on-call DPJP IGD.",
    "icon": "📅",
    "items": [
      {
        "title": "Jadwal On Call DPJP IGD",
        "desc": "File jadwal on-call DPJP IGD.",
        "url": "link/jadwal-jadwal-on-call-dpjp-igd/",
        "type": "Drive",
        "tag": "drive",
        "slug": "jadwal-jadwal-on-call-dpjp-igd",
        "localPath": "link/jadwal-jadwal-on-call-dpjp-igd/",
        "externalUrl": "https://drive.google.com/file/d/1l_Q2ezeL6LaJtFBoKh46Qdtuuz_tanzC/view?usp=drive_link"
      },
      {
        "title": "Jadwal Dokter Umum",
        "desc": "Spreadsheet jadwal dokter umum SGH.",
        "url": "link/jadwal-jadwal-dokter-umum/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "jadwal-jadwal-dokter-umum",
        "localPath": "link/jadwal-jadwal-dokter-umum/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1ZUctcT-ivLDZKItQV1MmFRKpGBymmS8_lRioD7qnARY/edit?gid=1779060015"
      },
      {
        "title": "Jadwal Perawat",
        "desc": "Spreadsheet jadwal perawat IGD RS SGH 2026.",
        "url": "link/jadwal-jadwal-perawat/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "jadwal-jadwal-perawat",
        "localPath": "link/jadwal-jadwal-perawat/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1RHwYk8x6YfzlgUieSNN6FhAk6Me1Ae25rqsqdT0nWzE/edit?usp=drive_link"
      }
    ]
  },
  {
    "id": "struktur",
    "title": "Struktur Organisasi",
    "subtitle": "Halaman struktur dan pembagian peran dalam unit emergensi.",
    "icon": "👥",
    "items": [
      {
        "title": "Organizational Structure",
        "desc": "Struktur organisasi dan daftar tim IGD.",
        "url": "link/struktur-organizational-structure/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-organizational-structure",
        "localPath": "link/struktur-organizational-structure/",
        "externalUrl": ""
      },
      {
        "title": "Head of Emergency Department",
        "desc": "Kepala Instalasi/Unit Emergensi.",
        "url": "link/struktur-head-of-emergency-department/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-head-of-emergency-department",
        "localPath": "link/struktur-head-of-emergency-department/",
        "externalUrl": ""
      },
      {
        "title": "Emergency Room Manager",
        "desc": "Manajer ruang IGD dan link manajemen.",
        "url": "link/struktur-emergency-room-manager/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-emergency-room-manager",
        "localPath": "link/struktur-emergency-room-manager/",
        "externalUrl": ""
      },
      {
        "title": "Secretary",
        "desc": "Sekretaris IGD dan dokumen meeting.",
        "url": "link/struktur-secretary/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-secretary",
        "localPath": "link/struktur-secretary/",
        "externalUrl": ""
      },
      {
        "title": "Finance Manager",
        "desc": "Manajer keuangan unit IGD.",
        "url": "link/struktur-finance-manager/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-finance-manager",
        "localPath": "link/struktur-finance-manager/",
        "externalUrl": ""
      },
      {
        "title": "EMR Division",
        "desc": "Divisi EMR IGD.",
        "url": "link/struktur-emr-division/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-emr-division",
        "localPath": "link/struktur-emr-division/",
        "externalUrl": ""
      },
      {
        "title": "Training and Development Division",
        "desc": "Divisi pelatihan dan pengembangan.",
        "url": "link/struktur-training-and-development-division/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-training-and-development-division",
        "localPath": "link/struktur-training-and-development-division/",
        "externalUrl": ""
      },
      {
        "title": "Inventory Division",
        "desc": "Divisi inventaris unit IGD.",
        "url": "link/struktur-inventory-division/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-inventory-division",
        "localPath": "link/struktur-inventory-division/",
        "externalUrl": ""
      },
      {
        "title": "Equipment Maintenance Division",
        "desc": "Divisi pemeliharaan alat.",
        "url": "link/struktur-equipment-maintenance-division/",
        "type": "Halaman",
        "tag": "page",
        "slug": "struktur-equipment-maintenance-division",
        "localPath": "link/struktur-equipment-maintenance-division/",
        "externalUrl": ""
      }
    ]
  },
  {
    "id": "manajemen",
    "title": "Manajemen Unit",
    "subtitle": "Dokumen pendukung manajemen, SDM, meeting, inventaris, dan maintenance.",
    "icon": "🧭",
    "items": [
      {
        "title": "Laporan Kunjungan IGD",
        "desc": "Laporan kunjungan/pelayanan IGD RS SGH.",
        "url": "link/manajemen-laporan-kunjungan-igd/",
        "type": "Sheets",
        "tag": "sheet",
        "sensitive": true,
        "slug": "manajemen-laporan-kunjungan-igd",
        "localPath": "link/manajemen-laporan-kunjungan-igd/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1Lzsf7r-Qgu0dQQ_QMq8tNiCASQX3-ocilMLSvErOP80/edit?gid=0&hl=id"
      },
      {
        "title": "SPK RKK",
        "desc": "Folder SPK dan RKK tenaga kesehatan RS SGH 2026.",
        "url": "link/manajemen-spk-rkk/",
        "type": "Drive",
        "tag": "drive",
        "slug": "manajemen-spk-rkk",
        "localPath": "link/manajemen-spk-rkk/",
        "externalUrl": "https://drive.google.com/drive/folders/1JAnpqMQb9Nag5YhhiKlBk8h1RhP2515j"
      },
      {
        "title": "Data Ambulance",
        "desc": "Folder data ambulans.",
        "url": "link/manajemen-data-ambulance/",
        "type": "Drive",
        "tag": "drive",
        "slug": "manajemen-data-ambulance",
        "localPath": "link/manajemen-data-ambulance/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/18x-MZ-tksmhZd2FN7kjeUianIdFb4UfD"
      },
      {
        "title": "Notulen Meeting",
        "desc": "Folder meeting IGD.",
        "url": "link/manajemen-notulen-meeting/",
        "type": "Drive",
        "tag": "drive",
        "slug": "manajemen-notulen-meeting",
        "localPath": "link/manajemen-notulen-meeting/",
        "externalUrl": "https://drive.google.com/drive/u/0/folders/1JFvOm19Rct65OqY9J9FG-bggsaHM2GYT"
      },
      {
        "title": "SIP Perawat & Bidan",
        "desc": "Spreadsheet SIP perawat dan bidan IGD SGH.",
        "url": "link/manajemen-sip-perawat-and-bidan/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "manajemen-sip-perawat-and-bidan",
        "localPath": "link/manajemen-sip-perawat-and-bidan/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1mILZ0LbHp8Fa7KmOy3KHCSGQznwJk4JZz2hgh_9Q7fw/edit?usp=drive_link"
      },
      {
        "title": "IHT",
        "desc": "Rencana dan bukti pelaksanaan pelatihan IHT.",
        "url": "link/manajemen-iht/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "manajemen-iht",
        "localPath": "link/manajemen-iht/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1w6doKENmyzpjmF3WvqpFIOqqPKZKPBKn66OwHFiqG2s/edit?gid=1681802920"
      },
      {
        "title": "Maintenance Schedule",
        "desc": "Jadwal pemeliharaan peralatan IGD.",
        "url": "link/manajemen-maintenance-schedule/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "manajemen-maintenance-schedule",
        "localPath": "link/manajemen-maintenance-schedule/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1ir63D8GB5FQvTUrhXc2Zcxy0pzMqRVtemPWEY7pJtZA/edit?usp=sharing"
      },
      {
        "title": "Berita Acara Serah Terima Barang",
        "desc": "Folder berita acara serah terima barang.",
        "url": "link/manajemen-berita-acara-serah-terima-barang/",
        "type": "Drive",
        "tag": "drive",
        "slug": "manajemen-berita-acara-serah-terima-barang",
        "localPath": "link/manajemen-berita-acara-serah-terima-barang/",
        "externalUrl": "https://drive.google.com/drive/folders/1naefLJjpFaEwlOZcfWsew8l6YZ6pvVBJ?usp=drive_link"
      },
      {
        "title": "Berita Acara Perbaikan & Permintaan",
        "desc": "Folder BA perbaikan dan permintaan.",
        "url": "link/manajemen-berita-acara-perbaikan-and-permintaan/",
        "type": "Drive",
        "tag": "drive",
        "slug": "manajemen-berita-acara-perbaikan-and-permintaan",
        "localPath": "link/manajemen-berita-acara-perbaikan-and-permintaan/",
        "externalUrl": "https://drive.google.com/drive/folders/1YjwgSk9B-Y7XXslVKqcdxasmhBD2o9Lr?usp=drive_link"
      },
      {
        "title": "Notulensi Morning Report",
        "desc": "Spreadsheet notulen morning report.",
        "url": "link/manajemen-notulensi-morning-report/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "manajemen-notulensi-morning-report",
        "localPath": "link/manajemen-notulensi-morning-report/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/18Ac9z5tJaeNu_GZhMGtop0rwHIvZFqqzg3UC_xcX4R8/edit?usp=sharing"
      },
      {
        "title": "Stok Obat",
        "desc": "Database farmasi/stok obat SGH.",
        "url": "link/manajemen-stok-obat/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "manajemen-stok-obat",
        "localPath": "link/manajemen-stok-obat/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1wjbyoVb2a19boCgN4BTqGNI_xfvWa9ZNj3Y5cSbRkF0/edit?usp=drivesdk"
      }
    ]
  },
  {
    "id": "kebijakan",
    "title": "Policies & Regulasi",
    "subtitle": "Kumpulan regulasi nasional dan kebijakan terkait pelayanan kegawatdaruratan.",
    "icon": "📚",
    "items": [
      {
        "title": "Emergency Department Policies",
        "desc": "Halaman induk kebijakan IGD.",
        "url": "link/kebijakan-emergency-department-policies/",
        "type": "Halaman",
        "tag": "page",
        "slug": "kebijakan-emergency-department-policies",
        "localPath": "link/kebijakan-emergency-department-policies/",
        "externalUrl": ""
      },
      {
        "title": "PMK No 129 Tahun 2008",
        "desc": "Regulasi standar pelayanan minimal rumah sakit.",
        "url": "link/kebijakan-pmk-no-129-tahun-2008/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-pmk-no-129-tahun-2008",
        "localPath": "link/kebijakan-pmk-no-129-tahun-2008/",
        "externalUrl": "https://drive.google.com/file/d/1PL3mronK1LCDNUMxICEmV4osf7atY9mL/view?usp=drive_link"
      },
      {
        "title": "Permenkes No. 290 Tahun 2009",
        "desc": "Persetujuan tindakan kedokteran.",
        "url": "link/kebijakan-permenkes-no-290-tahun-2009/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-permenkes-no-290-tahun-2009",
        "localPath": "link/kebijakan-permenkes-no-290-tahun-2009/",
        "externalUrl": "https://drive.google.com/file/d/1txjX6x39CFFeyCQbZdU8_ZkPGWKpQMOl/view?usp=drive_link"
      },
      {
        "title": "PMK No. 308 Tahun 2017",
        "desc": "Keselamatan pasien.",
        "url": "link/kebijakan-pmk-no-308-tahun-2017/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-pmk-no-308-tahun-2017",
        "localPath": "link/kebijakan-pmk-no-308-tahun-2017/",
        "externalUrl": "https://drive.google.com/file/d/1VY0gkoCWP84uEdyJ7fVYJDHISVcHZHoe/view?usp=drive_link"
      },
      {
        "title": "PMK 47 Tahun 2018",
        "desc": "Pelayanan kegawatdaruratan.",
        "url": "link/kebijakan-pmk-47-tahun-2018/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-pmk-47-tahun-2018",
        "localPath": "link/kebijakan-pmk-47-tahun-2018/",
        "externalUrl": "https://drive.google.com/file/d/1H1OVIauld4Cxq96rbRL7uNKByMkM6OPG/view?usp=drive_link"
      },
      {
        "title": "Permenkes Nomor 4 Tahun 2018",
        "desc": "Regulasi rumah sakit.",
        "url": "link/kebijakan-permenkes-nomor-4-tahun-2018/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-permenkes-nomor-4-tahun-2018",
        "localPath": "link/kebijakan-permenkes-nomor-4-tahun-2018/",
        "externalUrl": "https://drive.google.com/file/d/1I9A2ezg7rbf1Hc6_2yP5jBjOwuoz7Oh_/view?usp=drive_link"
      },
      {
        "title": "Permenkes Nomor 4 Tahun 2019",
        "desc": "Regulasi standar teknis mutu pelayanan dasar.",
        "url": "link/kebijakan-permenkes-nomor-4-tahun-2019/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-permenkes-nomor-4-tahun-2019",
        "localPath": "link/kebijakan-permenkes-nomor-4-tahun-2019/",
        "externalUrl": "https://drive.google.com/file/d/1dVFGsyqIvcCgVz1BeSUKGhs7EeS7XFbL/view?usp=drive_link"
      },
      {
        "title": "Permenkes Nomor 24 Tahun 2022",
        "desc": "Rekam medis.",
        "url": "link/kebijakan-permenkes-nomor-24-tahun-2022/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-permenkes-nomor-24-tahun-2022",
        "localPath": "link/kebijakan-permenkes-nomor-24-tahun-2022/",
        "externalUrl": "https://drive.google.com/file/d/1t69qkdgGLoTfBJwy40PapwEqVi0ZN72s/view?usp=drive_link"
      },
      {
        "title": "Undang-Undang Nomor 17 Tahun 2023",
        "desc": "Undang-undang kesehatan.",
        "url": "link/kebijakan-undang-undang-nomor-17-tahun-2023/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-undang-undang-nomor-17-tahun-2023",
        "localPath": "link/kebijakan-undang-undang-nomor-17-tahun-2023/",
        "externalUrl": "https://drive.google.com/file/d/1ggIxaWKHAyX-NBnpVwcvrUAIHofau69S/view?usp=drive_link"
      },
      {
        "title": "KMK No.HK.01.07/MENKES/1596/2024",
        "desc": "Keputusan Menteri Kesehatan.",
        "url": "link/kebijakan-kmk-no-hk-01-07-menkes-1596-2024/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-kmk-no-hk-01-07-menkes-1596-2024",
        "localPath": "link/kebijakan-kmk-no-hk-01-07-menkes-1596-2024/",
        "externalUrl": "https://drive.google.com/file/d/1x6ZFWX79aCrqzPlGtjk_rmuRD3f10-v0/view?usp=drive_link"
      },
      {
        "title": "PP Nomor 28 Tahun 2024",
        "desc": "Peraturan Pemerintah bidang kesehatan.",
        "url": "link/kebijakan-pp-nomor-28-tahun-2024/",
        "type": "Regulasi",
        "tag": "policy",
        "slug": "kebijakan-pp-nomor-28-tahun-2024",
        "localPath": "link/kebijakan-pp-nomor-28-tahun-2024/",
        "externalUrl": "https://drive.google.com/file/d/1HT8X2Z0dO_mLsUer6e13pwBeb5HohY62/view?usp=drive_link"
      }
    ]
  },
  {
    "id": "pedoman",
    "title": "Pedoman, SPO & Form",
    "subtitle": "Pedoman pelayanan, pengorganisasian, triage, SPO, formulir, dan employee file.",
    "icon": "📝",
    "items": [
      {
        "title": "Emergency Department Guidelines",
        "desc": "Halaman pedoman IGD.",
        "url": "link/pedoman-emergency-department-guidelines/",
        "type": "Halaman",
        "tag": "page",
        "slug": "pedoman-emergency-department-guidelines",
        "localPath": "link/pedoman-emergency-department-guidelines/",
        "externalUrl": ""
      },
      {
        "title": "Pedoman Pelayanan IGD",
        "desc": "Pedoman pelayanan UGD RS SGH.",
        "url": "link/pedoman-pedoman-pelayanan-igd/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-pedoman-pelayanan-igd",
        "localPath": "link/pedoman-pedoman-pelayanan-igd/",
        "externalUrl": "https://drive.google.com/file/d/1q2UvC1CmIDcx5crCz_jrupnPeH5an_po/view?usp=drive_link"
      },
      {
        "title": "Pedoman Pengorganisasian IGD",
        "desc": "Pedoman pengorganisasian unit IGD.",
        "url": "link/pedoman-pedoman-pengorganisasian-igd/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-pedoman-pengorganisasian-igd",
        "localPath": "link/pedoman-pedoman-pengorganisasian-igd/",
        "externalUrl": "https://drive.google.com/file/d/1OEYocDn5a27mGt9Ryjx4CN_g5-yJpbHg/view?usp=drive_link"
      },
      {
        "title": "Panduan Triage",
        "desc": "Panduan triase IGD.",
        "url": "link/pedoman-panduan-triage/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-panduan-triage",
        "localPath": "link/pedoman-panduan-triage/",
        "externalUrl": "https://drive.google.com/file/d/1yho-rIrcwMwaU2Aq1AuXr9SXiTlgFDBz/view?usp=drive_link"
      },
      {
        "title": "Emergency Department SOP",
        "desc": "Halaman SPO IGD.",
        "url": "link/pedoman-emergency-department-sop/",
        "type": "Halaman",
        "tag": "page",
        "slug": "pedoman-emergency-department-sop",
        "localPath": "link/pedoman-emergency-department-sop/",
        "externalUrl": ""
      },
      {
        "title": "SPO IGD",
        "desc": "Folder SPO Pelayanan IGD.",
        "url": "link/pedoman-spo-igd/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-spo-igd",
        "localPath": "link/pedoman-spo-igd/",
        "externalUrl": "https://drive.google.com/drive/folders/1nohEj1Nyxq_pMrglIyy_Otpk0L3vRi-p?usp=drive_link"
      },
      {
        "title": "SPO PONEX",
        "desc": "Folder SPO PONEX.",
        "url": "link/pedoman-spo-ponex/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-spo-ponex",
        "localPath": "link/pedoman-spo-ponex/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/1uzvl3Ho0ju8w2rS8RgYo3oF8FYw4o76Q"
      },
      {
        "title": "SPO Pemulasaran",
        "desc": "Folder SPO pemulasaran.",
        "url": "link/pedoman-spo-pemulasaran/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-spo-pemulasaran",
        "localPath": "link/pedoman-spo-pemulasaran/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/1cz6eqcV9RZgz4KNj95Q0ve4jY0UGmfSR"
      },
      {
        "title": "Assessment Form",
        "desc": "Halaman assessment form.",
        "url": "link/pedoman-assessment-form/",
        "type": "Halaman",
        "tag": "page",
        "slug": "pedoman-assessment-form",
        "localPath": "link/pedoman-assessment-form/",
        "externalUrl": ""
      },
      {
        "title": "Form IGD",
        "desc": "Folder formulir IGD/UGD.",
        "url": "link/pedoman-form-igd/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-form-igd",
        "localPath": "link/pedoman-form-igd/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/1gDY3QqhHOh5GT_JRnwYLC69R5sRR11wZ"
      },
      {
        "title": "Employee File",
        "desc": "Halaman employee file.",
        "url": "link/pedoman-employee-file/",
        "type": "Halaman",
        "tag": "page",
        "slug": "pedoman-employee-file",
        "localPath": "link/pedoman-employee-file/",
        "externalUrl": ""
      },
      {
        "title": "Dokter",
        "desc": "Folder employee file dokter.",
        "url": "link/pedoman-dokter/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-dokter",
        "localPath": "link/pedoman-dokter/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/1r2hr3g-1NP6f00YG6yDrPLn4aSkOoqiM"
      },
      {
        "title": "Perawat",
        "desc": "Folder employee file perawat.",
        "url": "link/pedoman-perawat/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-perawat",
        "localPath": "link/pedoman-perawat/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/16-mNpfXIiMrkP6yLGj4Pg5lfHxntRRAC"
      },
      {
        "title": "Bidan",
        "desc": "Folder employee file bidan.",
        "url": "link/pedoman-bidan/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-bidan",
        "localPath": "link/pedoman-bidan/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/1VktmNNEwgDjZX-sMwCCMLVU5C5zQk4YJ"
      },
      {
        "title": "Driver",
        "desc": "Folder employee file driver.",
        "url": "link/pedoman-driver/",
        "type": "Drive",
        "tag": "drive",
        "slug": "pedoman-driver",
        "localPath": "link/pedoman-driver/",
        "externalUrl": "https://drive.google.com/drive/u/1/folders/1il-5fH5raVCJ-QyYoZYtPSXXaL71_zjO"
      }
    ]
  },
  {
    "id": "akreditasi",
    "title": "Akreditasi",
    "subtitle": "Dashboard dokumen akreditasi, regulasi, jadwal, instrumen, dan PPS.",
    "icon": "🏥",
    "items": [
      {
        "title": "PIC Per Elemen",
        "desc": "Pembagian PIC per elemen akreditasi.",
        "url": "link/akreditasi-pic-per-elemen/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "akreditasi-pic-per-elemen",
        "localPath": "link/akreditasi-pic-per-elemen/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/17Ua28p-JfhNmndYfURVg_UlpFJowVOHjS4g_tsItV8M/edit?usp=sharing"
      },
      {
        "title": "Web Akreditasi",
        "desc": "Website akreditasi.",
        "url": "link/akreditasi-web-akreditasi/",
        "type": "Website",
        "tag": "website",
        "slug": "akreditasi-web-akreditasi",
        "localPath": "link/akreditasi-web-akreditasi/",
        "externalUrl": "https://www.akreditasi.rf.gd/"
      },
      {
        "title": "AKP Akreditasi",
        "desc": "Folder AKP Akreditasi SGH.",
        "url": "link/akreditasi-akp-akreditasi/",
        "type": "Drive",
        "tag": "drive",
        "slug": "akreditasi-akp-akreditasi",
        "localPath": "link/akreditasi-akp-akreditasi/",
        "externalUrl": "https://drive.google.com/drive/folders/1OnWWMqgkjTD74k0rObD6o6c62wG9D0de?usp=sharing"
      },
      {
        "title": "Daftar Regulasi",
        "desc": "Daftar regulasi SGH.",
        "url": "link/akreditasi-daftar-regulasi/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "akreditasi-daftar-regulasi",
        "localPath": "link/akreditasi-daftar-regulasi/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1d8GBfogitrZat-FSbKrkufnIpCrsEE3syNK0NH-TCsY/edit?usp=sharing"
      },
      {
        "title": "Time Line & Tim Akreditasi",
        "desc": "Timeline dan tim persiapan akreditasi.",
        "url": "link/akreditasi-time-line-and-tim-akreditasi/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "akreditasi-time-line-and-tim-akreditasi",
        "localPath": "link/akreditasi-time-line-and-tim-akreditasi/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1lqYTxiTeDTukonoyZTdAyl5j9jeq3kKEZ9-Jb1RWjHw/edit?gid=1857104022"
      },
      {
        "title": "GDrive Akreditasi",
        "desc": "Folder akreditasi RS SGH 2025.",
        "url": "link/akreditasi-gdrive-akreditasi/",
        "type": "Drive",
        "tag": "drive",
        "slug": "akreditasi-gdrive-akreditasi",
        "localPath": "link/akreditasi-gdrive-akreditasi/",
        "externalUrl": "https://drive.google.com/drive/folders/1Ux9EJhwMV6p2lgBgKRSvDkukvXJlkvS9"
      },
      {
        "title": "Jadwal Karantina",
        "desc": "Spreadsheet jadwal karantina akreditasi.",
        "url": "link/akreditasi-jadwal-karantina/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "akreditasi-jadwal-karantina",
        "localPath": "link/akreditasi-jadwal-karantina/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1EusR9tOuizy26OvuqZ4oso6inkw4ZjRbpYlu-z-46nA/edit?usp=sharing"
      },
      {
        "title": "Daftar Pertanyaan",
        "desc": "Daftar pertanyaan akreditasi.",
        "url": "link/akreditasi-daftar-pertanyaan/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "akreditasi-daftar-pertanyaan",
        "localPath": "link/akreditasi-daftar-pertanyaan/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1ZvVzZddY1Ls8bFZkacPbQqBPyV7qq0Yh-jnb-MhBVjw/edit?usp=drivesdk"
      },
      {
        "title": "Instrumen Akreditasi RS",
        "desc": "PDF instrumen akreditasi rumah sakit.",
        "url": "link/akreditasi-instrumen-akreditasi-rs/",
        "type": "Drive",
        "tag": "drive",
        "slug": "akreditasi-instrumen-akreditasi-rs",
        "localPath": "link/akreditasi-instrumen-akreditasi-rs/",
        "externalUrl": "https://drive.google.com/file/d/16wNS5wQHn-lSBEo-_kVRgQM1mWX0-bhl/view?usp=drive_link"
      },
      {
        "title": "Standar Akreditasi Rumah Sakit",
        "desc": "PDF standar akreditasi rumah sakit.",
        "url": "link/akreditasi-standar-akreditasi-rumah-sakit/",
        "type": "Drive",
        "tag": "drive",
        "slug": "akreditasi-standar-akreditasi-rumah-sakit",
        "localPath": "link/akreditasi-standar-akreditasi-rumah-sakit/",
        "externalUrl": "https://drive.google.com/file/d/1wyC5KLYoZna1U3BmMA_Sp_IwM3JjLg_o/view?usp=drive_link"
      },
      {
        "title": "Form RM",
        "desc": "Daftar formulir rekam medis SGH.",
        "url": "link/akreditasi-form-rm/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "akreditasi-form-rm",
        "localPath": "link/akreditasi-form-rm/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1uGAN3c5rSUDEJT3N_POTf-i09fxOrj_G8yZTDFrC-uQ/edit?gid=382917113"
      },
      {
        "title": "Daftar Nomor Regulasi",
        "desc": "Daftar penomoran RS SGH.",
        "url": "link/akreditasi-daftar-nomor-regulasi/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "akreditasi-daftar-nomor-regulasi",
        "localPath": "link/akreditasi-daftar-nomor-regulasi/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1X4cge_zt1birOYIrZiXf_r6F23sMXlK6JIRhVRvSe18/edit?gid=2062175656&pli=1"
      },
      {
        "title": "PPS",
        "desc": "Perencanaan Perbaikan Strategis RS SGH.",
        "url": "link/akreditasi-pps/",
        "type": "Sheets",
        "tag": "sheet",
        "slug": "akreditasi-pps",
        "localPath": "link/akreditasi-pps/",
        "externalUrl": "https://docs.google.com/spreadsheets/d/1zzD7n9zNwK9PK8rcNrvQwI2pfdu9vW0oUUOInS19CNw/edit?gid=1018308196"
      },
      {
        "title": "Pemenuhan PPS",
        "desc": "Folder pemenuhan PPS.",
        "url": "link/akreditasi-pemenuhan-pps/",
        "type": "Drive",
        "tag": "drive",
        "slug": "akreditasi-pemenuhan-pps",
        "localPath": "link/akreditasi-pemenuhan-pps/",
        "externalUrl": "https://drive.google.com/drive/folders/1BRf_7ei73SRtK1p34HSiFn-G7ZMSKsmf"
      }
    ]
  }
];
