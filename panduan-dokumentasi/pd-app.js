// Panduan Dokumentasi Klinis — Emergency Unit SGH (diadaptasi dari alat Casemix).
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

// ===================== HELPERS =====================
function baseName(nama){ return nama.replace(/\s*\([^)]+\)\s*$/, ''); }
function normalize(s){
  return (s||'').toLowerCase()
    .replace(/\bsusp(ek|ect)?\.?\b/g,' ')
    .replace(/\bobs\.?\b/g,' ')
    .replace(/\br\s*\/\s*o\b/g,' ')
    .replace(/\bdd\s*\/?\b/g,' ')
    .replace(/[^a-z0-9\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
function searchCasesByType(query, allowedTypes){
  const q = normalize(query);
  if(!q) return [];
  const words = q.split(' ').filter(w=>w.length>2);
  return CASES.filter(c=>allowedTypes.includes(c.codeType)).map(c=>{
    const haystack = normalize(c.nama + ' ' + (c.keywords||[]).join(' ') + ' ' + c.group);
    let score = 0;
    if(haystack.includes(q)) score += 10;
    words.forEach(w=>{ if(haystack.includes(w)) score += 1; });
    return {c, score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8).map(x=>x.c);
}

// ===================== OFFICIAL MASTER LIST SEARCH (ICD-10 / ICD-9-CM) =====================
function normalizeMasterQuery(s){
  return (s||'').toLowerCase()
    .replace(/\bsusp(ek|ect)?\.?\b/g,' ')
    .replace(/\bobs\.?\b/g,' ')
    .replace(/[^a-z0-9\s.]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
// Index istilah bahasa Indonesia -> prefiks kode ICD-10/ICD-9, dibangun sekali dari data
// DOC_GUIDES (nama + keywords Indonesia yang sudah kita tulis untuk ~60 diagnosis).
// Ini memungkinkan pencarian pakai bahasa Indonesia tapi tetap mengarah ke ICD baku.
let _indoTermIndexCache = null;
function buildIndoTermIndex(){
  if(_indoTermIndexCache) return _indoTermIndexCache;
  const index = []; // [{term, prefixes:[...]}]
  (typeof DOC_GUIDES !== 'undefined' ? DOC_GUIDES : []).forEach(g=>{
    if(!g.kode) return;
    const prefixes = parseKodePatterns(g.kode);
    if(!prefixes.length) return;
    const terms = new Set();
    (g.keywords||[]).forEach(k=>terms.add(normalizeMasterQuery(k)));
    terms.add(normalizeMasterQuery(baseName(g.nama)));
    terms.forEach(t=>{ if(t && t.length>2) index.push({term:t, prefixes}); });
  });
  // istilah terpanjang dicek duluan supaya frasa spesifik menang atas kata umum
  index.sort((a,b)=>b.term.length - a.term.length);
  _indoTermIndexCache = index;
  return index;
}

function searchMasterList(query, master, limit){
  const qRaw = normalizeMasterQuery(query);
  if(!qRaw) return [];
  const qCode = qRaw.replace(/\s/g,'').toUpperCase();
  const words = qRaw.split(' ').filter(w=>w.length>1);

  // Cocokkan dulu ke istilah Indonesia (dari Panduan Dokumentasi) -> kumpulkan prefiks kode yang di-boost
  const boostPrefixes = new Set();
  const indoIndex = buildIndoTermIndex();
  for(const entry of indoIndex){
    if(qRaw === entry.term || (' '+qRaw+' ').includes(' '+entry.term+' ') || (' '+entry.term+' ').includes(' '+qRaw+' ')){
      entry.prefixes.forEach(p=>boostPrefixes.add(p));
    }
  }

  const results = [];
  for(let i=0;i<master.length;i++){
    const code = master[i][0];
    const display = master[i][1];
    const codeUp = String(code).toUpperCase();
    const displayLow = display.toLowerCase();
    let score = 0;
    if(codeUp === qCode) score = 200;
    else if(qCode.length>=2 && codeUp.startsWith(qCode)) score = 100;
    else if(boostPrefixes.size && Array.from(boostPrefixes).some(p=>codeUp.startsWith(p))) score = 150;
    else if(displayLow.startsWith(qRaw)) score = 60;
    else if(displayLow.includes(qRaw)) score = 30;
    else {
      let wscore = 0;
      words.forEach(w=>{ if(displayLow.includes(w)) wscore += 3; });
      score = wscore;
    }
    if(score>0) results.push({code, display, score});
    if(results.length > 4000) break; // safety cap while scanning, still sorted after
  }
  results.sort((a,b)=> b.score - a.score || a.display.length - b.display.length);
  return results.slice(0, limit||7);
}

// Parse a case's `kode` field (e.g. "A41._", "R00.1/I47-I49", "O10-O14") into a list of
// prefixes to test a real selected code against.
function parseKodePatterns(kodeStr){
  if(!kodeStr) return [];
  const raw = kodeStr.split(/\/|\+| vs /i).map(s=>s.trim()).filter(Boolean);
  const patterns = [];
  raw.forEach(tok=>{
    const rangeMatch = tok.match(/^([A-Za-z])(\d+)-([A-Za-z])?(\d+)$/);
    if(rangeMatch && (rangeMatch[3]===undefined || rangeMatch[3].toUpperCase()===rangeMatch[1].toUpperCase())){
      const letter = rangeMatch[1].toUpperCase();
      const start = parseInt(rangeMatch[2],10);
      const end = parseInt(rangeMatch[4],10);
      const width = rangeMatch[2].length;
      for(let n=start;n<=end;n++){
        patterns.push(letter + String(n).padStart(width,'0'));
      }
      return;
    }
    let t = tok.replace(/\._?$/,'').replace(/_$/,'');
    if(t) patterns.push(t.toUpperCase());
  });
  return patterns;
}
function codeMatchesCase(selectedCode, caseObj){
  if(!caseObj.kode) return false;
  const patterns = parseKodePatterns(caseObj.kode);
  const codeUp = String(selectedCode).toUpperCase().replace(/\s/g,'');
  return patterns.some(p => codeUp.startsWith(p));
}
function findMatchedCaseForCode(selectedCode, allowedTypes){
  return CASES.find(c => allowedTypes.includes(c.codeType) && codeMatchesCase(selectedCode, c)) || null;
}

// ===================== STATE =====================
// entry = { text, matchedCase (or null), slot: 'Primer'|'Sekunder'|'Tindakan' }
let entryPrimer = null;
let entriesSekunder = [];
let entriesTindakan = [];

let reviewQueue = [];   // matched entries waiting to be reviewed via checklist
let reviewIndex = 0;
let currentReviewEntry = null;
let currentSuggestion = null;
let currentEpisode = [];   // final combined list (matched w/ decision + unmatched w/ N/A)

// ===================== FIELD SEARCH & ADD =====================
const fieldConfig = {
  primer:    {input:'inputPrimer',    results:'resultsPrimer',    list:'listPrimer',    types:['ICD-10','Aturan'],  slot:'Primer',    master:ICD10_MASTER, masterType:'ICD-10'},
  sekunder:  {input:'inputSekunder',  results:'resultsSekunder',  list:'listSekunder',  types:['ICD-10','Aturan'],  slot:'Sekunder',  master:ICD10_MASTER, masterType:'ICD-10'},
  tindakan:  {input:'inputTindakan',  results:'resultsTindakan',  list:'listTindakan',  types:['ICD-9-CM'],         slot:'Tindakan',  master:ICD9_MASTER,  masterType:'ICD-9-CM'}
};

Object.keys(fieldConfig).forEach(fieldKey=>{
  const cfg = fieldConfig[fieldKey];
  const input = document.getElementById(cfg.input);
  const resultsBox = document.getElementById(cfg.results);
  input.addEventListener('input', ()=>{
    renderSuggestions(fieldKey);
  });
  document.querySelector(`button.small-add[data-field="${fieldKey}"]`).addEventListener('click', ()=>{
    if(!input.value.trim()) return;
    addFreeTextEntry(fieldKey, input.value.trim());
    input.value=''; resultsBox.innerHTML='';
  });
  input.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){
      e.preventDefault();
      const masterMatches = searchMasterList(input.value, cfg.master, 1);
      if(masterMatches.length){
        addEntryFromMaster(fieldKey, masterMatches[0].code, masterMatches[0].display);
      } else {
        const caseMatches = searchCasesByType(input.value, cfg.types);
        if(caseMatches.length){ addEntry(fieldKey, caseMatches[0].nama, caseMatches[0]); }
        else if(input.value.trim()){ addFreeTextEntry(fieldKey, input.value.trim()); }
      }
      input.value=''; resultsBox.innerHTML='';
    }
  });
});

function renderSuggestions(fieldKey){
  const cfg = fieldConfig[fieldKey];
  const input = document.getElementById(cfg.input);
  const resultsBox = document.getElementById(cfg.results);
  const masterMatches = searchMasterList(input.value, cfg.master, 6);
  const caseMatches = searchCasesByType(input.value, cfg.types).slice(0,3);
  if(!masterMatches.length && !caseMatches.length){ resultsBox.innerHTML=''; return; }
  let html = '';
  masterMatches.forEach(m=>{
    html += `<div class="search-item" data-kind="master" data-code="${m.code}" data-display="${m.display.replace(/"/g,'&quot;')}">
      <div class="grp">${cfg.masterType} — resmi e-Klaim</div>
      <strong>${m.code}</strong> — ${m.display}
    </div>`;
  });
  caseMatches.forEach(c=>{
    html += `<div class="search-item" data-kind="case" data-id="${c.id}" style="border-left:3px solid var(--red);">
      <div class="grp">⚠ ${c.group} — pola dispute</div>
      ${baseName(c.nama)}
    </div>`;
  });
  resultsBox.innerHTML = html;
  resultsBox.querySelectorAll('.search-item').forEach(el=>{
    el.addEventListener('click', ()=>{
      if(el.dataset.kind==='master'){
        addEntryFromMaster(fieldKey, el.dataset.code, el.dataset.display);
      } else {
        const c = CASES.find(x=>x.id===el.dataset.id);
        addEntry(fieldKey, c.nama, c);
      }
      input.value=''; resultsBox.innerHTML='';
    });
  });
}

function addEntryFromMaster(fieldKey, code, display){
  const cfg = fieldConfig[fieldKey];
  const matchedCase = findMatchedCaseForCode(code, cfg.types.filter(t=>t!=='Aturan'));
  const entry = { text: `${code} — ${display}`, kode: code, codeTypeReal: cfg.masterType, matchedCase, slot: cfg.slot };
  pushEntry(fieldKey, entry);
}

function addFreeTextEntry(fieldKey, text){
  const cfg = fieldConfig[fieldKey];
  const entry = { text, kode: null, codeTypeReal: cfg.masterType, matchedCase: null, slot: cfg.slot };
  pushEntry(fieldKey, entry);
}

function pushEntry(fieldKey, entry){
  if(fieldKey==='primer'){ entryPrimer = entry; }
  else if(fieldKey==='sekunder'){ entriesSekunder.push(entry); }
  else { entriesTindakan.push(entry); }
  renderFieldLists();
  renderRingkasan();
}

function addEntry(fieldKey, text, matchedCase){
  const entry = { text: matchedCase ? baseName(matchedCase.nama) : text, kode: matchedCase?matchedCase.kode:null, codeTypeReal: matchedCase?matchedCase.codeType:null, matchedCase, slot: fieldConfig[fieldKey].slot };
  pushEntry(fieldKey, entry);
}

function resetChecklistState(){
  // Dipanggil setiap kali ada diagnosis/tindakan yang dihapus, supaya kartu checklist
  // dan kartu status/lanjut yang mungkin sedang tampil (dari 'Mulai Review Checklist'
  // sebelumnya) tidak nyangkut menampilkan data lama untuk entry yang sudah dihapus.
  reviewQueue = [];
  reviewIndex = 0;
  reviewResults = [];
  currentReviewEntry = null;
  currentSuggestion = null;
  const cc = document.getElementById('checklistCard');
  if(cc) cc.style.display = 'none';
  const mc = document.getElementById('masukanCard');
  if(mc) mc.style.display = 'none';
}
function renderFieldLists(){
  document.getElementById('listPrimer').innerHTML = entryPrimer ? entryChip(entryPrimer, ()=>{ entryPrimer=null; resetChecklistState(); renderFieldLists(); renderRingkasan(); }) : '';
  document.getElementById('listSekunder').innerHTML = entriesSekunder.map((e,i)=>entryChip(e, ()=>{ entriesSekunder.splice(i,1); resetChecklistState(); renderFieldLists(); renderRingkasan(); })).join('');
  document.getElementById('listTindakan').innerHTML = entriesTindakan.map((e,i)=>entryChip(e, ()=>{ entriesTindakan.splice(i,1); resetChecklistState(); renderFieldLists(); renderRingkasan(); })).join('');
  // rebind remove buttons
  document.querySelectorAll('.entry-item button.remove').forEach(btn=>{
    btn.onclick = window['__remove_'+btn.dataset.rid];
  });
}

let ridCounter = 0;
function entryChip(entry, onRemove){
  const rid = 'r'+(ridCounter++);
  window['__remove_'+rid] = onRemove;
  const label = entry.kode ? `${entry.codeTypeReal||''}: ${entry.kode}` : (entry.codeTypeReal||'manual');
  const tag = entry.matchedCase
    ? `<span class="icd-badge small" style="background:var(--red);">⚠ ${label}</span>`
    : `<span class="icd-badge small" style="background:var(--ok);">✓ ${label}</span>`;
  return `<div class="entry-item">${tag}<div class="ei-main">${entry.text}</div><button class="remove" data-rid="${rid}">✕</button></div>`;
}

function allEntries(){
  const arr = [];
  if(entryPrimer) arr.push(entryPrimer);
  entriesSekunder.forEach(e=>arr.push(e));
  entriesTindakan.forEach(e=>arr.push(e));
  return arr;
}

function extractCodeFromDu(duStr){
  const m = (duStr||'').match(/\(([^)]+)\)\s*$/);
  return m ? m[1].trim().toUpperCase().replace(/\s/g,'') : '';
}
function findBukuKodingMatches(primerEntry){
  if(!primerEntry) return [];
  const code = (primerEntry.kode||'').toUpperCase().replace(/\s/g,'').replace(/\.$/,'');
  const textNorm = normalize(primerEntry.text.replace(/\([^)]*\)/g,''));
  const firstWord = textNorm.split(' ')[0] || '';
  return BUKU_KODING_RS.filter(r=>{
    const rCode = extractCodeFromDu(r.du).replace(/\.$/,'');
    if(code && rCode){
      if(rCode === code) return true;
      const catA = code.slice(0,3), catB = rCode.slice(0,3);
      if(catA && catB && catA === catB) return true;
    }
    const duNorm = normalize(r.du.replace(/\([^)]*\)/g,''));
    if(!duNorm) return false;
    return firstWord.length>2 && duNorm.includes(firstWord);
  }).slice(0,8);
}
function renderBukuKodingSection(){
  const matches = findBukuKodingMatches(entryPrimer);
  const box = document.getElementById('bukuKodingSection');
  if(!matches.length){ box.innerHTML=''; return; }
  const rows = matches.map(r=>`
    <tr>
      <td><span class="icd-badge small" style="background:var(--ink-muted);">${r.section}</span></td>
      <td>${r.du}</td>
      <td>${r.ds||'-'}</td>
      <td>${r.tindakan||'-'}</td>
      <td style="text-align:center;">${r.severity}</td>
      <td>${r.inacbg||'-'}</td>${TAMPILKAN_TARIF ? `
      <td style="text-align:right;">${r.kelas1||'-'}</td>
      <td style="text-align:right;">${r.kelas2||'-'}</td>
      <td style="text-align:right;">${r.kelas3||'-'}</td>` : ''}
    </tr>`).join('');
  box.innerHTML = `
    <div class="step-label" style="margin-top:18px;">Referensi Kombinasi Kode RS (Riwayat Internal — Buku Koding)</div>
    <div class="warn-box">Ini kombinasi yang PERNAH dipakai/disahkan RS berdasarkan Buku Koding internal — <strong>bukan</strong> hasil grouping resmi e-Klaim. Gunakan sebagai referensi historis untuk melihat pola kombinasi${TAMPILKAN_TARIF ? ' &amp; tarif kelas' : ''} yang biasa dipakai untuk diagnosis primer ini.</div>
    <div style="overflow-x:auto;">
      <table style="font-size:.78rem; min-width:${TAMPILKAN_TARIF ? 700 : 520}px;">
        <thead><tr><th>Bagian</th><th>Diagnosis Utama</th><th>Diagnosis Sekunder</th><th>Tindakan</th><th>Sev.</th><th>Kode InaCBG</th>${TAMPILKAN_TARIF ? '<th>Kelas 1</th><th>Kelas 2</th><th>Kelas 3</th>' : ''}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function findDocGuide(entry){
  const text = typeof entry === 'string' ? entry : entry.text;
  const kode = typeof entry === 'string' ? null : entry.kode;
  // 1) Cocokkan berdasarkan KODE ICD (prioritas, sama seperti pencocokan CASES) — robust terhadap nama ICD-10 resmi berbahasa Inggris
  //    Bila beberapa guide sama-sama cocok (kode overlap, mis. rentang umum vs kode spesifik), pilih pola PALING SPESIFIK (terpanjang)
  if(kode){
    const codeUp = String(kode).toUpperCase().replace(/\s/g,'');
    let best = null, bestLen = -1;
    DOC_GUIDES.forEach(g=>{
      if(!g.kode) return;
      const patterns = parseKodePatterns(g.kode);
      patterns.forEach(p=>{
        if(codeUp.startsWith(p) && p.length > bestLen){
          best = g; bestLen = p.length;
        }
      });
    });
    if(best) return best;
  }
  // 2) Fallback: cocokkan berdasarkan kata kunci nama/keyword (untuk entry tanpa kode terstruktur)
  //    Wajib KATA UTUH (word-boundary) — bukan sekadar substring, supaya "fever" pada query
  //    tidak salah nyantol ke "typhoid fever" pada keyword guide lain.
  const q = normalize(text);
  if(!q) return null;
  const words = q.split(' ').filter(w=>w.length>3);
  const hasWholeWord = (hay, w) => new RegExp('(^|\\s)' + w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '(\\s|$)').test(hay);
  return DOC_GUIDES.find(g=>{
    const hay = normalize(g.nama + ' ' + (g.keywords||[]).join(' '));
    return hay.includes(q) || words.some(w=>hasWholeWord(hay, w));
  }) || null;
}
let docGuideCounter = 0;
function renderCombinedDocGuide(matchedList){
  // matchedList: [{slot, entryText, guide}]
  if(!matchedList.length) return '';
  const gid = 'dgcombo'+(docGuideCounter++);
  const list = arr => arr.map(x=>`<li>${x}</li>`).join('');
  const sections = matchedList.map(m=>`
    <div style="margin-bottom:14px; padding-bottom:12px; border-bottom:1px dashed var(--rule);">
      <div style="font-weight:600; margin-bottom:2px; font-size:1.05rem;">${m.slot==='Primer'?'Diagnosis Primer':m.slot==='Sekunder'?'Diagnosis Sekunder':'Tindakan'} — ${m.guide.nama}</div>
      <div style="font-size:.88rem; margin-bottom:6px; ${m.guide.sumber ? 'color:var(--ok);font-weight:600;' : 'color:var(--ink-muted);'}">${m.guide.sumber ? '✓ Sumber: '+m.guide.sumber : '⚠ Sumber: pengetahuan medis umum (belum dari PPK RS)'}</div>
      <strong>Anamnesis:</strong><ul style="margin:4px 0 8px 18px; padding:0;">${list(m.guide.anamnesis)}</ul>
      <strong>Pemeriksaan Fisik:</strong><ul style="margin:4px 0 8px 18px; padding:0;">${list(m.guide.pemeriksaanFisik)}</ul>
      <strong>Pemeriksaan Penunjang:</strong><ul style="margin:4px 0 8px 18px; padding:0;">${list(m.guide.penunjang)}</ul>
      ${m.guide.catatan ? `<div><strong>Catatan:</strong> ${m.guide.catatan}</div>` : ''}
    </div>`).join('');
  return `
    <button type="button" class="primary" style="margin-top:6px;" onclick="document.getElementById('${gid}').style.display = document.getElementById('${gid}').style.display==='none' ? 'block':'none';">📋 Lihat Panduan Dokumentasi Gabungan (${matchedList.length} diagnosis)</button>
    <div id="${gid}" style="display:none; margin-top:10px; padding:14px; background:var(--primary-soft); border-radius:4px; font-size:1rem; line-height:1.55;">
      <div style="margin-bottom:10px; color:var(--ink-muted); font-size:.88rem;">Panduan umum berdasarkan pedoman klinis standar, digabung dari semua diagnosis/tindakan pada episode ini — SPO/PPK rumah sakit tetap menjadi acuan utama bila berbeda.</div>
      ${sections}
    </div>`;
}

function renderRingkasan(){
  const all = allEntries();
  const card = document.getElementById('ringkasanCard');
  const masukanCard = document.getElementById('masukanGlobalCard');
  if(!all.length){ card.style.display='none'; masukanCard.style.display='none'; return; }
  card.style.display='block';
  // Sembunyikan kotak Masukan/Saran global SELAMA proses checklist review masih berjalan,
  // supaya tidak terlihat seperti review sudah selesai padahal masih ada checklist berikutnya.
  const sedangReview = reviewQueue.length > 0 && reviewIndex < reviewQueue.length && document.getElementById('checklistCard').style.display !== 'none';
  masukanCard.style.display = sedangReview ? 'none' : 'block';
  const bySlot = {'Primer':[], 'Sekunder':[], 'Tindakan':[]};
  all.forEach(e=>bySlot[e.slot].push(e));
  let html = '';
  const matchedGuides = [];
  ['Primer','Sekunder','Tindakan'].forEach(slot=>{
    if(!bySlot[slot].length) return;
    html += `<div class="slot-group"><h4>${slot==='Primer'?'Diagnosis Primer':slot==='Sekunder'?'Diagnosis Sekunder':'Tindakan (ICD-9-CM)'}</h4>`;
    bySlot[slot].forEach(e=>{
      const flagTxt = e.matchedCase ? '<span style="color:var(--red);font-size:.92rem;font-weight:600;">⚠ WARNING — Sering Dispute, perlu checklist</span>' : '<span style="color:var(--ok);font-size:.92rem;">✓ Normal — tidak masuk daftar sering dispute</span>';
      const guide = findDocGuide(e);
      if(guide) matchedGuides.push({slot, entryText:e.text, guide});
      html += `<div class="entry-item"><div class="ei-main">${e.text}</div>${flagTxt}</div>`;
    });
    html += `</div>`;
  });
  document.getElementById('ringkasanList').innerHTML = html;
  document.getElementById('docGuideCombined').innerHTML = renderCombinedDocGuide(matchedGuides);
  renderBukuKodingSection();
}

async function kirimMasukanGlobal(){
  const txt = document.getElementById('fMasukanGlobal').value.trim();
  if(!txt){ alert('Tulis masukannya dulu sebelum dikirim.'); return; }
  const all = allEntries();
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
    alert('Masukan terkirim. Terima kasih!');
    document.getElementById('fMasukanGlobal').value = '';
  }catch(e){
    alert('Gagal mengirim masukan: ' + e.message);
  }finally{ if (tombol) tombol.disabled = false; }
}

// ===================== CHECKLIST REVIEW FLOW (SEMUA TAMPIL SEKALIGUS) =====================
let reviewResults = []; // hasil evaluasi tiap item di reviewQueue, index selaras dengan reviewQueue

document.getElementById('btnMulaiChecklist').addEventListener('click', ()=>{
  reviewQueue = allEntries().filter(e=>e.matchedCase);
  const unmatched = allEntries().filter(e=>!e.matchedCase);
  currentEpisode = unmatched.map(e=>({
    nama: e.text, kode: e.kode, codeType: (e.codeTypeReal || (e.slot==='Tindakan'?'ICD-9-CM':'ICD-10')), slot: e.slot, status:'N/A', catatan:''
  }));
  reviewResults = new Array(reviewQueue.length).fill(null);
  if(!reviewQueue.length){
    alert('Tidak ada kode yang cocok dengan pola dispute — semua entry sudah dianggap standar (N/A). Langsung lihat Episode di bawah.');
    renderEpisodeList();
    document.getElementById('checklistCard').scrollIntoView({behavior:'smooth'});
    return;
  }
  renderAllChecklists();
});

function renderAllChecklists(){
  document.getElementById('masukanGlobalCard').style.display='none';
  document.getElementById('checklistCard').style.display='block';
  const container = document.getElementById('allChecklistsContainer');
  container.innerHTML = reviewQueue.map((entry, idx)=>{
    const c = entry.matchedCase;
    const badge = `<span class="icd-badge">${entry.kode ? (entry.codeTypeReal+': '+entry.kode) : (c.codeType+(c.kode?': '+c.kode:''))}</span>`;
    const reqHtml = c.required.map(item=>`<div class="checklist-item"><input type="checkbox" data-role="req" id="chk_${idx}_${item.id}"><label class="txt" for="chk_${idx}_${item.id}">${item.label}</label></div>`).join('');
    const dqHtml = c.disqualifiers.map(item=>`<div class="checklist-item flag"><input type="checkbox" data-role="dq" id="chk_${idx}_${item.id}"><label class="txt" for="chk_${idx}_${item.id}"><span class="flag-tag">Kondisi red-flag</span>${item.label}</label></div>`).join('');
    const vtHtml = c.hasVentilatorTimer ? `
      <div style="margin-top:14px;">
        <div class="grid2">
          <label class="field"><span>Jam mulai ventilator</span><input type="datetime-local" id="vtMulai_${idx}"></label>
          <label class="field"><span>Jam selesai ventilator</span><input type="datetime-local" id="vtSelesai_${idx}"></label>
        </div>
        <div id="vtDurasiInfo_${idx}" class="sub"></div>
      </div>` : '';
    return `<div class="checklist-subcard" style="${idx>0?'border-top:1px solid var(--rule); padding-top:20px; margin-top:20px;':''}">
      <div class="step-label">Diagnosis ${idx+1} dari ${reviewQueue.length} — ${entry.slot}</div>
      ${badge}
      <h3 style="margin-bottom:4px;">${baseName(c.nama)}</h3>
      <div class="sub" style="margin-bottom:14px;"><strong>Kriteria pengujian:</strong> ${c.kriteria}</div>
      ${c.sumberData ? `<div class="sub" style="margin-bottom:14px; font-size:.82rem; opacity:.75;"><strong>Sumber data pola dispute:</strong> ${c.sumberData}</div>` : ''}
      <div>${reqHtml}${dqHtml}</div>
      ${vtHtml}
      <div id="suggestionBox_${idx}"></div>
    </div>`;
  }).join('');

  reviewQueue.forEach((entry, idx)=>{
    container.querySelectorAll(`#suggestionBox_${idx}`); // no-op placeholder to keep structure clear
    const subcard = container.children[idx];
    subcard.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.addEventListener('change', ()=>evaluateCaseAt(idx)));
    const vtMulai = document.getElementById(`vtMulai_${idx}`);
    const vtSelesai = document.getElementById(`vtSelesai_${idx}`);
    if(vtMulai && vtSelesai){
      vtMulai.oninput = ()=>updateVentilatorDurasi(idx);
      vtSelesai.oninput = ()=>updateVentilatorDurasi(idx);
    }
    evaluateCaseAt(idx); // set status default (Hold) sejak awal ditampilkan
  });

  document.getElementById('checklistCard').scrollIntoView({behavior:'smooth', block:'start'});
}

function updateVentilatorDurasi(idx){
  const a = document.getElementById(`vtMulai_${idx}`).value;
  const b = document.getElementById(`vtSelesai_${idx}`).value;
  const info = document.getElementById(`vtDurasiInfo_${idx}`);
  if(a && b){
    const durasiJam = (new Date(b) - new Date(a)) / 3600000;
    if(durasiJam > 0){
      info.textContent = `Durasi pemakaian: ${durasiJam.toFixed(1)} jam — kategori: ${durasiJam < 96 ? '< 96 jam' : '≥ 96 jam'} (untuk penentuan spesifikasi kode ICD-9-CM oleh koder)`;
    } else { info.textContent = 'Jam selesai harus setelah jam mulai.'; }
  } else { info.textContent = ''; }
}

function evaluateCaseAt(idx){
  const entry = reviewQueue[idx];
  const c = entry.matchedCase;
  const dqChecked = c.disqualifiers.find(d=>document.getElementById(`chk_${idx}_${d.id}`).checked);
  const allRequired = c.required.every(r=>document.getElementById(`chk_${idx}_${r.id}`).checked);
  let result;
  if(dqChecked){ result = {status:'Re-Code', note:dqChecked.label, target:dqChecked.target}; }
  else if(allRequired){ result = {status:'OK', note:'Seluruh bukti wajib terpenuhi.'}; }
  else { result = {status:'Hold', note:'Bukti pendukung belum lengkap — perlu konfirmasi ke DPJP.'}; }
  reviewResults[idx] = result;
  const labelMap = {OK:'Saran: OK (Clear)', 'Re-Code':'Saran: Perlu Re-Code', Hold:'Saran: Hold — Konfirmasi DPJP'};
  document.getElementById(`suggestionBox_${idx}`).innerHTML = `<div class="suggestion ${result.status}"><strong>${labelMap[result.status]}</strong>${result.note}${result.target ? ' — usulan kode: <strong>'+result.target+'</strong>' : ''}</div>`;
}

document.getElementById('btnSelesaiSemuaChecklist').addEventListener('click', ()=>{
  reviewQueue.forEach((entry, idx)=>{
    const c = entry.matchedCase;
    const result = reviewResults[idx];
    currentEpisode.push({
      nama: entry.kode ? entry.text : baseName(c.nama),
      kode: entry.kode || c.kode,
      codeType: entry.codeTypeReal || c.codeType,
      slot: entry.slot,
      status: result.status, catatan: result.note
    });
  });
  document.getElementById('checklistCard').style.display='none';
  document.getElementById('masukanGlobalCard').style.display = allEntries().length ? 'block' : 'none';
  renderEpisodeList();
  document.getElementById('episodeCard').scrollIntoView({behavior:'smooth'});
});

// ===================== EPISODE (FINAL) =====================
function overallStatus(items){
  const relevant = items.filter(i=>i.status!=='N/A');
  if(relevant.some(i=>i.status==='Hold')) return 'Hold';
  if(relevant.some(i=>i.status==='Re-Code')) return 'Re-Code';
  return 'OK';
}

function renderEpisodeList(){
  const wrap = document.getElementById('episodeCard');
  const list = document.getElementById('episodeList');
  if(!currentEpisode.length){ wrap.style.display='none'; return; }
  wrap.style.display='block';
  const bySlot = {'Primer':[], 'Sekunder':[], 'Tindakan':[]};
  currentEpisode.forEach(it=>bySlot[it.slot||'Sekunder'].push(it));
  let html = '';
  ['Primer','Sekunder','Tindakan'].forEach(slot=>{
    if(!bySlot[slot].length) return;
    html += `<div class="slot-group"><h4>${slot==='Primer'?'Diagnosis Primer':slot==='Sekunder'?'Diagnosis Sekunder':'Tindakan (ICD-9-CM)'}</h4>`;
    bySlot[slot].forEach(it=>{
      html += `<div class="entry-item">
        <span class="icd-badge small">${it.codeType}${it.kode?': '+it.kode:''}</span>
        <div class="ei-main">${it.nama}</div>
        <span class="pill ${it.status.replace('/','-')}">${it.status}</span>
      </div>`;
    });
    html += `</div>`;
  });
  list.innerHTML = html;
}

document.getElementById('btnSimpanEpisode').addEventListener('click', async ()=>{
  if(!currentEpisode.length){ alert('Belum ada kode yang ditambahkan.'); return; }
  const tglLokal = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const record = { id: 'audit_' + Date.now(), tanggal: tglLokal, items: currentEpisode, status: overallStatus(currentEpisode) };
  const tombol = document.getElementById('btnSimpanEpisode');
  if (tombol.disabled) return;
  tombol.disabled = true;
  try{
    await pdPost('pdSimpan', { data: record });
    alert('Episode tersimpan ke rekap (' + currentEpisode.length + ' kode).');
    resetAll();
    loadRekap();
  }catch(e){ alert('Gagal menyimpan ke rekap: ' + e.message); }
  finally{ tombol.disabled = false; }
});

document.getElementById('btnKosongkanEpisode').addEventListener('click', ()=>{
  if(confirm('Mulai episode baru? Semua entry saat ini akan dihapus.')) resetAll();
});

document.getElementById('btnCetakEpisode').addEventListener('click', ()=>{
  if(!currentEpisode.length){ alert('Belum ada kode yang ditambahkan.'); return; }
  const status = overallStatus(currentEpisode);
  const labelStatus = {OK:'KATEGORI GREEN (Clear) — Status: SIAP ENTRI E-KLAIM',
    'Re-Code':'KATEGORI YELLOW (Perlu Klarifikasi/Penyesuaian Koding) — Status: REVISE KODE → SIAP ENTRI',
    Hold:'KATEGORI RED (Potensi Dispute / Resume Tidak Valid) — Status: HOLD INTERNAL (Maks. 2x24 Jam)'}[status];
  const tanggalHariIni = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'});
  const bySlot = {'Primer':[], 'Sekunder':[], 'Tindakan':[]};
  currentEpisode.forEach(it=>bySlot[it.slot||'Sekunder'].push(it));
  let rows = '';
  ['Primer','Sekunder','Tindakan'].forEach(slot=>{
    if(!bySlot[slot].length) return;
    rows += `<div class="print-slot-title">${slot==='Primer'?'Diagnosis Primer':slot==='Sekunder'?'Diagnosis Sekunder':'Tindakan (ICD-9-CM)'}</div>`;
    bySlot[slot].forEach(it=>{
      rows += `<div class="print-field">• [${it.codeType}${it.kode?' '+it.kode:''}] ${it.nama} — <strong>${it.status}</strong>${it.catatan?' ('+it.catatan+')':''}</div>`;
    });
  });
  document.getElementById('printArea').innerHTML = `
    <div class="print-sub" style="margin-bottom:4px;">RS Sedayu General Hospital — Emergency Unit (IGD)</div>
    <div class="print-title">LEMBAR CEK KELENGKAPAN DOKUMENTASI KLINIS</div>
    <div class="print-sub">Diisi Dokter IGD Saat Menegakkan Diagnosis — Referensi Internal, Bukan Hasil Grouping Resmi</div>
    <div class="print-field"><strong>Tanggal Audit:</strong> ${tanggalHariIni}</div>
    <div class="print-status-box"><strong>${labelStatus}</strong></div>
    ${rows}
    <hr style="border:none;border-top:1px dashed #888;margin:14px 0;">
    <div class="print-field" style="color:#555;font-size:.8rem;">Diisi tangan saat ditempel ke berkas fisik:</div>
    <div class="print-field">No. Rekam Medis: ______________________</div>
    <div class="print-field">Nama Pasien: ______________________</div>
    <div class="print-field">Ruangan: ______________________</div>
    <div class="print-field">Konfirmasi DPJP: ______________________</div>
    <br><br>
    <div class="print-field">Diperiksa oleh,</div>
    <br><br><br>
    <div class="print-field">( _____________________ )</div>
    <div class="print-field">Dokter / DPJP</div>
  `;
  window.print();
});

function resetAll(){
  entryPrimer = null; entriesSekunder = []; entriesTindakan = [];
  reviewQueue = []; reviewIndex = 0; currentEpisode = [];
  renderFieldLists(); renderRingkasan();
  document.getElementById('checklistCard').style.display='none';
  document.getElementById('masukanCard').style.display='none';
  document.getElementById('episodeCard').style.display='none';
}

// ===== TABS =====
document.querySelectorAll('nav.tabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-audit').style.display = btn.dataset.tab==='audit' ? 'block':'none';
    document.getElementById('tab-rekap').style.display = btn.dataset.tab==='rekap' ? 'block':'none';
    if(btn.dataset.tab==='rekap') loadRekap();
  });
});

async function loadRekap(){
  const tbody = document.getElementById('rekapTableBody');
  const filterBulan = document.getElementById('filterBulan').value;
  tbody.innerHTML = '';
  let records = [];
  const kosong = document.getElementById('rekapEmpty');
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
  if(filterBulan){ records = records.filter(r => r.tanggal && r.tanggal.startsWith(filterBulan)); }
  records.sort((a,b)=> (b.tanggal||'').localeCompare(a.tanggal||''));
  document.getElementById('sumOK').textContent = records.filter(r=>r.status==='OK').length;
  document.getElementById('sumYellow').textContent = records.filter(r=>r.status==='Re-Code').length;
  document.getElementById('sumRed').textContent = records.filter(r=>r.status==='Hold').length;
  kosong.style.display = records.length ? 'none':'block';
  records.forEach(r=>{
    const items = r.items || [];
    const kodeSummary = items.map(i=>(i.kode||i.nama)).join(', ');
    tbody.insertAdjacentHTML('beforeend', `<tr><td>${escPd(r.tanggal||'-')}</td><td>${escPd(items.map(i=>i.nama).join(', '))}</td><td>${escPd(kodeSummary)}</td><td><span class="pill ${escPd(r.status)}">${escPd(r.status)}</span></td><td>${escPd(items.map(i=>i.catatan).filter(Boolean).join('; ')||'-')}</td></tr>`);
  });
  window._rekapCache = records;
}
document.getElementById('filterBulan').addEventListener('change', loadRekap);
document.getElementById('btnExportCSV').addEventListener('click', ()=>{
  const records = window._rekapCache || [];
  if(!records.length){ alert('Tidak ada data untuk diunduh.'); return; }
  const header = ['Tanggal','Diagnosis/Tindakan','Kode','Status Keseluruhan','Catatan'];
  const rows = records.map(r=>{
    const items = r.items || [];
    const nama = items.map(i=>i.nama).join(' | ');
    const kode = items.map(i=>(i.kode||'-')+' ('+i.codeType+')').join(' | ');
    const catatan = items.map(i=>i.catatan).filter(Boolean).join(' | ');
    return [r.tanggal, nama, kode, r.status, catatan].map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(',');
  });
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'rekap-dokumentasi-klinis-igd.csv'; a.click();
  URL.revokeObjectURL(url);
});
