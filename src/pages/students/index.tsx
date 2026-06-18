import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Button, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import StatusTag from '@/components/StatusTag';
import { formatDate } from '@/utils';
import type { Student, AuthorizedPerson, PickupRecord } from '@/types';

const StudentsPage: React.FC = () => {
  const {
    currentUser,
    students,
    pickupRecords,
    updateStudent,
    addAuthorizedPerson,
    removeAuthorizedPerson
  } = useAppStore();

  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [newPerson, setNewPerson] = useState({
    name: '',
    relation: '',
    phone: '',
    isTemp: false,
    tempDate: ''
  });

  const today = formatDate();

  const filteredStudents = useMemo(() => {
    if (!searchText.trim()) return students;
    const keyword = searchText.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(keyword) ||
        s.className.toLowerCase().includes(keyword) ||
        s.parentName.toLowerCase().includes(keyword)
    );
  }, [students, searchText]);

  const getStudentPickupToday = (studentId: string): PickupRecord | undefined => {
    return pickupRecords.find((r) => r.studentId === studentId && r.date === today);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setEditData({});
    setEditMode(false);
    setShowDetailModal(true);
  };

  const handleToggleEdit = () => {
    if (!selectedStudent) return;
    if (editMode) {
      updateStudent(selectedStudent.id, editData);
      Taro.showToast({ title: '修改已保存', icon: 'success' });
      console.log('[Students] Update student:', selectedStudent.id, editData);
    }
    setEditMode(!editMode);
  };

  const handleAddPerson = () => {
    setShowAddPersonModal(true);
  };

  const handleConfirmAddPerson = () => {
    if (!selectedStudent || !newPerson.name || !newPerson.relation || !newPerson.phone) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    const personData: Omit<AuthorizedPerson, 'id'> = {
      name: newPerson.name,
      relation: newPerson.relation,
      phone: newPerson.phone,
      isTemp: newPerson.isTemp,
      tempDate: newPerson.isTemp ? newPerson.tempDate || today : undefined
    };
    addAuthorizedPerson(selectedStudent.id, personData);
    setShowAddPersonModal(false);
    setNewPerson({ name: '', relation: '', phone: '', isTemp: false, tempDate: '' });
    Taro.showToast({ title: '添加成功', icon: 'success' });
    console.log('[Students] Add authorized person:', selectedStudent.id, personData);
  };

  const handleRemovePerson = (personId: string, personName: string) => {
    if (!selectedStudent) return;
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除接送人"${personName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          removeAuthorizedPerson(selectedStudent.id, personId);
          Taro.showToast({ title: '已删除', icon: 'success' });
          console.log('[Students] Remove authorized person:', personId);
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>学生档案</Text>
        <Text className={styles.subtitle}>
          {currentUser.role === 'teacher' ? `共 ${students.length} 名学生` : '查看和维护孩子信息'}
        </Text>
      </View>

      <View className={styles.searchSection}>
        <View className={styles.searchBox}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索学生姓名、班级、家长"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.content}>
        {filteredStudents.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>未找到匹配的学生</Text>
          </View>
        ) : (
          <View className={styles.studentList}>
            {filteredStudents.map((student) => {
              const pickup = getStudentPickupToday(student.id);
              return (
                <View
                  key={student.id}
                  className="student-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '16rpx',
                    padding: '32rpx',
                    boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)'
                  }}
                  onClick={() => handleStudentClick(student)}
                >
                  <Image
                    style={{
                      width: '96rpx',
                      height: '96rpx',
                      borderRadius: '999rpx',
                      backgroundColor: '#f3f4f6',
                      flexShrink: 0
                    }}
                    src={student.avatar || 'https://picsum.photos/id/1005/200/200'}
                    mode="aspectFill"
                  />
                  <View style={{ flex: 1, marginLeft: '32rpx', minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8rpx' }}>
                      <Text style={{ fontSize: '32rpx', fontWeight: 600, color: '#1f2937' }}>{student.name}</Text>
                      {pickup?.status && <StatusTag status={pickup.status} size="sm" />}
                    </View>
                    <Text style={{ fontSize: '24rpx', color: '#4b5563', display: 'block', marginBottom: '4rpx' }}>
                      {student.className} · {student.grade} · {student.age}岁
                    </Text>
                    <Text style={{ fontSize: '22rpx', color: '#9ca3af', display: 'block' }}>
                      家长：{student.parentName} · {student.parentPhone}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {showDetailModal && selectedStudent && (
        <View className={styles.modalMask} onClick={() => { setShowDetailModal(false); setEditMode(false); }}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>学生详情</Text>
              <Button
                className={styles.closeBtn}
                onClick={() => { setShowDetailModal(false); setEditMode(false); }}
              >
                ✕
              </Button>
            </View>

            <View className={styles.studentDetailHeader}>
              <Image
                className={styles.studentAvatar}
                src={selectedStudent.avatar || 'https://picsum.photos/id/1005/200/200'}
                mode="aspectFill"
              />
              <View className={styles.studentBasic}>
                <Text className={styles.studentName}>
                  {editMode ? (
                    <Input
                      value={editData.name ?? selectedStudent.name}
                      onInput={(e) => setEditData({ ...editData, name: e.detail.value })}
                      style={{ fontSize: '36rpx', fontWeight: 600 }}
                    />
                  ) : selectedStudent.name}
                </Text>
                <Text className={styles.studentInfo}>
                  {selectedStudent.gender === 'boy' ? '👦' : '👧'} {selectedStudent.age}岁
                </Text>
                <Text className={styles.studentInfo}>
                  {selectedStudent.school} · {selectedStudent.grade} · {selectedStudent.className}
                </Text>
              </View>
            </View>

            <View className={styles.sectionTitle}>
              <Text>基本信息</Text>
              {currentUser.role === 'parent' && (
                <Button className={styles.addBtn} onClick={handleToggleEdit}>
                  {editMode ? '保存' : '编辑'}
                </Button>
              )}
            </View>

            <View className={styles.infoGrid}>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>家长姓名</Text>
                <Text className={styles.infoValue}>{selectedStudent.parentName}</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>联系电话</Text>
                <Text className={styles.infoValue}>{selectedStudent.parentPhone}</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>过敏史</Text>
                <Text className={styles.infoValue}>{selectedStudent.allergies || '无'}</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>学校</Text>
                <Text className={styles.infoValue}>{selectedStudent.school}</Text>
              </View>
            </View>

            {selectedStudent.remarks && (
              <>
                <View className={styles.sectionTitle}>
                  <Text>备注信息</Text>
                </View>
                <View className={styles.remarksBox}>
                  {editMode ? (
                    <Textarea
                      value={editData.remarks ?? selectedStudent.remarks}
                      onInput={(e) => setEditData({ ...editData, remarks: e.detail.value })}
                      style={{ width: '100%', minHeight: '120rpx', fontSize: '28rpx', backgroundColor: 'transparent' }}
                    />
                  ) : (
                    <Text className={styles.remarksText}>{selectedStudent.remarks}</Text>
                  )}
                </View>
              </>
            )}

            <View className={styles.sectionTitle}>
              <Text>授权接送人（{selectedStudent.authorizedPersons.length}人）</Text>
              {currentUser.role === 'parent' && (
                <Button className={styles.addBtn} onClick={handleAddPerson}>
                  + 添加
                </Button>
              )}
            </View>

            <View className={styles.personList}>
              {selectedStudent.authorizedPersons.map((person) => (
                <View key={person.id} className={styles.personCard}>
                  <Image
                    className={styles.personAvatar}
                    src={person.avatar || 'https://picsum.photos/id/1005/200/200'}
                    mode="aspectFill"
                  />
                  <View className={styles.personInfo}>
                    <Text className={styles.personName}>
                      {person.name}
                      {person.isTemp && <Text className={styles.tempBadge}>临时</Text>}
                    </Text>
                    <Text className={styles.personMeta}>
                      {person.relation} · {person.phone}
                      {person.isTemp && person.tempDate && ` · ${person.tempDate}`}
                    </Text>
                  </View>
                  {currentUser.role === 'parent' && (
                    <Button
                      className={styles.deleteBtn}
                      onClick={() => handleRemovePerson(person.id, person.name)}
                    >
                      ✕
                    </Button>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {showAddPersonModal && (
        <View className={styles.modalMask} onClick={() => setShowAddPersonModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加接送人</Text>
              <Button className={styles.closeBtn} onClick={() => setShowAddPersonModal(false)}>
                ✕
              </Button>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>姓名</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入接送人姓名"
                value={newPerson.name}
                onInput={(e) => setNewPerson({ ...newPerson, name: e.detail.value })}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>与学生关系</Text>
              <Input
                className={styles.formInput}
                placeholder="如：父亲、母亲、爷爷等"
                value={newPerson.relation}
                onInput={(e) => setNewPerson({ ...newPerson, relation: e.detail.value })}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>联系电话</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="请输入手机号码"
                value={newPerson.phone}
                onInput={(e) => setNewPerson({ ...newPerson, phone: e.detail.value })}
              />
            </View>

            <View className={styles.formItem}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text
                  className={styles.formLabel}
                  style={{ margin: 0, marginRight: '16rpx' }}
                  onClick={() => setNewPerson({ ...newPerson, isTemp: !newPerson.isTemp })}
                >
                  {newPerson.isTemp ? '☑' : '☐'} 是否为临时接送人
                </Text>
              </View>
              {newPerson.isTemp && (
                <Input
                  className={styles.formInput}
                  style={{ marginTop: '16rpx' }}
                  placeholder="有效日期（如：2024-06-20）"
                  value={newPerson.tempDate}
                  onInput={(e) => setNewPerson({ ...newPerson, tempDate: e.detail.value })}
                />
              )}
            </View>

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowAddPersonModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleConfirmAddPerson}
              >
                确认添加
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StudentsPage;
