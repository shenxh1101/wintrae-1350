import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import type { Student, PickupRecord } from '@/types';

interface StudentCardProps {
  student: Student;
  pickupRecord?: PickupRecord;
  onClick?: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, pickupRecord, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <Image
        className={styles.avatar}
        src={student.avatar || 'https://picsum.photos/id/1005/200/200'}
        mode="aspectFill"
      />
      <View className={styles.info}>
        <View className={styles.header}>
          <Text className={styles.name}>{student.name}</Text>
          {pickupRecord?.status && <StatusTag status={pickupRecord.status} size="sm" />}
        </View>
        <View className={styles.meta}>
          <Text className={styles.metaText}>{student.className} · {student.grade}</Text>
        </View>
        {pickupRecord && (
          <View className={styles.details}>
            {pickupRecord.arrivedTime && (
              <Text className={styles.detail}>到校: {pickupRecord.arrivedTime}</Text>
            )}
            {pickupRecord.deliveredTime && (
              <Text className={styles.detail}>送达: {pickupRecord.deliveredTime}</Text>
            )}
            {pickupRecord.pickupPerson && (
              <Text className={styles.detail}>接走: {pickupRecord.pickupPerson}({pickupRecord.pickupRelation})</Text>
            )}
            {pickupRecord.delayMinutes && pickupRecord.delayMinutes > 0 && (
              <Text className={styles.delay}>延迟{pickupRecord.delayMinutes}分钟</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default StudentCard;
