import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ThirdwebClient,
  BuyWithCryptoQuote,
  BuyWithCryptoStatus,
  sendTransaction,
  waitForReceipt,
} from 'thirdweb';
import { BuyWithFiatStatus } from '../ConnectButtonProps';
import { iconSize } from '../../design-system/index';
import { Spacer } from '../../Spacer';
import { Spinner } from '../../Spinner';
import { Container, ModalHeader } from '../../basic';
import { Button } from '../../buttons';
import { Text } from '../../text';
import { AccentFailIcon } from '../icons/AccentFailIcon';
import { PayerInfo } from '../util';
import { getPostOnRampQuote } from './getPostOnRampQuote';
import {
  useActiveAccount,
  useBuyWithCryptoQuote,
  useBuyWithCryptoStatus,
} from 'thirdweb/react';
import { client } from '@/lib/client';

export function PostOnRampSwap(props: {
  title: string;
  client: ThirdwebClient;
  buyWithFiatStatus: BuyWithFiatStatus;
  onBack?: () => void;
  onDone: () => void;
  transactionMode: boolean;
  isEmbed: boolean;
  payer: PayerInfo;
  onSuccess: ((status: BuyWithCryptoStatus) => void) | undefined;
}) {
  const [lockedOnRampQuote, setLockedOnRampQuote] = useState<
    BuyWithCryptoQuote | undefined
  >(undefined);
  const postOnRampQuoteQuery = useQuery({
    queryKey: ['getPostOnRampQuote', props.buyWithFiatStatus],
    queryFn: async () => {
      return await getPostOnRampQuote({
        client: props.client,
        buyWithFiatStatus: props.buyWithFiatStatus,
      });
    },
    // stop fetching if a quote is already locked
    enabled: !lockedOnRampQuote,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (
      postOnRampQuoteQuery.data &&
      !lockedOnRampQuote &&
      !postOnRampQuoteQuery.isRefetching
    ) {
      setLockedOnRampQuote(postOnRampQuoteQuery.data);
    }

    if (lockedOnRampQuote) {
    }
  }, [
    postOnRampQuoteQuery.data,
    lockedOnRampQuote,
    postOnRampQuoteQuery.isRefetching,
  ]);

  if (postOnRampQuoteQuery.isError) {
    return (
      <Container fullHeight>
        <Container p="lg">
          <ModalHeader title={props.title} onBack={props.onBack} />
        </Container>

        <Container
          style={{
            minHeight: '300px',
          }}
          flex="column"
          center="both"
          p="lg"
        >
          <AccentFailIcon size={iconSize['3xl']} />
          <Spacer y="xl" />
          <Text color="primaryText">Failed to get a price quote</Text>
          <Spacer y="lg" />

          <Button
            fullWidth
            variant="primary"
            onClick={() => {
              postOnRampQuoteQuery.refetch();
            }}
          >
            Try Again
          </Button>
        </Container>

        <Spacer y="xxl" />
      </Container>
    );
  }

  return (
    <Container fullHeight>
      <Container p="lg">
        <ModalHeader title={props.title} onBack={props.onBack} />
      </Container>

      <Container
        style={{
          minHeight: '300px',
        }}
        flex="column"
        center="both"
      >
        <Spinner size="xxl" color="accentText" />
        <Spacer y="xl" />
        {!lockedOnRampQuote && (
          <Text color="primaryText">Getting price quote</Text>
        )}
        {lockedOnRampQuote && (
          <SwapFlow quote={lockedOnRampQuote} onSuccess={props.onSuccess} />
        )}
      </Container>

      <Spacer y="xxl" />
    </Container>
  );
}

function SwapFlow(props: {
  quote: BuyWithCryptoQuote;
  onSuccess: ((status: BuyWithCryptoStatus) => void) | undefined;
}) {
  const [buyTxHash, setBuyTxHash] = useState<any | undefined>();
  const buyWithCryptoStatusQuery = useBuyWithCryptoStatus(
    buyTxHash
      ? {
          client,
          transactionHash: buyTxHash,
        }
      : undefined,
  );
  const account = useActiveAccount();

  async function handleBuyWithCrypto() {
    // if approval is required
    if (props.quote.approval) {
      const approveTx = await sendTransaction({
        transaction: props.quote.approval,
        account: account,
      });
      await waitForReceipt(approveTx);
    }

    // send the transaction to buy crypto
    // this promise is resolved when user confirms the transaction in the wallet and the transaction is sent to the blockchain
    const buyTx = await sendTransaction({
      transaction: props.quote.transactionRequest,
      account: account,
    });
    await waitForReceipt(buyTx);
  }

  useEffect(() => {
    handleBuyWithCrypto();
  }, []);

  useEffect(() => {
    if (buyWithCryptoStatusQuery?.data.status === 'COMPLETED') {
      props.onSuccess?.(buyWithCryptoStatusQuery.data);
    }
  }, [buyWithCryptoStatusQuery.data]);

  if (buyWithCryptoStatusQuery.data?.status === 'COMPLETED') {
    return <Text color="primaryText">Sending Transaction...</Text>;
  }

  if (buyWithCryptoStatusQuery.data?.status === 'FAILED') {
    return <Text color="primaryText">Transaction Failed</Text>;
  }

  return <Text color="primaryText">Swapping...</Text>;
}
