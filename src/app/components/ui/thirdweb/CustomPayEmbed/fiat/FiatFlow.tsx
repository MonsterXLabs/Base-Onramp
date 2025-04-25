import { useCallback, useState } from 'react';
import { ThirdwebClient } from 'thirdweb';
import { BuyWithFiatQuote } from '../util';
import { BuyWithFiatStatus } from '../ConnectButtonProps';
import { isSwapRequiredPostOnramp, openOnrampPopup } from '../util';
import { PayerInfo } from '../util';
import { OnrampStatusScreen } from './FiatStatusScreen';
import { FiatSteps, fiatQuoteToPartialQuote } from './FiatSteps';
import { PostOnRampSwapFlow } from './PostOnRampSwapFlow';
import { useBuyWithFiatStatus } from 'thirdweb/react';

// 2 possible flows

// If a Swap is required after doing onramp
// 1. show the 2 steps ui with step 1 highlighted, on continue button click:
// 2. open provider window, show onramp status screen, on onramp success:
// 3. show the 2 steps ui with step 2 highlighted, on continue button click:
// 4. show swap flow

//  If a Swap is not required after doing onramp
//  - window will already be opened before this component is mounted and `openedWindow` prop will be set, show onramp status screen

type Screen =
  | {
      id: 'step-1';
    }
  | {
      id: 'onramp-status';
    }
  | {
      id: 'postonramp-swap';
      data: BuyWithFiatStatus;
    }
  | {
      id: 'step-2';
    };

export function FiatFlow(props: {
  title: string;
  quote: BuyWithFiatQuote;
  onBack: () => void;
  client: ThirdwebClient;
  testMode: boolean;
  theme: 'light' | 'dark';
  openedWindow: Window | null;
  onDone: () => void;
  transactionMode: boolean;
  isEmbed: boolean;
  payer: PayerInfo;
  onSuccess: (status: BuyWithFiatStatus) => void;
}) {
  const fiatStatus = useBuyWithFiatStatus({
    client: props.client, // thirdweb client
    intentId: props.quote.intentId,
  });

  const hasTwoSteps = isSwapRequiredPostOnramp(props.quote);
  const [screen, setScreen] = useState<Screen>(
    hasTwoSteps
      ? {
          id: 'step-1',
        }
      : {
          id: 'onramp-status',
        },
  );

  const onPostOnrampSuccess = useCallback(() => {
    // report the status of fiat status instead of post onramp swap status when post onramp swap is successful
    if (fiatStatus.data?.status === 'ON_RAMP_TRANSFER_COMPLETED') {
      props.onSuccess(fiatStatus.data);
    }
  }, [props.onSuccess, props.quote.intentId, props.client, fiatStatus]);

  const [popupWindow, setPopupWindow] = useState<Window | null>(
    props.openedWindow,
  );

  if (screen.id === 'step-1') {
    return (
      <FiatSteps
        title={props.title}
        client={props.client}
        onBack={props.onBack}
        partialQuote={fiatQuoteToPartialQuote(props.quote)}
        step={1}
        onContinue={() => {
          const popup = openOnrampPopup(props.quote.onRampLink, props.theme);
          setPopupWindow(popup);
          setScreen({ id: 'onramp-status' });
        }}
      />
    );
  }

  if (screen.id === 'onramp-status') {
    return (
      <OnrampStatusScreen
        title={props.title}
        client={props.client}
        intentId={props.quote.intentId}
        onBack={props.onBack}
        hasTwoSteps={hasTwoSteps}
        openedWindow={popupWindow}
        quote={props.quote}
        onDone={props.onDone}
        onShowSwapFlow={(_status) => {
          setScreen({ id: 'postonramp-swap', data: _status });
        }}
        transactionMode={props.transactionMode}
        isEmbed={props.isEmbed}
        onSuccess={props.onSuccess}
      />
    );
  }

  if (screen.id === 'postonramp-swap') {
    return (
      <PostOnRampSwapFlow
        title={props.title}
        status={screen.data}
        quote={fiatQuoteToPartialQuote(props.quote)}
        client={props.client}
        onBack={props.onBack}
        onDone={props.onDone}
        onSwapFlowStarted={() => {
          // no op
        }}
        transactionMode={props.transactionMode}
        isEmbed={props.isEmbed}
        payer={props.payer}
        onSuccess={onPostOnrampSuccess}
      />
    );
  }

  // never
  return null;
}
