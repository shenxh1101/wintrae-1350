import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import { formatDate } from '@/utils';
import type { DailyStats, PickupRecord, LeaveRecord } from '@/types';

const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const HistoryPage: React.FC = () => {
  const {
    currentUser,
    students,
    dailyStats,
    monthlyStats,
    getMyPickupRecords,
    getMyLeaveRecords,
    recomputeMonthlyStats,
    resetRole
  } = useAppStore();

  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState(formatDate());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    recomputeMonthlyStats();
  }, []);

  const currentMonthly = monthlyStats[currentMonthIdx] || monthlyStats[0];

  const handlePrevMonth = () => {
    if (currentMonthIdx < monthlyStats.length - 1) {
      setCurrentMonthIdx(currentMonthIdx + 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx > 0) {
      setCurrentMonthIdx(currentMonthIdx - 1);
    }
  };

  const selectedDaily = useMemo(() => {
    return dailyStats.find((d) => d.date === selectedDate) || null;
  }, [dailyStats, selectedDate]);

  const myPickupRecords = useMemo(() => getMyPickupRecords(), [getMyPickupRecords]);
  const myLeaveRecords = useMemo(() => getMyLeaveRecords(), [getMyLeaveRecords]);

  const selectedDateRecords = useMemo(() => {
    return myPickupRecords.filter((r) => r.date === selectedDate);
  }, [myPickupRecords, selectedDate]);

  const getLeaveReason = (studentId: string, date: string): string | null => {
    const leave = myLeaveRecords.find((r) => {
      if (r.status !== 'approved') return false;
      if (r.studentId !== studentId) return false;
      return date >= r.startDate && date <= r.endDate;
    });
    return leave ? leave.reason : null;
  };

  const displayDailyList = useMemo(() => {
    const sorted = [...dailyStats].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.slice(0, 7);
  }, [dailyStats]);

  const getStudent = (id: string) => students.find((s) => s.id === id);

  const formatMonth = (month: string) => {
    const [y, m] = month.split('-');
    return `${y}年${parseInt(m)}月`;
  };

  const getWeekday = (dateStr: string) => {
    const date = new Date(dateStr);
    return weekdayMap[date.getDay()];
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <View>
            <Text className={styles.title}>历史记录</Text>
            <Text className={styles.subtitle}>查看考勤统计和接送记录</Text>
          </View>
          <Image
            className={styles.userAvatar}
            src={currentUser.avatar || 'https://picsum.photos/id/64/200/200'}
            mode="aspectFill"
            onClick={() => {
              Taro.showModal({
                title: '切换身份',
                content: '确定要退出当前账号并重新选择身份吗？',
                success: (res) => {
                  if (res.confirm) {
                    resetRole();
                  }
                }
              });
            }}
          />
        </View>
      </View>

      <View className={styles.monthlySection}>
        <View className={styles.monthlyCard}>
          <View className={styles.monthlyHeader}>
            <Text className={styles.monthlyTitle}>月度统计</Text>
            <View className={styles.monthSelector}>
              <Button className={styles.monthBtn} onClick={handleNextMonth}>‹</Button>
              <Text className={styles.monthText}>
                {currentMonthly ? formatMonth(currentMonthly.month) : '--'}
              </Text>
              <Button className={styles.monthBtn} onClick={handlePrevMonth}>›</Button>
            </View>
          </View>

          {currentMonthly && (
            <>
              <View className={styles.statsGrid}>
                <View className={styles.statItem}>
                  <Text className={classnames(styles.statValue, styles.primary)}>
                    {currentMonthly.attendanceDays}
                  </Text>
                  <Text className={styles.statLabel}>出勤天数</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={classnames(styles.statValue, styles.warning)}>
                    {currentMonthly.leaveDays}
                  </Text>
                  <Text className={styles.statLabel}>请假天数</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={classnames(styles.statValue, styles.error)}>
                    {currentMonthly.abnormalTimes}
                  </Text>
                  <Text className={styles.statLabel}>异常次数</Text>
                </View>
              </View>

              <View className={styles.progressSection}>
                <View className={styles.progressLabel}>
                  <Text>准时率</Text>
                  <Text style={{ color: '#2563EB', fontWeight: 600 }}>{currentMonthly.onTimeRate}%</Text>
                </View>
                <View className={styles.progressBar}>
                  <View
                    className={styles.progressFill}
                    style={{ width: `${currentMonthly.onTimeRate}%` }}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      <View className={styles.dailySection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>每日记录</Text>
          <View
            className={styles.dateInput}
            onClick={() => {
              Taro.showActionSheet({
                itemList: displayDailyList.map((d) => `${d.date} ${getWeekday(d.date)}`),
                success: (res) => {
                  setSelectedDate(displayDailyList[res.tapIndex].date);
                }
              });
            }}
          >
            <Text>{selectedDate} {getWeekday(selectedDate)}</Text>
          </View>
        </View>

        {selectedDaily && (
          <View className={styles.dailyCard}>
            <View className={styles.dailyHeader}>
              <View>
                <Text className={styles.dailyDate}>{selectedDaily.date}</Text>
                <Text className={styles.dailyWeekday}>{getWeekday(selectedDaily.date)}</Text>
              </View>
            </View>

            <View className={styles.dailyStats}>
              <View className={classnames(styles.dailyStatItem, styles.blue)}>
                <Text>总人数</Text>
                <Text className={styles.dailyStatValue}>{selectedDaily.totalStudents}</Text>
              </View>
              <View className={classnames(styles.dailyStatItem, styles.green)}>
                <Text>已到校</Text>
                <Text className={styles.dailyStatValue}>{selectedDaily.arrivedCount}</Text>
              </View>
              <View className={classnames(styles.dailyStatItem, styles.blue)}>
                <Text>已送达</Text>
                <Text className={styles.dailyStatValue}>{selectedDaily.deliveredCount}</Text>
              </View>
              <View className={classnames(styles.dailyStatItem, styles.gray)}>
                <Text>请假</Text>
                <Text className={styles.dailyStatValue}>{selectedDaily.leaveCount}</Text>
              </View>
              <View className={classnames(styles.dailyStatItem, styles.orange)}>
                <Text>待接送</Text>
                <Text className={styles.dailyStatValue}>{selectedDaily.pendingCount}</Text>
              </View>
              {selectedDaily.abnormalCount > 0 && (
                <View className={classnames(styles.dailyStatItem, styles.red)}>
                  <Text>异常</Text>
                  <Text className={styles.dailyStatValue}>{selectedDaily.abnormalCount}</Text>
                </View>
              )}
            </View>

            {selectedDateRecords.length > 0 && (
              <View className={styles.recordList}>
                {selectedDateRecords.map((record) => {
                  const student = getStudent(record.studentId);
                  const isExpanded = expandedId === record.id;
                  const leaveReason = getLeaveReason(record.studentId, selectedDate);
                  const statusText = {
                    pending: '待接送',
                    arrived: '已到校',
                    delivered: '已送达',
                    leave: '请假'
                  }[record.status];
                  return (
                    <View key={record.id}>
                      <View
                        className={styles.recordItem}
                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      >
                        <View className={styles.recordLeft}>
                          <Image
                            className={styles.recordAvatar}
                            src={student?.avatar || 'https://picsum.photos/id/1005/200/200'}
                            mode="aspectFill"
                          />
                          <View className={styles.recordInfo}>
                            <Text className={styles.recordName}>
                              {record.studentName}
                              {record.delayMinutes && record.delayMinutes > 0 && (
                                <Text className={styles.abnormalTag}>延迟{record.delayMinutes}分</Text>
                              )}
                            </Text>
                            <Text className={styles.recordDetail}>
                              {record.arrivedTime ? `到校 ${record.arrivedTime}` : '未到校'}
                              {record.deliveredTime ? ` · 送达 ${record.deliveredTime}` : ''}
                              {record.pickupPerson ? ` · ${record.pickupPerson}接走` : ''}
                            </Text>
                          </View>
                        </View>
                        <View className={styles.recordRight}>
                          <StatusTag status={record.status} size="sm" />
                          <Text style={{ marginLeft: '8rpx', fontSize: '24rpx', color: '#9ca3af' }}>
                            {isExpanded ? '▲' : '▼'}
                          </Text>
                        </View>
                      </View>
                      {isExpanded && (
                        <View style={{ padding: '16rpx 32rpx 32rpx', backgroundColor: '#f9fafb', borderTop: '1rpx solid #e5e7eb' }}>
                          <View style={{ display: 'flex', flexDirection: 'column', gap: '12rpx' }}>
                            <View style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ fontSize: '24rpx', color: '#6b7280', width: '140rpx' }}>签到时间</Text>
                              <Text style={{ fontSize: '24rpx', color: '#1f2937' }}>{record.arrivedTime || '--'}</Text>
                            </View>
                            <View style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ fontSize: '24rpx', color: '#6b7280', width: '140rpx' }}>签退时间</Text>
                              <Text style={{ fontSize: '24rpx', color: '#1f2937' }}>{record.deliveredTime || '--'}</Text>
                            </View>
                            <View style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ fontSize: '24rpx', color: '#6b7280', width: '140rpx' }}>状态</Text>
                              <Text style={{ fontSize: '24rpx', color: '#1f2937' }}>{statusText}</Text>
                            </View>
                            {leaveReason && (
                              <View style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: '24rpx', color: '#6b7280', width: '140rpx' }}>请假原因</Text>
                                <Text style={{ fontSize: '24rpx', color: '#1f2937', flex: 1 }}>{leaveReason}</Text>
                              </View>
                            )}
                            {record.delayMinutes && record.delayMinutes > 0 && (
                              <View style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: '24rpx', color: '#6b7280', width: '140rpx' }}>延迟异常说明</Text>
                                <Text style={{ fontSize: '24rpx', color: '#1f2937', flex: 1 }}>
                                  延迟{record.delayMinutes}分钟{record.delayReason ? `：${record.delayReason}` : ''}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={{ marginTop: '32rpx' }}>
          <Text className={styles.sectionTitle} style={{ marginBottom: '24rpx' }}>
            最近一周
          </Text>
          {displayDailyList.map((daily) => (
            <View
              key={daily.date}
              className={styles.dailyCard}
              style={{ padding: '24rpx 32rpx' }}
              onClick={() => setSelectedDate(daily.date)}
            >
              <View className={styles.dailyHeader}>
                <View>
                  <Text className={styles.dailyDate} style={{ fontSize: '28rpx' }}>
                    {daily.date}
                  </Text>
                  <Text className={styles.dailyWeekday}>{getWeekday(daily.date)}</Text>
                </View>
                <View className={styles.dailyStats}>
                  <View className={classnames(styles.dailyStatItem, styles.green)}>
                    <Text>到校</Text>
                    <Text className={styles.dailyStatValue}>{daily.arrivedCount}</Text>
                  </View>
                  <View className={classnames(styles.dailyStatItem, styles.blue)}>
                    <Text>送达</Text>
                    <Text className={styles.dailyStatValue}>{daily.deliveredCount}</Text>
                  </View>
                  <View className={classnames(styles.dailyStatItem, styles.gray)}>
                    <Text>请假</Text>
                    <Text className={styles.dailyStatValue}>{daily.leaveCount}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default HistoryPage;
