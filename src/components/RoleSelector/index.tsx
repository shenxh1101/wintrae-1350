import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import type { User, UserRole } from '@/types';

const RoleSelector: React.FC = () => {
  const { roleSelected, teachers, parents, selectRoleAndUser } = useAppStore();
  const [activeRole, setActiveRole] = useState<UserRole>('teacher');

  if (roleSelected) return null;

  const list = activeRole === 'teacher' ? teachers : parents;

  const handleSelectUser = (user: User) => {
    selectRoleAndUser(user);
    Taro.showToast({ title: `已登录为${user.name}`, icon: 'success' });
  };

  return (
    <View className={styles.mask}>
      <View className={styles.modal}>
        <View className={styles.header}>
          <Text className={styles.title}>欢迎使用托管班接送</Text>
          <Text className={styles.subtitle}>请选择您的身份登录</Text>
        </View>

        <View className={styles.roleTabs}>
          <View
            className={classnames(styles.roleTab, activeRole === 'teacher' && styles.roleTabActive)}
            onClick={() => setActiveRole('teacher')}
          >
            <Text className={styles.roleTabText}>我是老师</Text>
          </View>
          <View
            className={classnames(styles.roleTab, activeRole === 'parent' && styles.roleTabActive)}
            onClick={() => setActiveRole('parent')}
          >
            <Text className={styles.roleTabText}>我是家长</Text>
          </View>
        </View>

        <ScrollView scrollY className={styles.userList}>
          {list.map((user) => (
            <View
              key={user.id}
              className={styles.userItem}
              onClick={() => handleSelectUser(user)}
            >
              <Image
                className={styles.avatar}
                src={user.avatar || 'https://picsum.photos/id/1005/200/200'}
              />
              <View className={styles.userInfo}>
                <Text className={styles.userName}>{user.name}</Text>
                <Text className={styles.userPhone}>{user.phone}</Text>
                {activeRole === 'parent' && user.studentIds && user.studentIds.length > 0 && (
                  <Text className={styles.userExtra}>
                    孩子：{user.studentIds.length}名
                  </Text>
                )}
              </View>
              <Text className={styles.arrow}>›</Text>
            </View>
          ))}
        </ScrollView>

        <View className={styles.footerTip}>
          <Text className={styles.footerTipText}>
            {activeRole === 'teacher'
              ? '老师可查看全校学生接送情况、管理请假、发送通知'
              : '家长可维护孩子信息、提交请假改接、查看接送记录'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RoleSelector;
