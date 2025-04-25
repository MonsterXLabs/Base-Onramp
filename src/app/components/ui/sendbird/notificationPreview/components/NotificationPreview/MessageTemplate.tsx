import { createMessageTemplate } from '@sendbird/uikit-message-template';
import { useMemo } from 'react';
import { View } from 'react-native';
import { getNotificationBubbleStyle } from '../../utils/getStyleFromTheme';
import parser from './utils/parser';
import renderer from './utils/renderer';

import type { Template } from '@sendbird/uikit-message-template';
import type { ThemeValues } from '../../types/notification';

type Props = {
  theme: ThemeValues;
  templateItems: Template['body']['items'];
  customImageComponent?: (props: any) => React.ReactNode;
};

export default function MessageTemplate({
  theme,
  templateItems,
  customImageComponent,
}: Props) {
  const CustomTemplate = useMemo(() => {
    const { MessageTemplate } = createMessageTemplate({
      parser,
      renderer: renderer({ customImageComponent }),
      Container: ({ children }) => (
        <View
          style={[
            getNotificationBubbleStyle(theme),
            { flex: 1, overflow: 'hidden' },
          ]}
        >
          {children}
        </View>
      ),
    });
    return MessageTemplate;
  }, [theme]);

  return <CustomTemplate templateItems={templateItems} />;
}
