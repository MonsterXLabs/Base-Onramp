'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import SendbirdChat, {
  CollectionEventSource,
  SessionHandler,
} from '@sendbird/chat';
import {
  FeedChannel,
  FeedChannelModule,
  NotificationCollection,
  NotificationCollectionEventHandler,
  NotificationMessage,
} from '@sendbird/chat/feedChannel';
import {
  GroupChannelModule,
  MessageCollectionInitPolicy,
} from '@sendbird/chat/groupChannel';
import { useGlobalContext } from '../Context/GlobalContext';
import DefaultNotification from './defaultNotification.json';
import { ThemeValues } from '../ui/sendbird/notificationPreview/types/notification';

const APP_ID = process.env.NEXT_PUBLIC_APP_SENDBIRD_APPID;

export const sb = SendbirdChat.init({
  appId: APP_ID ?? '',
  modules: [new FeedChannelModule(), new GroupChannelModule()],
});

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [globalSettings, setGlobalSettings] = useState<null | ThemeValues>(
    DefaultNotification as ThemeValues,
  );
  const { user } = useGlobalContext();
  const [notificationCollection, setNotificationCollection] =
    useState<NotificationCollection | null>(null);
  const [isChannelLoading, setChannelLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<NotificationMessage>>([]);
  const [templates, setTemplates] = useState({});
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [feedChannel, setFeedChannel] = useState<FeedChannel | null>(null);

  async function getTemplates(token = '') {
    let hasMore = true;
    let templates = {};
    while (hasMore) {
      const response =
        await sb.feedChannel.getNotificationTemplateListByToken(token);
      const data = JSON.parse(response.notificationTemplateList.jsonString);
      data.templates.forEach((template) => {
        if (!template['color_variables']) template['color_variables'] = {};
        templates[template.key] = template;
      });
      token = response.token;
      hasMore = response.hasMore;
    }
    setTemplates(templates);
  }

  useEffect(() => {
    initNotifications();
  }, [user]);

  const messageCollectionHandler: NotificationCollectionEventHandler = {
    onMessagesAdded: (context, channel, messages) => {
      const newMessages = messages.filter(
        (message) => message.messageStatus === 'SENT',
      );
      if (newMessages.length !== 0) {
        console.log('Messages added', newMessages);
      }
      sb.feedChannel.refreshNotificationCollections();
    },
    onMessagesUpdated: () => {
      sb.feedChannel.refreshNotificationCollections();
    },
    onMessagesDeleted: (context, channel, messageIds, messages) => {
      console.log('Messages deleted', messages);
    },
    onChannelUpdated: (context, channel) => {
      if (
        [
          CollectionEventSource.EVENT_CHANNEL_READ,
          CollectionEventSource.SYNC_CHANNEL_CHANGELOGS,
        ].includes(context.source)
      ) {
        setUnreadCount(channel.unreadMessageCount);
      }
    },
  };

  const initNotifications = async () => {
    if (!user) return;
    setChannelLoading(true);
    sb.setSessionHandler(
      new SessionHandler({
        onSessionTokenRequired: (resolve) => {
          resolve('test_token');
        },
        onSessionError: (err) => {
          console.error('onSessionError', err);
        },
      }),
    );
    await sb.authenticateFeed(user?._id);
    await getTemplates();
    const channel = await sb.feedChannel.getChannel(
      'notification_235496_web-app',
    );
    // const channel = await sb.feedChannel.getChannel('notification_235496_sandbox-inapp');
    setFeedChannel(channel);
    setUnreadCount(channel.unreadMessageCount);
    const params = {
      limit: 20,
      startingPoint: Date.now(),
      nextResultLimit: 0,
      prevResultLimit: 20,
    };
    const collection = channel.createNotificationCollection(params);
    setNotificationCollection(collection);
    collection.setMessageCollectionHandler(messageCollectionHandler);
    collection
      .initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
      .onCacheResult((err, messages) => {
        setMessages(messages);
      })
      .onApiResult((err, messages) => {
        setChannelLoading(false);
        if (messages) {
          setMessages(messages);
        }
        if (err) console.log('Error', err);
      });
  };

  const refreshCollections = async () => {
    await sb.feedChannel.refreshNotificationCollections();
  };

  const markMessagesAsRead = async (data) => {
    if (!feedChannel) return;
    try {
      await feedChannel.markAsRead(data);
    } catch (error) {
      console.error('markMessagesAsRead Error', error);
    }
  };

  const logImpression = async (data) => {
    if (!feedChannel) return;
    try {
      await feedChannel.logViewed(data);
    } catch (error) {
      console.error('logViewed Error', error);
    }
  };

  const loadPrev = async () => {
    if (!notificationCollection) return;
    try {
      if (notificationCollection.hasPrevious) {
        const notifications = await notificationCollection.loadPrevious();
        return { notifications, collection: notificationCollection };
      }
    } catch (error) {
      console.error('loadPrev Error', error);
    }
  };

  const loadNext = async () => {
    if (!notificationCollection) return;
    try {
      if (
        notificationCollection.hasNext ||
        notificationCollection.hasPrevious
      ) {
        const notifications = await notificationCollection.loadNext();
        return { notifications, collection: notificationCollection };
      }
    } catch (error) {
      console.error('loadNext Error', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        globalSettings,
        isChannelLoading,
        messages,
        templates,
        feedChannel,
        unreadCount,
        setUnreadCount,
        refreshCollections,
        markMessagesAsRead,
        logImpression,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
