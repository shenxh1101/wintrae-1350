import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Button, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import { formatDate, formatDateTime, getLeaveTypeText } from '@/utils';
import type { LeaveType, LeaveRecord, ChangePickupRecord } from '@/types';

type TabType = 'leave' | 'change';

const leaveTypes: { key: LeaveType; label: string }[] = [
  { key: 'sick', label: '病假' },
  { key: 'personal', label: '事假' },
  { key: 'other', label: '其他' }
];

const LeavePage: React.FC = () => {
  const {
    currentUser,
    students,
    leaveRecords,
    changePickupRecords,
    addLeaveRecord,
    addChangePickupRecord
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('leave');
  const [showAddModal, setShowAddModal] = useState(false);

  const [leaveType, setLeaveType] = useState<LeaveType>('sick');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [startDate, setStartDate] = useState(formatDate());
  const [endDate, setEndDate] = useState(formatDate());
  const [reason, setReason] = useState('');

  const [changeStudentId, setChangeStudentId] = useState('');
  const [changeDate, setChangeDate] = useState(formatDate());
  const [originalPerson, setOriginalPerson] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [changeReason, setChangeReason] = useState('');

  const myStudents = useMemo(() => {
    if (currentUser.role === 'teacher') return students;
    return students.filter((s) => s.parentName === currentUser.name);
  }, [students, currentUser]);

  const displayLeaveRecords = useMemo(() => {
    if (currentUser.role === 'teacher') return leaveRecords;
    return leaveRecords.filter((r) => myStudents.some((s) => s.id === r.studentId));
  }, [leaveRecords, myStudents, currentUser]);

  const displayChangeRecords = useMemo(() => {
    if (currentUser.role === 'teacher') return changePickupRecords;
    return changePickupRecords.filter((r) => myStudents.some((s) => s.id === r.studentId));
  }, [changePickupRecords, myStudents, currentUser]);

  const resetForm = () => {
    setLeaveType('sick');
    setSelectedStudentId('');
    setStartDate(formatDate());
    setEndDate(formatDate());
    setReason('');
    setChangeStudentId('');
    setChangeDate(formatDate());
    setOriginalPerson('');
    setNewPerson('');
    setNewRelation('');
    setNewPhone('');
    setChangeReason('');
  };

  const handleOpenAdd = () => {
    if (currentUser.role !== 'parent' && myStudents.length === 0) {
      Taro.showToast({ title: '暂无学生可操作', icon: 'none' });
      return;
    }
    resetForm();
    setShowAddModal(true);
  };

  const handleSubmitLeave = () => {
    const student = myStudents.find((s) => s.id === selectedStudentId);
    if (!student) {
      Taro.showToast({ title: '请选择学生', icon: 'none' });
      return;
    }
    if (!reason.trim()) {
      Taro.showToast({ title: '请填写请假原因', icon: 'none' });
      return;
    }
    addLeaveRecord({
      studentId: student.id,
      studentName: student.name,
      type: leaveType,
      startDate,
      endDate,
      reason: reason.trim()
    });
    setShowAddModal(false);
    resetForm();
    Taro.showToast({ title: '请假申请已提交', icon: 'success' });
    console.log('[Leave] Submit leave:', student.name, leaveType, startDate, endDate);
  };

  const handleSubmitChange = () => {
    const student = myStudents.find((s) => s.id === changeStudentId);
    if (!student) {
      Taro.showToast({ title: '请选择学生', icon: 'none' });
      return;
    }
    if (!originalPerson.trim() || !newPerson.trim() || !newRelation.trim() || !newPhone.trim()) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    addChangePickupRecord({
      studentId: student.id,
      studentName: student.name,
      date: changeDate,
      originalPerson: originalPerson.trim(),
      newPerson: newPerson.trim(),
      newRelation: newRelation.trim(),
      newPhone: newPhone.trim(),
      reason: changeReason.trim() || '临时调整'
    });
    setShowAddModal(false);
    resetForm();
    Taro.showToast({ title: '改接申请已提交', icon: 'success' });
    console.log('[Leave] Submit change pickup:', student.name, newPerson);
  };

  const handleReviewLeave = (record: LeaveRecord, approved: boolean) => {
    Taro.showModal({
      title: approved ? '通过申请' : '拒绝申请',
      content: `确定要${approved ? '通过' : '拒绝'}${record.studentName}的请假申请吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: approved ? '已通过' : '已拒绝', icon: 'success' });
          console.log('[Leave] Review leave:', record.id, approved ? 'approved' : 'rejected');
        }
      }
    });
  };

  const handleReviewChange = (record: ChangePickupRecord, approved: boolean) => {
    Taro.showModal({
      title: approved ? '通过申请' : '拒绝申请',
      content: `确定要${approved ? '通过' : '拒绝'}${record.studentName}的改接申请吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: approved ? '已通过' : '已拒绝', icon: 'success' });
          console.log('[Leave] Review change:', record.id, approved ? 'approved' : 'rejected');
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>请假调班</Text>
        <Text className={styles.subtitle}>管理请假和临时改接申请</Text>
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'leave' && styles.active)}
          onClick={() => setActiveTab('leave')}
        >
          <Text>请假申请</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'change' && styles.active)}
          onClick={() => setActiveTab('change')}
        >
          <Text>改接申请</Text>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false} style={{ height: 'calc(100vh - 380rpx)' }}>
        <View className={styles.list}>
          {activeTab === 'leave' && displayLeaveRecords.length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无请假申请</Text>
            </View>
          )}

          {activeTab === 'leave' && displayLeaveRecords.map((record) => (
            <View key={record.id} className={styles.card}>
              <View className={styles.cardHeader}>
                <Text className={styles.cardTitle}>{record.studentName}</Text>
                <StatusTag status={record.status} size="sm" />
              </View>
              <Text className={styles.cardMeta}>
                提交时间：{formatDateTime(record.createdAt)}
              </Text>
              <View className={styles.cardInfo}>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>请假类型</Text>
                  <Text className={styles.infoValue}>{getLeaveTypeText(record.type)}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>请假时间</Text>
                  <Text className={styles.infoValue}>{record.startDate} 至 {record.endDate}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>请假原因</Text>
                  <Text className={styles.infoValue}>{record.reason}</Text>
                </View>
                {record.reviewer && (
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>审核人</Text>
                    <Text className={styles.infoValue}>{record.reviewer}</Text>
                  </View>
                )}
              </View>
              {currentUser.role === 'teacher' && record.status === 'pending' && (
                <View className={styles.cardActions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.success)}
                    onClick={() => handleReviewLeave(record, true)}
                  >
                    通过
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.danger)}
                    onClick={() => handleReviewLeave(record, false)}
                  >
                    拒绝
                  </Button>
                </View>
              )}
            </View>
          ))}

          {activeTab === 'change' && displayChangeRecords.length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🔄</Text>
              <Text className={styles.emptyText}>暂无改接申请</Text>
            </View>
          )}

          {activeTab === 'change' && displayChangeRecords.map((record) => (
            <View key={record.id} className={styles.card}>
              <View className={styles.cardHeader}>
                <Text className={styles.cardTitle}>{record.studentName}</Text>
                <StatusTag status={record.status} size="sm" />
              </View>
              <Text className={styles.cardMeta}>
                提交时间：{formatDateTime(record.createdAt)}
              </Text>
              <View className={styles.cardInfo}>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>日期</Text>
                  <Text className={styles.infoValue}>{record.date}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>原接送人</Text>
                  <Text className={styles.infoValue}>{record.originalPerson}</Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>新接送人</Text>
                  <Text className={styles.infoValue}>
                    {record.newPerson}（{record.newRelation}）· {record.newPhone}
                  </Text>
                </View>
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>改接原因</Text>
                  <Text className={styles.infoValue}>{record.reason}</Text>
                </View>
              </View>
              {currentUser.role === 'teacher' && record.status === 'pending' && (
                <View className={styles.cardActions}>
                  <Button
                    className={classnames(styles.actionBtn, styles.success)}
                    onClick={() => handleReviewChange(record, true)}
                  >
                    通过
                  </Button>
                  <Button
                    className={classnames(styles.actionBtn, styles.danger)}
                    onClick={() => handleReviewChange(record, false)}
                  >
                    拒绝
                  </Button>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {currentUser.role === 'parent' && (
        <View className={styles.fabBtn} onClick={handleOpenAdd}>
          <Text>+</Text>
        </View>
      )}

      {showAddModal && (
        <View className={styles.modalMask} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>
                {activeTab === 'leave' ? '提交请假申请' : '提交改接申请'}
              </Text>
              <Button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>✕</Button>
            </View>

            {activeTab === 'leave' && (
              <>
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>选择学生</Text>
                  <View className={styles.studentSelect}>
                    {myStudents.map((s) => (
                      <View
                        key={s.id}
                        className={classnames(styles.studentOption, selectedStudentId === s.id && styles.active)}
                        onClick={() => setSelectedStudentId(s.id)}
                      >
                        <Image
                          className={styles.studentOptionAvatar}
                          src={s.avatar || 'https://picsum.photos/id/1005/200/200'}
                          mode="aspectFill"
                        />
                        <Text className={styles.studentOptionName}>{s.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>请假类型</Text>
                  <View className={styles.typeList}>
                    {leaveTypes.map((t) => (
                      <View
                        key={t.key}
                        className={classnames(styles.typeItem, leaveType === t.key && styles.active)}
                        onClick={() => setLeaveType(t.key)}
                      >
                        <Text>{t.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>开始日期</Text>
                  <Input
                    className={styles.formInput}
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={startDate}
                    onInput={(e) => setStartDate(e.detail.value)}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>结束日期</Text>
                  <Input
                    className={styles.formInput}
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={endDate}
                    onInput={(e) => setEndDate(e.detail.value)}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>请假原因</Text>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder="请详细说明请假原因"
                    value={reason}
                    onInput={(e) => setReason(e.detail.value)}
                  />
                </View>

                <View className={styles.modalActions}>
                  <Button
                    className={classnames(styles.modalBtn, styles.cancel)}
                    onClick={() => setShowAddModal(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className={classnames(styles.modalBtn, styles.confirm)}
                    onClick={handleSubmitLeave}
                  >
                    提交申请
                  </Button>
                </View>
              </>
            )}

            {activeTab === 'change' && (
              <>
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>选择学生</Text>
                  <View className={styles.studentSelect}>
                    {myStudents.map((s) => (
                      <View
                        key={s.id}
                        className={classnames(styles.studentOption, changeStudentId === s.id && styles.active)}
                        onClick={() => {
                          setChangeStudentId(s.id);
                          if (s.authorizedPersons.length > 0) {
                            setOriginalPerson(s.authorizedPersons[0].name);
                          }
                        }}
                      >
                        <Image
                          className={styles.studentOptionAvatar}
                          src={s.avatar || 'https://picsum.photos/id/1005/200/200'}
                          mode="aspectFill"
                        />
                        <Text className={styles.studentOptionName}>{s.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>改接日期</Text>
                  <Input
                    className={styles.formInput}
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={changeDate}
                    onInput={(e) => setChangeDate(e.detail.value)}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>原接送人</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="请输入原接送人姓名"
                    value={originalPerson}
                    onInput={(e) => setOriginalPerson(e.detail.value)}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>新接送人姓名</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="请输入新接送人姓名"
                    value={newPerson}
                    onInput={(e) => setNewPerson(e.detail.value)}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>与学生关系</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="如：叔叔、阿姨等"
                    value={newRelation}
                    onInput={(e) => setNewRelation(e.detail.value)}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>联系电话</Text>
                  <Input
                    className={styles.formInput}
                    type="number"
                    placeholder="请输入手机号码"
                    value={newPhone}
                    onInput={(e) => setNewPhone(e.detail.value)}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>改接原因（选填）</Text>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder="请说明改接原因"
                    value={changeReason}
                    onInput={(e) => setChangeReason(e.detail.value)}
                  />
                </View>

                <View className={styles.modalActions}>
                  <Button
                    className={classnames(styles.modalBtn, styles.cancel)}
                    onClick={() => setShowAddModal(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className={classnames(styles.modalBtn, styles.confirm)}
                    onClick={handleSubmitChange}
                  >
                    提交申请
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default LeavePage;
