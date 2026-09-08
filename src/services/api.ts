import { ExtractedTaskData, UserAccount } from '../types';

export async function fetchUsersFromDb(): Promise<UserAccount[]> {
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
  try {
    const res = await fetch('/api/db/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Failed to save user to SQL backend:', err);
    return false;
  }
}

export async function fetchTasksFromDb(userId: string): Promise<ExtractedTaskData[]> {
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
  try {
    const res = await fetch('/api/db/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, task }),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Failed to save task to SQL backend:', err);
    return false;
  }
}

export async function updateTaskStatusInDb(taskId: string, status: string): Promise<boolean> {
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

export async function deleteTaskFromDb(taskId: string): Promise<boolean> {
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
