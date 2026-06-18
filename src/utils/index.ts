import dayjs from 'dayjs';

export const formatDate = (date: string | Date = new Date(), format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatTime = (date: string | Date = new Date(), format: string = 'HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date = new Date()): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待接送',
    arrived: '已到校',
    delivered: '已送达',
    leave: '已请假',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return map[status] || status;
};

export const getLeaveTypeText = (type: string): string => {
  const map: Record<string, string> = {
    sick: '病假',
    personal: '事假',
    other: '其他'
  };
  return map[type] || type;
};

export const getNotifyTypeText = (type: string): string => {
  const map: Record<string, string> = {
    homework: '作业提醒',
    notice: '公告通知',
    message: '留言',
    photo: '照片'
  };
  return map[type] || type;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
