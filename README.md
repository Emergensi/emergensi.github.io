# Emergency Unit SGH — Dashboard Internal IGD

Website statis (GitHub Pages) berisi tautan kerja IGD Sedayu General Hospital: operasional, jadwal, struktur organisasi, kebijakan dan regulasi, pedoman/SPO/form, serta akreditasi.

Alamat: https://emergensi.github.io/

## Struktur file

```text
index.html          Beranda
login.html          Halaman login
auth.js             Pemeriksaan login (sisi browser)
data.js             Daftar seluruh tautan per kategori
app.js              Penampil kartu, pencarian, dan navigasi
style.css           Tampilan
<kategori>/         Halaman per kategori (operasional, jadwal, dst.)
link/<slug>/        Halaman detail per tautan
assets/             Logo, ikon, dan manifest aplikasi
```

## Menambah atau mengubah tautan

Edit `data.js`. Setiap tautan memiliki `title`, `desc`, `type`, `tag`, dan `externalUrl` (alamat Drive/Sheets/sistem). Simpan, lalu situs akan ter-update otomatis beberapa menit setelah commit.

## Catatan keamanan

Repository ini publik. Login di situs ini hanya membatasi tampilan dan **bukan** pengaman data, karena seluruh isi repository (termasuk `data.js`) dapat dibaca siapa saja.

- Jangan menulis username, password, atau token di file mana pun di repository ini.
- Perlindungan sebenarnya ada pada pengaturan berbagi tiap file Google Drive: batasi ke akun tertentu, bukan "siapa saja yang memiliki link".
- Jangan mencantumkan data pasien, alamat server internal, atau dokumen kepegawaian yang bersifat rahasia.
