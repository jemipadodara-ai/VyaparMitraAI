import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import configJson from '../../firebase-applet-config.json';
import { ExtractedTaskData, TaskStatus, UserAccount } from '../types';

const firebaseConfig = {
  projectId: configJson.projectId,
  appId: configJson.appId,
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
};

const databaseId = configJson.firestoreDatabaseId || '(default)';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
let firestoreDb: Firestore;
try {
  firestoreDb = getFirestore(app, databaseId);
} catch (e) {
  console.warn('Failed to initialize Firestore with custom databaseId, falling back to default:', e);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const auth = getAuth(app);

// Sign in anonymously to authenticate requests for Firestore security rules
export async function ensureAuth() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (err) {
    console.warn('Anonymous auth failed or not enabled:', err);
  }
}

// Initial silent auth trigger
ensureAuth();

// --- Firestore User Profile Operations ---

export async function fetchUsersFromFirestore(): Promise<UserAccount[]> {
  try {
    await ensureAuth();
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => docSnap.data() as UserAccount);
    }
  } catch (err) {
    console.warn('Firestore fetchUsers error:', err);
  }
  return [];
}

export async function saveUserToFirestore(user: UserAccount): Promise<boolean> {
  try {
    await ensureAuth();
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore saveUser error:', err);
    return false;
  }
}

export function subscribeToUsers(onUsersUpdated: (users: UserAccount[]) => void) {
  try {
    const usersCol = collection(db, 'users');
    return onSnapshot(usersCol, (snapshot) => {
      const users = snapshot.docs.map((d) => d.data() as UserAccount);
      if (users.length > 0) {
        onUsersUpdated(users);
      }
    }, (err) => {
      console.warn('Firestore users subscription warning:', err);
    });
  } catch (err) {
    console.warn('Error subscribing to users:', err);
    return () => {};
  }
}

// --- Firestore Task Operations ---

export async function fetchTasksFromFirestore(userId: string): Promise<ExtractedTaskData[]> {
  try {
    await ensureAuth();
    const tasksCol = collection(db, 'users', userId, 'tasks');
    const q = query(tasksCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => docSnap.data() as ExtractedTaskData);
    }
  } catch (err) {
    console.warn('Firestore fetchTasks error:', err);
  }
  return [];
}

export async function saveTaskToFirestore(userId: string, task: ExtractedTaskData): Promise<boolean> {
  try {
    await ensureAuth();
    const taskRef = doc(db, 'users', userId, 'tasks', task.id);
    await setDoc(taskRef, {
      ...task,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore saveTask error:', err);
    return false;
  }
}

export async function updateTaskStatusInFirestore(userId: string, taskId: string, status: TaskStatus): Promise<boolean> {
  try {
    await ensureAuth();
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore updateTaskStatus error:', err);
    return false;
  }
}

export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<boolean> {
  try {
    await ensureAuth();
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
    return true;
  } catch (err) {
    console.warn('Firestore deleteTask error:', err);
    return false;
  }
}

export async function clearUserTasksInFirestore(userId: string): Promise<boolean> {
  try {
    await ensureAuth();
    const tasksCol = collection(db, 'users', userId, 'tasks');
    const snapshot = await getDocs(tasksCol);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.warn('Firestore clearUserTasks error:', err);
    return false;
  }
}

export function subscribeToTasks(userId: string, onTasksUpdated: (tasks: ExtractedTaskData[]) => void) {
  try {
    const tasksCol = collection(db, 'users', userId, 'tasks');
    const q = query(tasksCol, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((d) => d.data() as ExtractedTaskData);
      onTasksUpdated(tasks);
    }, (err) => {
      console.warn('Firestore tasks subscription warning:', err);
    });
  } catch (err) {
    console.warn('Error subscribing to tasks:', err);
    return () => {};
  }
}
