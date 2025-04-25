'use client';

import { Chain, NATIVE_TOKEN_ADDRESS, ThirdwebClient } from 'thirdweb';
import { PayUIOptions } from './ConnectButtonProps';
import { iconSize, spacing, Theme } from '../design-system';
import { Container, Line, ModalHeader } from '../basic';
import { Spinner } from '../Spinner';
import { useBuyWithFiatQuote } from 'thirdweb/react';
import { Text } from '../text';
import { Spacer } from '../Spacer';
import { Button } from '../buttons';
import {
  formatNumber,
  isSwapRequiredPostOnramp,
  openOnrampPopup,
  SelectedScreen,
} from './util';
import { useState } from 'react';
import { Drawer, DrawerOverlay, useDrawer } from '../Drawer';
import {
  CurrencyMeta,
  ERC20OrNativeToken,
  isNativeToken,
  PayerInfo,
} from './util';
import { FiatFees } from './FiatFees';
import { PayWithCreditCard } from './PayWIthCreditCard';
import { EstimatedTimeAndFees } from './EstimatedTimeAndFees';
import { addPendingTx } from './pendingSwapTx';
import Link from 'next/link';

export default function FiatScreen(props: {
  setScreen: (screen: SelectedScreen) => void;
  tokenAmount: string;
  toToken: ERC20OrNativeToken;
  toChain: Chain;
  selectedCurrency: CurrencyMeta;
  showCurrencySelector: () => void;
  payOptions: PayUIOptions;
  theme: 'light' | 'dark' | Theme;
  client: ThirdwebClient;
  onDone: () => void;
  isEmbed: boolean;
  payer: PayerInfo;
}) {
  const {
    toToken,
    tokenAmount,
    payer,
    client,
    setScreen,
    toChain,
    showCurrencySelector,
    selectedCurrency,
  } = props;

  const { drawerRef, drawerOverlayRef, isOpen, setIsOpen } = useDrawer();
  const [drawerScreen, setDrawerScreen] = useState<'fees'>('fees');
  const buyWithFiatOptions = props.payOptions.buyWithFiat;

  const defaultRecipientAddress = (
    props.payOptions as Extract<PayUIOptions, { mode: 'direct_payment' }>
  )?.paymentInfo?.sellerAddress;

  const receiverAddress =
    defaultRecipientAddress || props.payer.account.address;

  const fiatQuoteQuery = useBuyWithFiatQuote(
    buyWithFiatOptions !== false && tokenAmount
      ? {
          fromCurrencySymbol: selectedCurrency.shorthand,
          toChainId: toChain.id,
          toAddress: receiverAddress,
          toTokenAddress: isNativeToken(toToken)
            ? NATIVE_TOKEN_ADDRESS
            : toToken.address,
          toAmount: tokenAmount,
          client,
          isTestMode: buyWithFiatOptions?.testMode,
          purchaseData: props.payOptions.purchaseData,
          fromAddress: payer.account.address,
          preferredProvider: buyWithFiatOptions?.preferredProvider,
        }
      : undefined,
  );

  function handleSubmit() {
    if (!fiatQuoteQuery.data) {
      return;
    }

    let openedWindow: Window | null = null;

    const hasTwoSteps = isSwapRequiredPostOnramp(fiatQuoteQuery.data);
    if (!hasTwoSteps) {
      openedWindow = openOnrampPopup(
        fiatQuoteQuery.data.onRampLink,
        typeof props.theme === 'string' ? props.theme : props.theme.type,
      );

      addPendingTx({
        type: 'fiat',
        intentId: fiatQuoteQuery.data.intentId,
      });
    }

    setScreen({
      id: 'fiat-flow',
      quote: fiatQuoteQuery.data,
      openedWindow,
    });
  }

  function showFees() {
    if (!fiatQuoteQuery.data) {
      return;
    }

    setDrawerScreen('fees');
    setIsOpen(true);
  }

  function getErrorMessage(err: any) {
    type AmountTooLowError = {
      code: 'MINIMUM_PURCHASE_AMOUNT';
      data: {
        minimumAmountUSDCents: number;
        requestedAmountUSDCents: number;
        minimumAmountWei: string;
        minimumAmountEth: string;
      };
    };

    const defaultMessage = 'Unable to get price quote';
    try {
      if (err.error.code === 'MINIMUM_PURCHASE_AMOUNT') {
        const obj = err.error as AmountTooLowError;
        const minAmountToken = obj.data.minimumAmountEth;
        return {
          minAmount: formatNumber(Number(minAmountToken), 6),
        };
      }
    } catch {}

    return {
      msg: [defaultMessage],
    };
  }

  const disableSubmit = !fiatQuoteQuery.data;

  const errorMsg =
    !fiatQuoteQuery.isLoading && fiatQuoteQuery.error
      ? getErrorMessage(fiatQuoteQuery.error)
      : undefined;
  return (
    <Container flex="column" gap="md" animate="fadein">
      {isOpen && (
        <>
          <DrawerOverlay ref={drawerOverlayRef} />
          <Drawer ref={drawerRef} close={() => setIsOpen(false)}>
            {drawerScreen === 'fees' && fiatQuoteQuery.data && (
              <div>
                <Text size="lg" color="primaryText">
                  Fees
                </Text>

                <Spacer y="lg" />
                <FiatFees quote={fiatQuoteQuery.data} />
              </div>
            )}
          </Drawer>
        </>
      )}

      <div>
        <PayWithCreditCard
          isLoading={fiatQuoteQuery.isLoading}
          value={fiatQuoteQuery.data?.fromCurrencyWithFees.amount}
          client={client}
          currency={selectedCurrency}
          onSelectCurrency={showCurrencySelector}
        />
        {/* Estimated time + View fees button */}
        <EstimatedTimeAndFees
          quoteIsLoading={fiatQuoteQuery.isLoading}
          estimatedSeconds={fiatQuoteQuery.data?.estimatedDurationSeconds}
          onViewFees={showFees}
        />
        <Spacer y="md" />
      </div>

      {/* Error message */}
      {errorMsg && (
        <div>
          {errorMsg.minAmount && (
            <Text color="danger" size="sm" center multiline>
              Minimum amount is {errorMsg.minAmount}{' '}
            </Text>
          )}

          {errorMsg.msg?.map((msg) => (
            <Text color="danger" size="sm" center multiline key={msg}>
              {msg}
            </Text>
          ))}
          <Link href="https://www.google.com">
            <p className="text-[#DDF247] text-base text-center">
              Click here in detail.
            </p>
          </Link>
        </div>
      )}
      <Button
        variant={disableSubmit ? 'outline' : 'accent'}
        data-disabled={disableSubmit}
        disabled={disableSubmit}
        fullWidth
        onClick={handleSubmit}
        gap="xs"
      >
        {fiatQuoteQuery.isLoading ? (
          <>
            Getting price quote
            <Spinner size="sm" color="accentText" />
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </Container>
  );
}
