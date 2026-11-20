// Demo stand-in for the Firebase SDK (Demo Apps 5). Every page imports its database and
// sign-in functions from here. Documents live in memory (loaded from data/seed.json); a
// visitor's changes are kept in sessionStorage so they survive moving between pages and are
// gone when the tab closes or "Start again" is pressed. Nothing leaves the browser.
const SEED_URL = new URL("../data/seed.json", import.meta.url);
const OVERLAY_KEY = "tk.overlay";

export class Timestamp {
  constructor(ms) { this._ms = Math.round(ms); }
  toDate() { return new Date(this._ms); }
  toMillis() { return this._ms; }
  static fromDate(d) { return new Timestamp(d.getTime()); }
  static fromMillis(ms) { return new Timestamp(ms); }
  static now() { return new Timestamp(Date.now()); }
}

// ---- values in and out -------------------------------------------------------------------
function revive(v) {
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(revive);
  if (typeof v.__ts === "number" && Object.keys(v).length === 1) return new Timestamp(v.__ts);
  const o = {};
  for (const k in v) o[k] = revive(v[k]);
  return o;
}
function freeze(v) {
  if (v instanceof Timestamp) return { __ts: v.toMillis() };
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(freeze);
  const o = {};
  for (const k in v) o[k] = freeze(v[k]);
  return o;
}
function clone(v) {
  if (v instanceof Timestamp) return new Timestamp(v.toMillis());
  if (v === null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(clone);
  const o = {};
  for (const k in v) o[k] = clone(v[k]);
  return o;
}
const SERVER_TS = { __sentinel: "serverTimestamp" };
export function serverTimestamp() { return SERVER_TS; }
export function arrayUnion(...items) { return { __sentinel: "arrayUnion", items }; }
function same(a, b) { return JSON.stringify(freeze(a)) === JSON.stringify(freeze(b)); }
function resolve(v, existing) {
  if (v === SERVER_TS) return Timestamp.now();
  if (v && v.__sentinel === "arrayUnion") {
    const out = Array.isArray(existing) ? existing.slice() : [];
    for (const it of v.items) { const x = resolve(it); if (!out.some((y) => same(x, y))) out.push(x); }
    return out;
  }
  if (v instanceof Timestamp || v === null || typeof v !== "object") return v;
  if (v instanceof Date) return Timestamp.fromDate(v);
  if (Array.isArray(v)) return v.map((x) => resolve(x));
  const o = {};
  for (const k in v) if (v[k] !== undefined) o[k] = resolve(v[k]);     // undefined keys are dropped, never an error
  return o;
}

// ---- the store ---------------------------------------------------------------------------------
const store = new Map();          // "collection/id" (or deeper) -> data
let overlay = {};                 // this tab's changes: path -> frozen data, or null when deleted
let meta = {};
const ready = (async () => {
  const seed = await (await fetch(SEED_URL, { cache: "no-store" })).json();
  meta = seed.meta || {};
  for (const p in seed.docs) store.set(p, revive(seed.docs[p]));
  try { overlay = JSON.parse(sessionStorage.getItem(OVERLAY_KEY) || "{}"); } catch (e) { overlay = {}; }
  for (const p in overlay) { if (overlay[p] === null) store.delete(p); else store.set(p, revive(overlay[p])); }
})();
function persist(path) {
  overlay[path] = store.has(path) ? freeze(store.get(path)) : null;
  try { sessionStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay)); } catch (e) { /* storage full: the change still lives on this page */ }
}
function read(path) {
  const d = store.get(path);
  if (d === undefined) return undefined;
  const out = clone(d);
  if (out.__live) {            // people on shift right now: their computer keeps reporting in
    const now = new Timestamp(Date.now() - 15000);
    out.lastSeenAt = now; out.updatedAt = now; if (out.writerId) out.writerAt = now;
  }
  delete out.__live;
  return out;
}
const parentOf = (path) => path.slice(0, path.lastIndexOf("/"));
const idOf = (path) => path.slice(path.lastIndexOf("/") + 1);
function docsIn(colPath) {
  const pre = colPath + "/", out = [];
  for (const p of store.keys()) if (p.startsWith(pre) && p.indexOf("/", pre.length) < 0) out.push(p);
  return out;
}

// ---- references and queries ----------------------------------------------------------------------
export function getFirestore() { return { kind: "db" }; }
export function doc(db, ...segs) { const path = segs.join("/"); return { kind: "doc", path, id: idOf(path) }; }
export function collection(db, ...segs) { return { kind: "col", path: segs.join("/"), filters: [], order: null, lim: null }; }
export function where(f, op, v) { return { t: "where", f, op, v }; }
export function orderBy(f, dir) { return { t: "order", f, dir: dir || "asc" }; }
export function limit(n) { return { t: "limit", n }; }
export function query(col, ...parts) {
  const q = { ...col, filters: col.filters.slice() };
  for (const p of parts) { if (p.t === "where") q.filters.push(p); else if (p.t === "order") q.order = p; else if (p.t === "limit") q.lim = p.n; }
  return q;
}
const cmpVal = (x) => (x instanceof Timestamp ? x.toMillis() : x);
function matches(path, data, w) {
  const x = w.f === "__name__" ? idOf(path) : cmpVal(data[w.f]);
  const v = cmpVal(w.v);
  if (w.op === "==") return x === v;
  if (w.op === "in") return Array.isArray(w.v) && w.v.includes(x);
  if (x === undefined || x === null) return false;
  if (w.op === ">=") return x >= v;
  if (w.op === ">") return x > v;
  if (w.op === "<=") return x <= v;
  if (w.op === "<") return x < v;
  if (w.op === "!=") return x !== v;
  return true;
}
function run(q) {
  let rows = docsIn(q.path).map((p) => [p, read(p)]).filter(([p, d]) => q.filters.every((w) => matches(p, d, w)));
  if (q.order) {
    const k = q.order.f, s = q.order.dir === "desc" ? -1 : 1;
    rows = rows.filter(([, d]) => d[k] !== undefined);
    rows.sort((a, b) => { const x = cmpVal(a[1][k]), y = cmpVal(b[1][k]); return x < y ? -s : x > y ? s : 0; });
  }
  if (q.lim != null) rows = rows.slice(0, q.lim);
  return rows;
}
function docSnap(path) {
  const d = read(path);
  return { id: idOf(path), ref: { kind: "doc", path, id: idOf(path) }, exists: () => d !== undefined, data: () => (d === undefined ? undefined : clone(d)) };
}
function querySnap(q) {
  const docs = run(q).map(([p, d]) => ({ id: idOf(p), ref: { kind: "doc", path: p, id: idOf(p) }, exists: () => true, data: () => clone(d) }));
  return { docs, size: docs.length, empty: docs.length === 0, forEach(fn) { docs.forEach(fn); } };
}
export async function getDoc(ref) { await ready; return docSnap(ref.path); }
export async function getDocs(q) { await ready; return querySnap(q); }

// ---- live listeners: fire once, and again after any write to the same collection ----------------------
const listeners = new Set();
export function onSnapshot(ref, next, onErr) {
  const l = { ref, next, onErr, live: true };
  listeners.add(l);
  ready.then(() => fire(l));
  return () => { l.live = false; listeners.delete(l); };
}
function fire(l) {
  if (!l.live) return;
  try { l.next(l.ref.kind === "doc" ? docSnap(l.ref.path) : querySnap(l.ref)); }
  catch (e) { if (l.onErr) l.onErr(e); else console.error(e); }
}
let pending = new Set(), scheduled = false;
function changed(path) {
  persist(path);
  pending.add(path);
  if (scheduled) return;
  scheduled = true;
  setTimeout(() => {
    const paths = pending; pending = new Set(); scheduled = false;
    const cols = new Set([...paths].map(parentOf));
    for (const l of [...listeners]) {
      if (l.ref.kind === "doc" ? paths.has(l.ref.path) : cols.has(l.ref.path)) fire(l);
    }
  }, 0);
}

// ---- writes ------------------------------------------------------------------------------------------
let seq = 0;
const newId = () => "n" + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 6);
function write(path, data, merge) {
  const cur = store.get(path);
  const base = merge && cur ? cur : {};
  const out = merge && cur ? { ...cur } : {};
  for (const k in data) { if (data[k] !== undefined) out[k] = resolve(data[k], base[k]); }
  store.set(path, out);
  changed(path);
}
export async function addDoc(col, data) { await ready; const path = col.path + "/" + newId(); write(path, data, false); return { kind: "doc", path, id: idOf(path) }; }
export async function setDoc(ref, data, opts) { await ready; write(ref.path, data, !!(opts && opts.merge)); }
export async function updateDoc(ref, data) {
  await ready;
  if (!store.has(ref.path)) { const e = new Error("No document to update: " + ref.path); e.code = "not-found"; throw e; }
  write(ref.path, data, true);
}
export async function deleteDoc(ref) { await ready; if (store.delete(ref.path)) changed(ref.path); }
export function writeBatch() {
  const ops = [];
  return {
    delete(ref) { ops.push(() => deleteDoc(ref)); return this; },
    update(ref, data) { ops.push(() => updateDoc(ref, data)); return this; },
    set(ref, data, opts) { ops.push(() => setDoc(ref, data, opts)); return this; },
    async commit() { for (const op of ops) await op(); },
  };
}

// ---- sign-in: the demo is always signed in as one of two people ------------------------------------------
export function initializeApp(options, name) { return { options: options || {}, name: name || "[DEFAULT]" }; }
export async function deleteApp() {}
const mainAuth = { app: { options: {} }, main: true };
export function getAuth(app) { if (!app || !app.name || app.name === "[DEFAULT]") { mainAuth.app = app || mainAuth.app; return mainAuth; } return { app, main: false }; }
function currentUser() {
  let role = "contractor";
  try { role = sessionStorage.getItem("tk.role") || "contractor"; } catch (e) {}
  const uid = role === "admin" ? meta.adminUid : meta.contractorUid;
  const d = store.get("users/" + uid) || {};
  return { uid, email: d.email || "" };
}
export function onAuthStateChanged(auth, cb) { ready.then(() => setTimeout(() => cb(currentUser()), 0)); return () => {}; }
export async function signInWithEmailAndPassword() { await ready; return { user: currentUser() }; }
export async function signOut(auth) {
  if (auth && auth.main === false) return;       // the temporary session used while adding a person
  if (window.demoNotice) window.demoNotice("Signing out is not part of the demo. Use the two buttons in the yellow bar to switch between the Contractor view and the Admin view.", "Not available in the demo");
}
export async function sendPasswordResetEmail() {}
export async function createUserWithEmailAndPassword() { await ready; return { user: { uid: "u-" + newId() } }; }
export const EmailAuthProvider = { credential(email, password) { return { email, password }; } };
export async function reauthenticateWithCredential() {}
export async function updatePassword() {
  if (window.demoNotice) window.demoNotice("Changing a password is switched off in the demo. In the live tool this saves the new password straight away.", "Not available in the demo");
  const e = new Error("switched off in the demo"); e.code = "demo/switched-off"; throw e;
}
