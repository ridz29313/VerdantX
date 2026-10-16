import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with explicit firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handler conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'users', 'ping-connection-check'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or awaiting initial sync.');
    }
  }
}

// User sign in with Google Popup
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return null;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

// Sync user profile upon sign in
export async function syncUserProfile(user: User, additionalData?: Record<string, any>) {
  const userRef = doc(db, 'users', user.uid);
  try {
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Clean Innovator',
        photoURL: user.photoURL || '',
        gridHighScore: 0,
        highestValuationM: 0,
        totalCarbonAbatedTons: 0,
        isCertifiedAnalyst: false,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        ...additionalData,
      });
    } else {
      await setDoc(userRef, {
        lastActiveAt: new Date().toISOString(),
        ...additionalData,
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Save game progress
export async function saveGameProgress(userId: string, data: {
  gridHour?: number;
  gridCash?: number;
  gridScore?: number;
  tycoonQuarter?: number;
  tycoonFundCashM?: number;
  tycoonValuationM?: number;
  totalCarbonAbatedTons?: number;
}) {
  const saveRef = doc(db, 'users', userId, 'saves', 'latest');
  try {
    await setDoc(saveRef, {
      userId,
      ...data,
      savedAt: new Date().toISOString(),
    }, { merge: true });

    // Also update high score in user document
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      gridHighScore: data.gridScore || 0,
      highestValuationM: data.tycoonValuationM || 0,
      totalCarbonAbatedTons: data.totalCarbonAbatedTons || 0,
      lastActiveAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/saves/latest`);
  }
}

// Load game progress
export async function loadGameProgress(userId: string) {
  const saveRef = doc(db, 'users', userId, 'saves', 'latest');
  try {
    const snapshot = await getDoc(saveRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}/saves/latest`);
    return null;
  }
}
