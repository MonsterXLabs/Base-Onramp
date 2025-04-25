import { defineChain, ThirdwebClient } from 'thirdweb';
import { formatNumber } from '../util';
import { Container } from '../../basic';
import { Text } from '../../text';
import { useChainMetadata } from 'thirdweb/react';

export function TokenInfoRow(props: {
  tokenSymbol: string;
  tokenAmount: string;
  tokenAddress: string;
  chainId: number;
  label: string;
  client: ThirdwebClient;
}) {
  const { data: chainMetadata } = useChainMetadata(defineChain(props.chainId));

  return (
    <Container
      flex="row"
      style={{
        justifyContent: 'space-between',
      }}
    >
      <Text size="sm">{props.label}</Text>
      <Container
        flex="column"
        gap="xxs"
        style={{
          alignItems: 'flex-end',
        }}
      >
        <Container flex="row" gap="xs" center="y">
          <Text color="primaryText">
            {formatNumber(Number(props.tokenAmount), 6)} {props.tokenSymbol}
          </Text>
        </Container>
        <Text size="sm">{chainMetadata?.name}</Text>
      </Container>
    </Container>
  );
}
