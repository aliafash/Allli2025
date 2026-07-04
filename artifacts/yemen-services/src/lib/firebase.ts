import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCgFnPJso1f2mwB1jvyRbGzZReAdf4eug0",
  authDomain: "dalyly2026.firebaseapp.com",
  databaseURL: "https://dalyly2026-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dalyly2026",
  storageBucket: "dalyly2026.firebasestorage.app",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const rtdb = getDatabase(firebaseApp);
