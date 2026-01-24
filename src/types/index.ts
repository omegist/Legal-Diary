export type UserRole = 'lawyer' | 'partner';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  profilePhoto?: string;
  createdAt: string;
}

export interface LawyerProfile extends User {
  role: 'lawyer';
  enrollmentNumber: string;
  practiceArea?: string;
  courtName?: string;
  experienceYears?: number;
  description?: string;
}

export interface PartnerProfile extends User {
  role: 'partner';
  description?: string;
}

export interface PartnerRelationship {
  id: string;
  lawyerId: string;
  partnerId: string;
  status: 'pending' | 'accepted' | 'removed';
  createdAt: string;
}

export interface Diary {
  id: string;
  lawyerId: string;
  matterDate: string;
  courtName: string;
  caseType: string;
  caseNumber: string;
  partyNames: string;
  opponentAdvocate: string;
  stageOfCase: string;
  purposeOfHearing: string;
  notes?: string;
  reminderDate?: string;
  reminderTime?: string;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEditPermission {
  id: string;
  diaryId: string;
  partnerId: string;
  canEdit: boolean;
  grantedAt: string;
}

export interface Request {
  id: string;
  type: 'partner_request' | 'edit_request';
  senderId: string;
  receiverId: string;
  diaryId?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actionType: string;
  performedBy: string;
  targetEntity: string;
  targetId: string;
  timestamp: string;
  details?: string;
}
