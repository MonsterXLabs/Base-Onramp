import styled from '@emotion/styled';
import { useCustomTheme } from '../../design-system/CustomThemeProvider';
import { iconSize, spacing } from '../../design-system/index';
import { Spacer } from '../../Spacer';
import { Container, Line, ModalHeader } from '../../basic';
import { Button } from '../../buttons';
import { Text } from '../../text';
import { currencies } from '../currencies';
import { CurrencyMeta } from '../util';

export function CurrencySelection(props: {
  onSelect: (currency: CurrencyMeta) => void;
  onBack: () => void;
}) {
  return (
    <Container>
      <Container p="lg">
        <ModalHeader title="Pay with" onBack={props.onBack} />
      </Container>

      <Line />
      <Spacer y="lg" />

      <Container flex="column" gap="xs" px="lg">
        {currencies.map((c) => {
          return (
            <SelectCurrencyButton
              fullWidth
              variant="secondary"
              key={c.shorthand}
              onClick={() => props.onSelect(c)}
              gap="sm"
            >
              <c.icon size={iconSize.lg} />
              <Container flex="column" gap="xxs">
                <Text color="primaryText">{c.shorthand}</Text>
                <Text size="sm">{c.name}</Text>
              </Container>
            </SelectCurrencyButton>
          );
        })}
      </Container>

      <Spacer y="lg" />
    </Container>
  );
}

const SelectCurrencyButton = /* @__PURE__ */ styled(Button)(() => {
  const theme = useCustomTheme();
  return {
    background: theme.colors.tertiaryBg,
    justifyContent: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    '&:hover': {
      background: theme.colors.secondaryButtonBg,
      transform: 'scale(1.01)',
    },
    transition: 'background 200ms ease, transform 150ms ease',
  };
});
