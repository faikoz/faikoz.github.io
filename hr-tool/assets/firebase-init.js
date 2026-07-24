// DEMO firebase-init: no real Firebase call is made — every import below
// resolves to demo-firebase-shim.js via the import map declared in each page.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export const app  = initializeApp({});
export const auth = getAuth(app);
export const db   = getFirestore(app);
