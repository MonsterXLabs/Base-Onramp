export type UikitLayout = 'column' | 'row';
export type UikitAlignHorizontal = 'left' | 'right' | 'center';
export type UikitAlignVertical = 'top' | 'bottom' | 'center';
export type UikitImageContentMode = 'aspectFill' | 'aspectFit' | 'scalesToFill';
export type UikitNativeActionData = 'sendbirduikit://delete';
export type UikitSize = {
  type: 'fixed' | 'flex';
  value: number;
};
export type UikitImageMetadata = {
  pixelWidth: number;
  pixelHeight: number;
};

export type UikitAlign = {
  horizontal: UikitAlignHorizontal;
  vertical: UikitAlignVertical;
};

export type UikitViewStyle = {
  backgroundColor?: string;
  backgroundImageUrl?: string;
  borderWidth?: number;
  borderColor?: string;
  radius?: number;
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  padding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
};

type UikitWebAction = {
  type: 'web';
  data: string;
  alterData?: string;
};

type UikitNativeAction = {
  type: 'uikit';
  data: UikitNativeActionData | string;
  alterData?: string;
};

type UikitCustomAction = {
  type: 'custom';
  data: string;
  alterData?: string;
};

export type UikitAction =
  | UikitWebAction
  | UikitNativeAction
  | UikitCustomAction;

type UikitTextStyle = {
  size?: number;
  color?: string;
  weight?: 'bold' | 'normal';
};

export type UikitView = {
  action?: UikitAction;
  width?: UikitSize;
  height?: UikitSize;
  viewStyle?: UikitViewStyle;
};

export interface UikitText extends UikitView {
  type: 'text';
  text: string;
  maxTextLines?: number;
  textStyle?: UikitTextStyle;
}

export interface UikitImage extends UikitView {
  type: 'image';
  imageUrl: string;
  imageStyle?: {
    contentMode?: UikitImageContentMode;
  };
  metaData?: UikitImageMetadata;
}

export interface UikitImageButton extends UikitView {
  type: 'imageButton';
  imageUrl: string;
  imageStyle?: {
    contentMode?: UikitImageContentMode;
  };
  metaData?: UikitImageMetadata;
}

export interface UikitTextButton extends UikitView {
  type: 'textButton';
  text: string;
  maxTextLines?: number;
  textStyle?: UikitTextStyle;
}

export type UikitViewElement =
  | UikitText
  | UikitTextButton
  | UikitImage
  | UikitImageButton;

export type UikitItem = UikitViewElement | UikitBox;

export interface UikitBox extends UikitView {
  type: 'box';
  align?: UikitAlign;
  layout?: UikitLayout;
  items?: (UikitViewElement | UikitBox)[];
}

export type UikitMessage = {
  version: number;
  body: {
    items: UikitItem[];
  };
};
