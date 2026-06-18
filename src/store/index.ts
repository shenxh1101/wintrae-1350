import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { User, UserRole, Student, PickupRecord, LeaveRecord, ChangePickupRecord, NotifyRecord, DailyStats, MonthlyStats } from '@/types';
import { mockStudents, mockPickupRecords, mockLeaveRecords, mockChangePickupRecords, mockNotifyRecords, mockDailyStats, mockMonthlyStats, mockCurrentUser, mockAllUsers, mockTeachers, mockParents } from '@/data/mockData';
import dayjs from 'dayjs';

const STORAGE_KEY = 'tutoring_pickup_store_v1';

interface PersistState {
  currentUser: User | null;
  students: Student[];
  pickupRecords: PickupRecord[];
  leaveRecords: LeaveRecord[];
  changePickupRecords: ChangePickupRecord[];
  notifyRecords: NotifyRecord[];
  dailyStats: DailyStats[];
  monthlyStats: MonthlyStats[];
}

const loadPersistedState = (): Partial<PersistState> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    console.warn('[store] load persist failed', e);
  }
  return {};
};

const savePersistedState = (state: PersistState) => {
  try {
    const data = JSON.stringify(state);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, data);
    }
    Taro.setStorageSync(STORAGE_KEY, data);
  } catch (e) {
    console.warn('[store] save persist failed', e);
  }
};

interface AppState {
  roleSelected: boolean;
  allUsers: User[];
  teachers: User[];
  parents: User[];
  currentUser: User;
  students: Student[];
  pickupRecords: PickupRecord[];
  leaveRecords: LeaveRecord[];
  changePickupRecords: ChangePickupRecord[];
  notifyRecords: NotifyRecord[];
  dailyStats: DailyStats[];
  monthlyStats: MonthlyStats[];

  selectRoleAndUser: (user: User) => void;
  resetRole: () => void;
  setCurrentUser: (user: User) => void;
  updatePickupStatus: (id: string, status: PickupRecord['status'], extra?: Partial<PickupRecord>) => void;
  addLeaveRecord: (record: Omit<LeaveRecord, 'id' | 'status' | 'createdAt'>) => void;
  reviewLeaveRecord: (id: string, status: 'approved' | 'rejected', reviewer: string, rejectReason?: string) => void;
  addChangePickupRecord: (record: Omit<ChangePickupRecord, 'id' | 'status' | 'createdAt'>) => void;
  reviewChangePickupRecord: (id: string, status: 'approved' | 'rejected', reviewer: string, rejectReason?: string) => void;
  addNotifyRecord: (record: Omit<NotifyRecord, 'id' | 'createdAt'>) => void;
  confirmPickup: (id: string) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  addAuthorizedPerson: (studentId: string, person: Omit<import('@/types').AuthorizedPerson, 'id'>) => void;
  removeAuthorizedPerson: (studentId: string, personId: string) => void;
  getMyStudents: () => Student[];
  getMyPickupRecords: () => PickupRecord[];
  getMyLeaveRecords: () => LeaveRecord[];
  getMyChangePickupRecords: () => ChangePickupRecord[];
  getMyNotifyRecords: () => NotifyRecord[];
  recomputeMonthlyStats: () => void;
}

const persisted = loadPersistedState();

const getInitialState = (): Omit<AppState, keyof { [K in keyof AppState as AppState[K] extends Function ? K : never]: AppState[K] }> => {
  return {
    roleSelected: !!persisted.currentUser,
    allUsers: mockAllUsers,
    teachers: mockTeachers,
    parents: mockParents,
    currentUser: persisted.currentUser || mockCurrentUser,
    students: persisted.students || mockStudents,
    pickupRecords: persisted.pickupRecords || mockPickupRecords,
    leaveRecords: persisted.leaveRecords || mockLeaveRecords,
    changePickupRecords: persisted.changePickupRecords || mockChangePickupRecords,
    notifyRecords: persisted.notifyRecords || mockNotifyRecords,
    dailyStats: persisted.dailyStats || mockDailyStats,
    monthlyStats: persisted.monthlyStats || mockMonthlyStats
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  ...getInitialState(),

  selectRoleAndUser: (user) => {
    set({ currentUser: user, roleSelected: true });
    savePersistedState({
      currentUser: user,
      students: get().students,
      pickupRecords: get().pickupRecords,
      leaveRecords: get().leaveRecords,
      changePickupRecords: get().changePickupRecords,
      notifyRecords: get().notifyRecords,
      dailyStats: get().dailyStats,
      monthlyStats: get().monthlyStats
    });
  },

  resetRole: () => {
    set({ roleSelected: false });
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      Taro.removeStorageSync(STORAGE_KEY);
    } catch (e) {}
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  updatePickupStatus: (id, status, extra) => {
    set((state) => {
      const pickupRecords = state.pickupRecords.map((r) =>
        r.id === id ? { ...r, status, ...extra } : r
      );
      savePersistedState({
        currentUser: state.currentUser,
        students: state.students,
        pickupRecords,
        leaveRecords: state.leaveRecords,
        changePickupRecords: state.changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { pickupRecords };
    });
  },

  addLeaveRecord: (record) => {
    set((state) => {
      const leaveRecords = [
        {
          ...record,
          id: Date.now().toString(36),
          status: 'pending' as const,
          createdAt: dayjs().toISOString()
        },
        ...state.leaveRecords
      ];
      savePersistedState({
        currentUser: state.currentUser,
        students: state.students,
        pickupRecords: state.pickupRecords,
        leaveRecords,
        changePickupRecords: state.changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { leaveRecords };
    });
  },

  reviewLeaveRecord: (id, status, reviewer, rejectReason) => {
    set((state) => {
      const leaveRecords = state.leaveRecords.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              reviewedAt: dayjs().toISOString(),
              reviewer,
              ...(rejectReason ? { rejectReason } : {})
            }
          : r
      );
      savePersistedState({
        currentUser: state.currentUser,
        students: state.students,
        pickupRecords: state.pickupRecords,
        leaveRecords,
        changePickupRecords: state.changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { leaveRecords };
    });
  },

  addChangePickupRecord: (record) => {
    set((state) => {
      const changePickupRecords = [
        {
          ...record,
          id: Date.now().toString(36),
          status: 'pending' as const,
          createdAt: dayjs().toISOString()
        },
        ...state.changePickupRecords
      ];
      savePersistedState({
        currentUser: state.currentUser,
        students: state.students,
        pickupRecords: state.pickupRecords,
        leaveRecords: state.leaveRecords,
        changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { changePickupRecords };
    });
  },

  reviewChangePickupRecord: (id, status, reviewer, rejectReason) => {
    set((state) => {
      const changePickupRecords = state.changePickupRecords.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              reviewedAt: dayjs().toISOString(),
              reviewer,
              ...(rejectReason ? { rejectReason } : {})
            }
          : r
      );
      savePersistedState({
        currentUser: state.currentUser,
        students: state.students,
        pickupRecords: state.pickupRecords,
        leaveRecords: state.leaveRecords,
        changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { changePickupRecords };
    });
  },

  addNotifyRecord: (record) => {
    set((state) => {
      const notifyRecords = [
        {
          ...record,
          id: Date.now().toString(36),
          createdAt: dayjs().toISOString()
        },
        ...state.notifyRecords
      ];
      savePersistedState({
        currentUser: state.currentUser,
        students: state.students,
        pickupRecords: state.pickupRecords,
        leaveRecords: state.leaveRecords,
        changePickupRecords: state.changePickupRecords,
        notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { notifyRecords };
    });
  },

  confirmPickup: (id) => {
    set((state) => {
      const pickupRecords = state.pickupRecords.map((r) =>
        r.id === id ? { ...r, confirmed: true } : r
      );
      savePersistedState({
        currentUser: state.currentUser,
        students: state.students,
        pickupRecords,
        leaveRecords: state.leaveRecords,
        changePickupRecords: state.changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { pickupRecords };
    });
  },

  updateStudent: (id, data) => {
    set((state) => {
      const students = state.students.map((s) =>
        s.id === id ? { ...s, ...data } : s
      );
      savePersistedState({
        currentUser: state.currentUser,
        students,
        pickupRecords: state.pickupRecords,
        leaveRecords: state.leaveRecords,
        changePickupRecords: state.changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { students };
    });
  },

  addAuthorizedPerson: (studentId, person) => {
    set((state) => {
      const students = state.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              authorizedPersons: [...s.authorizedPersons, { ...person, id: Date.now().toString(36) }]
            }
          : s
      );
      savePersistedState({
        currentUser: state.currentUser,
        students,
        pickupRecords: state.pickupRecords,
        leaveRecords: state.leaveRecords,
        changePickupRecords: state.changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { students };
    });
  },

  removeAuthorizedPerson: (studentId, personId) => {
    set((state) => {
      const students = state.students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              authorizedPersons: s.authorizedPersons.filter((p) => p.id !== personId)
            }
          : s
      );
      savePersistedState({
        currentUser: state.currentUser,
        students,
        pickupRecords: state.pickupRecords,
        leaveRecords: state.leaveRecords,
        changePickupRecords: state.changePickupRecords,
        notifyRecords: state.notifyRecords,
        dailyStats: state.dailyStats,
        monthlyStats: state.monthlyStats
      });
      return { students };
    });
  },

  getMyStudents: () => {
    const { currentUser, students } = get();
    if (currentUser.role === 'teacher') return students;
    const myIds = currentUser.studentIds || [];
    return students.filter((s) => myIds.includes(s.id));
  },

  getMyPickupRecords: () => {
    const { currentUser, pickupRecords } = get();
    if (currentUser.role === 'teacher') return pickupRecords;
    const myIds = currentUser.studentIds || [];
    return pickupRecords.filter((r) => myIds.includes(r.studentId));
  },

  getMyLeaveRecords: () => {
    const { currentUser, leaveRecords } = get();
    if (currentUser.role === 'teacher') return leaveRecords;
    const myIds = currentUser.studentIds || [];
    return leaveRecords.filter((r) => myIds.includes(r.studentId));
  },

  getMyChangePickupRecords: () => {
    const { currentUser, changePickupRecords } = get();
    if (currentUser.role === 'teacher') return changePickupRecords;
    const myIds = currentUser.studentIds || [];
    return changePickupRecords.filter((r) => myIds.includes(r.studentId));
  },

  getMyNotifyRecords: () => {
    const { currentUser, notifyRecords } = get();
    return notifyRecords.filter((n) => {
      if (n.isGroup) return true;
      if (n.senderId === currentUser.id) return true;
      if (n.receiverId === currentUser.id) return true;
      return false;
    });
  },

  recomputeMonthlyStats: () => {
    const { pickupRecords, leaveRecords } = get();
    const monthMap = new Map<string, { attendance: Set<string>; leave: Set<string>; abnormal: number }>();

    pickupRecords.forEach((r) => {
      const m = r.date.substring(0, 7);
      if (!monthMap.has(m)) monthMap.set(m, { attendance: new Set(), leave: new Set(), abnormal: 0 });
      const bucket = monthMap.get(m)!;
      if (r.status === 'leave') {
        bucket.leave.add(r.date + r.studentId);
      } else if (r.status === 'arrived' || r.status === 'delivered') {
        bucket.attendance.add(r.date + r.studentId);
      }
      if (r.delayMinutes && r.delayMinutes > 0) {
        bucket.abnormal++;
      }
    });

    leaveRecords.forEach((r) => {
      if (r.status !== 'approved') return;
      const start = dayjs(r.startDate);
      const end = dayjs(r.endDate);
      for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
        const m = d.format('YYYY-MM');
        if (!monthMap.has(m)) monthMap.set(m, { attendance: new Set(), leave: new Set(), abnormal: 0 });
        monthMap.get(m)!.leave.add(d.format('YYYY-MM-DD') + r.studentId);
      }
    });

    const monthlyStats: MonthlyStats[] = Array.from(monthMap.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([month, data]) => {
        const total = data.attendance.size + data.leave.size;
        const onTimeRate = total > 0 ? Math.round((data.attendance.size / total) * 100) : 100;
        return {
          month,
          totalDays: 22,
          attendanceDays: data.attendance.size,
          leaveDays: data.leave.size,
          abnormalTimes: data.abnormal,
          onTimeRate
        };
      });

    if (monthlyStats.length === 0) {
      const curMonth = dayjs().format('YYYY-MM');
      monthlyStats.push({
        month: curMonth,
        totalDays: 22,
        attendanceDays: 0,
        leaveDays: 0,
        abnormalTimes: 0,
        onTimeRate: 100
      });
    }

    set({ monthlyStats });
    const state = get();
    savePersistedState({
      currentUser: state.currentUser,
      students: state.students,
      pickupRecords: state.pickupRecords,
      leaveRecords: state.leaveRecords,
      changePickupRecords: state.changePickupRecords,
      notifyRecords: state.notifyRecords,
      dailyStats: state.dailyStats,
      monthlyStats
    });
  }
}));
