import { create } from 'zustand';
import type { UserRole, Student, PickupRecord, LeaveRecord, ChangePickupRecord, NotifyRecord, DailyStats, MonthlyStats } from '@/types';
import { mockStudents, mockPickupRecords, mockLeaveRecords, mockChangePickupRecords, mockNotifyRecords, mockDailyStats, mockMonthlyStats, mockCurrentUser } from '@/data/mockData';

interface AppState {
  currentUser: { id: string; name: string; role: UserRole; phone: string; avatar?: string };
  students: Student[];
  pickupRecords: PickupRecord[];
  leaveRecords: LeaveRecord[];
  changePickupRecords: ChangePickupRecord[];
  notifyRecords: NotifyRecord[];
  dailyStats: DailyStats[];
  monthlyStats: MonthlyStats[];
  setCurrentUser: (user: AppState['currentUser']) => void;
  updatePickupStatus: (id: string, status: PickupRecord['status'], extra?: Partial<PickupRecord>) => void;
  addLeaveRecord: (record: Omit<LeaveRecord, 'id' | 'status' | 'createdAt'>) => void;
  addChangePickupRecord: (record: Omit<ChangePickupRecord, 'id' | 'status' | 'createdAt'>) => void;
  addNotifyRecord: (record: Omit<NotifyRecord, 'id' | 'createdAt'>) => void;
  confirmPickup: (id: string) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  addAuthorizedPerson: (studentId: string, person: Omit<import('@/types').AuthorizedPerson, 'id'>) => void;
  removeAuthorizedPerson: (studentId: string, personId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: mockCurrentUser,
  students: mockStudents,
  pickupRecords: mockPickupRecords,
  leaveRecords: mockLeaveRecords,
  changePickupRecords: mockChangePickupRecords,
  notifyRecords: mockNotifyRecords,
  dailyStats: mockDailyStats,
  monthlyStats: mockMonthlyStats,

  setCurrentUser: (user) => set({ currentUser: user }),

  updatePickupStatus: (id, status, extra) =>
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) =>
        r.id === id ? { ...r, status, ...extra } : r
      )
    })),

  addLeaveRecord: (record) =>
    set((state) => ({
      leaveRecords: [
        {
          ...record,
          id: Date.now().toString(36),
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        ...state.leaveRecords
      ]
    })),

  addChangePickupRecord: (record) =>
    set((state) => ({
      changePickupRecords: [
        {
          ...record,
          id: Date.now().toString(36),
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        ...state.changePickupRecords
      ]
    })),

  addNotifyRecord: (record) =>
    set((state) => ({
      notifyRecords: [
        {
          ...record,
          id: Date.now().toString(36),
          createdAt: new Date().toISOString()
        },
        ...state.notifyRecords
      ]
    })),

  confirmPickup: (id) =>
    set((state) => ({
      pickupRecords: state.pickupRecords.map((r) =>
        r.id === id ? { ...r, confirmed: true } : r
      )
    })),

  updateStudent: (id, data) =>
    set((state) => ({
      students: state.students.map((s) =>
        s.id === id ? { ...s, ...data } : s
      )
    })),

  addAuthorizedPerson: (studentId, person) =>
    set((state) => ({
      students: state.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              authorizedPersons: [...s.authorizedPersons, { ...person, id: Date.now().toString(36) }]
            }
          : s
      )
    })),

  removeAuthorizedPerson: (studentId, personId) =>
    set((state) => ({
      students: state.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              authorizedPersons: s.authorizedPersons.filter((p) => p.id !== personId)
            }
          : s
      )
    }))
}));
