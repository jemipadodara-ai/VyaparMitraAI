import { ExtractedTaskData, TaskStatus, UserAccount } from '../types';
import {
  fetchUsersFromFirestore,
  saveUserToFirestore,
  fetchTasksFromFirestore,
  saveTaskToFirestore,
  updateTaskStatusInFirestore,
  deleteTaskFromFirestore,
  clearUserTasksInFirestore,
  subscribeToTasks,
  subscribeToUsers,
} from '../lib/firebase';

export { subscribeToTasks, subscribeToUsers };

export async function fetchUsersFromDb(): Promise<UserAccount[]> {
  // 1. Try Cloud Firestore first
  try {
    const cloudUsers = await fetchUsersFromFirestore();
    if (cloudUsers && cloudUsers.length > 0) {
      return cloudUsers;
    }
  } catch (e) {
    console.warn('Could not fetch users from Cloud Firestore, falling back to SQLite:', e);
  }

  // 2. Fallback to Express / SQLite backend
  try {
    const res = await fetch('/api/db/users');
    const data = await res.json();
    if (data.success && Array.isArray(data.users)) {
      return data.users;
    }
  } catch (err) {
    console.warn('Failed to fetch users from SQL backend:', err);
  }
  return [];
}

export async function createUserInDb(user: UserAccount): Promise<boolean> {
  let cloudSuccess = false;
  try {
    cloudSuccess = await saveUserToFirestore(user);
  } catch (e) {
    console.warn('Error saving user to Cloud Firestore:', e);
  }

  // Dual-write to SQLite backend for offline durability
  try {
    await fetch('/api/db/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (err) {
    console.warn('Failed to save user to SQL backend:', err);
  }

  return cloudSuccess;
}

export async function fetchTasksFromDb(userId: string): Promise<ExtractedTaskData[]> {
  // 1. Try Cloud Firestore first
  try {
    const cloudTasks = await fetchTasksFromFirestore(userId);
    if (cloudTasks && cloudTasks.length > 0) {
      return cloudTasks;
    }
  } catch (e) {
    console.warn('Could not fetch tasks from Cloud Firestore, falling back to SQLite:', e);
  }

  // 2. Fallback to Express / SQLite backend
  try {
    const res = await fetch(`/api/db/tasks?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.tasks)) {
      return data.tasks;
    }
  } catch (err) {
    console.warn('Failed to fetch tasks from SQL backend:', err);
  }
  return [];
}

export async function saveTaskToDb(userId: string, task: ExtractedTaskData): Promise<boolean> {
  let cloudSuccess = false;
  try {
    cloudSuccess = await saveTaskToFirestore(userId, task);
  } catch (e) {
    console.warn('Error saving task to Cloud Firestore:', e);
  }

  // Dual-write to SQLite backend for redundancy
  try {
    await fetch('/api/db/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, task }),
    });
  } catch (err) {
    console.warn('Failed to save task to SQL backend:', err);
  }

  return cloudSuccess;
}

export async function updateTaskStatusInDb(taskId: string, status: TaskStatus, userId?: string): Promise<boolean> {
  if (userId) {
    try {
      await updateTaskStatusInFirestore(userId, taskId, status);
    } catch (e) {
      console.warn('Error updating task in Cloud Firestore:', e);
    }
  }

  try {
    const res = await fetch(`/api/db/tasks/${encodeURIComponent(taskId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Failed to update task status in SQL backend:', err);
    return false;
  }
}

export async function deleteTaskFromDb(taskId: string, userId?: string): Promise<boolean> {
  if (userId) {
    try {
      await deleteTaskFromFirestore(userId, taskId);
    } catch (e) {
      console.warn('Error deleting task in Cloud Firestore:', e);
    }
  }

  try {
    const res = await fetch(`/api/db/tasks/${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Failed to delete task from SQL backend:', err);
    return false;
  }
}

export async function clearUserTasksInDb(userId: string): Promise<boolean> {
  try {
    await clearUserTasksInFirestore(userId);
  } catch (e) {
    console.warn('Error clearing tasks from Cloud Firestore:', e);
  }

  try {
    const res = await fetch(`/api/db/tasks/user/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Failed to clear user tasks in SQL backend:', err);
    return false;
  }
}
