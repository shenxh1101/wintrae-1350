export type UserRole = 'teacher' | 'parent';

export type PickupStatus = 'pending' | 'arrived' | 'delivered' | 'leave';

export type LeaveType = 'sick' | 'personal' | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type NotifyType = 'homework' | 'notice' | 'message' | 'photo';

export interface AuthorizedPerson {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatar?: string;
  isTemp?: boolean;
  tempDate?: string;
}

export interface Student {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  className: string;
  grade: string;
  school: string;
  age: number;
  avatar?: string;
  parentName: string;
  parentPhone: string;
  authorizedPersons: AuthorizedPerson[];
  allergies?: string;
  remarks?: string;
}

export interface PickupRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: PickupStatus;
  arrivedTime?: string;
  deliveredTime?: string;
  pickupPerson?: string;
  pickupRelation?: string;
  delayMinutes?: number;
  delayReason?: string;
  photos?: string[];
  confirmed?: boolean;
  teacherNote?: string;
}

export interface LeaveRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewer?: string;
  rejectReason?: string;
}

export interface ChangePickupRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  originalPerson: string;
  newPerson: string;
  newRelation: string;
  newPhone: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface NotifyRecord {
  id: string;
  type: NotifyType;
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId?: string;
  receiverName?: string;
  isGroup: boolean;
  photos?: string[];
  createdAt: string;
  readCount?: number;
  totalCount?: number;
}

export interface DailyStats {
  date: string;
  totalStudents: number;
  arrivedCount: number;
  deliveredCount: number;
  leaveCount: number;
  pendingCount: number;
  abnormalCount: number;
}

export interface MonthlyStats {
  month: string;
  totalDays: number;
  attendanceDays: number;
  leaveDays: number;
  abnormalTimes: number;
  onTimeRate: number;
}
