import type { StyleProp } from 'react-native';

import { ThemeValues } from '../types/notification';

type GetStyleFromTheme = (theme: ThemeValues) => StyleProp<any>;

const withFallback = (
  value: string | number | undefined,
  fallback: string | number,
) => (value == null ? fallback : value);

export const getLabelStyle: GetStyleFromTheme = (theme) => {
  const attributes = theme.notification.label || theme.notification.category;
  return {
    color: attributes.textColor,
    fontSize: attributes.textSize,

    // Providing a fallback value here because the font weight is not supported in all regions.
    fontWeight: withFallback(attributes.fontWeight, '700'),
  };
};

export const getDateAndTimeStyle: GetStyleFromTheme = (theme) => ({
  color: theme.notification.sentAt.textColor,
  fontSize: theme.notification.sentAt.textSize,

  // Providing a fallback value here because the font weight is not supported in all regions.
  fontWeight: withFallback(theme.notification.sentAt.fontWeight, '400'),
});

export const getUnreadIndicatorStyle: GetStyleFromTheme = (theme) => ({
  backgroundColor: theme.notification.unreadIndicatorColor,
});

export const getNotificationBubbleStyle: GetStyleFromTheme = (theme) => ({
  backgroundColor: theme.notification.backgroundColor,
  borderRadius: theme.notification.radius,
});
