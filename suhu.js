// Input suhu & kelembapan ruang IGD per shift → Form Monitoring Suhu IGD (Google Sheet, satu tab per bulan)
(function () {
  const R = () => window.RegForm;
  const esc = (v) => R().esc(v);
  const root = () => document.getElementById('suhuRoot');
  const token = () => { try { const t = JSON.parse(localStorage.getItem('input_token_v1') || 'null'); if (t && t.sampai > Date.now()) return t.token; } catch (e) {} return ''; };
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const SHIFT = [['pagi', '☀️ Pagi', '07–14'], ['siang', '🌤 Siang', '14–21'], ['malam', '🌙 Malam', '21–07']];
  const SHEET = 'https://docs.google.com/spreadsheets/d/1ZsYjDGx_zfm6hKRXqO7IiR7qO1vcbfWp-2cwR0QeGOY/edit';
  const KEY_CACHE = 'suhu_bulan_v1';

  // Waktu WIB sekarang
  function wib() {
    const f = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
    return { tgl: f.slice(0, 10), jam: +f.slice(11, 13) };
  }
  const geserTgl = (tgl, n) => { const d = new Date(tgl + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  // Shift berjalan; shift malam setelah tengah malam tetap dicatat di tanggal mulai shift
  function shiftSekarang() {
    const w = wib();
    if (w.jam >= 7 && w.jam < 14) return { shift: 'pagi', tgl: w.tgl };
    if (w.jam >= 14 && w.jam < 21) return { shift: 'siang', tgl: w.tgl };
    return { shift: 'malam', tgl: w.jam < 7 ? geserTgl(w.tgl, -1) : w.tgl };
  }

  let bulanTampil = wib().tgl.slice(0, 7), dataBulan = null;

  function tampil() {
    const s = shiftSekarang();
    root().innerHTML = `
      <form class="pt-card sh-form" novalidate>
        <h2>Catat suhu ruangan</h2>
        <div class="sh-baris">
          <label>Tanggal<input type="date" name="tanggal" value="${s.tgl}" max="${wib().tgl}" required></label>
        </div>
        <div class="sh-shift" role="radiogroup" aria-label="Shift">
          ${SHIFT.map(([v, l, j]) => `<label class="sh-pil"><input type="radio" name="shift" value="${v}" ${v === s.shift ? 'checked' : ''}><span>${l}<small>${j}</small></span></label>`).join('')}
        </div>
        <div class="sh-baris sh-dua">
          <label>Suhu (°C)<input name="suhu" inputmode="decimal" placeholder="mis. 24,5" autocomplete="off" required></label>
          <label>Kelembapan (%)<input name="kelembapan" inputmode="numeric" placeholder="mis. 55" autocomplete="off" required></label>
        </div>
        <button class="primary-btn" type="submit">Simpan</button>
        <p class="rf-err" role="alert"></p>
        <p class="rf-info">Shift otomatis sesuai jam sekarang; ubah bila mengisi untuk shift lain. Diisi 1 jam setelah operan jaga.</p>
      </form>
      <div class="pt-card sh-tabel-wadah">
        <div class="sh-judul-bulan">
          <button type="button" class="sh-nav" data-geser="-1" aria-label="Bulan sebelumnya">‹</button>
          <h2 id="shJudul">${namaBulan(bulanTampil)}</h2>
          <button type="button" class="sh-nav" data-geser="1" aria-label="Bulan berikutnya">›</button>
        </div>
        <div id="shTabel"><p class="pt-sub">Memuat…</p></div>
      </div>`;
    const f = root().querySelector('form');
    f.addEventListener('submit', (ev) => { ev.preventDefault(); simpan(f); });
    root().querySelectorAll('[data-geser]').forEach((b) => b.addEventListener('click', () => {
      const [y, m] = bulanTampil.split('-').map(Number);
      const d = new Date(Date.UTC(y, m - 1 + +b.dataset.geser, 1));
      const baru = d.toISOString().slice(0, 7);
      if (baru > wib().tgl.slice(0, 7)) return;
      bulanTampil = baru; muat();
    }));
    muat();
  }
  const namaBulan = (ym) => BULAN[+ym.slice(5, 7) - 1] + ' ' + ym.slice(0, 4);
  const angka = (x) => (x === '' || x == null ? '' : String(x).replace('.', ','));

  async function muat() {
    const judul = document.getElementById('shJudul'); if (judul) judul.textContent = namaBulan(bulanTampil);
    const wadah = document.getElementById('shTabel');
    try { const c = JSON.parse(localStorage.getItem(KEY_CACHE) || 'null'); if (c && c.bulan === bulanTampil) tabel(c.d); } catch (e) {}
    const minta = bulanTampil;
    let d;
    try {
      const res = await fetch(R().API_URL + '?aksi=suhuBulan&bulan=' + minta + '&token=' + encodeURIComponent(token()) + '&_=' + Date.now());
      d = await res.json();
    } catch (e) { d = { error: 'Gagal memuat: ' + e.message }; }
    if (minta !== bulanTampil) return;
    if (d.error) { wadah.innerHTML = '<p class="pt-error">' + esc(d.error === 'aksi tidak dikenal' ? 'Server Apps Script belum diperbarui: Deploy → Manage deployments → Edit → New version → Deploy.' : d.error) + '</p>'; return; }
    try { localStorage.setItem(KEY_CACHE, JSON.stringify({ bulan: minta, d })); } catch (e) {}
    tabel(d);
  }

  function tabel(d) {
    dataBulan = d;
    const wadah = document.getElementById('shTabel');
    if (!d.tab) { wadah.innerHTML = '<p class="pt-sub">Tab bulan ini belum ada di sheet. Tab akan dibuat otomatis saat data pertama disimpan.</p>'; return; }
    const a = document.getElementById('suhuSheet'); if (a && d.gid != null) a.href = SHEET + '#gid=' + d.gid;
    const s = shiftSekarang(), hariIni = wib().tgl;
    const sel = (x, tgl, sh) => {
      const ada = x[0] !== '' || x[1] !== '';
      const tglStr = bulanTampil + '-' + String(tgl).padStart(2, '0');
      const lewat = tglStr < s.tgl || (tglStr === s.tgl && ['pagi', 'siang', 'malam'].indexOf(sh) < ['pagi', 'siang', 'malam'].indexOf(s.shift));
      const kini = tglStr === s.tgl && sh === s.shift;
      return `<td class="${ada ? '' : kini ? 'sh-kini' : lewat ? 'sh-kosong' : ''}">${ada ? angka(x[0]) + '°<small>' + angka(x[1]) + '%</small>' : kini ? 'isi sekarang' : lewat ? '–' : ''}</td>`;
    };
    const kosong = d.hari.reduce((n, h) => n + ['pagi', 'siang', 'malam'].filter((sh) => {
      const tglStr = bulanTampil + '-' + String(h.tgl).padStart(2, '0');
      const lewat = tglStr < s.tgl || (tglStr === s.tgl && ['pagi', 'siang', 'malam'].indexOf(sh) < ['pagi', 'siang', 'malam'].indexOf(s.shift));
      return lewat && h[sh][0] === '' && h[sh][1] === '';
    }).length, 0);
    const tampilHari = d.hari.filter((h) => bulanTampil + '-' + String(h.tgl).padStart(2, '0') <= hariIni).reverse();
    wadah.innerHTML = `<p class="pt-sub">Tab: ${esc(d.tab)} · ${kosong ? '<b class="sh-merah">' + kosong + ' isian terlewat</b>' : 'tidak ada yang terlewat'} · terbaru di atas</p>
      <div class="sh-scroll"><table class="sh-tabel"><thead><tr><th>Tgl</th><th>Pagi</th><th>Siang</th><th>Malam</th></tr></thead>
      <tbody>${tampilHari.map((h) => `<tr><th>${h.tgl}</th>${sel(h.pagi, h.tgl, 'pagi')}${sel(h.siang, h.tgl, 'siang')}${sel(h.malam, h.tgl, 'malam')}</tr>`).join('')}</tbody></table></div>`;
  }

  async function simpan(f, timpa) {
    const fd = new FormData(f);
    const err = f.querySelector('.rf-err'); err.textContent = '';
    const body = { aksi: 'suhu', token: token(), tanggal: fd.get('tanggal'), shift: fd.get('shift'), suhu: String(fd.get('suhu') || '').trim(), kelembapan: String(fd.get('kelembapan') || '').trim(), timpa: !!timpa };
    if (!body.suhu || !body.kelembapan) { err.textContent = 'Isi suhu dan kelembapan.'; return; }
    const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Menyimpan…';
    try {
      const r = await R().post(body);
      if (r.perluTimpa) {
        const lama = (r.lama || []).map(angka);
        if (confirm('Shift ' + body.shift + ' tanggal ' + +body.tanggal.slice(8) + ' sudah terisi: ' + lama[0] + ' °C / ' + lama[1] + ' %.\nGanti dengan ' + body.suhu + ' °C / ' + body.kelembapan + ' %?')) { btn.disabled = false; btn.textContent = 'Simpan'; return simpan(f, true); }
        err.textContent = 'Tidak disimpan (data lama dipertahankan).';
        return;
      }
      if (r.error) throw new Error(r.error === 'aksi tidak dikenal' ? 'Server Apps Script belum diperbarui.' : r.error);
      err.innerHTML = '<span class="rf-ok">✓ Tersimpan: ' + esc(r.tab) + ', tgl ' + r.tanggal + ', shift ' + esc(r.shift) + ' — ' + angka(r.suhu) + ' °C / ' + r.kelembapan + ' %</span>';
      f.querySelector('[name=suhu]').value = ''; f.querySelector('[name=kelembapan]').value = '';
      bulanTampil = body.tanggal.slice(0, 7); muat();
    } catch (e) {
      err.textContent = 'Belum tersimpan: ' + e.message;
    } finally {
      btn.disabled = false; btn.textContent = 'Simpan';
    }
  }

  document.addEventListener('DOMContentLoaded', tampil);
})();
