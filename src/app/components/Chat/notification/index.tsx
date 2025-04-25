import { ScrollArea } from '@/components/ui/scrollarea';
import { parseThemeColor } from '@/lib/utils';
import { NotificationMessage } from '@sendbird/chat/feedChannel';
import '@sendbird/uikit-react/dist/index.css';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNotificationContext } from '../../Context/NotificationContext';
import { NotificationPreview } from '../../ui/sendbird/notificationPreview';

export const NotificationHeader: React.FC = () => {
  const { globalSettings } = useNotificationContext();
  const { theme } = useTheme();
  const selectedTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <>
      <View style={styles.outerContainer(globalSettings.header, selectedTheme)}>
        <Text style={styles.text(globalSettings.header, selectedTheme)}>
          Notifications
        </Text>
        <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
          <Image
            src="/images/notification/SettingsIcon.svg"
            width={22}
            height={22}
            alt="setting-icon"
            style={{ filter: 'invert(1)' }}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.headerLine(globalSettings.header, selectedTheme)} />
    </>
  );
};
export function Notification() {
  const {
    globalSettings,
    isChannelLoading,
    messages,
    templates,
    refreshCollections,
    markMessagesAsRead,
    logImpression,
    setUnreadCount,
  } = useNotificationContext();
  const { theme } = useTheme();
  const selectedTheme = theme === 'dark' ? 'dark' : 'light';
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const [page, setPage] = useState(1);

  const NoNotifications = () => (
    <View style={styles.listEmpty}>
      <div>
        <Image
          src="/images/notification/NotificationBell.svg"
          width={60}
          height={60}
          alt="notification-bell"
          style={{ filter: 'invert(1)' }}
        />
      </div>
      <Text style={styles.listEmptyText(selectedTheme)}>No Notifications</Text>
    </View>
  );

  const NewNotifications = () => (
    <TouchableOpacity
      style={styles.newNotificationsContainer}
      onPress={() => {
        refreshCollections().then(() => {
          flatListRef.current &&
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        });
      }}
    >
      <Text style={styles.newNotificationsText} allowFontScaling={false}>
        New Notifications
      </Text>
    </TouchableOpacity>
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshCollections();
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const NotificationList = () => {
    if (isChannelLoading) {
      return (
        <View style={styles.activityIndicator}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (messages.length === 0) return <NoNotifications />;

    const NotificationItem = (item: NotificationMessage) => {
      useEffect(() => {
        if (item.messageStatus === 'SENT') {
          markMessagesAsRead([item]);
          setUnreadCount((prev) => (prev ? prev - 1 : 0));
          logImpression(item);
        }
      }, [item]);

      return (
        <NotificationPreview
          globalTheme={globalSettings}
          template={templates[item.notificationData.templateKey]}
          notification={item}
          useLayout={true}
          themeMode="dark"
          handlePress={(props) => {
            switch (props.action?.type) {
              case 'web': {
                if (
                  !props.action.data.startsWith('http://') ||
                  !props.action.data.startsWith('https://')
                ) {
                  return Linking.openURL(`https://${props.action.data}`);
                }
                return Linking.openURL(props.action.data);
              }
              case 'uikit': {
                return console.warn(props.action.data);
              }
              case 'custom': {
                return;
              }
            }
          }}
        />
      );
    };

    return (
      <ScrollArea
        className="w-full my-2"
        style={{ height: 'calc(100vh - 100px)' }}
      >
        {messages.map((item) => (
          <>
            <NotificationItem {...item} />
            <View style={{ height: 16 }} />
          </>
        ))}
      </ScrollArea>
    );
    return (
      <View
        style={[
          styles.listContainer(globalSettings.list, selectedTheme),
          { height: '100vh' },
        ]}
      >
        <View
          style={[styles.listPadding, { flex: 1 }]}
          id="notification-list-pad"
        >
          <FlatList
            ref={flatListRef}
            contentContainerStyle={{ paddingBottom: 40 }}
            data={messages}
            keyExtractor={(item) => item.notificationId}
            ListEmptyComponent={<NoNotifications />}
            onEndReachedThreshold={0.1}
            onRefresh={onRefresh}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            refreshing={refreshing}
            renderItem={({ item }) => <NotificationItem {...item} />}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </View>
    );
  };

  return <NotificationList />;
}

const styles = StyleSheet.create({
  listContainer: (listSettings, selectedTheme) => ({
    width: '100%',
    flex: 1,
    backgroundColor: parseThemeColor(
      listSettings.backgroundColor,
      selectedTheme,
    ),
  }),
  activityIndicator: {
    margin: 0,
    padding: 0,
    position: 'absolute',
    top: '50%',
    width: '100%',
  },
  listEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 600,
  },
  listEmptyText: (selectedTheme) => ({
    width: 200,
    height: 20,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 19,
    textAlign: 'center',
    color: selectedTheme === 'light' ? '#000' : '#fff',
  }),
  listPadding: {
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 20,
    height: '100%',
  },
  notificationBell: (selectedTheme) => ({
    color: selectedTheme === 'light' ? '#000' : '#fff',
  }),
  newNotificationsContainer: {
    height: 38,
    width: 152,
    position: 'absolute',
    top: 45,
    alignSelf: 'center',
    flex: 1,
    zIndex: 1,
    borderRadius: 19,
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#742DDD',
  },
  newNotificationsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.1,
    alignSelf: 'center',
  },
  outerContainer: (headerSettings, selectedTheme) => ({
    width: '100%',
    paddingLeft: 20,
    paddingRight: 16,
    flexDirection: 'row',
    paddingTop: 0,
    paddingBottom: 12,
    backgroundColor: parseThemeColor(
      headerSettings.backgroundColor,
      selectedTheme,
    ),
    borderBottomWidth: 1,
    borderBottomColor: parseThemeColor(headerSettings.lineColor, selectedTheme),
  }),
  text: (headerSettings, selectedTheme) => ({
    fontSize: headerSettings.textSize,
    fontWeight: headerSettings.fontWeight,
    color: parseThemeColor(headerSettings.textColor, selectedTheme),
  }),
  iconButton: {
    marginLeft: 'auto',
  },
  icon: (headerSettings, selectedTheme) => ({
    color: parseThemeColor(headerSettings.buttonIconTintColor, selectedTheme),
  }),
  headerLine: (headerSettings, selectedTheme) => ({
    flex: 1,
    height: 1,
    maxHeight: 1,
    backgroundColor: parseThemeColor(headerSettings.lineColor, selectedTheme),
  }),
  upperSafeView: (headerSettings, selectedTheme) => ({
    flex: 0,
    backgroundColor: parseThemeColor(
      headerSettings.backgroundColor,
      selectedTheme,
    ),
  }),
  lowerSafeView: (listSettings, selectedTheme) => ({
    backgroundColor: parseThemeColor(
      listSettings.backgroundColor,
      selectedTheme,
    ),
    flex: 1,
  }),
  container: {
    height: '100%',
    alignItems: 'center',
  },
});
