// Configuração e inicialização do Firebase para o sistema SafeCare-Home

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDXmeNr6wCZR-6bXVcnb_rqWwZRQrEsQoo",
  authDomain: "safecare-home-1dce7.firebaseapp.com",
  databaseURL: "https://safecare-home-1dce7-default-rtdb.firebaseio.com",
  projectId: "safecare-home-1dce7",
  storageBucket: "safecare-home-1dce7.appspot.com",
  messagingSenderId: "660801831627",
  appId: "1:660801831627:web:c9d482564008e9c957514e",
  measurementId: "G-S2S8V76NM3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

export { app, analytics, database, auth };