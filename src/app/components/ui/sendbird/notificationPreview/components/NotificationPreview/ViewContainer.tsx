import {
  BasicProps,
  ComponentType,
  View,
} from '@sendbird/uikit-message-template';
import {
  ImageBackground,
  Linking,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { RNParsedProperties } from './utils/styles';

export default function ViewContainer(
  props: BasicProps<View, RNParsedProperties>,
) {
  let component = <>{props.children}</>;

  if (props.viewStyle?.backgroundImageUrl) {
    component = (
      <ImageBackground
        source={{ uri: props.viewStyle.backgroundImageUrl }}
        style={props.parsedProperties?.viewStyles}
        imageStyle={props.parsedProperties?.imageStyles}
      >
        {component}
      </ImageBackground>
    );
  }

  if (props.action) {
    const ActionComponent = isButton(props.type) ? TouchableOpacity : Pressable;

    component = (
      <ActionComponent
        style={[
          { backgroundColor: '#ffffff' },
          props.parsedProperties?.viewStyles,
        ]}
        onPress={() => {
          switch (props.action?.type) {
            case 'web': {
              return Linking.openURL(props.action.data);
            }
            case 'uikit': {
              return console.warn(props.action.data);
            }
            case 'custom': {
              return;
            }
          }
        }}
      >
        {component}
      </ActionComponent>
    );
  }

  return component;
}

function isButton(type: ComponentType) {
  return (
    type === ComponentType.ImageButton || type === ComponentType.TextButton
  );
}
