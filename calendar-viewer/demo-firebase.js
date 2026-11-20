// Demo stand-in for the Firebase SDK (Demo Apps 5). The page imports its database and
// sign-in functions from here. Appointments and quote history come from two files next to
// the page; the demo user is always signed in; nothing can be written.
const DEMO_USER = { email: "demo.owner@ironbarktools.example", emailVerified: true };
let dataP = null;
function load() {
  if (!dataP) {
    dataP = Promise.all([
      fetch("data/events.json", { cache: "no-store" }).then((r) => r.json()),
      fetch("data/config.json", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([events, config]) => ({ events, config }));
  }
  return dataP;
}
export const firebaseConfig = {};
export function initializeApp() { return {}; }
export function getFirestore() { return {}; }
export function getAuth() { return {}; }
export function collection(db, name) { return { kind: "col", name, filters: [], order: null }; }
export function doc(db, col, id) { return { kind: "doc", col, id }; }
export function where(f, op, v) { return { t: "where", f, op, v }; }
export function orderBy(f, dir) { return { t: "order", f, dir: dir || "asc" }; }
export function query(col, ...parts) {
  return { ...col, filters: parts.filter((p) => p.t === "where"), order: parts.find((p) => p.t === "order") || null };
}
function run(q, d) {
  const ok = (e, w) => {
    const x = e[w.f];
    if (w.op === ">=") return x >= w.v;
    if (w.op === ">") return x > w.v;
    if (w.op === "<") return x < w.v;
    if (w.op === "<=") return x <= w.v;
    if (w.op === "==") return x === w.v;
    return true;
  };
  let rows = d.events.filter((e) => q.filters.every((w) => ok(e, w)));
  if (q.order) {
    const k = q.order.f, s = q.order.dir === "desc" ? -1 : 1;
    rows = rows.slice().sort((a, b) => (a[k] < b[k] ? -s : a[k] > b[k] ? s : 0));
  }
  return rows;
}
function rowsSnap(rows) {
  return {
    size: rows.length,
    forEach(fn) { rows.forEach((r) => fn({ id: r.id, data: () => { const { id, ...rest } = r; return rest; } })); },
  };
}
export async function getDocs(q) { return rowsSnap(run(q, await load())); }
export function onSnapshot(ref, cb, onErr) {
  load().then((d) => {
    if (ref.kind === "doc") { const v = d.config[ref.id]; cb({ exists: () => v !== undefined, data: () => v }); }
    else cb(rowsSnap(run(ref, d)));
  }).catch((e) => { if (onErr) onErr(e); else console.error(e); });
  return () => {};
}
export function onAuthStateChanged(auth, cb) { setTimeout(() => cb(DEMO_USER), 0); return () => {}; }
export function isSignInWithEmailLink() { return false; }
export async function sendSignInLinkToEmail() {}
export async function signInWithEmailLink() { return { user: DEMO_USER }; }
export async function signInWithEmailAndPassword() { return { user: DEMO_USER }; }
export async function signOut() {
  if (window.demoNotice) window.demoNotice("Signing out is not part of the demo. In the live tool staff sign in with a link sent to their work email, and this ends the session.", "Not available in the demo");
}
