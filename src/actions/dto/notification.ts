import { NotificationEvent } from '@/types';

export type TransNotificationDTO = {
  mode: 'transaction';
  event: NotificationEvent;
  nftId: string;
  actorId: string;
};

export type UnreadNotificationDTO = {
  mode: 'unread';
  sendFromId: string;
  sendToId: string;
  unread_count: string;
};

export type SignupNotificationDTO = {
  mode: 'register';
  registerId: string;
};

export type NotificationResDTO = {
  success: boolean;
  message: string;
};
