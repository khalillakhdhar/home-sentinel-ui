import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLUYiXbz2fOL5-iuROgsad4CkqHOhTvdY",
  authDomain: "smartmonitor-98bf3.firebaseapp.com",
  projectId: "smartmonitor-98bf3",
  storageBucket: "smartmonitor-98bf3.firebasestorage.app",
  messagingSenderId: "212372132340",
  appId: "1:212372132340:web:2fec50aef7571cc567e9a1",
  measurementId: "G-FGCMSZLNE9",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

async function initAnalytics() {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  return getAnalytics(firebaseApp);
}

void initAnalytics();
