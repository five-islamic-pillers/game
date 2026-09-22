import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Use specified databaseId if present, otherwise default
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Verify connection
async function verifyFirestore() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
  } catch {
    // Expected if document doesn't exist or client starts up
  }
}
verifyFirestore();

export default app;
