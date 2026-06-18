import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import { formatDate } from '@/utils';
import type { DailyStats, PickupRecord } from '@/types';

const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const HistoryPage: React.FC = () => {
  const {
    currentUser,
    students,
    pickupRecords,
    dailyStats,
    monthlyStats
  } = useAppStore();

  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState(formatDate());

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

  const selectedDateRecords = useMemo(() => {
    let records = pickupRecords.filter((r) => r.date === selectedDate);
    if (currentUser.role === 'parent') {
      const myStudentIds = students
        .filter((s) => s.parentName === currentUser.name)
        .map((s) => s.id);
      records = records.filter((r) => myStudentIds.includes(r.studentId));
    }
    return records;
  }, [pickupRecords, selectedDate, students, currentUser]);

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
        <Text className={styles.title}>历史记录</Text>
        <Text className={styles.subtitle}>查看考勤统计和接送记录</Text>
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
                  return (
                    <View key={record.id} className={styles.recordItem}>
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
                      </View>
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
