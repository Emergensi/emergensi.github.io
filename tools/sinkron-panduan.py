#!/usr/bin/env python3
"""Sinkronkan Panduan Dokumentasi Klinis SGH dengan versi terbaru di rssacasemix.github.io.

Pemakaian (dari folder repo emergensi.github.io):
    python3 tools/sinkron-panduan.py [versi-cache]

Skrip menarik rssacasemix.github.io/panduan-dokumentasi/index.html (clone sementara),
lalu menulis ulang panduan-dokumentasi/{index.html, pd.css, pd-data.js, pd-app.js} dengan
penyesuaian SGH: identitas RS, tampilan situs IGD, tarif INA-CBG disembunyikan
(TAMPILKAN_TARIF), dan backend Apps Script IGD (aksi pdSimpan/pdMasukan/pdRekap).

Skrip memotong file sumber berdasarkan NOMOR BARIS dan teks yang harus cocok persis.
Bila RSSA mengubah struktur halamannya, skrip berhenti dengan pesan "Expected ..." —
artinya batas baris atau teks penggantinya perlu disesuaikan dulu, bukan dipaksa.
"""
import re, sys, pathlib, subprocess, tempfile

REPO = pathlib.Path(__file__).resolve().parent.parent
OUT = REPO / 'panduan-dokumentasi'
OUT.mkdir(exist_ok=True)
_tmp = tempfile.mkdtemp(prefix='rssa-')
subprocess.run(['git', 'clone', '-q', '--depth', '1', 'https://github.com/rssacasemix/rssacasemix.github.io', _tmp], check=True)
SRC = pathlib.Path(_tmp) / 'panduan-dokumentasi' / 'index.html'
lines = SRC.read_text(encoding='utf-8').split('\n')

def L(a, b):  # 1-based inclusive
    return '\n'.join(lines[a-1:b])

def must_replace(s, old, new, count=1):
    n = s.count(old)
    if n != count:
        sys.exit(f'Expected {count}x, found {n}x: {old[:80]!r}')
    return s.replace(old, new)

# ---------------------------------------------------------------- DATA
data = L(280, 2422)   # const CASES ... DOC_GUIDES ];
assert data.lstrip().startswith('const CASES'), data[:40]
assert data.rstrip().endswith('];'), data[-40:]
data = must_replace(data, 'sumber:"Buku Koding RSUD Saras Adyatma — Catatan After Verif Internal"',
                    'sumber:"Buku Koding RS — Catatan After Verif Internal"')
data = must_replace(data, 'sumber:"PPK RSUD Saras Adyatma No. 001/PPK/B/2023"',
                    'sumber:"PPK RS No. 001/PPK/B/2023"')
data = must_replace(data, 'sumber:"Clinical Pathway HIV-AIDS RSUD Saras Adyatma"',
                    'sumber:"Clinical Pathway HIV-AIDS RS"')
assert 'Saras' not in data and 'RSSA' not in data
(OUT / 'pd-data.js').write_text(
    '// Data Panduan Dokumentasi Klinis — kasus dispute, panduan dokumentasi, master ICD-10 & ICD-9-CM, Buku Koding RS.\n'
    '// Dipisah dari logika (pd-app.js) supaya mudah diperbarui.\n' + data + '\n', encoding='utf-8')

# ---------------------------------------------------------------- LOGIC
logic = L(2424, 3119)
assert logic.startswith('// ===================== HELPERS')

header = r"""// Panduan Dokumentasi Klinis — Emergency Unit SGH (diadaptasi dari alat Casemix).
// Data ada di pd-data.js. Penyimpanan episode, rekap, dan masukan memakai Apps Script IGD (aksi pd*).

// ===================== KONFIGURASI =====================
const API_URL = 'https://script.google.com/macros/s/AKfycbzdXDcOLMnBj5kuhINSpVRKpQ1RWwdOhXuPfEOxd11b7s9yRWVjU3f8T744OyaQgxtJUw/exec';
// Tarif INA-CBG kelas 1–3 pada tabel Buku Koding. Ubah ke true bila ingin ditampilkan lagi.
const TAMPILKAN_TARIF = false;

// ===================== BACKEND IGD =====================
function escPd(v){ return String(v == null ? '' : v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
// Token dari Akses Pimpinan (pantau/input) atau perangkat staf yang sudah didaftarkan.
function pdToken(){
  for (const k of ['pantau_token_v1','input_token_v1','perangkat_token_v1']){
    try { const t = JSON.parse(localStorage.getItem(k) || 'null'); if (t && t.token && (!t.sampai || t.sampai > Date.now())) return t.token; } catch(e){}
  }
  return '';
}
const PD_TANPA_TOKEN = 'Belum tersambung ke server IGD. Simpan/rekap hanya bisa dari perangkat yang masuk lewat Akses Pimpinan atau perangkat staf yang sudah didaftarkan. Panduan & checklist tetap bisa dipakai tanpa ini.';
function pdPesanError(err){
  if (err === 'token' || err === 'khusus pimpinan') return 'Sesi server IGD habis atau belum ada. Klik Keluar lalu masuk lagi lewat Akses Pimpinan (atau daftarkan perangkat staf).';
  if (/aksi tidak dikenal/i.test(err || '')) return 'Server Apps Script belum diperbarui: tempel PanduanDokumentasi.gs + baris pemanggilnya di file utama, lalu Deploy → New version.';
  return err;
}
async function pdBacaJson(res){
  const teks = await res.text();
  try { return JSON.parse(teks); } catch(e){ throw new Error('Server Apps Script membalas error. Coba lagi sebentar; bila tetap, deploy ulang (New version).'); }
}
async function pdPost(aksi, isi){
  const token = pdToken();
  if (!token) throw new Error(PD_TANPA_TOKEN);
  const d = await pdBacaJson(await fetch(API_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify(Object.assign({ aksi, token }, isi)) }));
  if (d.error) throw new Error(pdPesanError(d.error));
  return d;
}
async function pdGet(aksi, params){
  const token = pdToken();
  if (!token) throw new Error(PD_TANPA_TOKEN);
  const q = new URLSearchParams(Object.assign({ aksi, token, _: Date.now() }, params || {}));
  const d = await pdBacaJson(await fetch(API_URL + '?' + q.toString()));
  if (d.error) throw new Error(pdPesanError(d.error));
  return d;
}

"""

# --- Buku Koding: kolom tarif bersyarat
logic = must_replace(logic, """      <td>${r.inacbg||'-'}</td>
      <td style="text-align:right;">${r.kelas1||'-'}</td>
      <td style="text-align:right;">${r.kelas2||'-'}</td>
      <td style="text-align:right;">${r.kelas3||'-'}</td>
    </tr>`).join('');""", """      <td>${r.inacbg||'-'}</td>${TAMPILKAN_TARIF ? `
      <td style="text-align:right;">${r.kelas1||'-'}</td>
      <td style="text-align:right;">${r.kelas2||'-'}</td>
      <td style="text-align:right;">${r.kelas3||'-'}</td>` : ''}
    </tr>`).join('');""")
logic = must_replace(logic, "untuk melihat pola kombinasi &amp; tarif kelas yang biasa dipakai untuk diagnosis primer ini.",
                     "untuk melihat pola kombinasi${TAMPILKAN_TARIF ? ' &amp; tarif kelas' : ''} yang biasa dipakai untuk diagnosis primer ini.")
logic = must_replace(logic, """      <table style="font-size:.78rem; min-width:700px;">
        <thead><tr><th>Bagian</th><th>Diagnosis Utama</th><th>Diagnosis Sekunder</th><th>Tindakan</th><th>Sev.</th><th>Kode InaCBG</th><th>Kelas 1</th><th>Kelas 2</th><th>Kelas 3</th></tr></thead>""",
"""      <table style="font-size:.78rem; min-width:${TAMPILKAN_TARIF ? 700 : 520}px;">
        <thead><tr><th>Bagian</th><th>Diagnosis Utama</th><th>Diagnosis Sekunder</th><th>Tindakan</th><th>Sev.</th><th>Kode InaCBG</th>${TAMPILKAN_TARIF ? '<th>Kelas 1</th><th>Kelas 2</th><th>Kelas 3</th>' : ''}</tr></thead>""")

# --- Masukan
old_masukan = logic[logic.index("  if(APPS_SCRIPT_URL.includes('GANTI_DENGAN')){\n    alert('Backend Google Sheets belum disetel — masukan"):logic.index("    alert('Masukan terkirim. Terima kasih!');")]
new_masukan = """  const all = allEntries();
  const daftarDiagnosis = all.length ? all.map(e=>e.text).join(' | ') : '(tidak ada entri saat mengisi masukan)';
  const tombol = document.querySelector('#masukanGlobalCard button.primary');
  if (tombol) tombol.disabled = true;
  try{
    await pdPost('pdMasukan', { data: {
      id: 'masukan_' + Date.now(),
      tanggal: new Date().toISOString().slice(0,10),
      bagian: 'IGD',
      diagnosis: daftarDiagnosis,
      masukan: txt
    }});
"""
logic = logic.replace(old_masukan, new_masukan)
logic = must_replace(logic, """  }catch(e){
    alert('Gagal mengirim masukan: ' + e.message);
  }
}""", """  }catch(e){
    alert('Gagal mengirim masukan: ' + e.message);
  }finally{ if (tombol) tombol.disabled = false; }
}""")

# --- Simpan episode
logic = must_replace(logic, """  if(APPS_SCRIPT_URL.includes('GANTI_DENGAN')){ alert('Backend Google Sheets belum disetel. Lihat komentar APPS_SCRIPT_URL di bagian atas kode.'); return; }
  const record = { id: 'audit_' + Date.now(), tanggal: new Date().toISOString().slice(0,10), items: currentEpisode, status: overallStatus(currentEpisode) };
  try{
    await fetch(APPS_SCRIPT_URL, { method:'POST', body: JSON.stringify(record) });""",
"""  const tglLokal = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const record = { id: 'audit_' + Date.now(), tanggal: tglLokal, items: currentEpisode, status: overallStatus(currentEpisode) };
  const tombol = document.getElementById('btnSimpanEpisode');
  if (tombol.disabled) return;
  tombol.disabled = true;
  try{
    await pdPost('pdSimpan', { data: record });""")
logic = must_replace(logic, """  }catch(e){ alert('Gagal menyimpan ke Google Sheets: ' + e.message); }
});""", """  }catch(e){ alert('Gagal menyimpan ke rekap: ' + e.message); }
  finally{ tombol.disabled = false; }
});""")

# --- Rekap
old_rekap = logic[logic.index("  if(APPS_SCRIPT_URL.includes('GANTI_DENGAN')){\n    document.getElementById('rekapEmpty')"):logic.index("  if(filterBulan){ records = records.filter")]
new_rekap = """  const kosong = document.getElementById('rekapEmpty');
  kosong.textContent = 'Memuat rekap…'; kosong.style.display = 'block';
  try{
    const d = await pdGet('pdRekap', filterBulan ? { bulan: filterBulan } : {});
    records = Array.isArray(d.data) ? d.data : [];
    kosong.textContent = 'Belum ada data audit untuk bulan ini.';
  }catch(e){
    kosong.textContent = e.message;
    ['sumOK','sumYellow','sumRed'].forEach(id=>document.getElementById(id).textContent = '0');
    window._rekapCache = [];
    return;
  }
"""
logic = logic.replace(old_rekap, new_rekap)
logic = must_replace(logic, "  document.getElementById('rekapEmpty').style.display = records.length ? 'none':'block';",
                     "  kosong.style.display = records.length ? 'none':'block';")
logic = must_replace(logic,
    "tbody.insertAdjacentHTML('beforeend', `<tr><td>${r.tanggal||'-'}</td><td>${items.map(i=>i.nama).join(', ')}</td><td>${kodeSummary}</td><td><span class=\"pill ${r.status}\">${r.status}</span></td><td>${items.map(i=>i.catatan).filter(Boolean).join('; ')||'-'}</td></tr>`);",
    "tbody.insertAdjacentHTML('beforeend', `<tr><td>${escPd(r.tanggal||'-')}</td><td>${escPd(items.map(i=>i.nama).join(', '))}</td><td>${escPd(kodeSummary)}</td><td><span class=\"pill ${escPd(r.status)}\">${escPd(r.status)}</span></td><td>${escPd(items.map(i=>i.catatan).filter(Boolean).join('; ')||'-')}</td></tr>`);")
logic = must_replace(logic, "a.download = 'rekap-audit-klinis.csv'", "a.download = 'rekap-dokumentasi-klinis-igd.csv'")

# --- Lembar tempel
logic = must_replace(logic, """    <div class="print-title">LEMBAR CEK KELENGKAPAN DOKUMENTASI KLINIS</div>""",
"""    <div class="print-sub" style="margin-bottom:4px;">RS Sedayu General Hospital — Emergency Unit (IGD)</div>
    <div class="print-title">LEMBAR CEK KELENGKAPAN DOKUMENTASI KLINIS</div>""")

assert 'APPS_SCRIPT_URL' not in logic, [m.start() for m in re.finditer('APPS_SCRIPT_URL', logic)]
(OUT / 'pd-app.js').write_text(header + logic + '\n', encoding='utf-8')

# ---------------------------------------------------------------- CSS (scoped to .pd)
css_src = L(13, 124)
DROP = re.compile(r'^(body|\.wrap|h1|h1,h2,h3|header\b|\.sub$|\.hero|\.masthead|\*$)')

def scope(selectors):
    out = []
    for s in selectors.split(','):
        s = s.strip()
        if not s: continue
        out.append('.pd ' + s)
    return ', '.join(out)

def parse_rules(css):
    """yield (prelude, body) top level, handling one nesting level for @media."""
    i, n = 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        yield prelude, css[j+1:k-1]
        i = k

css_out = []
for prelude, body in parse_rules(css_src):
    if prelude == ':root':
        continue
    if prelude.startswith('@media print'):
        continue  # diganti di bawah
    if prelude.startswith('@media'):
        inner = ' '.join(f'{scope(p)}{{{b.strip()}}}' for p, b in parse_rules(body) if not DROP.match(p))
        css_out.append(f'{prelude}{{{inner}}}')
        continue
    if DROP.match(prelude):
        continue
    css_out.append(f'{scope(prelude)}{{{" ".join(body.split())}}}')

pd_css = r"""
/* ===== Panduan Dokumentasi Klinis (dicakup .pd agar tidak bentrok dengan style.css) ===== */
.pd{
  --ink:var(--text); --ink-muted:var(--muted); --surface:#fff;
  --primary:#0f5f88; --primary-soft:#e0f2fe; --rule:#e2e8f0;
  --ok:#047857; --ok-bg:#e7f6ef;
  --yellow:#92580a; --yellow-bg:#fdf3dc;
  --red:#b91c1c; --red-bg:#fdeaea;
  --na:#64748b; --na-bg:#eef1f4;
  max-width:860px; margin:0 auto; color:var(--ink); line-height:1.55; font-size:15.5px;
}
.pd h4, .pd .slot-group h4{margin:0; font-family:inherit; font-weight:800;}
.pd .sub{color:var(--ink-muted); font-size:.98rem; margin-top:4px;}
""" + '\n'.join(css_out) + r"""
/* penyesuaian gaya situs IGD */
.pd section.card{border-radius:20px; border-color:rgba(15,23,42,.08); box-shadow:0 14px 40px rgba(15,23,42,.06);}
.pd .step-label{font-weight:800; letter-spacing:.1em; font-size:.78rem;}
.pd input[type=text], .pd input[type=month], .pd select, .pd textarea{border-radius:12px; font-size:1rem;}
.pd input[type=month]{padding:10px 12px; border:1px solid var(--rule); font:inherit; background:#fff;}
.pd button.primary{background:linear-gradient(135deg, var(--red), #ef4444); box-shadow:0 10px 26px rgba(193,18,31,.22); font-weight:700;}
.pd button.primary:disabled, .pd button.primary[disabled]{opacity:.6; cursor:progress; transform:none;}
.pd button.small-add{min-height:44px; font-weight:700;}
.pd .icd-badge{font-family:inherit; font-weight:800;}
.pd .summary-box{border-radius:14px; background:#fff;}
.pd .summary-box .num{font-family:inherit; font-weight:800;}
.pd nav.tabs{display:flex;}
.pd nav.tabs button{font-weight:700; font-size:.92rem;}
.pd .search-item{background:#fff;}
.pd .pd-note-sesi{font-size:.85rem; color:var(--ink-muted); background:#fff; border:1px dashed var(--rule); border-radius:12px; padding:10px 12px; margin:-8px 0 18px;}
.pd .pd-footer{margin-top:32px; padding:16px 0; border-top:1px solid var(--rule); text-align:center; font-size:.75rem; color:var(--ink-muted);}
@media (max-width:520px){ .pd{font-size:15px;} .pd section.card{padding:16px;} .pd .inline-add{flex-wrap:wrap;} .pd button.small-add{width:100%;} }

#printArea{display:none;}
.print-title{font-size:1.1rem; font-weight:700; text-align:center; margin-bottom:2px;}
.print-sub{text-align:center; font-size:.8rem; color:#555; margin-bottom:18px;}
.print-field{margin-bottom:6px; font-size:.9rem;}
.print-status-box{border:1.5px solid #333; padding:12px 14px; margin:10px 0; font-size:.9rem;}
.print-slot-title{font-weight:700; font-size:.85rem; margin-top:10px; margin-bottom:2px;}
@media print{
  body{background:#fff !important;}
  body *{visibility:hidden;}
  #printArea, #printArea *{visibility:visible;}
  #printArea{display:block; position:absolute; top:0; left:0; width:100%; padding:24px; color:#000;}
}
"""
(OUT / 'pd.css').write_text(pd_css.strip() + '\n', encoding='utf-8')

# ---------------------------------------------------------------- MARKUP
body = L(162, 265)   # tab-audit .. tab-rekap
assert body.lstrip().startswith('<!-- ===================== TAB: AUDIT BARU'), body[:60]
assert body.rstrip().endswith('</div>')

VER = sys.argv[1] if len(sys.argv) > 1 else '1'
html = f"""<!doctype html>
<html lang="id" data-protected="true">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#b91c1c" />
  <link rel="icon" href="../assets/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="../assets/apple-touch-icon.png" />
  <link rel="manifest" href="../assets/site.webmanifest" />
  <title>Panduan Dokumentasi Klinis — Emergency Unit SGH</title>
  <link rel="stylesheet" href="../style.css?v=20261029140000" />
  <link rel="stylesheet" href="pd.css?v={VER}" />
  <script src="../auth.js"></script>
  <script>window.IGDAuth.requireAuth();</script>
</head>
<body data-page="panduan-dokumentasi" data-group="operasional" data-root="../">
  <div class="page-shell">
    <header class="page-hero">
      <nav class="topbar" aria-label="Navigasi utama">
        <a class="brand" href="../index.html" aria-label="Emergency Unit SGH">
          <span class="brand-mark logo-mark"><img src="../assets/emergency-logo.png" alt="Logo Emergency Unit"></span>
          <span><strong>Emergency Unit</strong><small>Sedayu General Hospital</small></span>
        </a>
        <div class="top-actions">
          <a class="ghost-btn home-first" href="../index.html">Beranda</a>
          <div class="nav-links" id="navLinks" aria-label="Menu kategori"></div>
          <button class="ghost-btn danger" type="button" id="logoutBtn">Keluar</button>
        </div>
      </nav>
      <section class="page-hero-card">
        <a class="breadcrumb" href="../operasional/">← Kembali ke Operasional</a>
        <div class="page-title-row">
          <span class="page-big-icon">🩺</span>
          <div><span class="eyebrow"><span></span> DOKTER &amp; KODER</span><h1>Panduan Dokumentasi Klinis</h1></div>
        </div>
        <p>Untuk dokter dan koder saat menegakkan diagnosis &amp; menulis rekam medis — supaya sejak awal tidak ada celah dispute BPJS. Kode yang sering dispute otomatis diberi tanda <b>⚠ WARNING</b> (pola diketahui dari kasus riil RS).</p>
      </section>
    </header>
    <main>
      <div class="pd">
        <nav class="tabs">
          <button class="active" data-tab="audit">Dokumentasi Baru</button>
          <button data-tab="rekap">Rekap &amp; Evaluasi</button>
        </nav>
        <div class="pd-note-sesi" id="pdSesi" hidden></div>

{body}

        <div class="pd-footer">© 2026 dr. Nurul Khafidz Subekti, AIFO-K. Seluruh hak cipta dilindungi. Dilarang menyalin, mendistribusikan, atau menggunakan sebagian maupun seluruh isi alat ini tanpa izin tertulis dari pemilik hak cipta.</div>
      </div>
      <div id="printArea"></div>
    </main>
  </div>
  <script src="../data.js?v=20261023083315"></script>
  <script src="../app.js?v=20261022220015"></script>
  <script src="pd-data.js?v={VER}"></script>
  <script src="pd-app.js?v={VER}"></script>
  <script>
    (function () {{
      var el = document.getElementById('pdSesi');
      if (!pdToken()) {{ el.textContent = PD_TANPA_TOKEN; el.hidden = false; }}
    }})();
  </script>
</body>
</html>
"""
(OUT / 'index.html').write_text(html, encoding='utf-8')
print('ok', {p.name: p.stat().st_size for p in OUT.iterdir()})
