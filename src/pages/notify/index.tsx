import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Button, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store';
import { formatDateTime, getNotifyTypeText } from '@/utils';
import type { NotifyType, NotifyRecord } from '@/types';

type TabType = 'all' | 'homework' | 'notice' | 'message' | 'photo';

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'homework', label: '作业' },
  { key: 'notice', label: '公告' },
  { key: 'message', label: '留言' },
  { key: 'photo', label: '照片' }
];

const sendTypes: { key: NotifyType; label: string }[] = [
  { key: 'homework', label: '作业提醒' },
  { key: 'notice', label: '公告通知' },
  { key: 'message', label: '单独留言' },
  { key: 'photo', label: '照片分享' }
];

const NotifyPage: React.FC = () => {
  const {
    currentUser,
    students,
    notifyRecords,
    addNotifyRecord
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showSendModal, setShowSendModal] = useState(false);

  const [sendType, setSendType] = useState<NotifyType>('homework');
  const [sendTitle, setSendTitle] = useState('');
  const [sendContent, setSendContent] = useState('');
  const [isGroup, setIsGroup] = useState(true);
  const [selectedReceivers, setSelectedReceivers] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const filteredRecords = useMemo(() => {
    let records = notifyRecords;
    if (currentUser.role === 'parent') {
      records = records.filter(
        (r) => r.isGroup || r.receiverId === currentUser.id || r.senderId === currentUser.id
      );
    }
    if (activeTab !== 'all') {
      records = records.filter((r) => r.type === activeTab);
    }
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifyRecords, activeTab, currentUser]);

  const resetSendForm = () => {
    setSendType('homework');
    setSendTitle('');
    setSendContent('');
    setIsGroup(true);
    setSelectedReceivers([]);
    setPhotos([]);
  };

  const handleOpenSend = () => {
    if (currentUser.role !== 'teacher') {
      setSendType('message');
      setIsGroup(false);
    }
    setShowSendModal(true);
  };

  const handleToggleReceiver = (studentId: string) => {
    setSelectedReceivers((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9 - photos.length,
        sizeType: ['compressed']
      });
      setPhotos((prev) => [...prev, ...res.tempFilePaths]);
      console.log('[Notify] Choose images:', res.tempFilePaths.length);
    } catch (e) {
      console.error('[Notify] Choose image failed:', e);
      setPhotos([
        ...photos,
        `https://picsum.photos/id/${100 + photos.length}/300/300`
      ]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (!sendTitle.trim() || !sendContent.trim()) {
      Taro.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }
    if (!isGroup && sendType === 'message' && selectedReceivers.length === 0) {
      Taro.showToast({ title: '请选择接收人', icon: 'none' });
      return;
    }

    const notifyData: Omit<NotifyRecord, 'id' | 'createdAt'> = {
      type: sendType,
      title: sendTitle.trim(),
      content: sendContent.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      isGroup,
      photos: photos.length > 0 ? photos : undefined,
      readCount: 0,
      totalCount: isGroup ? students.length : selectedReceivers.length
    };

    addNotifyRecord(notifyData);
    setShowSendModal(false);
    resetSendForm();
    Taro.showToast({ title: '发送成功', icon: 'success' });
    console.log('[Notify] Send notification:', notifyData);
  };

  const handleReply = (record: NotifyRecord) => {
    Taro.showToast({ title: `回复：${record.title}`, icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>通知反馈</Text>
        <Text className={styles.subtitle}>作业提醒、公告通知、留言互动</Text>
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY enhanced showScrollbar={false} style={{ height: 'calc(100vh - 380rpx)' }}>
        <View className={styles.list}>
          {filteredRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>暂无通知消息</Text>
            </View>
          ) : (
            filteredRecords.map((record) => (
              <View key={record.id} className={styles.noticeCard}>
                <View className={styles.cardHeader}>
                  <View className={styles.senderInfo}>
                    <Image
                      className={styles.senderAvatar}
                      src={`https://picsum.photos/id/${record.senderRole === 'teacher' ? 64 : 177}/200/200`}
                      mode="aspectFill"
                    />
                    <View className={styles.senderDetail}>
                      <Text className={styles.senderName}>
                        {record.senderName}
                        {record.senderRole === 'teacher' && <Text style={{ fontSize: '20rpx', color: '#2563EB', marginLeft: '8rpx' }}>老师</Text>}
                      </Text>
                      <Text className={styles.sendTime}>{formatDateTime(record.createdAt)}</Text>
                    </View>
                  </View>
                  <View className={classnames(styles.typeTag, styles[record.type])}>
                    {getNotifyTypeText(record.type)}
                  </View>
                </View>

                <Text className={styles.cardTitle}>{record.title}</Text>
                <Text className={styles.cardContent}>{record.content}</Text>

                {record.photos && record.photos.length > 0 && (
                  <View className={styles.photoGrid}>
                    {record.photos.slice(0, 9).map((photo, idx) => (
                      <View key={idx} className={styles.photoItem}>
                        <Image
                          className={styles.photoImg}
                          src={photo}
                          mode="aspectFill"
                        />
                      </View>
                    ))}
                  </View>
                )}

                <View className={styles.cardFooter}>
                  {record.isGroup && record.totalCount !== undefined && (
                    <Text className={styles.readInfo}>
                      已读 {record.readCount}/{record.totalCount}
                    </Text>
                  )}
                  {!record.isGroup && currentUser.role === 'teacher' && record.senderRole === 'parent' && (
                    <Button
                      className={styles.replyBtn}
                      onClick={() => handleReply(record)}
                    >
                      回复
                    </Button>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View className={styles.fabBtn} onClick={handleOpenSend}>
        <Text>✎</Text>
      </View>

      {showSendModal && (
        <View className={styles.modalMask} onClick={() => setShowSendModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>
                {currentUser.role === 'teacher' ? '发送通知' : '发送留言'}
              </Text>
              <Button className={styles.closeBtn} onClick={() => setShowSendModal(false)}>✕</Button>
            </View>

            {currentUser.role === 'teacher' && (
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>通知类型</Text>
                <View className={styles.typeSelector}>
                  {sendTypes.map((t) => (
                    <View
                      key={t.key}
                      className={classnames(styles.typeOption, sendType === t.key && styles.active)}
                      onClick={() => setSendType(t.key)}
                    >
                      <Text>{t.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {currentUser.role === 'teacher' && (
              <View className={styles.receiverSection}>
                <View className={styles.receiverRow}>
                  <View
                    className={classnames(styles.switchBox, isGroup && styles.checked)}
                    onClick={() => setIsGroup(!isGroup)}
                  >
                    {isGroup ? '✓' : ''}
                  </View>
                  <Text className={styles.switchLabel}>群发（所有家长）</Text>
                </View>

                {!isGroup && (
                  <View className={styles.receiverList}>
                    {students.map((s) => (
                      <View
                        key={s.id}
                        className={classnames(styles.receiverItem, selectedReceivers.includes(s.id) && styles.active)}
                        onClick={() => handleToggleReceiver(s.id)}
                      >
                        <Image
                          className={styles.receiverAvatar}
                          src={s.avatar || 'https://picsum.photos/id/1005/200/200'}
                          mode="aspectFill"
                        />
                        <Text className={styles.receiverName}>{s.parentName}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>标题</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入标题"
                value={sendTitle}
                onInput={(e) => setSendTitle(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>内容</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="请输入内容"
                value={sendContent}
                onInput={(e) => setSendContent(e.detail.value)}
              />
            </View>

            {(sendType === 'photo' || currentUser.role === 'teacher') && (
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>上传照片（可选）</Text>
                <View className={styles.uploadSection}>
                  {photos.map((p, i) => (
                    <View key={i} className={styles.uploadItem} onClick={() => handleRemovePhoto(i)}>
                      <Image className={styles.uploadImg} src={p} mode="aspectFill" />
                    </View>
                  ))}
                  {photos.length < 9 && (
                    <View className={styles.uploadAdd} onClick={handleChooseImage}>
                      <Text>+</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowSendModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleSend}
              >
                发送
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default NotifyPage;
