import api from '../services/api';

const QUEUE_KEY = 'mediassist_pending_sync';

export function getPendingQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function enqueueOfflineAction(endpoint, payload) {
  const queue = getPendingQueue();
  queue.push({
    id: crypto.randomUUID(),
    endpoint,
    payload,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function flushSyncQueue() {
  const queue = getPendingQueue();
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  const remaining = [];
  let synced = 0;

  for (const item of queue) {
    try {
      await api.post(item.endpoint, item.payload);
      synced += 1;
    } catch {
      remaining.push(item);
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { synced, remaining: remaining.length };
}
