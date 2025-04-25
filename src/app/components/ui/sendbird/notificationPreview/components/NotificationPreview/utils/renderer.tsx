import { createRenderer } from '@sendbird/uikit-message-template';
import { Image, Text, View } from 'react-native';
import ViewContainer from '../ViewContainer';
import { RNParsedProperties } from './styles';

const renderer = ({ customImageComponent }) =>
  createRenderer<RNParsedProperties>({
    views: {
      box(props) {
        return (
          <ViewContainer {...props}>
            <View style={props.parsedProperties?.viewStyles}>
              {props.children}
            </View>
          </ViewContainer>
        );
      },
      text(props) {
        return (
          <ViewContainer {...props}>
            <Text
              style={[
                props.parsedProperties?.viewStyles,
                props.parsedProperties?.textStyles,
              ]}
              numberOfLines={props.maxTextLines}
            >
              {props.text}
            </Text>
          </ViewContainer>
        );
      },
      image(props) {
        return (
          <ViewContainer {...props}>
            <View style={props.parsedProperties?.viewStyles}>
              <Image
                style={{
                  ...(!props.parsedProperties?.imageStyles.height
                    ? { aspectRatio: 686 / 320 }
                    : null),
                  ...props.parsedProperties?.imageStyles,
                }}
                source={{ uri: props.imageUrl }}
                resizeMode={props.parsedProperties?.resizeMode}
              />
              {/* {customImageComponent ? (
                customImageComponent(props)
              ) : (
                <Image
                  style={{
                    ...(!props.parsedProperties?.imageStyles.height ? { aspectRatio: 686 / 320 } : null),
                    ...props.parsedProperties?.imageStyles,
                  }}
                  source={{ uri: props.imageUrl }}
                  resizeMode={props.parsedProperties?.resizeMode}
                />
              )} */}
            </View>
          </ViewContainer>
        );
      },
      textButton(props) {
        const viewStyles = {
          ...props.parsedProperties.viewStyles,
          backgroundColor: '#ffffff1f',
        };
        props.parsedProperties.viewStyles = viewStyles;
        return (
          <ViewContainer {...props}>
            <Text
              style={props.parsedProperties?.textStyles}
              numberOfLines={props.maxTextLines}
            >
              {props.text}
            </Text>
          </ViewContainer>
        );
      },
      imageButton(props) {
        return (
          <ViewContainer {...props}>
            <View style={props.parsedProperties?.viewStyles}>
              <Image
                style={{
                  ...props.parsedProperties?.imageStyles,
                }}
                source={{ uri: props.imageUrl }}
                resizeMode={props.parsedProperties?.resizeMode}
              />
              {/* {customImageComponent ? (
                customImageComponent(props)
              ) : (
                <Image
                  style={{
                    ...props.parsedProperties?.imageStyles,
                  }}
                  source={{ uri: props.imageUrl }}
                  resizeMode={props.parsedProperties?.resizeMode}
                />
              )} */}
            </View>
          </ViewContainer>
        );
      },
    },
  });

export default renderer;
