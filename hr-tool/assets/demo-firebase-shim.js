// Demo Firebase shim — replaces firebase-app / firebase-auth / firebase-firestore
// via an import map. Reads all data from ./demo-data.json.

const RAW = await fetch(new URL("./demo-data.json", import.meta.url)).then(r => r.json());

// Shift every "date" string and every {_ts_ms: N} timestamp so the mock's
// concept of "today" aligns with the real "today" in the browser. Without
// this the tool's melDateKey() (which uses real Date.now()) wouldn't match
// any of our stored records after enough time passes.
const MOCK_TODAY = "2026-07-06";              // matches generate_hr_mock.py
const REAL_TODAY = _melDateKey(new Date());   // today in Melbourne
const _dayShift  = Math.round(
  (Date.parse(REAL_TODAY + "T00:00:00Z") - Date.parse(MOCK_TODAY + "T00:00:00Z")) / 86_400_000
);
const _msShift   = _dayShift * 86_400_000;

function _melDateKey(d) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(d);
  const m = {};
  parts.forEach(p => (m[p.type] = p.value));
  return `${m.year}-${m.month}-${m.day}`;
}
function _shiftDayKey(key, days) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,"0")}-${String(dt.getUTCDate()).padStart(2,"0")}`;
}

const DATE_KEYS = new Set(["date", "startDate", "endDate", "startKey", "endKey"]);
const NOW = Date.now();
function _shiftAllDates(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(_shiftAllDates);
  if (typeof value === "object") {
    // {_offset_ms: N} → real now + N (used for live clock-ins so the elapsed
    // timer starts ticking from the moment the demo loads).
    if (typeof value._offset_ms === "number") {
      return { _ts_ms: NOW + value._offset_ms };
    }
    if (typeof value._ts_ms === "number") {
      return { _ts_ms: value._ts_ms + _msShift };
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (DATE_KEYS.has(k) && typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
        out[k] = _shiftDayKey(v, _dayShift);
      } else {
        out[k] = _shiftAllDates(v);
      }
    }
    return out;
  }
  return value;
}

const _collections = _shiftAllDates(RAW.collections);
const holidays     = RAW.holidays;
console.log("[demo shim] loaded — dayShift=" + _dayShift + " (mock today=" + MOCK_TODAY + ", real today=" + REAL_TODAY + ")");

// Expose the holidays list so assets/holidays.js can read it without a fetch.
window.__DEMO_HOLIDAYS__ = holidays;

// ---- Auth persona resolver ------------------------------------------------
// Path-based persona: /admin/* → admin, /app/* → contractor.
// Same rule works inside iframes (each frame has its own path).
function pickPersona() {
  const p = location.pathname.toLowerCase();
  if (p.includes("/admin/")) {
    return _collections.users.find(u => u.role === "admin");
  }
  const contractors = _collections.users.filter(u => u.role === "contractor" && u.active && !u.mustChangePassword);
  return contractors[0] || _collections.users.find(u => u.role === "contractor");
}
const PERSONA = pickPersona();
const FAKE_USER = PERSONA ? {
  uid:          PERSONA.uid,
  email:        PERSONA.email,
  displayName:  PERSONA.displayName,
  emailVerified: true,
  metadata: { creationTime: PERSONA.startDate, lastSignInTime: new Date().toISOString() },
} : null;

// ---- initializeApp / deleteApp -------------------------------------------
export function initializeApp(_cfg, _name) { return { __demo: true }; }
export function deleteApp(_app) { return Promise.resolve(); }

// ---- getAuth + auth API ---------------------------------------------------
const _authListeners = new Set();
const _authInstance  = { currentUser: FAKE_USER };
export function getAuth(_app) { return _authInstance; }

export function onAuthStateChanged(_auth, cb) {
  // Fire immediately with the fake user.
  Promise.resolve().then(() => cb(FAKE_USER));
  _authListeners.add(cb);
  return () => _authListeners.delete(cb);
}
export function signOut(_auth) {
  return demoBlock("Sign out");
}
export function updatePassword(_user, _pwd) {
  return demoBlock("Change password");
}
export function signInWithEmailAndPassword(_auth, _email, _pwd) {
  return demoBlock("Sign in");
}
export function createUserWithEmailAndPassword(_auth, _email, _pwd) {
  return demoBlock("Create account");
}
export function sendPasswordResetEmail(_auth, _email) {
  return demoBlock("Send password reset");
}
export function reauthenticateWithCredential(_user, _cred) {
  return demoBlock("Reauthenticate");
}
export const EmailAuthProvider = {
  credential(email, pwd) { return { email, pwd, __demoCredential: true }; },
  PROVIDER_ID: "password",
};

// ---- Firestore ------------------------------------------------------------
export function getFirestore(_app) { return { __demo: true }; }

class DocRef {
  constructor(collectionPath, id) { this._c = collectionPath; this._id = id; }
  get id() { return this._id; }
  get path() { return this._c + "/" + this._id; }
}
class CollectionRef {
  constructor(path) { this._path = path; }
  get path() { return this._path; }
}
class QueryObj {
  constructor(collectionRef, constraints) {
    this._c = collectionRef;
    this._constraints = constraints || [];
  }
}

export function collection(_db, ...pathParts) {
  return new CollectionRef(pathParts.join("/"));
}
export function doc(dbOrRef, ...pathParts) {
  // Two call shapes:
  //   doc(db, "users", uid)
  //   doc(collectionRef, id)
  if (dbOrRef instanceof CollectionRef) {
    return new DocRef(dbOrRef.path, pathParts[0]);
  }
  const id = pathParts.pop();
  return new DocRef(pathParts.join("/"), id);
}

function _fetchColl(name) { return (_collections[name] || []).slice(); }
function _findDoc(collectionName, id) {
  const list = _collections[collectionName] || [];
  return list.find(d => (d.id || d.uid) === id);
}
function _idOf(doc) { return doc.id || doc.uid; }

// Query constraints — return small tagged objects; apply in _runQuery below.
export function where(field, op, value) { return { __c: "where", field, op, value }; }
export function orderBy(field, dir = "asc") { return { __c: "orderBy", field, dir }; }
export function limit(n) { return { __c: "limit", n }; }

function _runQuery(qOrRef) {
  let coll, constraints;
  if (qOrRef instanceof QueryObj) {
    coll = qOrRef._c; constraints = qOrRef._constraints;
  } else if (qOrRef instanceof CollectionRef) {
    coll = qOrRef; constraints = [];
  } else {
    throw new Error("demo shim: bad query target");
  }
  let rows = _fetchColl(coll.path.split("/")[0]);
  // Sub-collection support (leaveRequests/{id}/comments) — return empty for demo.
  if (coll.path.split("/").length > 1) return [];
  for (const c of constraints) {
    if (c.__c === "where") {
      rows = rows.filter(r => _matchWhere(r[c.field], c.op, c.value));
    } else if (c.__c === "orderBy") {
      rows.sort((a, b) => {
        const av = a[c.field], bv = b[c.field];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (c.dir === "desc" ? -1 : 1);
      });
    } else if (c.__c === "limit") {
      rows = rows.slice(0, c.n);
    }
  }
  return rows;
}
function _matchWhere(val, op, target) {
  switch (op) {
    case "==": return val === target;
    case "!=": return val !== target;
    case ">":  return val >  target;
    case ">=": return val >= target;
    case "<":  return val <  target;
    case "<=": return val <= target;
    case "in": return Array.isArray(target) && target.includes(val);
    case "not-in": return Array.isArray(target) && !target.includes(val);
    case "array-contains": return Array.isArray(val) && val.includes(target);
    default: return false;
  }
}

export function query(collRef, ...constraints) {
  return new QueryObj(collRef, constraints);
}

export async function getDoc(docRef) {
  const [name] = docRef.path.split("/");
  const found = _findDoc(name, docRef._id);
  return _snap(found, docRef._id);
}
function _snap(data, id) {
  return {
    id,
    exists: () => !!data,
    data:   () => data ? _cloneWithTimestamps(data) : undefined,
    ref:    { id },
  };
}
export async function getDocs(qOrRef) {
  const rows = _runQuery(qOrRef);
  const docs = rows.map(r => _snap(r, _idOf(r)));
  return {
    empty:  docs.length === 0,
    size:   docs.length,
    docs,
    forEach(cb) { docs.forEach(cb); },
  };
}

// Live listeners — fire once immediately and never again (data is static).
export function onSnapshot(qOrRef, cb, errCb) {
  // Fire asynchronously so calling code has time to finish setup before the
  // callback runs (mirrors the real Firestore behaviour).
  queueMicrotask(() => {
    try {
      if (qOrRef instanceof DocRef) {
        const [name] = qOrRef.path.split("/");
        cb(_snap(_findDoc(name, qOrRef._id), qOrRef._id));
      } else {
        const rows  = _runQuery(qOrRef);
        const docs  = rows.map(r => _snap(r, _idOf(r)));
        cb({ empty: docs.length === 0, size: docs.length, docs, forEach(fn) { docs.forEach(fn); } });
      }
    } catch (e) {
      console.error("[demo shim] onSnapshot error", e);
      if (errCb) errCb(e);
    }
  });
  return () => {};
}

// ---- Writes: block with the standard demo message. -----------------------
function demoBlock(_label) {
  alert("Unavailable in Demo");
  return Promise.reject(new Error("demo-locked"));
}
export function addDoc(_ref, _data)  { return demoBlock("addDoc"); }
export function setDoc(_ref, _data)  { return demoBlock("setDoc"); }
export function updateDoc(_ref, _d)  { return demoBlock("updateDoc"); }
export function deleteDoc(_ref)      { return demoBlock("deleteDoc"); }
export function writeBatch(_db)      {
  return { set: demoBlock, update: demoBlock, delete: demoBlock,
           commit: () => demoBlock("batch commit") };
}
export function runTransaction(_db, _fn) { return demoBlock("transaction"); }
export function arrayUnion(...values) { return { __arrayUnion: values }; }
export function arrayRemove(...values) { return { __arrayRemove: values }; }
export function increment(n) { return { __increment: n }; }

// ---- Timestamp shim -------------------------------------------------------
export class Timestamp {
  constructor(seconds, nanoseconds = 0) { this.seconds = seconds; this.nanoseconds = nanoseconds; }
  static now()               { return Timestamp.fromDate(new Date()); }
  static fromDate(d)         { return new Timestamp(Math.floor(d.getTime() / 1000)); }
  static fromMillis(ms)      { return new Timestamp(Math.floor(ms / 1000)); }
  toMillis()                 { return this.seconds * 1000; }
  toDate()                   { return new Date(this.toMillis()); }
}
export function serverTimestamp() { return Timestamp.now(); }

// Convert {_ts_ms: <ms>} markers (used in demo-data.json) into Timestamp
// objects so the tool's .toDate() calls keep working. Applied recursively
// so nested arrays / objects are covered.
function _cloneWithTimestamps(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(_cloneWithTimestamps);
  if (typeof value === "object") {
    if (typeof value._ts_ms === "number") return Timestamp.fromMillis(value._ts_ms);
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = _cloneWithTimestamps(v);
    return out;
  }
  return value;
}

// ---- Also cover a couple of one-off imports the tool uses ---------------
export function connectFirestoreEmulator() {}
export function enableIndexedDbPersistence() { return Promise.resolve(); }
