import {
  modalMaxWidthCompact,
  modalMaxWidthWide,
  wideModalMaxHeight,
} from '../connect-wallet/constants';
import { radius } from '../design-system';
import { useCustomTheme } from '../design-system/CustomThemeProvider';
import { StyledDiv } from '../design-system/elements';

export const EmbedContainer = /* @__PURE__ */ StyledDiv<{
  modalSize: 'compact' | 'wide';
}>((props) => {
  const { modalSize } = props;
  const theme = useCustomTheme();
  return {
    color: theme.colors.primaryText,
    background: theme.colors.modalBg,
    height: modalSize === 'compact' ? 'auto' : wideModalMaxHeight,
    width: modalSize === 'compact' ? modalMaxWidthCompact : modalMaxWidthWide,
    boxSizing: 'border-box',
    position: 'relative',
    lineHeight: 'normal',
    borderRadius: radius.xl,
    border: `1px solid ${theme.colors.borderColor}`,
    overflow: 'hidden',
    fontFamily: theme.fontFamily,
    '& *::selection': {
      backgroundColor: theme.colors.selectedTextBg,
      color: theme.colors.selectedTextColor,
    },
    '& *': {
      boxSizing: 'border-box',
    },
  };
});
