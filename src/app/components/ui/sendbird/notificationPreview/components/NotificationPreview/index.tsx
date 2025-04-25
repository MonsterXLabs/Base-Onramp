import { mapData } from '../../utils/mapData';
import DataTemplate from './DataTemplate';
import FeedLayout from './Layout/FeedLayout';
import MessageTemplate from './MessageTemplate';
import restoreNumbersFromUiTemplate from './utils/restoreNumbersFromUITemplate';
import selectTheme from './utils/selectTheme';

import type { NotificationMessage } from '@sendbird/chat/feedChannel';
import type {
  NotificationTemplate,
  ThemeValues,
} from '../../types/notification';

type NotificationProps = {
  globalTheme: ThemeValues;
  notification: NotificationMessage;
  template: NotificationTemplate;
  themeMode?: 'light' | 'dark';
  useLayout?: boolean;
  customImageComponent?: (props: any) => React.ReactNode;
  handlePress?: (props: any) => void;
};

export function NotificationPreview({
  globalTheme,
  template,
  themeMode = 'light',
  notification,
  useLayout,
  customImageComponent,
  handlePress,
}: NotificationProps) {
  const selectedThemeColorVariables = selectTheme({
    theme: template['color_variables'],
    themeMode,
  });

  const theme = selectTheme({
    theme: globalTheme,
    themeMode,
  });

  if (Object.keys(template['data_template']).length > 0) {
    if (!useLayout) {
      <DataTemplate
        theme={theme}
        templateItems={template['data_template']}
        customImageComponent={customImageComponent}
        handlePress={handlePress}
      />;
    } else {
      <FeedLayout
        theme={theme}
        label={notification.notificationData.label}
        createdAt={notification.createdAt}
        isUnread={notification.messageStatus !== 'READ'}
      >
        <DataTemplate
          theme={theme}
          templateItems={template['data_template']}
          customImageComponent={customImageComponent}
          handlePress={handlePress}
        />
      </FeedLayout>;
    }
  } else {
    const parsedTemplate = mapData({
      template: restoreNumbersFromUiTemplate(template['ui_template']) as any,
      source: {
        ...notification.notificationData.templateVariables,
        ...selectedThemeColorVariables,
      },
    });

    if (!useLayout) {
      return (
        <MessageTemplate
          theme={theme}
          templateItems={parsedTemplate.body.items}
          customImageComponent={customImageComponent}
        />
      );
    } else {
      return (
        <FeedLayout
          theme={theme}
          label={notification.notificationData.label}
          createdAt={notification.createdAt}
          isUnread={notification.messageStatus !== 'READ'}
        >
          <MessageTemplate
            theme={theme}
            templateItems={parsedTemplate.body.items}
            customImageComponent={customImageComponent}
          />
        </FeedLayout>
      );
    }
  }
}
