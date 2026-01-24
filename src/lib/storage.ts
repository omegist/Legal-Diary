import { User, LawyerProfile, PartnerProfile, Diary, PartnerRelationship, Request, DiaryEditPermission, AuditLog } from '@/types';

const STORAGE_KEYS = {
  CURRENT_USER: 'legalDiary_currentUser',
  USERS: 'legalDiary_users',
  DIARIES: 'legalDiary_diaries',
  PARTNER_RELATIONSHIPS: 'legalDiary_partnerRelationships',
  REQUESTS: 'legalDiary_requests',
  EDIT_PERMISSIONS: 'legalDiary_editPermissions',
  AUDIT_LOGS: 'legalDiary_auditLogs',
};

// Generic helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// User management
export function getCurrentUser(): LawyerProfile | PartnerProfile | null {
  return getItem(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: LawyerProfile | PartnerProfile | null): void {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
}

export function getAllUsers(): (LawyerProfile | PartnerProfile)[] {
  return getItem(STORAGE_KEYS.USERS, []);
}

export function getUserById(id: string): LawyerProfile | PartnerProfile | undefined {
  return getAllUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): LawyerProfile | PartnerProfile | undefined {
  return getAllUsers().find(u => u.email === email);
}

export function createUser(user: LawyerProfile | PartnerProfile): void {
  const users = getAllUsers();
  users.push(user);
  setItem(STORAGE_KEYS.USERS, users);
  setCurrentUser(user);
  addAuditLog('USER_CREATED', user.id, 'user', user.id);
}

export function updateUser(user: LawyerProfile | PartnerProfile): void {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    setItem(STORAGE_KEYS.USERS, users);
    if (getCurrentUser()?.id === user.id) {
      setCurrentUser(user);
    }
  }
}

export function getLawyers(): LawyerProfile[] {
  return getAllUsers().filter((u): u is LawyerProfile => u.role === 'lawyer');
}

export function searchLawyers(query: string): LawyerProfile[] {
  const lawyers = getLawyers();
  const lowerQuery = query.toLowerCase();
  return lawyers.filter(l => 
    l.name.toLowerCase().includes(lowerQuery) ||
    l.enrollmentNumber.toLowerCase().includes(lowerQuery)
  );
}

// Diary management
export function getDiaries(): Diary[] {
  return getItem(STORAGE_KEYS.DIARIES, []);
}

export function getDiaryById(id: string): Diary | undefined {
  return getDiaries().find(d => d.id === id);
}

export function getDiariesByLawyer(lawyerId: string): Diary[] {
  return getDiaries().filter(d => d.lawyerId === lawyerId);
}

export function createDiary(diary: Diary): void {
  const diaries = getDiaries();
  diaries.push(diary);
  setItem(STORAGE_KEYS.DIARIES, diaries);
  addAuditLog('DIARY_CREATED', diary.lawyerId, 'diary', diary.id);
}

export function updateDiary(diary: Diary): void {
  const diaries = getDiaries();
  const index = diaries.findIndex(d => d.id === diary.id);
  if (index !== -1) {
    diaries[index] = { ...diary, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.DIARIES, diaries);
    const currentUser = getCurrentUser();
    addAuditLog('DIARY_UPDATED', currentUser?.id || 'unknown', 'diary', diary.id);
  }
}

export function deleteDiary(diaryId: string): void {
  const diaries = getDiaries().filter(d => d.id !== diaryId);
  setItem(STORAGE_KEYS.DIARIES, diaries);
  const currentUser = getCurrentUser();
  addAuditLog('DIARY_DELETED', currentUser?.id || 'unknown', 'diary', diaryId);
}

// Partner relationships
export function getPartnerRelationships(): PartnerRelationship[] {
  return getItem(STORAGE_KEYS.PARTNER_RELATIONSHIPS, []);
}

export function getPartnersByLawyer(lawyerId: string): PartnerRelationship[] {
  return getPartnerRelationships().filter(
    r => r.lawyerId === lawyerId && r.status === 'accepted'
  );
}

export function getLawyersByPartner(partnerId: string): PartnerRelationship[] {
  return getPartnerRelationships().filter(
    r => r.partnerId === partnerId && r.status === 'accepted'
  );
}

export function createPartnerRelationship(relationship: PartnerRelationship): void {
  const relationships = getPartnerRelationships();
  relationships.push(relationship);
  setItem(STORAGE_KEYS.PARTNER_RELATIONSHIPS, relationships);
}

export function updatePartnerRelationship(id: string, status: PartnerRelationship['status']): void {
  const relationships = getPartnerRelationships();
  const index = relationships.findIndex(r => r.id === id);
  if (index !== -1) {
    relationships[index].status = status;
    setItem(STORAGE_KEYS.PARTNER_RELATIONSHIPS, relationships);
  }
}

// Requests
export function getRequests(): Request[] {
  return getItem(STORAGE_KEYS.REQUESTS, []);
}

export function getRequestsByReceiver(receiverId: string): Request[] {
  return getRequests().filter(r => r.receiverId === receiverId && r.status === 'pending');
}

export function getRequestsBySender(senderId: string): Request[] {
  return getRequests().filter(r => r.senderId === senderId);
}

export function createRequest(request: Request): void {
  const requests = getRequests();
  requests.push(request);
  setItem(STORAGE_KEYS.REQUESTS, requests);
}

export function updateRequest(id: string, status: Request['status']): void {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index].status = status;
    setItem(STORAGE_KEYS.REQUESTS, requests);
  }
}

// Edit permissions
export function getEditPermissions(): DiaryEditPermission[] {
  return getItem(STORAGE_KEYS.EDIT_PERMISSIONS, []);
}

export function canPartnerEditDiary(partnerId: string, diaryId: string): boolean {
  return getEditPermissions().some(
    p => p.partnerId === partnerId && p.diaryId === diaryId && p.canEdit
  );
}

export function grantEditPermission(permission: DiaryEditPermission): void {
  const permissions = getEditPermissions();
  const existing = permissions.findIndex(
    p => p.partnerId === permission.partnerId && p.diaryId === permission.diaryId
  );
  if (existing !== -1) {
    permissions[existing] = permission;
  } else {
    permissions.push(permission);
  }
  setItem(STORAGE_KEYS.EDIT_PERMISSIONS, permissions);
}

export function revokeEditPermission(partnerId: string, diaryId: string): void {
  const permissions = getEditPermissions().filter(
    p => !(p.partnerId === partnerId && p.diaryId === diaryId)
  );
  setItem(STORAGE_KEYS.EDIT_PERMISSIONS, permissions);
}

// Audit logs
export function getAuditLogs(): AuditLog[] {
  return getItem(STORAGE_KEYS.AUDIT_LOGS, []);
}

export function addAuditLog(
  actionType: string,
  performedBy: string,
  targetEntity: string,
  targetId: string,
  details?: string
): void {
  const logs = getAuditLogs();
  logs.push({
    id: crypto.randomUUID(),
    actionType,
    performedBy,
    targetEntity,
    targetId,
    timestamp: new Date().toISOString(),
    details,
  });
  setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// Logout
export function logout(): void {
  setCurrentUser(null);
}
