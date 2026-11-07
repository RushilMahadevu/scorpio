import { auth } from './firebase';
/** Bearer authentication avoids racing the asynchronous session-cookie refresh. */
export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in again');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  return fetch(input, { ...init, headers });
}
export async function getTeacherAssignment(id: string) {
  const res = await authenticatedFetch(`/api/assignments?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Unable to load assignment');
  const data = await res.json();
  // Preserve the timestamp interface used by existing views.
  if (data.dueDate?._seconds) data.dueDate = new Date(data.dueDate._seconds * 1000);
  return { exists: () => true, data: () => data, id };
}
