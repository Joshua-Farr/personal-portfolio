import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, type Functions } from "firebase/functions";

/**
 * Client SDK for the NEW joshfarr.com billing Firebase project only.
 * Do not point VITE_FIREBASE_* at dojo-codex.
 */

export type BillingFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readConfig(): BillingFirebaseConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
  const messagingSenderId = import.meta.env
    .VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  if (projectId === "dojo-codex") {
    throw new Error(
      "VITE_FIREBASE_PROJECT_ID must NOT be dojo-codex. Create a dedicated billing Firebase project."
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket ?? `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId ?? "",
    appId,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let functions: Functions | null = null;
let emulatorsConnected = false;

export function isFirebaseConfigured(): boolean {
  return readConfig() !== null;
}

export function getBillingApp(): FirebaseApp {
  const config = readConfig();
  if (!config) {
    throw new Error(
      "Firebase is not configured. Set VITE_FIREBASE_* for the billing project (see .env.example)."
    );
  }
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(config);
  }
  return app;
}

export function getBillingAuth(): Auth {
  if (!auth) {
    auth = getAuth(getBillingApp());
    maybeConnectEmulators();
  }
  return auth;
}

export function getBillingFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getBillingApp());
    maybeConnectEmulators();
  }
  return firestore;
}

export function getBillingFunctions(): Functions {
  if (!functions) {
    functions = getFunctions(getBillingApp());
    maybeConnectEmulators();
  }
  return functions;
}

function maybeConnectEmulators(): void {
  if (emulatorsConnected) return;
  if (import.meta.env.VITE_USE_FIREBASE_EMULATORS !== "true") return;
  if (!auth) auth = getAuth(getBillingApp());
  if (!firestore) firestore = getFirestore(getBillingApp());
  if (!functions) functions = getFunctions(getBillingApp());
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  emulatorsConnected = true;
}
