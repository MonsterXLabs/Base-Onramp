'use client';

import {
  Chain,
  NATIVE_TOKEN_ADDRESS,
  PreparedTransaction,
  ThirdwebClient,
} from 'thirdweb';
import { PayUIOptions, TranasctionOptions } from './ConnectButtonProps';
import { iconSize, spacing, Theme } from '../design-system';
import { Container, Line, ModalHeader } from '../basic';
import { Spinner } from '../Spinner';
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useChainMetadata,
} from 'thirdweb/react';
import { useTransactionCostAndData } from './useBuyTxStates';
import { Text } from '../text';
import { Spacer } from '../Spacer';
import { Img } from '../Img';
import { useCustomTheme } from '../design-system/CustomThemeProvider';
import { WalletImage } from '@/app/components/Header/Menu';
import { ChainIcon } from '../ChainIcon';
import { TokenIcon } from '../TokenIcon';
import { Button } from '../buttons';
import { formatNumber, toTokens } from './util';

export type BuyScreenProps = {
  title: string;
  onBack: (() => void) | undefined;
  client: ThirdwebClient;
  payOptions: PayUIOptions;
  theme: 'light' | 'dark' | Theme;
  isEmbed: boolean;
  onContinue: (
    tokenAmount: string,
    toChain: Chain,
    toToken: {
      address: string;
      name: string;
      symbol: string;
      icon: string;
    },
  ) => void;
};

export function LoadingScreen(props: { height?: string }) {
  return (
    <Container
      style={{
        minHeight: props.height || '350px',
      }}
      fullHeight
      flex="row"
      center="both"
    >
      <Spinner size="xl" color="secondaryText" />
    </Container>
  );
}

export default function BuyScreen(
  props: BuyScreenProps & { payOptions: PayUIOptions & TranasctionOptions },
) {
  const { client, payOptions, onContinue } = props;
  const activeAccount = useActiveAccount();

  const { data: chainData } = useChainMetadata(payOptions.transaction.chain);

  const { data: transactionCostAndData } = useTransactionCostAndData({
    transaction: payOptions.transaction,
    account: activeAccount,
  });

  const sponsoredTransactionsEnabled = false;
  const metadata = payOptions.metadata;
  const theme = useCustomTheme();
  const activeWallet = useActiveWallet();

  if (!transactionCostAndData || !chainData) {
    return <LoadingScreen />;
  }

  return (
    <Container p="lg" expand>
      <ModalHeader title={metadata?.name || 'Transaction'} />

      <Spacer y="lg" />
      <Container>
        {metadata?.image ? (
          <Img
            client={client}
            src={metadata?.image}
            style={{
              width: '100%',
              borderRadius: spacing.md,
              backgroundColor: theme.colors.tertiaryBg,
            }}
          />
        ) : activeWallet ? (
          <Container
            flex="row"
            center="both"
            style={{
              padding: spacing.md,
              marginBottom: spacing.md,
              borderRadius: spacing.md,
              backgroundColor: theme.colors.tertiaryBg,
            }}
          >
            <WalletImage
              size={Number(iconSize.xl)}
              walletId={activeWallet.id}
            />
            <div
              style={{
                flexGrow: 1,
                borderBottom: '6px dotted',
                borderColor: theme.colors.secondaryIconColor,
                marginLeft: spacing.md,
                marginRight: spacing.md,
              }}
            />
            <ChainIcon
              client={client}
              size={iconSize.xl}
              chainIconUrl={chainData.icon?.url}
            />
          </Container>
        ) : null}
        <Spacer y="md" />
        <Container flex="row">
          <Container flex="column" expand>
            <Text size="md" color="primaryText" weight={700}>
              Price
            </Text>
          </Container>
          <Container expand>
            <Container
              flex="row"
              gap="xs"
              center="y"
              style={{ justifyContent: 'right' }}
            >
              <TokenIcon
                chain={payOptions.transaction.chain}
                client={props.client}
                size="sm"
              />
              <Text color="primaryText" size="md" weight={700}>
                {String(
                  formatNumber(
                    Number(
                      toTokens(
                        transactionCostAndData.transactionValueWei,
                        transactionCostAndData.decimals,
                      ),
                    ),
                    6,
                  ),
                )}{' '}
                {transactionCostAndData.token.symbol}
              </Text>
            </Container>
          </Container>
        </Container>
        <Spacer y="md" />
        <Line />
        <Spacer y="md" />
        <Container flex="row">
          <Container flex="column" expand>
            <Text size="xs" color="secondaryText">
              Gas Fees
            </Text>
          </Container>
          <Container expand>
            <Container
              flex="row"
              gap="xs"
              center="y"
              style={{ justifyContent: 'right' }}
            >
              <Text
                color={sponsoredTransactionsEnabled ? 'success' : 'primaryText'}
                size="xs"
              >
                {sponsoredTransactionsEnabled
                  ? 'Sponsored'
                  : `${String(
                      formatNumber(
                        Number(
                          toTokens(
                            transactionCostAndData.gasCostWei,
                            chainData.nativeCurrency.decimals,
                          ),
                        ),
                        6,
                      ),
                    )} ${chainData.nativeCurrency.symbol}`}
              </Text>
            </Container>
          </Container>
        </Container>
        <Spacer y="sm" />
        <Container flex="row">
          <Container flex="column" expand>
            <Text size="xs" color="secondaryText">
              Network
            </Text>
          </Container>
          <Container expand>
            <Container
              flex="row"
              gap="xs"
              center="y"
              style={{ justifyContent: 'right' }}
            >
              <ChainIcon
                chainIconUrl={chainData.icon?.url}
                size="xs"
                client={props.client}
              />
              <Text
                size="xs"
                color="secondaryText"
                style={{ textAlign: 'right' }}
              >
                {chainData.name}
              </Text>
            </Container>
          </Container>
        </Container>
      </Container>
      <Spacer y="xl" />
      {activeAccount ? (
        <Button
          variant="accent"
          fullWidth
          onClick={() => {
            let totalCostWei = transactionCostAndData.transactionValueWei;
            if (
              transactionCostAndData.token.address === NATIVE_TOKEN_ADDRESS &&
              !sponsoredTransactionsEnabled
            ) {
              totalCostWei += transactionCostAndData.gasCostWei;
            }
            onContinue(
              toTokens(totalCostWei, transactionCostAndData.decimals),
              payOptions.transaction.chain,
              transactionCostAndData.token,
            );
          }}
        >
          Pay with Credit Card
        </Button>
      ) : (
        <div>
          <ConnectButton
            client={client}
            connectButton={{
              style: {
                width: '100%',
              },
            }}
          />
        </div>
      )}
    </Container>
  );
}
