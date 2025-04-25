import { format, isToday, isYesterday } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

import {
  getDateAndTimeStyle,
  getLabelStyle,
  getUnreadIndicatorStyle,
} from '../../../utils/getStyleFromTheme';

import type { ReactNode } from 'react';
import type { StyleProp } from 'react-native';
import type { ThemeValues } from '../../../types/notification';

type Props = {
  theme: ThemeValues;
  label?: string;
  createdAt?: number;
  isUnread?: boolean;
  style?: StyleProp<any>;
  children: ReactNode;
};

function formatDate(createdAt) {
  if (!createdAt) {
    return '';
  } else if (isToday(createdAt)) {
    return format(createdAt, 'p');
  } else if (isYesterday(createdAt)) {
    return 'Yesterday';
  } else {
    return format(createdAt, 'MMM d');
  }
}

export default function FeedLayout({
  theme,
  label,
  createdAt,
  isUnread,
  style,
  children,
}: Props) {
  console.log(getLabelStyle(theme));
  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={getLabelStyle(theme)}>{label}</Text>
          <View style={styles.unreadDT}>
            {isUnread && (
              <View
                style={[getUnreadIndicatorStyle(theme), styles.unreadIcon]}
              />
            )}
            <Text style={getDateAndTimeStyle(theme)}>
              {formatDate(createdAt || new Date())}
            </Text>
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    marginBottom: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: 0,
    flexDirection: 'row',
  },
  unreadDT: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadIcon: {
    borderRadius: 9999,
    width: 4,
    height: 4,
    marginRight: 6,
  },
});
