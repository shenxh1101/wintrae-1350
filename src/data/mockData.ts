import type { Student, PickupRecord, LeaveRecord, ChangePickupRecord, NotifyRecord, DailyStats, MonthlyStats, UserRole, User } from '@/types';
import dayjs from 'dayjs';

const todayStr = () => dayjs().format('YYYY-MM-DD');
const dateStr = (offsetDays: number = 0) => dayjs().add(offsetDays, 'day').format('YYYY-MM-DD');

export const mockTeachers: User[] = [
  {
    id: 'u001',
    name: '李老师',
    role: 'teacher',
    phone: '13800138000',
    avatar: 'https://picsum.photos/id/64/200/200'
  },
  {
    id: 'u002',
    name: '王老师',
    role: 'teacher',
    phone: '13800138099',
    avatar: 'https://picsum.photos/id/91/200/200'
  }
];

export const mockParents: User[] = [
  { id: 'p001', name: '张伟', role: 'parent', phone: '13800138001', avatar: 'https://picsum.photos/id/177/200/200', studentIds: ['s001'] },
  { id: 'p002', name: '王芳', role: 'parent', phone: '13800138002', avatar: 'https://picsum.photos/id/64/200/200', studentIds: ['s001'] },
  { id: 'p003', name: '李明', role: 'parent', phone: '13800138003', avatar: 'https://picsum.photos/id/91/200/200', studentIds: ['s002'] },
  { id: 'p005', name: '王强', role: 'parent', phone: '13800138005', studentIds: ['s003'] },
  { id: 'p006', name: '赵刚', role: 'parent', phone: '13800138006', studentIds: ['s004'] },
  { id: 'p008', name: '陈建国', role: 'parent', phone: '13800138008', studentIds: ['s005'] },
  { id: 'p009', name: '孙伟', role: 'parent', phone: '13800138009', studentIds: ['s006'] },
  { id: 'p011', name: '周涛', role: 'parent', phone: '13800138011', studentIds: ['s007'] },
  { id: 'p012', name: '吴磊', role: 'parent', phone: '13800138012', studentIds: ['s008'] },
  { id: 'p014', name: '郑华', role: 'parent', phone: '13800138014', studentIds: ['s009'] },
  { id: 'p015', name: '刘军', role: 'parent', phone: '13800138015', studentIds: ['s010'] }
];

export const mockAllUsers: User[] = [...mockTeachers, ...mockParents];

export const mockCurrentUser: User = mockTeachers[0];

export const mockStudents: Student[] = [
  {
    id: 's001',
    name: '张小明',
    gender: 'boy',
    className: '向日葵班',
    grade: '三年级',
    school: '阳光小学',
    age: 9,
    avatar: 'https://picsum.photos/id/1027/200/200',
    parentName: '张伟',
    parentPhone: '13800138001',
    authorizedPersons: [
      { id: 'p001', name: '张伟', relation: '父亲', phone: '13800138001', avatar: 'https://picsum.photos/id/177/200/200' },
      { id: 'p002', name: '王芳', relation: '母亲', phone: '13800138002', avatar: 'https://picsum.photos/id/64/200/200' }
    ],
    allergies: '花生过敏',
    remarks: '放学后需先完成作业再玩耍'
  },
  {
    id: 's002',
    name: '李小红',
    gender: 'girl',
    className: '向日葵班',
    grade: '三年级',
    school: '阳光小学',
    age: 9,
    avatar: 'https://picsum.photos/id/338/200/200',
    parentName: '李明',
    parentPhone: '13800138003',
    authorizedPersons: [
      { id: 'p003', name: '李明', relation: '父亲', phone: '13800138003', avatar: 'https://picsum.photos/id/91/200/200' },
      { id: 'p004', name: '奶奶', relation: '祖母', phone: '13800138004' }
    ]
  },
  {
    id: 's003',
    name: '王小强',
    gender: 'boy',
    className: '向日葵班',
    grade: '三年级',
    school: '阳光小学',
    age: 9,
    avatar: 'https://picsum.photos/id/1025/200/200',
    parentName: '王强',
    parentPhone: '13800138005',
    authorizedPersons: [
      { id: 'p005', name: '王强', relation: '父亲', phone: '13800138005' }
    ]
  },
  {
    id: 's004',
    name: '赵小美',
    gender: 'girl',
    className: '小树苗班',
    grade: '二年级',
    school: '阳光小学',
    age: 8,
    avatar: 'https://picsum.photos/id/1062/200/200',
    parentName: '赵刚',
    parentPhone: '13800138006',
    authorizedPersons: [
      { id: 'p006', name: '赵刚', relation: '父亲', phone: '13800138006' },
      { id: 'p007', name: '刘敏', relation: '母亲', phone: '13800138007' }
    ],
    remarks: '喜欢画画'
  },
  {
    id: 's005',
    name: '陈小军',
    gender: 'boy',
    className: '小树苗班',
    grade: '二年级',
    school: '阳光小学',
    age: 8,
    avatar: 'https://picsum.photos/id/1074/200/200',
    parentName: '陈建国',
    parentPhone: '13800138008',
    authorizedPersons: [
      { id: 'p008', name: '陈建国', relation: '父亲', phone: '13800138008' }
    ]
  },
  {
    id: 's006',
    name: '孙小莉',
    gender: 'girl',
    className: '彩虹班',
    grade: '一年级',
    school: '阳光小学',
    age: 7,
    avatar: 'https://picsum.photos/id/1011/200/200',
    parentName: '孙伟',
    parentPhone: '13800138009',
    authorizedPersons: [
      { id: 'p009', name: '孙伟', relation: '父亲', phone: '13800138009' },
      { id: 'p010', name: '外婆', relation: '外祖母', phone: '13800138010' }
    ],
    allergies: '牛奶过敏'
  },
  {
    id: 's007',
    name: '周小杰',
    gender: 'boy',
    className: '彩虹班',
    grade: '一年级',
    school: '阳光小学',
    age: 7,
    avatar: 'https://picsum.photos/id/1012/200/200',
    parentName: '周涛',
    parentPhone: '13800138011',
    authorizedPersons: [
      { id: 'p011', name: '周涛', relation: '父亲', phone: '13800138011' }
    ]
  },
  {
    id: 's008',
    name: '吴小雨',
    gender: 'girl',
    className: '彩虹班',
    grade: '一年级',
    school: '阳光小学',
    age: 7,
    avatar: 'https://picsum.photos/id/1014/200/200',
    parentName: '吴磊',
    parentPhone: '13800138012',
    authorizedPersons: [
      { id: 'p012', name: '吴磊', relation: '父亲', phone: '13800138012' },
      { id: 'p013', name: '妈妈', relation: '母亲', phone: '13800138013' }
    ]
  },
  {
    id: 's009',
    name: '郑小阳',
    gender: 'boy',
    className: '向日葵班',
    grade: '三年级',
    school: '阳光小学',
    age: 9,
    avatar: 'https://picsum.photos/id/1027/200/200',
    parentName: '郑华',
    parentPhone: '13800138014',
    authorizedPersons: [
      { id: 'p014', name: '郑华', relation: '父亲', phone: '13800138014' }
    ]
  },
  {
    id: 's010',
    name: '刘小燕',
    gender: 'girl',
    className: '小树苗班',
    grade: '二年级',
    school: '阳光小学',
    age: 8,
    avatar: 'https://picsum.photos/id/1062/200/200',
    parentName: '刘军',
    parentPhone: '13800138015',
    authorizedPersons: [
      { id: 'p015', name: '刘军', relation: '父亲', phone: '13800138015' }
    ]
  }
];

export const mockPickupRecords: PickupRecord[] = [
  {
    id: 'pr001',
    studentId: 's001',
    studentName: '张小明',
    date: todayStr(),
    status: 'delivered',
    arrivedTime: '16:30',
    deliveredTime: '18:15',
    pickupPerson: '王芳',
    pickupRelation: '母亲',
    confirmed: true
  },
  {
    id: 'pr002',
    studentId: 's002',
    studentName: '李小红',
    date: todayStr(),
    status: 'arrived',
    arrivedTime: '16:35'
  },
  {
    id: 'pr003',
    studentId: 's003',
    studentName: '王小强',
    date: todayStr(),
    status: 'arrived',
    arrivedTime: '16:28'
  },
  {
    id: 'pr004',
    studentId: 's004',
    studentName: '赵小美',
    date: todayStr(),
    status: 'pending'
  },
  {
    id: 'pr005',
    studentId: 's005',
    studentName: '陈小军',
    date: todayStr(),
    status: 'pending'
  },
  {
    id: 'pr006',
    studentId: 's006',
    studentName: '孙小莉',
    date: todayStr(),
    status: 'leave'
  },
  {
    id: 'pr007',
    studentId: 's007',
    studentName: '周小杰',
    date: todayStr(),
    status: 'arrived',
    arrivedTime: '16:40',
    delayMinutes: 10,
    delayReason: '学校打扫卫生'
  },
  {
    id: 'pr008',
    studentId: 's008',
    studentName: '吴小雨',
    date: todayStr(),
    status: 'pending'
  },
  {
    id: 'pr009',
    studentId: 's009',
    studentName: '郑小阳',
    date: todayStr(),
    status: 'pending'
  },
  {
    id: 'pr010',
    studentId: 's010',
    studentName: '刘小燕',
    date: todayStr(),
    status: 'leave'
  }
];

export const mockLeaveRecords: LeaveRecord[] = [
  {
    id: 'lv001',
    studentId: 's006',
    studentName: '孙小莉',
    type: 'sick',
    startDate: todayStr(),
    endDate: todayStr(),
    reason: '感冒发烧，需要在家休息一天',
    status: 'approved',
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    reviewedAt: dayjs().subtract(23, 'hour').toISOString(),
    reviewer: '李老师'
  },
  {
    id: 'lv002',
    studentId: 's010',
    studentName: '刘小燕',
    type: 'personal',
    startDate: todayStr(),
    endDate: dateStr(1),
    reason: '家人带孩子外出办事',
    status: 'approved',
    createdAt: dayjs().subtract(2, 'day').toISOString(),
    reviewedAt: dayjs().subtract(47, 'hour').toISOString(),
    reviewer: '李老师'
  },
  {
    id: 'lv003',
    studentId: 's003',
    studentName: '王小强',
    type: 'sick',
    startDate: dateStr(-3),
    endDate: dateStr(-2),
    reason: '肠胃炎需要休息',
    status: 'approved',
    createdAt: dayjs().subtract(4, 'day').toISOString(),
    reviewedAt: dayjs().subtract(4, 'day').add(1, 'hour').toISOString(),
    reviewer: '李老师'
  },
  {
    id: 'lv004',
    studentId: 's001',
    studentName: '张小明',
    type: 'other',
    startDate: dateStr(2),
    endDate: dateStr(2),
    reason: '参加市数学竞赛',
    status: 'pending',
    createdAt: dayjs().toISOString()
  }
];

export const mockChangePickupRecords: ChangePickupRecord[] = [
  {
    id: 'cp001',
    studentId: 's002',
    studentName: '李小红',
    date: todayStr(),
    originalPerson: '李明',
    newPerson: '奶奶',
    newRelation: '祖母',
    newPhone: '13800138004',
    reason: '爸爸临时加班',
    status: 'approved',
    createdAt: dayjs().subtract(2, 'hour').toISOString()
  },
  {
    id: 'cp002',
    studentId: 's004',
    studentName: '赵小美',
    date: todayStr(),
    originalPerson: '赵刚',
    newPerson: '刘敏',
    newRelation: '母亲',
    newPhone: '13800138007',
    reason: '爸爸开会',
    status: 'pending',
    createdAt: dayjs().subtract(1, 'hour').toISOString()
  }
];

export const mockNotifyRecords: NotifyRecord[] = [
  {
    id: 'nt001',
    type: 'homework',
    title: '今日作业提醒',
    content: '各位家长好，今日作业：1.语文抄写课文三遍 2.数学练习册第23页 3.英语朗读第5单元',
    senderId: 'u001',
    senderName: '李老师',
    senderRole: 'teacher',
    isGroup: true,
    createdAt: dayjs().subtract(4, 'hour').toISOString(),
    readCount: 8,
    totalCount: 10
  },
  {
    id: 'nt002',
    type: 'notice',
    title: '下周五举办亲子活动',
    content: '尊敬的各位家长，下周五下午2点将在托管班举办亲子手工活动，请各位家长安排时间参加。',
    senderId: 'u001',
    senderName: '李老师',
    senderRole: 'teacher',
    isGroup: true,
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    readCount: 10,
    totalCount: 10
  },
  {
    id: 'nt003',
    type: 'photo',
    title: '今日活动照片',
    content: '孩子们下午户外活动的照片，请查收~',
    senderId: 'u001',
    senderName: '李老师',
    senderRole: 'teacher',
    isGroup: true,
    photos: [
      'https://picsum.photos/id/103/750/500',
      'https://picsum.photos/id/225/750/500',
      'https://picsum.photos/id/230/750/500'
    ],
    createdAt: dayjs().subtract(2, 'hour').toISOString(),
    readCount: 7,
    totalCount: 10
  },
  {
    id: 'nt004',
    type: 'message',
    title: '张小明家长留言',
    content: '李老师您好，张小明今天有点咳嗽，请提醒他多喝温水，谢谢！',
    senderId: 'p001',
    senderName: '张伟',
    senderRole: 'parent',
    receiverId: 'u001',
    receiverName: '李老师',
    isGroup: false,
    createdAt: dayjs().subtract(6, 'hour').toISOString()
  },
  {
    id: 'nt005',
    type: 'message',
    title: '老师回复',
    content: '好的张爸爸，已经提醒小明了，请放心。',
    senderId: 'u001',
    senderName: '李老师',
    senderRole: 'teacher',
    receiverId: 'p001',
    receiverName: '张伟',
    isGroup: false,
    createdAt: dayjs().subtract(5, 'hour').toISOString()
  }
];

export const mockDailyStats: DailyStats[] = Array.from({ length: 14 }, (_, i) => {
  const leaveCount = Math.floor(Math.random() * 3);
  const pendingCount = Math.floor(Math.random() * 2);
  const abnormalCount = Math.floor(Math.random() * 2);
  return {
    date: dateStr(-i),
    totalStudents: 10,
    arrivedCount: 10 - leaveCount - pendingCount,
    deliveredCount: 10 - leaveCount - pendingCount - Math.floor(Math.random() * 2),
    leaveCount,
    pendingCount,
    abnormalCount
  };
});

export const mockMonthlyStats: MonthlyStats[] = [
  {
    month: '2024-06',
    totalDays: 20,
    attendanceDays: 19,
    leaveDays: 1,
    abnormalTimes: 0,
    onTimeRate: 98
  },
  {
    month: '2024-05',
    totalDays: 22,
    attendanceDays: 20,
    leaveDays: 2,
    abnormalTimes: 1,
    onTimeRate: 95
  },
  {
    month: '2024-04',
    totalDays: 21,
    attendanceDays: 20,
    leaveDays: 1,
    abnormalTimes: 0,
    onTimeRate: 99
  }
];
