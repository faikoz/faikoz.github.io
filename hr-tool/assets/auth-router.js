// DEMO auth-router: resolves synchronously with a fixed persona per iframe.
import { auth, db } from "./firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const BASE = location.pathname.includes("/hr-tool/") ? "/hr-tool/" : "/";
export function pathTo(rel) { return BASE + rel.replace(/^\//, ""); }

export async function requireRole(expected) {
  const user = auth.currentUser;
  if (!user) throw new Error("demo: no persona for path " + location.pathname);
  const snap = await getDoc(doc(db, "users", user.uid));
  const profile = snap.data();
  return { user, profile };
}

export async function logout() {
  alert("Unavailable in Demo");
}
