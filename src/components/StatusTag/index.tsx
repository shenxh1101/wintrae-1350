import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getStatusText } from '@/utils';

interface StatusTagProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusTag: React.FC<StatusTagProps> = ({ status, size = 'md' }) => {
  const statusClassMap: Record<string, string> = {
    pending: styles.pending,
    arrived: styles.arrived,
    delivered: styles.delivered,
    leave: styles.leave,
    approved: styles.approved,
    rejected: styles.rejected
  };

  return (
    <View className={classnames(styles.tag, statusClassMap[status], styles[size])}>
      <Text className={styles.text}>{getStatusText(status)}</Text>
    </View>
  );
};

export default StatusTag;
