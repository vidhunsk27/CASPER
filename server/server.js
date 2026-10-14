// =============================================================================
// Wally MK 3 / C.A.S.P.E.R. backend
// - serves the app itself (the folder above this one)
// - stores the ledger, wishlist/library, workspace and all other app data
// - receives bank SMS from your phone and holds them until the app collects them
// - reads product / title pages for the link scraper
// Storage: Firestore when FIREBASE_SERVICE_ACCOUNT is set, otherwise a JSON file.
// =============================================================================
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const KEY = process.env.WALLY_KEY || '';
const DATA_FILE = process.env.WALLY_DATA_FILE || path.join(__dirname, 'data.json');

// ----------------------------------------------------------------------------- storage
function fileStore() {
  let db = { transactions: {}, wishlist: {}, state: {}, meta: {}, inbox: {}, deleted: {} };
  try { db = Object.assign(db, JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))); } catch (e) {}
  let timer = null;
  const save = () => { clearTimeout(timer); timer = setTimeout(() => { const tmp = DATA_FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db)); fs.renameSync(tmp, DATA_FILE); }, 150); };
  const lag = +process.env.WALLY_TEST_LATENCY || 0, w = () => lag ? new Promise(r => setTimeout(r, lag)) : null;   // tests only: behave like a slow remote database
  return {
    kind: 'file',
    async entries(col) { await w(); return Object.entries(db[col] || {}); },
    async all(col) { await w(); return Object.values(db[col] || {}); },
    async get(col, id) { await w(); return (db[col] || {})[id] || null; },
    async set(col, id, val) { await w(); (db[col] = db[col] || {})[id] = val; save(); },
    async del(col, id) { await w(); if (db[col]) delete db[col][id]; save(); }
  };
}
function firestoreStore() {
  const admin = require('firebase-admin'), { getFirestore } = require('firebase-admin/firestore');
  const app = admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  // Firebase names the database either "(default)" or "default" depending on when the project was made.
  // Try both (or the one named in FIRESTORE_DATABASE_ID) and keep whichever answers.
  const ids = process.env.FIRESTORE_DATABASE_ID ? [process.env.FIRESTORE_DATABASE_ID] : ['(default)', 'default'];
  let fsdb = null, opening = null;
  const open = async () => { let last; for (const id of ids) { try { const d = id === '(default)' ? getFirestore(app) : getFirestore(app, id); await d.collection('wally_meta').limit(1).get(); console.log('Firestore database in use: ' + id); return d; } catch (e) { last = e; console.error('Firestore database "' + id + '" not usable: ' + e.message); } } throw last; };
  const db = async () => { if (fsdb) return fsdb; if (!opening) opening = open().then(d => (fsdb = d)).finally(() => { opening = null; }); return opening; };
  const c = async col => (await db()).collection('wally_' + col), safe = id => encodeURIComponent(String(id)).slice(0, 1400);
  db().catch(() => {});
  return {
    kind: 'firestore',
    async entries(col) { const s = await (await c(col)).get(); return s.docs.map(d => { let id = d.id; try { id = decodeURIComponent(d.id); } catch (e) {} return [id, d.data().v]; }); },
    async all(col) { const s = await (await c(col)).get(); return s.docs.map(d => d.data().v); },
    async get(col, id) { const d = await (await c(col)).doc(safe(id)).get(); return d.exists ? d.data().v : null; },
    async set(col, id, val) { await (await c(col)).doc(safe(id)).set({ v: val }); },
    async del(col, id) { await (await c(col)).doc(safe(id)).delete(); }
  };
}
let store;
try { store = process.env.FIREBASE_SERVICE_ACCOUNT ? firestoreStore() : fileStore(); }
catch (e) { console.error('Firestore could not start, falling back to the local file:', e.message); store = fileStore(); }

// ----------------------------------------------------------------------------- encryption at rest
// Every record is compressed and sealed with AES-256-GCM before it reaches Firestore (or the file), so
// the database holds only unreadable blobs: anyone who sees the database cannot read your money data,
// and any tampering is detected. The key comes from DATA_KEY, or WALLY_KEY when DATA_KEY is not set.
// Keep that value forever: if it changes, the old records cannot be opened (they are kept, not deleted).
// Older plain records are still read and are sealed automatically the first time they are loaded.
const zlibRest = require('zlib'), nodeCrypto = require('crypto');
const DKEY_SRC = process.env.ENCRYPT === 'off' ? '' : (process.env.DATA_KEY || KEY);
const DKEY = DKEY_SRC ? nodeCrypto.scryptSync(DKEY_SRC, 'wally-mk3-data-v1', 32) : null;
const encStat = { on: !!DKEY, unreadable: 0, sealed: 0 };
function sealed(inner) {
  if (!DKEY) return inner;
  const enc = v => { const iv = nodeCrypto.randomBytes(12), c = nodeCrypto.createCipheriv('aes-256-gcm', DKEY, iv); const ct = Buffer.concat([c.update(zlibRest.deflateRawSync(Buffer.from(JSON.stringify(v), 'utf8'))), c.final()]); return { _enc: 2, d: Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64') }; };
  const dec = v => { const b = Buffer.from(v.d, 'base64'), d = nodeCrypto.createDecipheriv('aes-256-gcm', DKEY, b.subarray(0, 12)); d.setAuthTag(b.subarray(12, 28)); return JSON.parse(zlibRest.inflateRawSync(Buffer.concat([d.update(b.subarray(28)), d.final()])).toString('utf8')); };
  const isSealed = v => v && typeof v === 'object' && v._enc === 2 && typeof v.d === 'string';
  const open = v => { if (!isSealed(v)) return v; try { return dec(v); } catch (e) { encStat.unreadable++; return undefined; } };
  return {
    kind: inner.kind,
    async entries(col) {
      const out = [], plain = [];
      for (const [id, v] of await inner.entries(col)) { const x = open(v); if (x === undefined) continue; out.push([id, x]); if (!isSealed(v) && x != null) plain.push([id, x]); }
      (async () => { for (let i = 0; i < plain.length; i += 20) await Promise.all(plain.slice(i, i + 20).map(([id, x]) => inner.set(col, id, enc(x)).then(() => encStat.sealed++).catch(() => {}))); })();
      return out;
    },
    async all(col) { return (await this.entries(col)).map(e => e[1]); },
    async get(col, id) { const v = await inner.get(col, id); if (v == null) return null; const x = open(v); return x === undefined ? null : x; },
    async set(col, id, val) { return inner.set(col, id, enc(val)); },
    async del(col, id) { return inner.del(col, id); }
  };
}
store = sealed(store);
const inParallel = async (list, fn, n) => { for (let i = 0; i < list.length; i += (n || 20)) await Promise.all(list.slice(i, i + (n || 20)).map(fn)); };

// ----------------------------------------------------------------------------- memory copy + live updates
// The server keeps each list in memory after the first read and writes every change through to the
// database. Reads then cost nothing, so devices can check for changes every few seconds without using
// up the free database quota. "rev" goes up by one on every change; devices compare it to know when to sync.
const BOOT = Date.now().toString(36); let rev = 0; const listeners = new Set(); let bt = null;
const announce = () => { rev++; clearTimeout(bt); bt = setTimeout(() => { for (const r of listeners) { try { r.write('data: ' + BOOT + ':' + rev + '\n\n'); } catch (e) { listeners.delete(r); } } }, 120); };
function withMemory(inner) {
  const mem = {};
  const load = col => mem[col] || (mem[col] = inner.entries(col).then(list => new Map(list)).catch(e => { delete mem[col]; throw e; }));
  return {
    kind: inner.kind,
    async all(col) { return [...(await load(col)).values()]; },
    async ids(col) { return [...(await load(col)).keys()]; },
    async get(col, id) { const v = (await load(col)).get(String(id)); return v === undefined ? null : v; },
    async set(col, id, val) { const m = await load(col); if (m.has(String(id)) && JSON.stringify(m.get(String(id))) === JSON.stringify(val)) return;   // nothing new: no write, no wake-up for other devices
      try { await inner.set(col, id, val); } catch (e) { delete mem[col]; throw e; } m.set(String(id), val); if (process.env.WALLY_DEBUG) console.log('SET', col, String(id).slice(0, 40)); announce(); },
    async del(col, id) { const m = await load(col); if (!m.has(String(id))) return; try { await inner.del(col, id); } catch (e) { delete mem[col]; throw e; } m.delete(String(id)); announce(); }
  };
}
store = withMemory(store);

const awake = { pings: 0, last: 0, ok: null };
const SELF_URL = process.env.KEEP_AWAKE === 'off' ? '' : (process.env.KEEP_AWAKE_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
// ----------------------------------------------------------------------------- app
const app = express();
app.use((req, res, next) => (process.env.SITE_GATE === 'off' || !(process.env.SITE_PASSWORD || KEY)) ? cors()(req, res, next) : next());   // with the sign-in page on, only this site may call its own API
app.use(express.json({ limit: '8mb' }));
const zlib = require('zlib');
const sendFast = (req, res, obj) => { const raw = Buffer.from(JSON.stringify(obj)); res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); if (raw.length > 1400 && /\bgzip\b/.test(req.get('accept-encoding') || '')) { res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Vary', 'Accept-Encoding'); return res.end(zlib.gzipSync(raw, { level: 6 })); } res.end(raw); };
const wrap = fn => (req, res) => fn(req, res).catch(e => { console.error(e); res.status(500).json({ error: 'server error' }); });

const AI = process.env.ANTHROPIC_API_KEY ? 'anthropic' : process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : '';
const VERSION = 'mk3-r20';
// purge epoch: after a purge, anything older than this moment is refused, so a device that was offline cannot bring wiped data back
let epoch = { at: 0, scope: '' };
let purging = false;
// one-time clean ledger for round 16 (you asked for every ledger entry to go): runs once per database, then never again.
// Set LEDGER_RESET=off in Render before deploying if you ever need to skip it.
const RESET_ID = 'r16-ledger';
async function wipeScope(scope) {
  purging = true;
  try {
    epoch = { at: Date.now(), scope }; await store.set('meta', 'epoch', epoch);          // first: from this moment nothing older can come back
    const cols = scope === 'ledger' ? ['transactions'] : ['transactions', 'wishlist', 'state', 'inbox', 'deleted']; let n = 0;
    for (const c of cols) { const ids = await store.ids(c); await inParallel(ids, id => store.del(c, id)); n += ids.length; }
    if (scope === 'ledger') { const ids = (await store.ids('deleted')).filter(id => String(id).indexOf('tx:') === 0); await inParallel(ids, id => store.del('deleted', id)); n += ids.length; }
    else await store.del('meta', 'workspace').catch(() => {});
    epoch = { at: Date.now(), scope }; await store.set('meta', 'epoch', epoch);          // and again at the end, so a push that slipped in while deleting is refused too
    console.log('Purge (' + scope + '): removed ' + n + ' records'); return n;
  } finally { purging = false; }
}
const epochLoaded = Promise.resolve().then(() => store.get('meta', 'epoch')).then(v => { if (v && v.at) epoch = v; }).catch(() => {})
  .then(async () => { if (process.env.LEDGER_RESET === 'off') return; try { if (await store.get('meta', RESET_ID)) return; const n = await wipeScope('ledger'); await store.set('meta', RESET_ID, { at: Date.now(), removed: n }); console.log('One-time ledger reset done.'); } catch (e) { console.error('Ledger reset failed:', e.message); } })
  .then(async () => { if (!DKEY) return; for (const c of ['transactions', 'wishlist', 'state', 'inbox', 'deleted', 'meta']) { try { await store.all(c); } catch (e) {} } });   // loading each list seals any old plain records straight away
const stale = m => epoch.at && (+m || 0) < epoch.at;
app.get('/api/alive', (req, res) => { res.setHeader('Cache-Control', 'no-store'); const ok = signedIn(req); if (ok) touch(req); res.json({ ok }); });
app.get('/api/health', (req, res) => { const pub = { ok: true, time: Date.now(), gate: gateOn(), version: VERSION, lock: 4, idle: process.env.PAGE_IDLE_SEC === 'off' ? 0 : PAGE_IDLE / 1000 }; if (gateOn() && !signedIn(req) && !hasKey(req)) return res.json(pub); res.json(Object.assign(pub, { store: store.kind, locked: !!KEY, up: Math.round(process.uptime()), ai: AI || false, awake: SELF_URL ? awake : false })); });   // details only for you
// ---------------------------------------------------------------------------
// password gate: nothing but the sign-in page is served until the password is given.
//   SITE_PASSWORD  the password you type to open the site (falls back to WALLY_KEY when not set)
//   WALLY_KEY      the machine key used by bookmarks and SMS automation (?key=…)
// A correct password sets a signed, HttpOnly cookie for 30 days on that device.
// ---------------------------------------------------------------------------
const crypto = require('crypto');
const PASS = process.env.SITE_GATE === 'off' ? '' : (process.env.SITE_PASSWORD || KEY);   // SITE_GATE=off keeps the site open and protects only the data routes with WALLY_KEY
// a password changed from inside the app is kept (salted and hashed) in the database and takes over from SITE_PASSWORD.
// Forgot it? Set SITE_PASSWORD_RESET=1 in the host settings: the stored one is ignored and SITE_PASSWORD works again.
let custom = null, SECRET = Buffer.alloc(32);
const reseal = () => { SECRET = crypto.createHash('sha256').update((custom ? custom.hash : PASS) + '|' + KEY + '|wally-mk2').digest(); };
reseal();
const scrypt = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');
const gateOn = () => process.env.SITE_GATE !== 'off' && !!(PASS || custom);
const checkPass = pw => { pw = String(pw || ''); if (custom) return same(scrypt(pw, custom.salt), custom.hash); return !!PASS && same(pw, PASS); };
const authLoaded = process.env.SITE_PASSWORD_RESET === '1' || process.env.SITE_GATE === 'off' ? Promise.resolve() : Promise.resolve().then(() => store.get('meta', 'auth')).then(v => { if (v && v.salt && v.hash) { custom = v; reseal(); console.log('Sign-in uses the password set from inside the app.'); } }).catch(e => console.error('Stored password could not be read, using SITE_PASSWORD: ' + e.message));
const same = (a, b) => { const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest(); return crypto.timingSafeEqual(x, y); };
const sign = exp => exp + '.' + crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex');
const cookieOf = req => { const m = String(req.headers.cookie || '').match(/(?:^|;\s*)wally_s=([^;]+)/); return m ? decodeURIComponent(m[1]) : ''; };
const signedIn = req => { const t = cookieOf(req), exp = +t.split('.')[0]; return gateOn() && exp > Date.now() && same(t, sign(exp)); };
const hasKey = req => !!KEY && same(req.get('x-wally-key') || req.query.key || '', KEY);
const SESSION_MS = 12 * 3600000;
// presence: an open window pings the server every few seconds. Opening the site again after every window has been
// gone for PAGE_IDLE_SEC (default 90 s) always shows the sign-in page, enforced here on the server, so it works
// even if the browser restored the old tab, kept the cookie, or ran an old cached copy of the app.
const PAGE_IDLE = Math.max(15, +process.env.PAGE_IDLE_SEC || 90) * 1000, seen = new Map(), passes = new Map();
const touch = req => { const t = cookieOf(req); if (!t) return; seen.set(t, Date.now()); if (seen.size > 300) { const cut = Date.now() - 864e5; for (const [k, v] of seen) if (v < cut) seen.delete(k); } };
const issuePass = () => { const n = crypto.randomBytes(9).toString('base64url'); passes.set(n, Date.now()); for (const [k, v] of passes) if (Date.now() - v > 120000) passes.delete(k); return n; };
const usePass = n => { const at = passes.get(String(n || '')); if (!at) return false; passes.delete(String(n)); return Date.now() - at < 120000; };
const setCookie = (req, res, val, age) => res.setHeader('Set-Cookie', `wally_s=${encodeURIComponent(val)}; Path=/; HttpOnly; SameSite=Lax${age === null ? '' : '; Max-Age=' + age}${(req.secure || req.get('x-forwarded-proto') === 'https') ? '; Secure' : ''}`);
app.set('trust proxy', 1);
app.use((req, res, next) => { authLoaded.then(() => next()); });
app.use((req, res, next) => { res.setHeader('Referrer-Policy', 'no-referrer'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self), payment=()'); if (process.env.CSP !== 'off') res.setHeader('Content-Security-Policy', CSP); next(); });
// where the pages may load code from and talk to. Anything else (an injected script calling home, a swapped library host) is refused by the browser.
const CSP = ["default-src 'self'", "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com blob:", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com", "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net", "img-src * data: blob:", "media-src * data: blob:", "connect-src 'self' https://api.open-meteo.com https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com https://api.bigdatacloud.net https://api.allorigins.win https://corsproxy.io https://r.jina.ai https://cdn.jsdelivr.net https://unpkg.com https://tessdata.projectnaptha.com data: blob:", "worker-src 'self' blob: https://cdn.jsdelivr.net", "frame-src https://www.youtube.com https://www.youtube-nocookie.com", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"].join('; ');
const tries = new Map();                                          // sign-in attempts per address: 8 wrong tries, then a 15 minute wait
const LOGIN = (msg, next) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Wally MK 3 • Sign in</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 30%,#0b2a3a 0%,#05080e 60%,#020305 100%);color:#e2e8f0;font:15px/1.5 system-ui,Segoe UI,sans-serif}main{width:min(360px,90vw);text-align:center}.r{width:96px;height:96px;margin:0 auto 18px;border-radius:50%;border:3px solid rgba(0,229,255,.5);box-shadow:0 0 30px rgba(0,229,255,.4),inset 0 0 24px rgba(0,229,255,.3);display:grid;place-items:center}.r i{width:34px;height:34px;border-radius:50%;background:radial-gradient(circle,#fff,#9af6ff 45%,rgba(0,229,255,.2) 75%);box-shadow:0 0 26px 6px rgba(0,229,255,.6);animation:b 2.4s ease-in-out infinite}@keyframes b{50%{transform:scale(1.15)}}h1{font-size:19px;letter-spacing:.3em;margin:0;color:#fff}p{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#00e5ff;margin:6px 0 22px}input{width:100%;padding:13px 14px;border-radius:12px;border:1px solid rgba(0,229,255,.4);background:#03080f;color:#fff;font-size:16px;outline:none;text-align:center}input:focus{border-color:#00e5ff;box-shadow:0 0 14px rgba(0,229,255,.3)}button{width:100%;margin-top:12px;padding:13px;border:0;border-radius:12px;background:#00e5ff;color:#000;font-weight:800;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}.e{color:#f87171;font-size:13px;min-height:20px;margin-top:12px}</style></head><body><main><div class="r"><i></i></div><h1>WALLY MK 3</h1><p>C.A.S.P.E.R. • identity check</p><form method="post" action="/login"><input type="hidden" name="next" value="${next || '/'}"><input type="password" name="password" placeholder="Password" autocomplete="current-password" autofocus required><button>Unlock</button></form><div class="e">${msg || ''}</div></main></body></html>`;
app.post('/login', express.urlencoded({ extended: false, limit: '2kb' }), (req, res) => {
  const ip = req.ip || 'x', now = Date.now(), t = tries.get(ip) || { n: 0, at: now }; if (now - t.at > 15 * 60000) { t.n = 0; t.at = now; }
  if (t.n >= 8) return res.status(429).type('html').send(LOGIN('Too many wrong tries. Wait 15 minutes, sir.'));
  if (gateOn() && checkPass(req.body && req.body.password)) { tries.delete(ip); setCookie(req, res, sign(now + SESSION_MS), null); const nx = String((req.body && req.body.next) || '/'); return res.redirect(303, (/^\/(?!\/)[\w\-./]*$/.test(nx) ? nx : '/') + '?u=' + issuePass()); }
  t.n++; tries.set(ip, t); setTimeout(() => res.status(401).type('html').send(LOGIN('That password is not right.')), 600);
});
// change the sign-in password from inside the app (needs a signed-in session and the current password)
app.post('/api/password', (req, res, next) => { if (!signedIn(req)) return res.status(401).json({ error: 'Sign in with the password first.' }); next(); }, wrap(async (req, res) => {
  const cur = String((req.body && req.body.current) || ''), nw = String((req.body && req.body.next) || '');
  const ip = req.ip || 'x', now = Date.now(), t = tries.get(ip) || { n: 0, at: now }; if (now - t.at > 15 * 60000) { t.n = 0; t.at = now; } if (t.n >= 8) return res.status(429).json({ error: 'Too many wrong tries. Wait 15 minutes.' });
  if (!checkPass(cur)) { t.n++; tries.set(ip, t); return res.status(403).json({ error: 'The current password is not right.' }); }
  if (nw.length < 8) return res.status(400).json({ error: 'Use at least 8 characters.' }); if (nw.length > 200) return res.status(400).json({ error: 'That is too long.' }); if (KEY && nw === KEY) return res.status(400).json({ error: 'Do not reuse the machine key as the password.' });
  const salt = crypto.randomBytes(16).toString('hex'), rec = { salt, hash: scrypt(nw, salt), at: now };
  await store.set('meta', 'auth', rec); custom = rec; reseal();                       // every other device is signed out; this one gets a fresh session
  setCookie(req, res, sign(now + SESSION_MS), null); res.json({ success: true });
}));
app.post('/api/logout', (req, res) => { setCookie(req, res, '', 0); res.json({ success: true }); });
// capture key: a separate key that can only ADD bookmarks and bank messages. It is what goes into bookmarks and phone
// automations, so a copied bookmark cannot be used to read or change anything else.
const CAPTURE = KEY || PASS ? crypto.createHmac('sha256', KEY || PASS).update('wally-capture-v1').digest('base64url').slice(0, 24) : '';
const hasCapture = req => !!CAPTURE && same(req.get('x-wally-key') || req.query.key || (req.body && req.body.key) || '', CAPTURE);
const CAPTURE_ONLY = /^\/(bookmark-auto|bookmark-media-auto|sms)$/, CAPTURE_FORM = /^\/(bookmark|bookmark-media)$/;
app.get('/api/capture-key', (req, res, next) => { if (signedIn(req) || hasKey(req)) return res.json({ key: CAPTURE }); res.status(401).json({ error: 'key required' }); });
app.use(/^\/api\/bookmark(-media)?(-auto)?$/, express.urlencoded({ extended: false, limit: '64kb' }));   // the finish-by-hand form posts here
app.use('/api', (req, res, next) => {
  if (!KEY && !gateOn()) return next();
  if (CAPTURE_ONLY.test(req.path)) { if (hasKey(req) || hasCapture(req)) return next(); return res.status(401).type(req.method === 'GET' ? 'html' : 'json').send(req.method === 'GET' ? '<p style="font-family:sans-serif">This save link needs the capture key. Re-drag the bookmark from the app.</p>' : '{"error":"capture key required"}'); }   // never by cookie alone: another website cannot add things in your name
  if (CAPTURE_FORM.test(req.path) && (hasCapture(req) || signedIn(req) || hasKey(req))) return next();
  if (signedIn(req)) { touch(req); return next(); }
  if (hasKey(req)) return next();
  res.status(401).json({ error: 'key required' });
});
// every new tab or app launch asks for the password again: pages carry a small check that signs out a window that was not opened by signing in
const TAB_LOCK = `<script>(function(){try{var S=sessionStorage,L=localStorage,K='cxUnlocked',now=Date.now();
var grace=function(){var v=L.getItem('cxLockGrace');return v===null||isNaN(+v)?30:+v;};
var go=function(){S.removeItem(K);location.replace('/login?next='+encodeURIComponent(location.pathname));};
if(/[?&]u=[\\w-]+/.test(location.search)){S.setItem(K,'1');history.replaceState(null,'',location.pathname+location.hash);}
else if(S.getItem(K)){var left=+S.getItem('cxLeftAt')||0,alive=+S.getItem('cxAlive')||0,keep=+S.getItem('cxKeep')||0,last=Math.max(left,alive);if(!(keep&&now-keep<30000)&&(!last||now-last>6000))S.removeItem(K);}
S.removeItem('cxLeftAt');S.removeItem('cxKeep');
if(!S.getItem(K)){var st=document.createElement('style');st.textContent='body>*:not(#cxLockMsg){display:none!important}';document.documentElement.appendChild(st);
if(navigator.onLine){go();}else{document.addEventListener('DOMContentLoaded',function(){var d=document.createElement('div');d.id='cxLockMsg';d.style.cssText='position:fixed;inset:0;display:grid;place-items:center;background:#030508;color:#7dd3fc;font:600 15px system-ui;text-align:center;padding:24px;z-index:2147483647';d.textContent='Wally MK 3 is locked. Connect to the internet to sign in.';document.body.appendChild(d);});}return;}
window.__cxLock=4;var pinged=0,ping=function(){if(Date.now()-pinged<15000)return;pinged=Date.now();try{fetch('/api/alive',{cache:'no-store',credentials:'same-origin'}).catch(function(){})}catch(e){}};var beat=function(){if(!document.hidden){S.setItem('cxAlive',String(Date.now()));ping();}};beat();setInterval(beat,2000);addEventListener('pagehide',function(){S.setItem('cxLeftAt',String(Date.now()));});addEventListener('pageshow',function(e){if(e.persisted){var a=+S.getItem('cxAlive')||0;if(Date.now()-a>6000+grace()*1000)go();}});
var hid=0;document.addEventListener('visibilitychange',function(){if(document.hidden){hid=Date.now();return;}if(!hid)return;var away=Date.now()-hid;hid=0;var pk=+S.getItem('cxPicker')||0,own=+S.getItem('cxOwn')||0;
if(pk&&Date.now()-pk<600000){S.removeItem('cxPicker');return;}if(own&&Date.now()-own<1800000){S.removeItem('cxOwn');return;}if(away>grace()*1000+800)go();});
document.addEventListener('click',function(e){var t=e.target,l=t&&t.closest&&t.closest('label');if(t&&t.closest&&(t.closest('input[type=file]')||(l&&l.querySelector('input[type=file]'))))S.setItem('cxPicker',String(Date.now()));},true);
var wo=window.open;window.open=function(u){try{if(new URL(u,location.href).origin===location.origin)S.setItem('cxOwn',String(Date.now()));}catch(e){}return wo.apply(window,arguments);};
}catch(e){}})();</script>`;
const PAGES = { '/': 'index.html', '/index.html': 'index.html', '/fitness/': 'fitness/index.html', '/fitness/index.html': 'fitness/index.html', '/fitness': 'fitness/index.html' };
app.get(Object.keys(PAGES), (req, res, next) => { if (!gateOn() || !signedIn(req)) return next();
  if (usePass(req.query.u)) touch(req);                                                                   // straight after typing the password
  else if (process.env.PAGE_IDLE_SEC !== 'off' && Date.now() - (seen.get(cookieOf(req)) || 0) > PAGE_IDLE) { res.setHeader('Cache-Control', 'no-store'); return res.redirect(302, '/login?next=' + encodeURIComponent(req.path)); } fs.readFile(path.join(__dirname, '..', PAGES[req.path]), 'utf8', (e, html) => { if (e) return next(); res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'text/html; charset=utf-8'); const body = Buffer.from(html.replace(/<head[^>]*>/i, m => m + TAB_LOCK)); if (/\bgzip\b/.test(req.get('accept-encoding') || '')) { res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Vary', 'Accept-Encoding'); return res.end(zlib.gzipSync(body)); } res.end(body); }); });
// the sign-in page on its own address: a new window shows it even while another window is signed in (that one stays signed in)
const nextOf = v => /^\/(?!\/)[\w\-./]*$/.test(String(v || '')) ? String(v) : '/';
app.get('/login', (req, res) => { if (!gateOn()) return res.redirect(302, '/'); res.setHeader('Cache-Control', 'no-store'); res.type('html').send(LOGIN('', nextOf(req.query.next))); });
// the site itself: only the sign-in page until the password is given
app.use((req, res, next) => {
  if (!gateOn() || req.path.indexOf('/api/') === 0 || signedIn(req) || /^\/(manifest\.json|sw\.js|icon-\d+\.png|favicon\.ico)$/.test(req.path)) return next();
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(401).end();
  res.status(401).setHeader('Cache-Control', 'no-store'); res.type('html').send(LOGIN('', /^\/(?!\/)[\w\-./]*$/.test(req.path) ? req.path : '/'));
});

// live updates: /api/rev is a cheap "has anything changed" check, /api/events pushes the same number the moment it changes
app.get('/api/rev', (req, res) => res.json({ boot: BOOT, rev, clients: listeners.size, epoch: epoch.at, scope: epoch.scope }));
app.get('/api/events', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write('retry: 4000\n\ndata: ' + BOOT + ':' + rev + '\n\n'); listeners.add(res);
  const beat = setInterval(() => { try { res.write(': ping\n\n'); } catch (e) {} }, 25000);
  req.on('close', () => { clearInterval(beat); listeners.delete(res); });
});

// ---------------------------------------------------------------------------
// one-trip sync: everything a device needs in a single request, and everything it changed in a single request.
// Fewer round trips matters most when the server is far away (each trip from India to a US server is ~250 ms).
// ---------------------------------------------------------------------------
app.get('/api/sync', wrap(async (req, res) => {
  await epochLoaded; const [tx, wish, del, inbox, st] = await Promise.all([store.all('transactions'), store.all('wishlist'), store.all('deleted'), store.all('inbox'), store.all('state')]);
  const state = {}; st.forEach(e => { if (e && e.k) state[e.k] = { v: e.v, t: e.t }; });
  sendFast(req, res, { v: 2, tx, wish, deleted: { tx: del.filter(d => d.kind === 'tx').map(d => d.id), wish: del.filter(d => d.kind === 'wish').map(d => d.id) }, inbox: inbox.sort((a, b) => a.at - b.at), state, rev: BOOT + ':' + rev, epoch });
}));
app.post('/api/sync', wrap(async (req, res) => {
  await epochLoaded; const b = req.body || {}, out = { tx: 0, wish: 0, del: 0, state: 0, ack: 0, skipped: 0 };
  if (purging) return res.status(503).json({ error: 'A purge is running. Try again in a moment.', purging: true });
  if (epoch.at && b.epoch !== undefined && (+b.epoch || 0) < epoch.at) return res.status(409).json({ error: 'This device has not applied the latest purge yet.', purged: epoch });   // its copy is older than the purge: nothing from it is taken
  await inParallel((b.tx || []).slice(0, 2000), async t => { if (!t || t.id == null) return; if (stale(t._m) && epoch.scope !== 'wish') { out.skipped++; return; } if (await isGone('tx', String(t.id))) { out.skipped++; return; } await store.set('transactions', String(t.id), t); out.tx++; });
  await inParallel((b.wish || []).slice(0, 1000), async w => { if (!w || w.id == null) return; if (stale(w._m) && epoch.scope === 'all') { out.skipped++; return; } if (await isGone('wish', String(w.id))) { out.skipped++; return; } await store.set('wishlist', String(w.id), w); out.wish++; });
  for (const id of ((b.del || {}).tx || [])) { await store.del('transactions', String(id)); if (!(await isGone('tx', String(id)))) await store.set('deleted', 'tx:' + id, { kind: 'tx', id: String(id), at: Date.now() }); out.del++; }
  for (const id of ((b.del || {}).wish || [])) { await store.del('wishlist', String(id)); if (!(await isGone('wish', String(id)))) await store.set('deleted', 'wish:' + id, { kind: 'wish', id: String(id), at: Date.now() }); out.del++; }
  for (const id of ((b.undelete || {}).tx || [])) await store.del('deleted', 'tx:' + id);
  for (const id of ((b.undelete || {}).wish || [])) await store.del('deleted', 'wish:' + id);
  const stIn = b.state || {}; for (const k of Object.keys(stIn)) { const cur = await store.get('state', k), inc = stIn[k]; if (!inc || typeof inc.v !== 'string') continue; if (epoch.scope === 'all' && stale(inc.t)) { out.skipped++; continue; } if (!cur || (inc.t || 0) >= (cur.t || 0)) { await store.set('state', k, { k, v: inc.v, t: inc.t || Date.now() }); out.state++; } }
  for (const id of (b.ack || [])) { await store.del('inbox', String(id)); out.ack++; }
  res.json(Object.assign(out, { success: true, rev: BOOT + ':' + rev }));
}));
// purge: wipes the chosen data on the server and tells every device to wipe its copy too
app.post('/api/purge', wrap(async (req, res) => {
  if (!signedIn(req) && !hasKey(req)) return res.status(401).json({ error: 'Sign in first.' });
  const ip = req.ip || 'x', now = Date.now(), t = tries.get(ip) || { n: 0, at: now }; if (now - t.at > 15 * 60000) { t.n = 0; t.at = now; } if (t.n >= 8) return res.status(429).json({ error: 'Too many wrong tries. Wait 15 minutes.' });
  if (gateOn() && !checkPass((req.body || {}).password)) { t.n++; tries.set(ip, t); return res.status(403).json({ error: 'The password is not right.' }); }
  await epochLoaded; const scope = (req.body || {}).scope === 'ledger' ? 'ledger' : 'all';
  const n = await wipeScope(scope);
  res.json({ success: true, removed: n, epoch });
}));
// self-check: measures the database round trip from the server, for the in-app diagnostics
app.get('/api/selftest', wrap(async (req, res) => {
  const t0 = Date.now(), id = 'selftest'; let ok = false, err = '';
  try { await store.set('meta', id, { at: t0 }); const v = await store.get('meta', id); ok = !!v && v.at === t0; await store.del('meta', id); } catch (e) { err = e.message; }
  res.json({ ok, err, dbMs: Date.now() - t0, store: store.kind, version: VERSION, up: Math.round(process.uptime()), ai: AI || false, awake: SELF_URL ? awake : false, gate: gateOn(), epoch, capture: !!CAPTURE, encrypted: encStat });
}));

// ledger
app.get('/api/get-transactions', wrap(async (req, res) => res.json(await store.all('transactions'))));
// a deleted item is remembered, so another device that still holds it cannot quietly put it back
const isGone = async (kind, id) => !!(await store.get('deleted', kind + ':' + id));
app.post('/api/add-transaction', wrap(async (req, res) => { const t = req.body || {}; if (purging) return res.status(503).json({ error: 'purge running' }); if (t.id == null) return res.status(400).json({ error: 'id missing' }); await epochLoaded; if (stale(t._m) && (epoch.scope !== 'wish')) return res.json({ success: true, skipped: 'purged' }); if (await isGone('tx', String(t.id))) return res.json({ success: true, skipped: 'deleted' }); await store.set('transactions', String(t.id), t); res.json({ success: true }); }));
app.delete('/api/delete-transaction/:id', wrap(async (req, res) => { await store.del('transactions', req.params.id); if (!(await isGone('tx', req.params.id))) await store.set('deleted', 'tx:' + req.params.id, { kind: 'tx', id: req.params.id, at: Date.now() }); res.json({ success: true }); }));
app.get('/api/deleted', wrap(async (req, res) => { const all = await store.all('deleted'); res.json({ tx: all.filter(d => d.kind === 'tx').map(d => d.id), wish: all.filter(d => d.kind === 'wish').map(d => d.id) }); }));
app.post('/api/undelete', wrap(async (req, res) => { for (const id of (req.body.tx || [])) await store.del('deleted', 'tx:' + id); for (const id of (req.body.wish || [])) await store.del('deleted', 'wish:' + id); res.json({ success: true }); }));

// wishlist + library share one list (library items carry isMedia: true)
app.get('/api/get-wishlist', wrap(async (req, res) => res.json(await store.all('wishlist'))));
app.post('/api/add-wishlist', wrap(async (req, res) => { const w = req.body || {}; if (w.id == null) return res.status(400).json({ error: 'id missing' }); await epochLoaded; if (stale(w._m) && epoch.scope === 'all') return res.json({ success: true, skipped: 'purged' }); if (await isGone('wish', String(w.id))) return res.json({ success: true, skipped: 'deleted' }); await store.set('wishlist', String(w.id), w); res.json({ success: true }); }));
app.delete('/api/delete-wishlist/:id', wrap(async (req, res) => { await store.del('wishlist', req.params.id); if (!(await isGone('wish', req.params.id))) await store.set('deleted', 'wish:' + req.params.id, { kind: 'wish', id: req.params.id, at: Date.now() }); res.json({ success: true }); }));

// workspace
app.get('/api/get-workspace', wrap(async (req, res) => res.json((await store.get('meta', 'workspace')) || {})));
app.post('/api/save-workspace', wrap(async (req, res) => { await store.set('meta', 'workspace', { notes: req.body.notes || '', whiteboard: req.body.whiteboard || '', t: Date.now() }); res.json({ success: true }); }));

// everything else the app keeps (habits, planner, growth, fitness...) as key -> { v, t }
app.get('/api/state', wrap(async (req, res) => { const out = {}; (await store.all('state')).forEach(e => { out[e.k] = { v: e.v, t: e.t }; }); res.json(out); }));
app.put('/api/state', wrap(async (req, res) => {
  const body = req.body || {}; let n = 0;
  await epochLoaded; for (const k of Object.keys(body)) { const cur = await store.get('state', k), inc = body[k]; if (!inc || typeof inc.v !== 'string') continue; if (epoch.scope === 'all' && stale(inc.t)) continue; if (!cur || (inc.t || 0) >= (cur.t || 0)) { await store.set('state', k, { k, v: inc.v, t: inc.t || Date.now() }); n++; } }
  res.json({ success: true, written: n });
}));

// bank SMS drop-box: the phone posts here, the app collects and files them
const smsIn = wrap(async (req, res) => { const text = String((req.body && (req.body.text || req.body.sms || req.body.message)) || req.query.text || '').slice(0, 2000); if (text.trim().length < 12) return res.status(400).json({ error: 'text missing' }); if (req.query.dry === '1' || (req.body && req.body.dry)) return res.json({ success: true, dry: true }); const id = Date.now() + '_' + Math.random().toString(36).slice(2, 8); await store.set('inbox', id, { id, text, at: Date.now() }); res.json({ success: true, id }); });
app.post('/api/sms', smsIn); app.get('/api/sms', smsIn);
app.get('/api/sms-inbox', wrap(async (req, res) => res.json((await store.all('inbox')).sort((a, b) => a.at - b.at))));
app.post('/api/sms-ack', wrap(async (req, res) => { for (const id of (req.body.ids || [])) await store.del('inbox', String(id)); res.json({ success: true }); }));

// approval queue kept for compatibility with the original app
app.get('/api/pending', (req, res) => res.json([]));
app.post('/api/approve', (req, res) => res.json({ success: false }));
app.post('/api/reject', (req, res) => res.json({ success: true }));

// link scraper
const num = s => { const v = parseFloat(String(s || '').replace(/[^\d.]/g, '')); return v > 0 && v < 1e8 ? v : 0; };
const meta = (html, name) => { const m = html.match(new RegExp('<meta[^>]+(?:property|name|itemprop)=["\']' + name + '["\'][^>]*content=["\']([^"\']*)["\']', 'i')) || html.match(new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name|itemprop)=["\']' + name + '["\']', 'i')); return m ? m[1].trim() : ''; };
const decode = s => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
async function readPage(url) {
  if (!/^https?:\/\//i.test(url)) throw new Error('bad url');
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', 'Accept-Language': 'en-IN,en;q=0.9', 'Accept': 'text/html,application/xhtml+xml' } });
    const html = (await r.text()).slice(0, 3000000);
    if (r.status >= 400 || /<title[^>]*>\s*(access denied|attention required|just a moment|robot check|are you a human|captcha|403|forbidden)/i.test(html)) throw new Error('the shop blocked the server (' + r.status + ')');
    const o = { title: '', price: 0, imageUrl: '', details: '', mediaType: '', genre: '' };
    // the selling price the shop itself marks as final, before any list price: Flipkart, Myntra, Shopify-type stores, The Souled Store
    const firstNum = res => { for (const re of res) { const m = html.match(re); if (m && num(m[1]) > 0) return num(m[1]); } return 0; };
    const sell = firstNum([/Buy (?:at|for|now at)\s*(?:₹|&#8377;|Rs\.?)\s?([\d,]+(?:\.\d+)?)/i, /"finalPrice"\s*:\s*\{[^{}]*?"value"\s*:\s*"?(\d[\d,.]*)/, /"sellingPrice"\s*:\s*\{[^{}]*?"value"\s*:\s*"?(\d[\d,.]*)/, /"discounted(?:Price)?"\s*:\s*"?(\d[\d,.]*)/, /"special_price"\s*:\s*"?(\d[\d,.]*)/, /"sale_price"\s*:\s*"?(\d[\d,.]*)/, /"offer_?[pP]rice"\s*:\s*"?(\d[\d,.]*)/]);
    let ld = null;
    for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { const j = JSON.parse(m[1]); (Array.isArray(j) ? j : [j].concat(j['@graph'] || [])).forEach(x => { if (x && /Product|Movie|Book|TVSeries/.test([].concat(x['@type'] || '').join()) && (!ld || x.offers)) ld = x; }); } catch (e) {} }
    if (ld) { const of = Array.isArray(ld.offers) ? ld.offers[0] : (ld.offers || {}); o.price = sell || num(of.price || of.lowPrice); let im = ld.image; if (Array.isArray(im)) im = im[0]; if (im && im.url) im = im.url; o.imageUrl = im || ''; o.title = ld.name || ''; const pn = x => { x = Array.isArray(x) ? x[0] : x; return x ? (x.name || x) : ''; }; o.details = [String(pn(ld.author) || pn(ld.director) || ''), ld.description || ''].filter(Boolean).join(' — ').slice(0, 300); const ty = [].concat(ld['@type'] || '').join(); o.mediaType = /TVSeries/.test(ty) ? 'Series' : /Book/.test(ty) ? 'Book' : /Movie/.test(ty) ? 'Movie' : ''; o.genre = [].concat(ld.genre || '')[0] || ''; }
    o.title = decode(o.title || meta(html, 'og:title') || (html.match(/id=["']productTitle["'][^>]*>([^<]+)</i) || [])[1] || (html.match(/<title[^>]*>([^<]+)</i) || [])[1] || '');
    o.imageUrl = decode(o.imageUrl || meta(html, 'og:image') || (html.match(/data-old-hires=["']([^"']+)["']/i) || [])[1] || '');
    o.details = decode(o.details || meta(html, 'og:description') || meta(html, 'description')).slice(0, 300);
    if (!o.price) o.price = sell;
    if (!o.price) o.price = num(meta(html, 'product:price:amount') || meta(html, 'og:price:amount') || meta(html, 'price'));
    if (!o.price) o.price = num((html.match(/class=["'][^"']*a-offscreen[^"']*["'][^>]*>\s*(?:₹|&#8377;|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i) || [])[1]);
    if (!o.price) o.price = num((html.match(/class=["'][^"']*(?:Nx9bqj|_30jeq3|a-price-whole|pdp-price|selling-price|final-price)[^"']*["'][^>]*>\s*(?:<[^>]+>\s*)*(?:₹|&#8377;|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i) || [])[1]);
    if (!o.price) o.price = num((html.match(/"(?:selling_?price|final_?price|sale_?price|price)"\s*:\s*"?(\d[\d,.]*)"?/i) || [])[1]);
    if (!o.price) o.price = num((html.match(/(?:₹|&#8377;|Rs\.?)\s?([\d,]{3,}(?:\.\d{1,2})?)/) || [])[1]);
    o.title = o.title.replace(/\s*[-|–:]\s*(Amazon\.in|Amazon\.com|Flipkart\.com|IMDb|Goodreads|Myntra|MyAnimeList\.net).*$/i, '').replace(/^Buy\s+/i, '').replace(/\s+Online at.*$/i, '').replace(/\s+/g, ' ').trim().slice(0, 140);
    return o;
  } finally { clearTimeout(t); }
}
// ---------------------------------------------------------------------------
// bookmark capture: save from any site without opening the dashboard
//   /api/bookmark-auto, /api/bookmark-media-auto : data already read on the page -> save, close tab
//   /api/bookmark, /api/bookmark-media           : small form to finish by hand
// ---------------------------------------------------------------------------
const hEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
const storeOf = u => { const h = hostOf(u); const m = h.match(/(amazon|flipkart|myntra|ajio|croma|meesho|nykaa|tatacliq|snapdeal|reliancedigital|ebay|etsy|ikea|decathlon)/i); return (m ? m[1] : (h.split('.').slice(-2, -1)[0] || 'CAPTURED')).toUpperCase(); };
const mediaTypeOf = (u, ty) => { const x = (u + ' ' + (ty || '')).toLowerCase(); if (/goodreads|book|kindle|audible|storygraph|openlibrary|scribd|libby|wattpad|manga(?!.*anime)/.test(x)) return 'Book'; if (/crunchyroll|myanimelist|anilist|anime|funimation|hidive|kitsu\.|animeplanet|anime-planet/.test(x)) return 'Anime'; if (/tvseries|tvseason|tvepisode|\/tv\/|series|season|episode|\/show|tvmaze|trakt\.tv\/shows/.test(x)) return 'Series'; return 'Movie'; };
const GENRES = ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];
const cleanTitle = t => String(t || '').replace(/\s*[-|–:]\s*(Amazon\.in|Amazon\.com|Flipkart\.com|IMDb|Goodreads|Myntra|MyAnimeList\.net).*$/i, '').replace(/^Buy\s+/i, '').replace(/\s+Online at.*$/i, '').replace(/\s+/g, ' ').trim().slice(0, 140);
async function saveBookmark(q, media) {
  if (q.to === 'm') media = true; else if (q.to === 'w') media = false;              // the form can switch between Wishlist and Library
  const url = String(q.url || ''), title = cleanTitle(q.title); if (!title) throw new Error('title missing');
  const dup = (await store.all('wishlist')).find(w => w && w.link && url && w.link === url && !!w.isMedia === media && !w.purchased);
  if (dup) {                                                                                         // captured again: refresh the price (and fill gaps), keep the old price as history
    const np = num(q.price), was = num(dup.price), upd = Object.assign({}, dup); let changed = 0;
    if (np > 0 && np !== was) { upd.priceHistory = (dup.priceHistory || []).concat({ at: Date.now(), p: was }).slice(-20); upd.priceWas = was; upd.price = np; upd.priceAt = Date.now(); changed = was; }
    if (!dup.imageUrl && /^https?:\/\//i.test(q.image || '')) upd.imageUrl = String(q.image).slice(0, 1500);
    if (changed || upd.imageUrl !== dup.imageUrl) { upd._m = Date.now(); await store.set('wishlist', String(dup.id), upd); }
    return { item: upd, dup: true, changed };
  }
  const id = String(Date.now()) + Math.floor(Math.random() * 90 + 10), base = { id, title, price: num(q.price), link: url, imageUrl: /^https?:\/\//i.test(q.image || '') ? String(q.image).slice(0, 1500) : '', timestamp: Date.now(), source: 'bookmark', _m: Date.now() };
  const item = media
    ? Object.assign(base, { category: 'MEDIA NODE', wishCategory: ['Movie', 'Book', 'Series', 'Anime'].includes(q.mtype) ? q.mtype : mediaTypeOf(url, q.type), mediaGenre: GENRES.find(g => String(q.genre || '').toLowerCase().includes(g.toLowerCase())) || 'Drama', mediaStatus: 'Planned', mediaRating: 'Unrated', mediaDetails: [q.by, q.details].filter(Boolean).join(' — ').slice(0, 300), isMedia: true })
    : Object.assign(base, { category: String(q.store || storeOf(url)).toUpperCase().slice(0, 24), wishCategory: String(q.category || 'Lifestyle').slice(0, 30), priority: 2 });
  await store.set('wishlist', id, item); return { item, dup: false };
}
const PAGE = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${hEsc(title)}</title><style>body{margin:0;background:#04070d;color:#e2e8f0;font:14px/1.5 system-ui,Segoe UI,sans-serif;display:grid;place-items:center;min-height:100vh}main{width:min(380px,92vw);border:1px solid rgba(0,229,255,.45);border-radius:16px;padding:20px;background:#07101c;box-shadow:0 0 30px rgba(0,229,255,.15)}h1{font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#00e5ff;margin:0 0 4px}p{color:#94a3b8;font-size:12.5px;margin:0 0 14px}label{display:block;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;margin:10px 0 4px}input,select{width:100%;box-sizing:border-box;background:#030810;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px;color:#fff;font-size:14px}button{margin-top:16px;width:100%;padding:12px;border:0;border-radius:10px;background:#00e5ff;color:#000;font-weight:800;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}img{max-width:100%;max-height:120px;border-radius:10px;display:block;margin:0 auto 10px}.ok{color:#34d399;font-weight:700}.sw{display:flex;gap:4px;padding:4px;border-radius:12px;background:rgba(255,255,255,.05);margin:4px 0 10px}.sw button{flex:1;margin:0!important;padding:8px!important;background:transparent!important;color:#94a3b8!important;border:0!important;box-shadow:none!important;font-size:12px!important}.sw button.on{background:#00e5ff!important;color:#001018!important}</style></head><body><main>${body}</main></body></html>`;
const savedPage = (r, media) => PAGE('Saved', `<h1>${r.changed ? 'Price updated' : r.dup ? 'Already saved' : 'Saved'}</h1><p class="ok">${hEsc(r.item.title)}${!media && r.item.price ? ' • ₹' + r.item.price : ''}</p>${r.changed ? `<p>Was ₹${r.changed}, now ₹${r.item.price} (${r.item.price < r.changed ? '↓ ₹' + (r.changed - r.item.price) + ' cheaper' : '↑ ₹' + (r.item.price - r.changed) + ' dearer'}).</p>` : ''}<p>It is in your ${r.item.isMedia ? 'Library' : 'Wishlist'} and on all your devices. This window closes by itself.</p><p><a href="#" onclick="history.length>1?history.back():window.close();return false" style="color:#00e5ff">Back to the page</a></p><script>setTimeout(function(){window.close();setTimeout(function(){if(!window.closed&&!window.opener&&history.length>1)history.back()},400)},${r.dup ? 1400 : 600});</script>`);
const formPage = (q, media, pre) => {
  const v = k => hEsc(q[k] || pre[k] || ''), img = q.image || pre.image || '';
  return PAGE('Save to Wally MK 3', `<h1>Save to ${media ? 'Library' : 'Wishlist'}</h1><p>${hEsc(hostOf(q.url || '') || 'No link')} — fill in what the page did not give.</p>${/^https?:/i.test(img) ? `<img src="${hEsc(img)}" alt="">` : ''}
<div class="sw"><button type="button" id="toW" class="${media ? '' : 'on'}">Wishlist</button><button type="button" id="toM" class="${media ? 'on' : ''}">Library</button></div>
<form method="post" action="${media ? 'bookmark-media-auto' : 'bookmark-auto'}"><input type="hidden" name="to" id="to" value="${media ? 'm' : 'w'}"><input type="hidden" name="url" value="${v('url')}"><input type="hidden" name="key" value="${hEsc(CAPTURE)}"><input type="hidden" name="details" value="${v('details')}"><input type="hidden" name="by" value="${v('by')}"><input type="hidden" name="genre" value="${v('genre')}"><input type="hidden" name="type" value="${v('type')}">
<label>${media ? 'Title' : 'Name'}</label><input name="title" required value="${v('title')}">
${media ? `<label>Type</label><select name="mtype">${['Movie', 'Series', 'Anime', 'Book'].map(t => `<option ${t === mediaTypeOf(q.url || '', q.type) ? 'selected' : ''}>${t}</option>`).join('')}</select>` : `<label>Price (₹)</label><input name="price" type="number" min="0" step="any" required value="${hEsc(num(q.price) || num(pre.price) || '')}" autofocus>${!num(q.price) && num(pre.price) ? '<p style="margin:6px 0 0;color:#fbbf24">Read by the server, which shops sometimes show a different price. Check it against the page.</p>' : !num(q.price) ? '<p style="margin:6px 0 0">The page did not show a price to the bookmark. Type the price you see.</p>' : ''}<label>Category</label><select name="category">${['Gadgets', 'Fashion', 'Home', 'Books', 'Fitness', 'Lifestyle'].map(t => `<option ${t === 'Lifestyle' ? 'selected' : ''}>${t}</option>`).join('')}</select>`}
<label>Picture address</label><input name="image" value="${hEsc(img)}"><button>Save</button></form>
<script>(function(){var f=document.forms[0],w=document.getElementById('toW'),m=document.getElementById('toM'),t=document.getElementById('to');function set(x){t.value=x;w.className=x==='w'?'on':'';m.className=x==='m'?'on':'';var p=f.querySelector('[name=price]');if(p){p.required=x==='w';p.parentNode&&(p.style.display=x==='w'?'':'none');var l=p.previousElementSibling;if(l)l.style.display=x==='w'?'':'none';}}w.onclick=function(){set('w')};m.onclick=function(){set('m')};})();</script>`);
};
const bmAuto = media => wrap(async (req, res) => { const q = Object.assign({}, req.query, req.body || {}); try { res.type('html').send(savedPage(await saveBookmark(q, media), media)); } catch (e) { res.type('html').send(formPage(q, media, {})); } });
const bmForm = media => wrap(async (req, res) => { let pre = {}; if (req.query.url && !(req.query.title && (media || num(req.query.price)))) { try { const p = await readPage(String(req.query.url)); pre = { title: p.title, price: p.price, image: p.imageUrl, details: p.details }; } catch (e) {} } res.type('html').send(formPage(req.query, media, pre)); });
app.get('/api/bookmark-auto', bmAuto(false)); app.get('/api/bookmark-media-auto', bmAuto(true)); app.post('/api/bookmark-auto', bmAuto(false)); app.post('/api/bookmark-media-auto', bmAuto(true));
app.get('/api/bookmark', bmForm(false)); app.get('/api/bookmark-media', bmForm(true));

app.post('/api/scrape-price', wrap(async (req, res) => { try { res.json(await readPage(String(req.body.url || ''))); } catch (e) { res.json({ title: '', price: 0, imageUrl: '' }); } }));
app.post('/api/scrape-media', wrap(async (req, res) => { try { res.json(await readPage(String(req.body.url || ''))); } catch (e) { res.json({ title: '' }); } }));

// AI routes are not configured here; the app falls back to its built-in analysis
// ---------------------------------------------------------------------------
// C.A.S.P.E.R. chat: forwards open questions to an AI service when a key is set on the server.
//   ANTHROPIC_API_KEY (Claude)  |  GEMINI_API_KEY (Google)  |  OPENAI_API_KEY (+ OPENAI_BASE_URL for compatible services)
//   CHAT_MODEL overrides the model name. The key never leaves the server.
// ---------------------------------------------------------------------------
const chatHits = []; let geminiModel = process.env.CHAT_MODEL || 'gemini-3.8-flash';
const SYSTEM = `You are C.A.S.P.E.R. (Calculated Asset Security and Personal Expense Recorder), the assistant built into the user's personal finance and life dashboard, Wally MK 3. Address the user as "sir". Be direct, warm and concise: a few short sentences or a short list unless asked for depth. You can answer any general question (knowledge, coding, writing, planning, maths) as well as questions about the user's own data. A snapshot of the user's current data is supplied below as JSON; use it when relevant, quote amounts in Indian rupees with the ₹ sign, and never invent figures that are not in it. For financial or legal decisions give the facts and trade-offs rather than a firm instruction, and say you are not a financial adviser when it matters. You cannot change the user's data yourself; if they want an entry added, tell them the built-in commands (for example "spent 250 on lunch" or "task: pay rent").`;
async function askAI(messages, context, opt) {
  opt = opt || {}; const system = (opt.system || SYSTEM) + '\n\nUSER DATA SNAPSHOT:\n' + JSON.stringify(context || {}).slice(0, 14000) + (opt.json ? '\n\nAnswer with valid JSON only, no other text.' : '');
  const img = opt.image && /^image\/(jpeg|png|webp)$/.test(opt.image.mime) && typeof opt.image.data === 'string' ? opt.image : null;
  const post = async (url, headers, body) => { const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 45000); try { const r = await fetch(url, { method: 'POST', signal: ctl.signal, headers: Object.assign({ 'content-type': 'application/json' }, headers), body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error((j.error && (j.error.message || j.error)) || ('HTTP ' + r.status)); return j; } finally { clearTimeout(t); } };
  if (AI === 'anthropic') { const j = await post('https://api.anthropic.com/v1/messages', { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, { model: process.env.CHAT_MODEL || 'claude-haiku-4-5-20251001', max_tokens: opt.max || 1000, system, messages: img ? messages.map((m, i) => i === messages.length - 1 ? { role: m.role, content: [{ type: 'image', source: { type: 'base64', media_type: img.mime, data: img.data } }, { type: 'text', text: m.content }] } : m) : messages }); return (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n'); }
  if (AI === 'gemini') {
    const call = model => post('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', { 'x-goog-api-key': process.env.GEMINI_API_KEY }, { systemInstruction: { parts: [{ text: system }] }, contents: messages.map((m, i) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }].concat(img && i === messages.length - 1 ? [{ inline_data: { mime_type: img.mime, data: img.data } }] : []) })), generationConfig: Object.assign({ maxOutputTokens: opt.max || 1000 }, opt.json ? { responseMimeType: 'application/json' } : {}) });
    const busy = e => /high demand|overloaded|unavailable|try again|resource.?exhausted|quota|rate|HTTP (429|500|502|503)/i.test(String(e.message));
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const attempt = async model => { let last; for (const d of [0, 1500, 4000]) { if (d) await wait(d); try { return await call(model); } catch (e) { last = e; if (!busy(e)) throw e; } } throw last; };
    let j;
    try { j = await attempt(geminiModel); }
    catch (e) {
      const m = String(e.message).match(/use\s+(?:models\/)?(gemini-[\w.\-]+)/i);                 // Google retired the model and named its replacement
      if (m && m[1] !== geminiModel) { console.log('Gemini model ' + geminiModel + ' is retired, switching to ' + m[1]); geminiModel = m[1]; j = await attempt(geminiModel); }
      else if (busy(e)) {                                                                              // still overloaded: try the other Flash models this key can use
        let alts = (process.env.CHAT_FALLBACK_MODELS || '').split(',').map(x => x.trim()).filter(Boolean);
        if (!alts.length) { try { const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY } }), l = await r.json(); alts = (l.models || []).filter(x => (x.supportedGenerationMethods || []).includes('generateContent') && /gemini-.*flash/i.test(x.name) && !/image|tts|audio|live|embed|preview-0|exp/i.test(x.name)).map(x => x.name.replace(/^models\//, '')).filter(n => n !== geminiModel).sort().reverse().slice(0, 3); } catch (x) {} }
        let done = false; for (const alt of alts) { try { j = await call(alt); console.log('Gemini ' + geminiModel + ' is busy, answered with ' + alt); done = true; break; } catch (x) {} }
        if (!done) throw new Error('Google’s AI is overloaded right now and the backup models are busy too. Try again in a minute.');
      } else throw e;
    }
    return (((j.candidates || [])[0] || {}).content || { parts: [] }).parts.map(p => p.text || '').join('');
  }
  if (AI === 'openai') { const j = await post((process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '') + '/chat/completions', { authorization: 'Bearer ' + process.env.OPENAI_API_KEY }, { model: process.env.CHAT_MODEL || 'gpt-4o-mini', max_tokens: opt.max || 1000, messages: [{ role: 'system', content: system }].concat(img ? messages.map((m, i) => i === messages.length - 1 ? { role: m.role, content: [{ type: 'text', text: m.content }, { type: 'image_url', image_url: { url: 'data:' + img.mime + ';base64,' + img.data } }] } : m) : messages) }); return (((j.choices || [])[0] || {}).message || {}).content || ''; }
  throw new Error('no AI key set');
}
app.post('/api/chat', wrap(async (req, res) => {
  if (!AI) return res.status(503).json({ error: 'No AI key is set on the server.' });
  const now = Date.now(); while (chatHits.length && now - chatHits[0] > 60000) chatHits.shift(); if (chatHits.length >= 20) return res.status(429).json({ error: 'Too many questions in a minute. Give it a moment.' }); chatHits.push(now);
  let msgs = (Array.isArray(req.body.messages) ? req.body.messages : []).filter(m => m && typeof m.content === 'string' && m.content.trim()).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 6000) })).slice(-16);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift(); if (!msgs.length) return res.status(400).json({ error: 'message missing' });
  try { const reply = await askAI(msgs, req.body.context); res.json({ reply: reply || 'I have no answer for that, sir.', provider: AI }); }
  catch (e) { console.error('chat failed: ' + e.message); res.status(502).json({ error: String(e.message).slice(0, 300) }); }
}));

// general AI tasks for the trainer: plans, meal estimates from text or a photo, coach chat with memory
app.post('/api/ai', wrap(async (req, res) => {
  if (!AI) return res.status(503).json({ error: 'No AI key is set on the server.' });
  const now = Date.now(); while (chatHits.length && now - chatHits[0] > 60000) chatHits.shift(); if (chatHits.length >= 20) return res.status(429).json({ error: 'Too many requests in a minute. Give it a moment.' }); chatHits.push(now);
  const b = req.body || {}; let msgs = (Array.isArray(b.messages) ? b.messages : [{ role: 'user', content: String(b.prompt || '') }]).filter(m => m && typeof m.content === 'string' && m.content.trim()).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 8000) })).slice(-16);
  while (msgs.length && msgs[0].role !== 'user') msgs.shift(); if (!msgs.length) return res.status(400).json({ error: 'prompt missing' });
  if (b.image && String(b.image.data || '').length > 6000000) return res.status(413).json({ error: 'That photo is too large.' });
  try { const out = await askAI(msgs, b.context, { system: typeof b.system === 'string' ? b.system.slice(0, 6000) : '', json: !!b.json, image: b.image, max: Math.min(+b.max || 1500, 4000) }); res.json({ reply: out || '', provider: AI }); }
  catch (e) { console.error('ai task failed: ' + e.message); res.status(502).json({ error: String(e.message).slice(0, 300) }); }
}));

['jarvis-advice', 'jarvis-predict', 'jarvis-report'].forEach(r => app.post('/api/' + r, (req, res) => res.status(503).send('AI engine not configured')));

// ----------------------------------------------------------------------------- the app itself
const ROOT = path.join(__dirname, '..');
app.use((req, res, next) => { if (/^\/(server|node_modules|\.git)(\/|$)/.test(req.path) || /\.(env|md)$/i.test(req.path)) return res.status(404).end(); next(); });
// compressed copies of the app files (app.js shrinks from ~700 KB to ~150 KB), kept in memory and revalidated by date
const gz = new Map();
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next(); if (!/\bgzip\b/.test(req.get('accept-encoding') || '')) return next();
  let p = decodeURIComponent(req.path); if (p.endsWith('/')) p += 'index.html'; if (!/\.(js|css|html|json|svg|txt|md)$/i.test(p)) return next();
  const file = path.join(ROOT, p); if (file.indexOf(ROOT) !== 0) return next();
  fs.stat(file, (e, st) => { if (e || !st.isFile()) return next(); const tag = 'W/"' + st.size.toString(36) + '-' + st.mtimeMs.toString(36) + '-gz"';
    if (req.get('if-none-match') === tag) return res.status(304).end();
    let c = gz.get(file); if (!c || c.m !== st.mtimeMs) { try { c = { m: st.mtimeMs, b: zlib.gzipSync(fs.readFileSync(file), { level: 9 }) }; gz.set(file, c); } catch (x) { return next(); } }
    const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', json: 'application/json', svg: 'image/svg+xml', txt: 'text/plain', md: 'text/plain' };
    res.setHeader('Content-Type', types[p.split('.').pop().toLowerCase()] + '; charset=utf-8'); res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Vary', 'Accept-Encoding'); res.setHeader('ETag', tag); res.setHeader('Cache-Control', 'no-cache'); res.end(req.method === 'HEAD' ? undefined : c.b); });
});
app.use(express.static(ROOT, { extensions: ['html'] }));

app.listen(PORT, () => console.log(`Wally MK 3 server on port ${PORT} • storage: ${store.kind} • ${process.env.SITE_GATE === 'off' ? 'sign-in page off' : PASS ? 'password gate on' + (process.env.SITE_PASSWORD ? ' (SITE_PASSWORD)' : ' (using WALLY_KEY as the password)') : 'NO PASSWORD OR KEY SET (open to anyone who has the link)'}`));

// keep-awake: free hosts put the server to sleep when nobody visits. Visiting our own public address
// every 10 minutes counts as a visit. Render sets RENDER_EXTERNAL_URL by itself; elsewhere set KEEP_AWAKE_URL.
// Set KEEP_AWAKE=off to disable.
if (SELF_URL) { const SELF = SELF_URL;
  const ping = () => fetch(SELF + '/api/health').then(r => { awake.pings++; awake.last = Date.now(); awake.ok = r.ok; if (!r.ok) console.error('keep-awake ping answered ' + r.status); }).catch(e => { awake.last = Date.now(); awake.ok = false; console.error('keep-awake ping failed: ' + e.message); });
  setInterval(ping, 10 * 60 * 1000); console.log('Keep-awake is on for ' + SELF);
}
