// Auth state router — every protected page imports this.
// On load: if not signed in → /login.html. If role mismatch → kick to correct view.
import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "./demo-firebase.js";
import { doc, getDoc } from "./demo-firebase.js";

// DEMO: the folder this app is served from, wherever that is
const BASE = location.pathname.replace(/(?:app|admin)\/[^/]*$/, "").replace(/[^/]*$/, "");

export function pathTo(rel) {
  return BASE + rel.replace(/^\//, "");
}

export async function requireRole(expected) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        location.replace(pathTo("login.html"));
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        alert("Your account has not been set up by an admin yet. Signing you out.");
        await signOut(auth);
        location.replace(pathTo("login.html"));
        return;
      }
      const profile = snap.data();
      if (!profile.active) {
        alert("Your account is deactivated. Contact your admin.");
        await signOut(auth);
        location.replace(pathTo("login.html"));
        return;
      }
      if (profile.mustChangePassword && !location.pathname.endsWith("set-password.html")) {
        location.replace(pathTo("set-password.html"));
        return;
      }
      // `expected` may be a role string or an array of accepted roles.
      const allowed = expected ? (Array.isArray(expected) ? expected : [expected]) : null;
      if (allowed && !allowed.includes(profile.role)) {
        const target = (profile.role === "admin" || profile.role === "viewer")
          ? "admin/index.html"
          : "app/index.html";
        location.replace(pathTo(target));
        return;
      }
      resolve({ user, profile });
    });
  });
}

export async function logout() {
  await signOut(auth);   // DEMO: shows a note and stays on the page
}
