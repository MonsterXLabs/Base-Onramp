import type { UikitMessage } from './uikit';

export type NotificationTemplateDataSchemaProperty = {
  key: string;
  name: string;
  type: 'string' | 'image' | 'action';
};

export type NotificationChannelViewType = 'chat' | 'feed';

export type NotificationChannel = {
  key: string;
  name: string;
  view: NotificationChannelViewType;
  cover_url: string;
  created_at: number;
  updated_at: number;
  active_notification_template_count: number;
};

export type Category = {
  id: number;
  name: string;
  is_default: boolean;
};

export type NotificationTemplate = {
  key: string;
  name: string;
  category?: Category | string;
  label?: string;
  status: 'active' | 'archived';
  data_schema: { properties: NotificationTemplateDataSchemaProperty[] };
  ui_template: UikitMessage;
  color_variables: Record<string, string>;
  enable_push: boolean;
  fallback_message: string | null;
  push_template: {
    title: string;
    body: string;
  };
  channel: NotificationChannel;
  created_at: number;
  updated_at: number;
};

export type SimpleNotificationTemplate = Omit<
  NotificationTemplate,
  'data_schema' | 'ui_template' | 'color_variables' | 'channel'
>;

type FontWeight = 'bold' | 'normal';

/**
 * The value of each theme property contains both light and dark value with comma separated string
 * ex)
 * {
 *   ...
 *   backgroundColor: "#800000FF, #20FFFFTT" // lgiht , dark with ARGB 8-digit hexacode
 *   ....
 * }
 *  */
export type Theme = {
  key: string;
  notification: {
    backgroundColor: string;
    label?: {
      textColor: string;
      textSize: number;
      fontWeight?: FontWeight;
    };
    category?: {
      textColor: string;
      textSize: number;
      fontWeight?: FontWeight;
    };
    pressedColor: string;
    radius: number;
    sentAt: {
      textColor: string;
      textSize: number;
      fontWeight?: FontWeight;
    };
    unreadIndicatorColor: string;
  };
  list: {
    backgroundColor: string;
    category: {
      textSize: number;
      fontWeight: FontWeight;
      radius: number;
      backgroundColor: string;
      textColor: string;
      selectedBackgroundColor: string;
      selectedTextColor: string;
    };
    timeline: {
      backgroundColor: string;
      textColor: string;
      textSize?: number;
      fontWeight?: FontWeight;
    };
    tooltip: {
      backgroundColor: string;
      textColor: string;
      textSize?: number;
      fontWeight?: FontWeight;
    };
  };
  header: {
    backgroundColor: string;
    buttonIconTintColor: string;
    lineColor: string;
    textColor: string;
    textSize: number;
    fontWeight?: FontWeight;
  };
  // marked as optional because this is not used for now
  components?: {
    text: {
      textColor: string;
    };
    textButton: {
      textColor: string;
      backgroundColor: string;
      radius: number;
    };
  };
};

export type ThemeValues = Omit<Theme, 'key' | 'created_at' | 'updated_at'>;

export type ThemeMode = 'light' | 'dark';
export type AppThemeMode = 'default' | ThemeMode;

export type NotificationSettings = {
  themes: Theme[];
  theme_mode: AppThemeMode;
  updated_at: number;
};

export type TextData = string;

export type ImageData = {
  width: number;
  height: number;
  url: string;
};

export type ActionData = {
  type: 'web' | 'custom';
  data: string;
};

export type VariablesValue = TextData | ImageData | ActionData;

export type TemplateData = Record<string, VariablesValue>;
