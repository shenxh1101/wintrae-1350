import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import StudentCard from '@/components/StudentCard';
import StatusTag from '@/components/StatusTag';
import { formatDate, formatTime } from '@/utils';
import type { PickupStatus, Student, PickupRecord, AuthorizedPerson } from '@/types';

type FilterType = 'all' | PickupStatus;

const filterList: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待接送' },
  { key: 'arrived', label: '已到校' },
  { key: 'delivered', label: '已送达' },
  { key: 'leave', label: '请假' }
];

const PickupPage: React.FC = () => {
  const {
    currentUser,
    students,
    pickupRecords,
    updatePickupStatus,
    confirmPickup
  } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PickupRecord | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showTempPersonModal, setShowTempPersonModal] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [tempPersonName, setTempPersonName] = useState('');
  const [tempPersonRelation, setTempPersonRelation] = useState('');
  const [tempPersonPhone, setTempPersonPhone] = useState('');

  const today = formatDate();

  const todayRecords = useMemo(() => {
    return pickupRecords.filter((r) => r.date === today);
  }, [pickupRecords, today]);

  const stats = useMemo(() => {
    return {
      total: todayRecords.length,
      arrived: todayRecords.filter((r) => r.status === 'arrived').length,
      pending: todayRecords.filter((r) => r.status === 'pending').length,
      delivered: todayRecords.filter((r) => r.status === 'delivered').length,
      leave: todayRecords.filter((r) => r.status === 'leave').length
    };
  }, [todayRecords]);

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') return todayRecords;
    return todayRecords.filter((r) => r.status === activeFilter);
  }, [todayRecords, activeFilter]);

  const getStudentById = (id: string) => students.find((s) => s.id === id);

  const unconfirmedRecords = useMemo(() => {
    if (currentUser.role !== 'parent') return [];
    return todayRecords.filter(
      (r) => r.status === 'delivered' && !r.confirmed
    );
  }, [todayRecords, currentUser.role]);

  const handleCardClick = (record: PickupRecord) => {
    const student = getStudentById(record.studentId);
    if (!student) return;
    setSelectedRecord(record);
    setSelectedStudent(student);
    if (currentUser.role === 'teacher') {
      setShowActionSheet(true);
    } else {
      Taro.showToast({ title: '查看详情', icon: 'none' });
    }
  };

  const handleMarkArrived = () => {
    if (!selectedRecord) return;
    updatePickupStatus(selectedRecord.id, 'arrived', {
      arrivedTime: formatTime()
    });
    setShowActionSheet(false);
    Taro.showToast({ title: '已标记到校', icon: 'success' });
    console.log('[Pickup] Mark arrived:', selectedRecord.id);
  };

  const handleMarkDelivered = () => {
    if (!selectedRecord || !selectedStudent) return;
    if (selectedStudent.authorizedPersons.length > 0) {
      setShowPersonModal(true);
    } else {
      setShowTempPersonModal(true);
    }
    setShowActionSheet(false);
  };

  const handleSelectPerson = (person: AuthorizedPerson) => {
    if (!selectedRecord) return;
    updatePickupStatus(selectedRecord.id, 'delivered', {
      deliveredTime: formatTime(),
      pickupPerson: person.name,
      pickupRelation: person.relation
    });
    setShowPersonModal(false);
    Taro.showToast({ title: '已标记送达', icon: 'success' });
    console.log('[Pickup] Mark delivered with person:', person.name);
  };

  const handleShowDelayModal = () => {
    setShowDelayModal(true);
    setShowActionSheet(false);
  };

  const handleSendDelay = () => {
    if (!selectedRecord) return;
    const minutes = parseInt(delayMinutes) || 0;
    if (minutes <= 0) {
      Taro.showToast({ title: '请输入正确的延迟时间', icon: 'none' });
      return;
    }
    updatePickupStatus(selectedRecord.id, selectedRecord.status, {
      delayMinutes: minutes,
      delayReason: delayReason || '未填写原因'
    });
    setShowDelayModal(false);
    setDelayMinutes('');
    setDelayReason('');
    Taro.showToast({ title: '延迟提醒已发送', icon: 'success' });
    console.log('[Pickup] Send delay alert:', minutes, 'minutes');
  };

  const handleShowTempPerson = () => {
    setShowTempPersonModal(true);
    setShowActionSheet(false);
  };

  const handleAddTempPerson = () => {
    if (!selectedRecord || !tempPersonName || !tempPersonRelation || !tempPersonPhone) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    updatePickupStatus(selectedRecord.id, 'delivered', {
      deliveredTime: formatTime(),
      pickupPerson: tempPersonName,
      pickupRelation: tempPersonRelation
    });
    setShowTempPersonModal(false);
    setTempPersonName('');
    setTempPersonRelation('');
    setTempPersonPhone('');
    Taro.showToast({ title: '临时接送人已登记', icon: 'success' });
    console.log('[Pickup] Add temp person:', tempPersonName);
  };

  const handleConfirm = (record: PickupRecord) => {
    confirmPickup(record.id);
    Taro.showToast({ title: '已确认到达', icon: 'success' });
    console.log('[Pickup] Parent confirmed:', record.id);
  };

  const handleRefresh = () => {
    console.log('[Pickup] Refreshing data...');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  React.useEffect(() => {
    Taro.eventCenter.on('__taroPullDownRefresh', handleRefresh);
    return () => {
      Taro.eventCenter.off('__taroPullDownRefresh', handleRefresh);
    };
  }, []);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.dateText}>{formatDate(new Date(), 'MM月DD日 dddd')}</Text>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{currentUser.name}</Text>
            <Image
              className={styles.userAvatar}
              src={currentUser.avatar || 'https://picsum.photos/id/64/200/200'}
              mode="aspectFill"
            />
          </View>
        </View>
        <Text className={styles.title}>今日接送</Text>
        <Text className={styles.subtitle}>
          {currentUser.role === 'teacher' ? '托管班接送管理中心' : '查看孩子接送状态'}
        </Text>
      </View>

      <View className={styles.statsSection}>
        <ScrollView className={styles.statsScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.statsInner}>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.primary)}>{stats.total}</Text>
              <Text className={styles.statLabel}>总人数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.success)}>{stats.arrived}</Text>
              <Text className={styles.statLabel}>已到校</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.warning)}>{stats.pending}</Text>
              <Text className={styles.statLabel}>待接送</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.primary)}>{stats.delivered}</Text>
              <Text className={styles.statLabel}>已送达</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.gray)}>{stats.leave}</Text>
              <Text className={styles.statLabel}>请假</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {unconfirmedRecords.length > 0 && (
        <View className={styles.confirmBanner}>
          <Text className={styles.confirmText}>
            您有 {unconfirmedRecords.length} 条送达通知待确认
          </Text>
          <Button
            className={styles.confirmBtn}
            onClick={() => handleConfirm(unconfirmedRecords[0])}
          >
            确认到达
          </Button>
        </View>
      )}

      <View className={styles.filterSection}>
        <ScrollView className={styles.filterScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.filterInner}>
            {filterList.map((item) => (
              <View
                key={item.key}
                className={classnames(styles.filterItem, activeFilter === item.key && styles.active)}
                onClick={() => setActiveFilter(item.key)}
              >
                <Text>{item.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.listSection}>
        <Text className={styles.listTitle}>
          学生名单（{filteredRecords.length}人）
        </Text>

        {filteredRecords.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无数据</Text>
          </View>
        ) : (
          filteredRecords.map((record) => {
            const student = getStudentById(record.studentId);
            if (!student) return null;
            return (
              <StudentCard
                key={record.id}
                student={student}
                pickupRecord={record}
                onClick={() => handleCardClick(record)}
              />
            );
          })
        )}
      </View>

      {showActionSheet && selectedRecord && selectedStudent && (
        <View className={styles.modalMask} onClick={() => setShowActionSheet(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.actionTitle}>
              {selectedStudent.name} - 接送操作
            </Text>
            <View className={styles.actionList}>
              {(selectedRecord.status === 'pending') && (
                <Button
                  className={classnames(styles.actionBtn, styles.success)}
                  onClick={handleMarkArrived}
                >
                  ✓ 标记已接到
                </Button>
              )}
              {(selectedRecord.status === 'arrived') && (
                <Button
                  className={classnames(styles.actionBtn, styles.primary)}
                  onClick={handleMarkDelivered}
                >
                  标记已送达家长
                </Button>
              )}
              <Button
                className={classnames(styles.actionBtn, styles.warning)}
                onClick={handleShowDelayModal}
              >
                发送延迟提醒
              </Button>
              <Button
                className={classnames(styles.actionBtn)}
                onClick={handleShowTempPerson}
              >
                登记临时接送人
              </Button>
            </View>
            <Button
              className={styles.cancelBtn}
              onClick={() => setShowActionSheet(false)}
            >
              取消
            </Button>
          </View>
        </View>
      )}

      {showPersonModal && selectedStudent && (
        <View className={styles.modalMask} onClick={() => setShowPersonModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择接送人</Text>
            {selectedStudent.authorizedPersons.map((person) => (
              <View key={person.id} className={styles.personInfo}>
                <Image
                  className={styles.personAvatar}
                  src={person.avatar || 'https://picsum.photos/id/1005/200/200'}
                  mode="aspectFill"
                />
                <View className={styles.personDetail}>
                  <Text className={styles.personName}>{person.name}</Text>
                  <Text className={styles.personMeta}>
                    {person.relation} · {person.phone}
                  </Text>
                </View>
                <Button
                  className={styles.selectBtn}
                  onClick={() => handleSelectPerson(person)}
                >
                  选择
                </Button>
              </View>
            ))}
            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowPersonModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={() => {
                  setShowPersonModal(false);
                  setShowTempPersonModal(true);
                }}
              >
                添加临时接送人
              </Button>
            </View>
          </View>
        </View>
      )}

      {showDelayModal && (
        <View className={styles.modalMask} onClick={() => setShowDelayModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>发送延迟提醒</Text>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>延迟时间（分钟）</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="请输入延迟分钟数"
                value={delayMinutes}
                onInput={(e) => setDelayMinutes(e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>延迟原因</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入延迟原因"
                value={delayReason}
                onInput={(e) => setDelayReason(e.detail.value)}
              />
            </View>
            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowDelayModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleSendDelay}
              >
                发送
              </Button>
            </View>
          </View>
        </View>
      )}

      {showTempPersonModal && (
        <View className={styles.modalMask} onClick={() => setShowTempPersonModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>登记临时接送人</Text>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>姓名</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入接送人姓名"
                value={tempPersonName}
                onInput={(e) => setTempPersonName(e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>与学生关系</Text>
              <Input
                className={styles.formInput}
                placeholder="如：叔叔、阿姨、邻居等"
                value={tempPersonRelation}
                onInput={(e) => setTempPersonRelation(e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>联系电话</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="请输入手机号码"
                value={tempPersonPhone}
                onInput={(e) => setTempPersonPhone(e.detail.value)}
              />
            </View>
            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowTempPersonModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleAddTempPerson}
              >
                确认登记
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PickupPage;
