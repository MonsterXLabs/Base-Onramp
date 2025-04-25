import { Text, View } from 'react-native';
import { getNotificationBubbleStyle } from '../../utils/getStyleFromTheme';

import type { ThemeValues } from '../../types/notification';

type Props = {
  theme: ThemeValues;
  templateItems: object;
  customImageComponent?: (props: any) => React.ReactNode;
  handlePress?: (props: any) => void;
};

export default function DataTemplate({
  theme,
  templateItems,
  customImageComponent,
  handlePress,
}: Props) {
  return (
    <View
      style={[
        getNotificationBubbleStyle(theme),
        { flex: 1, overflow: 'hidden' },
      ]}
    >
      {Object.keys(templateItems).map((key) => {
        return (
          <View key={key}>
            <Text>{key}</Text>
            <Text>{templateItems[key]}</Text>
          </View>
        );
      })}
    </View>
  );
}
