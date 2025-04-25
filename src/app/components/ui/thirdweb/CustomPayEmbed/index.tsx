'use client';

import { useState } from 'react';

import { PreparedTransaction, type ThirdwebClient } from 'thirdweb';
import { CustomThemeProvider } from '../design-system/CustomThemeProvider';

import type { PayUIOptions, TranasctionOptions } from './ConnectButtonProps';

import { EmbedContainer } from '../custom-connect-embed';
import { DynamicHeight } from '../DynamicHeight';
import { Theme } from '../design-system/index';
import BuyScreen from './BuyScreen';
import {
  ERC20OrNativeToken,
  SelectedScreen,
  NATIVE_TOKEN,
  CurrencyMeta,
} from './util';
import FiatScreen from './FiatScreen';
import { client } from '@/lib/client';
import { chain } from '@/lib/contract';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { getCurrencyMeta } from './currencies';
import TokenSelectedLayout from './TokenSelectedLayout';
import { CurrencySelection } from './fiat/CurrencySelection';
import { FiatFlow } from './fiat/FiatFlow';

export type CustomPayEmbedProps = {
  client: ThirdwebClient;
  payOptions?: PayUIOptions & TranasctionOptions;
  theme?: 'light' | 'dark' | Theme;
  style?: React.CSSProperties;
  className?: string;
  onDone: () => void;
};

export function CustomPayEmbed(props: CustomPayEmbedProps) {
  const activeWallet = useActiveWallet();
  const activeAccount = useActiveAccount();

  const theme = props.theme || 'dark';
  const [screen, setScreen] = useState<SelectedScreen>({
    id: 'main',
  });
  let content = null;
  const metadata =
    props.payOptions && 'metadata' in props.payOptions
      ? props.payOptions.metadata
      : null;

  const [deferredTokenAmount, setDeferredTokenAmount] = useState<string>('');
  const [selectedCrrency, setSelectedCurrency] = useState<CurrencyMeta>(
    getCurrencyMeta('USD'),
  );
  const [deferedToToken, setDeferedToToken] =
    useState<ERC20OrNativeToken>(NATIVE_TOKEN);

  content = (
    <>
      {screen.id === 'main' && (
        <BuyScreen
          title={metadata?.name || 'Buy'}
          isEmbed={true}
          theme={theme}
          client={props.client}
          payOptions={props.payOptions}
          onContinue={(tokenAmount, toChain, toToken) => {
            setDeferredTokenAmount(tokenAmount);
            setDeferedToToken(toToken);
            if (props.payOptions?.mode === 'transaction') {
              setScreen({
                id: 'buy-with-fiat',
              });
            }
          }}
          onBack={undefined}
        />
      )}

      {screen.id === 'buy-with-fiat' && (
        <TokenSelectedLayout
          title="Buy"
          tokenAmount={deferredTokenAmount}
          selectedToken={deferedToToken}
          selectedChain={chain}
          client={client}
          onBack={() => {
            setScreen({
              id: 'main',
            });
          }}
        >
          <FiatScreen
            setScreen={setScreen}
            tokenAmount={deferredTokenAmount}
            toChain={chain}
            toToken={deferedToToken}
            selectedCurrency={selectedCrrency}
            client={client}
            isEmbed={true}
            onDone={() => {}}
            payOptions={props.payOptions}
            theme={theme}
            showCurrencySelector={() => {
              setScreen({
                id: 'select-currency',
                backScreen: screen,
              });
            }}
            payer={{
              wallet: activeWallet,
              chain,
              account: activeAccount,
            }}
          />
        </TokenSelectedLayout>
      )}
      {screen.id === 'select-currency' && (
        <CurrencySelection
          onSelect={(currency) => {
            setScreen({
              id: 'buy-with-fiat',
            });
            setSelectedCurrency(currency);
          }}
          onBack={() => {
            setScreen({
              id: 'buy-with-fiat',
            });
          }}
        />
      )}
      {screen.id === 'fiat-flow' && (
        <FiatFlow
          title="Buy"
          transactionMode={props.payOptions.mode === 'transaction'}
          quote={screen.quote}
          onBack={() => {
            setScreen({
              id: 'buy-with-fiat',
            });
          }}
          client={client}
          testMode={
            props.payOptions.buyWithFiat !== false &&
            props.payOptions.buyWithFiat?.testMode === true
          }
          theme={
            typeof props.theme === 'string'
              ? props.theme
              : props.theme?.type || 'dark'
          }
          openedWindow={screen.openedWindow}
          onDone={() => {}}
          isEmbed={true}
          payer={{
            wallet: activeWallet,
            chain,
            account: activeAccount,
          }}
          onSuccess={() => {
            if (props.payOptions.mode === 'transaction') {
              props.onDone();
            }
          }}
        />
      )}
    </>
  );
  return (
    <CustomThemeProvider theme={theme}>
      <EmbedContainer
        modalSize="compact"
        style={props.style}
        className={props.className}
      >
        <DynamicHeight>{content}</DynamicHeight>
      </EmbedContainer>
    </CustomThemeProvider>
  );
}
