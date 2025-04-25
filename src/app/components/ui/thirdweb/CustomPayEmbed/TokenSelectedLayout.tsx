import { Chain, ThirdwebClient } from 'thirdweb';
import { ERC20OrNativeToken } from './util';
import { Container, Line, ModalHeader } from '../basic';
import { spacing } from '../design-system';
import { Spacer } from '../Spacer';
import { SelectedTokenInfo } from './SelectedTokenInfo';
import { Text } from '../text';

export default function TokenSelectedLayout(props: {
  title: string;
  children: React.ReactNode;
  tokenAmount: string;
  selectedToken: ERC20OrNativeToken;
  selectedChain: Chain;
  client: ThirdwebClient;
  onBack: () => void;
}) {
  return (
    <Container>
      <Container p="lg">
        <ModalHeader title={props.title} onBack={props.onBack} />
      </Container>

      <Container
        px="lg"
        style={{
          paddingBottom: spacing.lg,
        }}
      >
        <Spacer y="xs" />
        <SelectedTokenInfo
          selectedToken={props.selectedToken}
          selectedChain={props.selectedChain}
          tokenAmount={props.tokenAmount}
          client={props.client}
        />

        <Spacer y="md" />
        <Line />
        <Spacer y="lg" />

        <Text size="sm"> Pay with </Text>
        <Spacer y="sm" />

        {props.children}
      </Container>
    </Container>
  );
}
