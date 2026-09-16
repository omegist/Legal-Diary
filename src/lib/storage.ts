import { User, LawyerProfile, PartnerProfile, Diary, PartnerRelationship, Request, DiaryEditPermission, AuditLog } from '@/types';
import { saveToCache, getFromCache, STORES } from './offlineCache';

// IMPORTANT: For mobile app, always use production URL
// localhost doesn't work on mobile devices
const API_URL = 'https://legal-diary-backend.onrender.com/api';
const STORAGE_KEYS = {
  CURRENT_USER: 'legalDiary_currentUser',
};

// Helper to convert snake_case to camelCase
const toCamel = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamel(obj[key]);
    return acc;
  }, {} as any);
};

// Helper to convert camelCase to snake_case
const toSnake = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = toSnake(obj[key]);
    return acc;
  }, {} as any);
};

// Current user (still in localStorage for session)
export function getCurrentUser(): LawyerProfile | PartnerProfile | null {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: LawyerProfile | PartnerProfile | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Users
export async function getAllUsers(): Promise<(LawyerProfile | PartnerProfile)[]> {
  const res = await fetch(`${API_URL}/users`);
  const data = await res.json();
  return toCamel(data);
}

export async function getUserById(id: string): Promise<LawyerProfile | PartnerProfile | undefined> {
  const res = await fetch(`${API_URL}/users/${id}`);
  const data = await res.json();
  return toCamel(data);
}

export async function getUserByEmail(email: string): Promise<LawyerProfile | PartnerProfile | undefined> {
  try {
    console.log('Fetching user by email:', email);
    const res = await fetch(`${API_URL}/users/email/${encodeURIComponent(email)}`);
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      console.error('Failed to fetch user:', res.status, res.statusText);
      return undefined;
    }
    
    const data = await res.json();
    console.log('User data received:', data);
    
    // If no user found, API returns null or empty object
    if (!data || Object.keys(data).length === 0) {
      console.log('No user found with email:', email);
      return undefined;
    }
    
    const camelData = toCamel(data);
    console.log('Converted to camelCase:', camelData);
    return camelData;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return undefined;
  }
}

export async function createUser(user: LawyerProfile | PartnerProfile): Promise<void> {
  await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(user)),
  });
  setCurrentUser(user);
  await addAuditLog('USER_CREATED', user.id, 'user', user.id);
}

export async function updateUser(user: LawyerProfile | PartnerProfile): Promise<void> {
  await fetch(`${API_URL}/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(user)),
  });
  if (getCurrentUser()?.id === user.id) {
    setCurrentUser(user);
  }
}

export async function getLawyers(): Promise<LawyerProfile[]> {
  const users = await getAllUsers();
  return users.filter((u): u is LawyerProfile => u.role === 'lawyer');
}

export async function searchLawyers(query: string): Promise<LawyerProfile[]> {
  const lawyers = await getLawyers();
  const lowerQuery = query.toLowerCase();
  return lawyers.filter(l => 
    l.name.toLowerCase().includes(lowerQuery) ||
    l.enrollmentNumber.toLowerCase().includes(lowerQuery)
  );
}

// Diaries
export async function getDiaries(): Promise<Diary[]> {
  try {
    const res = await fetch(`${API_URL}/diaries`);
    const data = await res.json();
    const diaries = toCamel(data);
    // Cache for offline use
    await saveToCache(STORES.DIARIES, diaries);
    return diaries;
  } catch (error) {
    console.log('Offline: Loading diaries from cache');
    return await getFromCache(STORES.DIARIES) || [];
  }
}

export async function getDiaryById(id: string): Promise<Diary | undefined> {
  const res = await fetch(`${API_URL}/diaries/${id}`);
  const data = await res.json();
  return toCamel(data);
}

export async function getDiariesByLawyer(lawyerId: string): Promise<Diary[]> {
  try {
    const res = await fetch(`${API_URL}/diaries/lawyer/${lawyerId}`);
    const data = await res.json();
    const diaries = toCamel(data);
    await saveToCache(STORES.DIARIES, diaries);
    return diaries;
  } catch (error) {
    console.log('Offline: Loading lawyer diaries from cache');
    const allDiaries = await getFromCache(STORES.DIARIES) || [];
    return allDiaries.filter((d: Diary) => d.lawyerId === lawyerId);
  }
}

export async function createDiary(diary: Diary): Promise<void> {
  console.log('Creating diary:', diary);
  const snakeData = toSnake(diary);
  console.log('Snake case data:', snakeData);
  
  try {
    const res = await fetch(`${API_URL}/diaries`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(snakeData),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error response:', errorText);
      throw new Error(`Failed to create diary: ${res.status} - ${errorText}`);
    }
    
    const result = await res.json();
    console.log('Create diary response:', result);
    await addAuditLog('DIARY_CREATED', diary.lawyerId, 'diary', diary.id);
  } catch (error) {
    console.error('Network error creating diary:', error);
    throw error;
  }
}

export async function updateDiary(diary: Diary): Promise<void> {
  await fetch(`${API_URL}/diaries/${diary.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(diary)),
  });
  const currentUser = getCurrentUser();
  await addAuditLog('DIARY_UPDATED', currentUser?.id || 'unknown', 'diary', diary.id);
}

export async function deleteDiary(diaryId: string): Promise<void> {
  await fetch(`${API_URL}/diaries/${diaryId}`, { method: 'DELETE' });
  const currentUser = getCurrentUser();
  await addAuditLog('DIARY_DELETED', currentUser?.id || 'unknown', 'diary', diaryId);
}

// Partner Relationships
export async function getPartnerRelationships(): Promise<PartnerRelationship[]> {
  const res = await fetch(`${API_URL}/partner-relationships`);
  const data = await res.json();
  return toCamel(data);
}

export async function getPartnersByLawyer(lawyerId: string): Promise<PartnerRelationship[]> {
  const all = await getPartnerRelationships();
  return all.filter(r => r.lawyerId === lawyerId && r.status === 'accepted');
}

export async function getLawyersByPartner(partnerId: string): Promise<PartnerRelationship[]> {
  const all = await getPartnerRelationships();
  return all.filter(r => r.partnerId === partnerId && r.status === 'accepted');
}

export async function createPartnerRelationship(relationship: PartnerRelationship): Promise<void> {
  await fetch(`${API_URL}/partner-relationships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(relationship)),
  });
}

export async function updatePartnerRelationship(id: string, status: PartnerRelationship['status']): Promise<void> {
  await fetch(`${API_URL}/partner-relationships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// Requests
export async function getRequests(): Promise<Request[]> {
  const res = await fetch(`${API_URL}/requests`);
  const data = await res.json();
  return toCamel(data);
}

export async function getRequestsByReceiver(receiverId: string): Promise<Request[]> {
  const all = await getRequests();
  return all.filter(r => r.receiverId === receiverId && r.status === 'pending');
}

export async function getRequestsBySender(senderId: string): Promise<Request[]> {
  const all = await getRequests();
  return all.filter(r => r.senderId === senderId);
}

export async function createRequest(request: Request): Promise<void> {
  await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(request)),
  });
}

export async function updateRequest(id: string, status: Request['status']): Promise<void> {
  await fetch(`${API_URL}/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// Edit Permissions
export async function getEditPermissions(): Promise<DiaryEditPermission[]> {
  const res = await fetch(`${API_URL}/edit-permissions`);
  const data = await res.json();
  return toCamel(data);
}

export async function canPartnerEditDiary(partnerId: string, diaryId: string): Promise<boolean> {
  const perms = await getEditPermissions();
  return perms.some(p => p.partnerId === partnerId && p.diaryId === diaryId && p.canEdit);
}

export async function grantEditPermission(permission: DiaryEditPermission): Promise<void> {
  await fetch(`${API_URL}/edit-permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(permission)),
  });
}

export async function revokeEditPermission(partnerId: string, diaryId: string): Promise<void> {
  await fetch(`${API_URL}/edit-permissions/${diaryId}/${partnerId}`, { method: 'DELETE' });
}

// Audit Logs
export async function getAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_URL}/audit-logs`);
  const data = await res.json();
  return toCamel(data);
}

export async function addAuditLog(
  actionType: string,
  performedBy: string,
  targetEntity: string,
  targetId: string,
  details?: string
): Promise<void> {
  await fetch(`${API_URL}/audit-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      action_type: actionType,
      performed_by: performedBy,
      target_entity: targetEntity,
      target_id: targetId,
      details,
    }),
  });
}

export function logout(): void {
  setCurrentUser(null);
}
