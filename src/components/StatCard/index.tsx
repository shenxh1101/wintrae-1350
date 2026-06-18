import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  label: string;
  value: number | string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color = 'default' }) => {
  const colorClassMap: Record<string, string> = {
    primary: styles.colorPrimary,
    success: styles.colorSuccess,
    warning: styles.colorWarning,
    error: styles.colorError,
    default: styles.colorDefault
  };

  return (
    <View className={classnames(styles.card, colorClassMap[color])}>
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;
