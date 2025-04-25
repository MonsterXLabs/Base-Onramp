import { Layout, createParser } from '@sendbird/uikit-message-template';
import {
  RNParsedProperties,
  getDefaultStyles,
  setAlign,
  setImageStyle,
  setTextStyle,
  setViewProps,
} from './styles';

const parser = createParser<RNParsedProperties>({
  mapBoxProps(props) {
    const styles = getDefaultStyles();

    setViewProps(styles, props);
    setAlign(styles, props.layout, props.align);

    return styles;
  },
  mapTextProps(props) {
    const styles = getDefaultStyles();

    setViewProps(styles, props);
    setTextStyle(styles, props.textStyle);
    setAlign(styles, Layout.Row, props.align);

    return styles;
  },
  mapImageProps(props) {
    const styles = getDefaultStyles();

    setViewProps(styles, props);
    setImageStyle(styles, props.imageStyle);

    return styles;
  },
  mapTextButtonProps(props) {
    const styles = getDefaultStyles({
      viewStyles: { alignItems: 'center', justifyContent: 'center' },
    });

    setViewProps(styles, props);
    setTextStyle(styles, props.textStyle);

    return styles;
  },
  mapImageButtonProps(props) {
    const styles = getDefaultStyles();

    setViewProps(styles, props);
    setImageStyle(styles, props.imageStyle);

    return styles;
  },
});

export default parser;
