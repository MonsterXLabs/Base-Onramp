import { CheckCircledIcon } from '@radix-ui/react-icons';
import { useEffect, useRef } from 'react';
import { ThirdwebClient } from 'thirdweb';
import { BuyWithFiatQuote } from '../util';
import { BuyWithFiatStatus } from '../ConnectButtonProps';

import { iconSize } from '../../design-system/index';
import { useBuyWithFiatStatus } from 'thirdweb/react';
import { Spacer } from '../../Spacer';
import { Spinner } from '../../Spinner';
import { StepBar } from '../../StepBar';
import { Container, ModalHeader } from '../../basic';
import { Button } from '../../buttons';
import { Text } from '../../text';
import { AccentFailIcon } from '../icons/AccentFailIcon';
import { getBuyWithFiatStatusMeta } from '../pay-transactions/statusMeta';
import { OnRampTxDetailsTable } from './FiatTxDetailsTable';

type UIStatus = 'loading' | 'failed' | 'completed' | 'partialSuccess';

/**
 * Poll for "Buy with Fiat" status - when the on-ramp is in progress
 * - Show success screen if swap is not required and on-ramp is completed
 * - Show Failed screen if on-ramp failed
 * - call `onShowSwapFlow` if on-ramp is completed and swap is required
 */
export function OnrampStatusScreen(props: {
  title: string;
  client: ThirdwebClient;
  onBack: () => void;
  intentId: string;
  hasTwoSteps: boolean;
  openedWindow: Window | null;
  quote: BuyWithFiatQuote;
  onDone: () => void;
  onShowSwapFlow: (status: BuyWithFiatStatus) => void;
  transactionMode: boolean;
  isEmbed: boolean;
  onSuccess: ((status: BuyWithFiatStatus) => void) | undefined;
}) {
  const { openedWindow, onSuccess } = props;
  const statusQuery = useBuyWithFiatStatus({
    intentId: props.intentId,
    client: props.client,
  });

  // determine UI status
  let uiStatus: UIStatus = 'loading';
  if (
    statusQuery.data?.status === 'ON_RAMP_TRANSFER_FAILED' ||
    statusQuery.data?.status === 'PAYMENT_FAILED'
  ) {
    uiStatus = 'failed';
  } else if (statusQuery.data?.status === 'CRYPTO_SWAP_FALLBACK') {
    uiStatus = 'partialSuccess';
  } else if (statusQuery.data?.status === 'ON_RAMP_TRANSFER_COMPLETED') {
    uiStatus = 'completed';
  }

  const purchaseCbCalled = useRef(false);
  useEffect(() => {
    if (purchaseCbCalled.current || !onSuccess) {
      return;
    }

    if (statusQuery.data?.status === 'ON_RAMP_TRANSFER_COMPLETED') {
      purchaseCbCalled.current = true;
      onSuccess(statusQuery.data);
    }
  }, [onSuccess, statusQuery.data]);

  // close the onramp popup if onramp is completed
  useEffect(() => {
    if (!openedWindow || !statusQuery.data) {
      return;
    }

    if (
      statusQuery.data?.status === 'CRYPTO_SWAP_REQUIRED' ||
      statusQuery.data?.status === 'ON_RAMP_TRANSFER_COMPLETED'
    ) {
      openedWindow.close();
    }
  }, [statusQuery.data, openedWindow]);

  // invalidate wallet balance when onramp is completed
  const invalidatedBalance = useRef(false);
  useEffect(() => {
    if (
      !invalidatedBalance.current &&
      statusQuery.data?.status === 'ON_RAMP_TRANSFER_COMPLETED'
    ) {
      invalidatedBalance.current = true;
    }
  }, [statusQuery.data]);

  // show swap flow
  useEffect(() => {
    if (statusQuery.data?.status === 'CRYPTO_SWAP_REQUIRED') {
      props.onShowSwapFlow(statusQuery.data);
    }
  }, [statusQuery.data, props.onShowSwapFlow]);

  return (
    <Container p="lg">
      <ModalHeader title={props.title} onBack={props.onBack} />
      {props.hasTwoSteps && (
        <>
          <Spacer y="lg" />
          <StepBar steps={2} currentStep={1} />
          <Spacer y="sm" />
          <Text size="xs">
            Step 1 of 2 - Buying {props.quote.onRampToken.token.symbol} with{' '}
            {props.quote.fromCurrencyWithFees.currencySymbol}
          </Text>
        </>
      )}
      <OnrampStatusScreenUI
        uiStatus={uiStatus}
        onDone={props.onDone}
        fiatStatus={statusQuery.data}
        client={props.client}
        transactionMode={props.transactionMode}
        quote={props.quote}
        isEmbed={props.isEmbed}
      />
    </Container>
  );
}

function OnrampStatusScreenUI(props: {
  uiStatus: UIStatus;
  fiatStatus?: BuyWithFiatStatus;
  onDone: () => void;
  client: ThirdwebClient;
  transactionMode: boolean;
  isEmbed: boolean;
  quote: BuyWithFiatQuote;
}) {
  const { uiStatus } = props;

  const statusMeta = props.fiatStatus
    ? getBuyWithFiatStatusMeta(props.fiatStatus)
    : undefined;

  const fiatStatus: any | undefined =
    props.fiatStatus && props.fiatStatus.status !== 'NOT_FOUND'
      ? props.fiatStatus
      : undefined;

  const onRampTokenQuote = props.quote.onRampToken;

  const txDetails = (
    <OnRampTxDetailsTable
      client={props.client}
      token={
        fiatStatus?.source // source tx is onRamp token
          ? {
              chainId: fiatStatus.source.token.chainId,
              address: fiatStatus.source.token.tokenAddress,
              symbol: fiatStatus.source.token.symbol || '',
              amount: fiatStatus.source.amount,
            }
          : {
              chainId: onRampTokenQuote.token.chainId,
              address: onRampTokenQuote.token.tokenAddress,
              symbol: onRampTokenQuote.token.symbol,
              amount: onRampTokenQuote.amount,
            }
      }
      fiat={{
        amount: props.quote.fromCurrencyWithFees.amount,
        currencySymbol: props.quote.fromCurrencyWithFees.currencySymbol,
      }}
      statusMeta={
        fiatStatus?.source && statusMeta
          ? {
              color: statusMeta?.color,
              text: statusMeta?.status,
              txHash: fiatStatus.source.transactionHash,
            }
          : undefined
      }
    />
  );

  return (
    <Container>
      <Spacer y="xl" />

      {uiStatus === 'loading' && (
        <>
          <Spacer y="md" />
          <Container flex="row" center="x">
            <Spinner size="xxl" color="accentText" />
          </Container>
          <Spacer y="md" />
          <Text color="primaryText" size="lg" center>
            Buy Pending
          </Text>
          <Spacer y="sm" />
          {<Text center>Complete the purchase in popup</Text>}
          <Spacer y="xxl" />
          {txDetails}
        </>
      )}

      {uiStatus === 'failed' && (
        <>
          <Spacer y="md" />
          <Container flex="row" center="x">
            <AccentFailIcon size={iconSize['3xl']} />
          </Container>
          <Spacer y="lg" />
          <Text color="primaryText" size="lg" center>
            Transaction Failed
          </Text>
          <Spacer y="xxl" />
          {txDetails}
        </>
      )}

      {uiStatus === 'completed' && (
        <>
          <Spacer y="md" />
          <Container flex="row" center="x" color="success">
            <CheckCircledIcon
              width={iconSize['3xl']}
              height={iconSize['3xl']}
            />
          </Container>
          <Spacer y="md" />
          <Text color="primaryText" size="lg" center>
            Buy Complete
          </Text>
          {props.fiatStatus && props.fiatStatus.status !== 'NOT_FOUND' && (
            <>
              <Spacer y="xxl" />
              {txDetails}
              <Spacer y="sm" />
            </>
          )}

          {!props.isEmbed && (
            <Button variant="accent" fullWidth onClick={props.onDone}>
              {props.transactionMode ? 'Continue Transaction' : 'Done'}
            </Button>
          )}
        </>
      )}
    </Container>
  );
}
