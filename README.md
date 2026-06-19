# Emergency Unit SGH — GitHub Pages

Website statis landing page IGD/UGD dengan halaman login ringan berbasis JavaScript.

## Login

- Username: `IGD`
- Password: `321`

## Struktur file

```text
index.html
login.html
auth.js
app.js
style.css
.nojekyll
README_DEPLOY.md
```

## Cara upload ke GitHub Pages

### Opsi A — Repository baru khusus IGD

1. Buat repository baru, misalnya `IGD` atau `emergency-unit`.
2. Upload semua file dari folder ini ke root repository.
3. Masuk ke **Settings → Pages**.
4. Pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/root`.
6. Simpan.
7. URL biasanya menjadi:

```text
https://nkhafidz.github.io/IGD/
```

### Opsi B — Di dalam repository `nkhafidz.github.io`

1. Buat folder baru, misalnya `igd`.
2. Upload semua file ke dalam folder `igd`.
3. URL menjadi:

```text
https://nkhafidz.github.io/igd/
```

### Opsi C — Mengganti halaman utama akun

Upload semua file ke root repository `nkhafidz.github.io`. Ini akan mengganti website utama di:

```text
https://nkhafidz.github.io/
```

## Catatan teknis

GitHub Pages adalah hosting statis untuk HTML, CSS, dan JavaScript. Login di file ini adalah login ringan berbasis JavaScript, cocok untuk membatasi tampilan umum, tetapi bukan pengganti autentikasi server-side/VPN untuk data klinis atau link sensitif.
