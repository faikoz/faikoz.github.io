// Firebase init — shared by every page.
import { initializeApp } from "./demo-firebase.js";
import { getAuth } from "./demo-firebase.js";
import { getFirestore } from "./demo-firebase.js";

const firebaseConfig = { projectId: "demo" };   // DEMO: no project behind the demo

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
