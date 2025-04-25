import axios, { AxiosResponse } from 'axios';
import {
  NotificationResDTO,
  SignupNotificationDTO,
  TransNotificationDTO,
  UnreadNotificationDTO,
} from './dto/notification';
import { NotificationEvent } from '@/types';

export const sendTransactionNotification = async (
  event: NotificationEvent,
  nftId: string,
  actorId: string = '',
): Promise<NotificationResDTO> => {
  try {
    const res = await axios.post<
      TransNotificationDTO,
      AxiosResponse<NotificationResDTO>
    >('/api/sendbird/notification', {
      mode: 'transaction',
      event,
      nftId,
      actorId,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const sendUnreadNotification = async (
  sendFrom: string,
  sendTo: string,
  unread_count: number,
): Promise<NotificationResDTO> => {
  try {
    const res = await axios.post<
      UnreadNotificationDTO,
      AxiosResponse<NotificationResDTO>
    >(`/api/sendbird/notification`, {
      mode: 'unread',
      sendFrom,
      sendTo,
      unread_count,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const sendSignUpNotification = async (
  registerId: string,
): Promise<NotificationResDTO> => {
  try {
    const res = await axios.post<
      SignupNotificationDTO,
      AxiosResponse<NotificationResDTO>
    >(`/api/sendbird/notification`, {
      mode: 'register',
      registerId,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};
