import type {
  ImageResizeMode,
  ImageStyle as RNImageStyle,
  TextStyle as RNTextStyle,
  ViewStyle as RNViewStyle,
} from 'react-native';

import {
  Align,
  AlignValue,
  FlexSizeSpecValue,
  ImageStyle,
  Layout,
  MediaContentMode,
  TextStyle,
  View,
  ViewStyle,
} from '@sendbird/uikit-message-template';

export type RNParsedProperties = {
  viewStyles: RNViewStyle;
  textStyles: RNTextStyle;
  imageStyles: RNImageStyle;
  resizeMode?: ImageResizeMode;
};

export function getDefaultStyles(
  overrides?: Partial<RNParsedProperties>,
): RNParsedProperties {
  return {
    viewStyles: {
      overflow: 'hidden',
      ...overrides?.viewStyles,
    },
    textStyles: {
      ...overrides?.textStyles,
    },
    imageStyles: {
      ...overrides?.imageStyles,
    },
  };
}

export function setViewProps(properties: RNParsedProperties, view: View) {
  setViewSize(properties, view);
  setViewStyle(properties, view.viewStyle);
}

export function setViewStyle(
  { viewStyles }: RNParsedProperties,
  viewStyle?: ViewStyle,
) {
  if (viewStyle?.padding?.top) viewStyles['paddingTop'] = viewStyle.padding.top;
  if (viewStyle?.padding?.bottom)
    viewStyles['paddingBottom'] = viewStyle.padding.bottom;
  if (viewStyle?.padding?.left)
    viewStyles['paddingLeft'] = viewStyle.padding.left;
  if (viewStyle?.padding?.right)
    viewStyles['paddingRight'] = viewStyle.padding.right;

  if (viewStyle?.margin?.top) viewStyles['marginTop'] = viewStyle.margin.top;
  if (viewStyle?.margin?.bottom)
    viewStyles['marginBottom'] = viewStyle.margin.bottom;
  if (viewStyle?.margin?.left) viewStyles['marginLeft'] = viewStyle.margin.left;
  if (viewStyle?.margin?.right)
    viewStyles['marginRight'] = viewStyle.margin.right;

  if (viewStyle?.backgroundColor)
    viewStyles['backgroundColor'] = viewStyle.backgroundColor;
  if (viewStyle?.borderWidth) viewStyles['borderWidth'] = viewStyle.borderWidth;
  if (viewStyle?.borderColor) viewStyles['borderColor'] = viewStyle.borderColor;

  if (viewStyle?.radius) {
    viewStyles['borderRadius'] = viewStyle.radius;
    // imageStyles['borderRadius'] = viewStyle.radius;
  }

  // if (viewStyle?.backgroundImageUrl) viewStyles['backgroundImageUrl'] = viewStyle.backgroundImageUrl;
}

export function setViewSize(
  { viewStyles, imageStyles }: RNParsedProperties,
  view: View,
) {
  function updateSize(key: 'width' | 'height') {
    const type = view[key]?.type ?? 'flex';
    const value =
      view[key]?.value ??
      (key === 'width'
        ? FlexSizeSpecValue.FillParent
        : FlexSizeSpecValue.WrapContent);

    if (type === 'flex' && value === FlexSizeSpecValue.FillParent) {
      viewStyles['flex'] = 1;
      imageStyles['flex'] = 1;
    }

    if (type === 'fixed' && value) {
      viewStyles[key] = value;
      imageStyles[key] = value;
    }
  }

  updateSize('width');
  updateSize('height');
}

export function setAlign(
  { viewStyles }: RNParsedProperties,
  layout: Layout = Layout.Row,
  align: Align = { vertical: AlignValue.Top, horizontal: AlignValue.Left },
) {
  if (layout === Layout.Row) {
    viewStyles['flexDirection'] = 'row';
  }

  if (layout === Layout.Column) {
    viewStyles['flexDirection'] = 'column';
  }

  if (align.horizontal) {
    const styleKey = layout === Layout.Row ? 'justifyContent' : 'alignItems';
    switch (align.horizontal) {
      case AlignValue.Center:
        viewStyles[styleKey] = 'center';
        break;
      case AlignValue.Left:
        // viewStyles[styleKey] = 'flex-start';
        break;
      case AlignValue.Right:
        viewStyles[styleKey] = 'flex-end';
        break;
    }
  }

  if (align?.vertical) {
    const styleKey = layout === Layout.Row ? 'alignItems' : 'justifyContent';
    switch (align.vertical) {
      case AlignValue.Center:
        viewStyles[styleKey] = 'center';
        break;
      case AlignValue.Top:
        // viewStyles[styleKey] = 'flex-start';
        break;
      case AlignValue.Bottom:
        viewStyles[styleKey] = 'flex-end';
        break;
    }
  }
}

export function setImageStyle(
  properties: RNParsedProperties,
  imageStyle?: ImageStyle,
) {
  const { contentMode = MediaContentMode.AspectFit } = imageStyle || {};

  if (contentMode) {
    switch (contentMode) {
      case MediaContentMode.AspectFill:
        properties['resizeMode'] = 'cover';
        break;
      case MediaContentMode.AspectFit:
        properties['resizeMode'] = 'contain';
        break;
      case MediaContentMode.ScalesToFill:
        properties['resizeMode'] = 'stretch';
        break;
    }
  }
}

export function setTextStyle(
  { textStyles }: RNParsedProperties,
  textStyle?: TextStyle,
) {
  // TODO: Change default as design
  const { size = 50, color = '#4f4f4f', weight = 'normal' } = textStyle || {};

  textStyles['fontSize'] = size;
  textStyles['color'] = color;
  textStyles['fontWeight'] =
    typeof weight === 'number' ? (String(weight) as '100') : weight;
}
