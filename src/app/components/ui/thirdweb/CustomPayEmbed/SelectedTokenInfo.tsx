import { Chain, ThirdwebClient } from 'thirdweb';
import { ERC20OrNativeToken, formatNumber } from './util';
import { Container } from '../basic';
import { Text } from '../text';
import { useActiveWalletChain, useChainMetadata } from 'thirdweb/react';
import { Skeleton } from '../Skeleton';
import { fontSize, iconSize } from '../design-system';
import { ChainIcon } from '../ChainIcon';
import { chain } from '@/lib/contract';

export const ChainName: React.FC<{
  chain: Chain;
  size: 'xs' | 'sm' | 'md' | 'lg';
  client: ThirdwebClient;
  short?: boolean;
}> = (props) => {
  const activeChain = useActiveWalletChain();

  if (activeChain?.name) {
    return (
      <Text size={props.size}>
        {props.short ? shorterChainName(activeChain?.name) : activeChain?.name}
      </Text>
    );
  }

  return <Skeleton width="50px" height={fontSize[props.size]} />;
};

function shorterChainName(name: string) {
  const split = name.split(' ');
  const wordsToRemove = new Set(['mainnet', 'testnet', 'chain']);
  return split
    .filter((s) => {
      return !wordsToRemove.has(s.toLowerCase());
    })
    .join(' ');
}

export function SelectedTokenInfo(props: {
  selectedToken: ERC20OrNativeToken;
  selectedChain: Chain;
  tokenAmount: string;
  client: ThirdwebClient;
}) {
  const { data: chainData } = useChainMetadata(chain);

  return (
    <div>
      <Container
        flex="row"
        gap="sm"
        center="y"
        style={{
          justifyContent: 'space-between',
        }}
      >
        <Container flex="row" gap="xs" center="y">
          <Text color="primaryText" data-testid="tokenAmount" size="xl">
            {formatNumber(Number(props.tokenAmount), 6)}
          </Text>

          <Container flex="row" gap="xxs" center="y">
            <Text size="md" color="secondaryText">
              {chainData?.nativeCurrency.symbol}
            </Text>
            <ChainIcon
              client={props.client}
              size={iconSize.sm}
              chainIconUrl={chainData.icon?.url}
            />
          </Container>
        </Container>

        <ChainName
          chain={props.selectedChain}
          client={props.client}
          size="sm"
          short
        />
      </Container>
    </div>
  );
}
