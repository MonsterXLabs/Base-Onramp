import {
  BuyWithCryptoQuote,
  getAddress,
  NATIVE_TOKEN_ADDRESS,
  type Chain,
} from 'thirdweb';
import { Account, Wallet } from 'thirdweb/wallets';

export function formatNumber(value: number, decimalPlaces: number) {
  if (value === 0) return 0;
  const precision = 10 ** decimalPlaces;
  const threshold = 1 / 10 ** decimalPlaces; // anything below this if rounded will result in zero - so use ceil instead
  const fn: 'ceil' | 'round' = value < threshold ? 'ceil' : 'round';
  return Math[fn]((value + Number.EPSILON) * precision) / precision;
}

export function toTokens(units: bigint, decimals: number): string {
  // Convert to string once and handle negativity.
  const stringValue = units.toString();
  const prefix = stringValue[0] === '-' ? '-' : '';
  // Abusing that string "-" is truthy
  const absStringValue = prefix ? stringValue.slice(1) : stringValue;

  // Ensure we have enough digits for the fractional part.
  const paddedValue = absStringValue.padStart(decimals + 1, '0');
  const splitIndex = paddedValue.length - decimals;

  // Extract integer and fraction parts directly.
  const integerPart = paddedValue.slice(0, splitIndex) || '0';
  let fractionPart = paddedValue.slice(splitIndex);

  // Manually trim trailing zeros from the fraction part.
  for (let i = fractionPart.length - 1; i >= 0; i--) {
    if (fractionPart[i] !== '0') {
      fractionPart = fractionPart.slice(0, i + 1);
      break;
    }
    // check if the next digit is a zero also
    // If all zeros, make fraction part empty
    if (i === 0) {
      fractionPart = '';
    }
  }

  // Construct and return the formatted string.
  return `${prefix}${integerPart}${fractionPart ? `.${fractionPart}` : ''}`;
}

export type BuyWithFiatQuote = {
  /**
   * Estimated time for the transaction to complete in seconds.
   */
  estimatedDurationSeconds: number;
  /**
   * Minimum amount of token that is expected to be received in units.
   */
  estimatedToAmountMin: string;
  /**
   * Minimum amount of token that is expected to be received in wei.
   */
  estimatedToAmountMinWei: string;
  /**
   * Amount of token that is expected to be received in units.
   *
   * (estimatedToAmountMinWei - maxSlippageWei)
   */
  toAmountMinWei: string;
  /**
   * Amount of token that is expected to be received in wei.
   *
   * (estimatedToAmountMin - maxSlippageWei)
   */
  toAmountMin: string;
  /**
   * fiat currency used to buy the token - excluding the fees.
   */
  fromCurrency: {
    amount: string;
    amountUnits: string;
    decimals: number;
    currencySymbol: string;
  };
  /**
   * Fiat currency used to buy the token - including the fees.
   */
  fromCurrencyWithFees: {
    amount: string;
    amountUnits: string;
    decimals: number;
    currencySymbol: string;
  };
  /**
   * Token information for the desired token. (token the user wants to buy)
   */
  toToken: {
    symbol?: string | undefined;
    priceUSDCents?: number | undefined;
    name?: string | undefined;
    chainId: number;
    tokenAddress: string;
    decimals: number;
  };
  /**
   * Address of the wallet to which the tokens will be sent.
   */
  toAddress: string;
  /**
   * Address of the wallet used for buying the token.
   */
  fromAddress: string;
  /**
   * The maximum slippage in basis points (bps) allowed for the transaction.
   */
  maxSlippageBPS: number;
  /**
   * Id of transaction
   */
  intentId: string;
  /**
   * Array of processing fees for the transaction.
   *
   * This includes the processing fees for on-ramp and swap (if required).
   */
  processingFees: {
    amount: string;
    amountUnits: string;
    decimals: number;
    currencySymbol: string;
    feeType: 'ON_RAMP' | 'NETWORK';
  }[];
  /**
   * Token that will be sent to the user's wallet address by the on-ramp provider.
   *
   * If the token is same as `toToken` - the user can directly buy the token from the on-ramp provider.
   * If not, the user will receive this token and a swap is required to convert it `toToken`.
   */
  onRampToken: {
    amount: string;
    amountWei: string;
    amountUSDCents: number;
    token: {
      chainId: number;
      decimals: number;
      name: string;
      priceUSDCents: number;
      symbol: string;
      tokenAddress: string;
    };
  };

  /**
   * Gas Token that will be sent to the user's wallet address by the on-ramp provider.
   *
   * Only used for ERC20 + Gas on-ramp flow. This will hold the details of the gas token and amount sent for gas.
   *
   * In Native Currency case, extra for gas will be added to the output amount of the onramp.
   */
  gasToken?: {
    amount: string;
    amountWei: string;
    amountUSDCents: number;
    token: {
      chainId: number;
      decimals: number;
      name: string;
      priceUSDCents: number;
      symbol: string;
      tokenAddress: string;
    };
  };

  /**
   * Link to the on-ramp provider UI that will prompt the user to buy the token with fiat currency.
   *
   * This link should be opened in a new tab.
   * @example
   * ```ts
   * window.open(quote.onRampLink, "_blank");
   * ```
   *
   */
  onRampLink: string;
};

export type IconFC = React.FC<{ size: string }>;

export type CurrencyMeta = {
  shorthand: 'USD' | 'CAD' | 'GBP' | 'EUR' | 'JPY';
  name: string;
  icon: IconFC;
};

export type NativeToken = { nativeToken: true };

export type TokenInfo = {
  name: string;
  symbol: string;
  address: string;
  icon?: string;
};

export type PayerInfo = {
  wallet: Wallet;
  chain: Chain;
  account: Account;
};

export function isNativeToken(
  token: Partial<TokenInfo> | NativeToken,
): token is NativeToken {
  return (
    'nativeToken' in token ||
    token.address?.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
  );
}

export type ERC20OrNativeToken = TokenInfo | NativeToken;

export function isSwapRequiredPostOnramp(
  buyWithFiatQuote: Pick<BuyWithFiatQuote, 'toToken' | 'onRampToken'>,
) {
  const sameChain =
    buyWithFiatQuote.toToken.chainId ===
    buyWithFiatQuote.onRampToken.token.chainId;

  const sameToken =
    getAddress(buyWithFiatQuote.toToken.tokenAddress) ===
    getAddress(buyWithFiatQuote.onRampToken.token.tokenAddress);

  return !(sameChain && sameToken);
}

export function openOnrampPopup(link: string, theme: string) {
  const height = 750;
  const width = 500;
  const top = (window.innerHeight - height) / 2;
  const left = (window.innerWidth - width) / 2;

  return window.open(
    `${link}&theme=${theme}`,
    'thirdweb Pay',
    `width=${width}, height=${height}, top=${top}, left=${left}`,
  );
}

export function formatSeconds(seconds: number) {
  // hours and minutes
  if (seconds > 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} Hours ${minutes} Minutes`;
  }

  // minutes only
  if (seconds > 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} Minutes`;
  }

  return `${seconds}s`;
}

export type SelectedScreen =
  | {
      id: 'main' | 'select-payment-method' | 'buy-with-fiat' | 'select-wallet';
    }
  | {
      id: 'buy-with-crypto';
      payDisabled?: boolean;
    }
  | {
      id: 'select-from-token';
      backScreen: SelectedScreen;
    }
  | {
      id: 'select-to-token';
      backScreen: SelectedScreen;
    }
  | {
      id: 'select-currency';
      backScreen: SelectedScreen;
    }
  | {
      id: 'swap-flow';
      quote: BuyWithCryptoQuote;
    }
  | {
      id: 'fiat-flow';
      quote: BuyWithFiatQuote;
      openedWindow: Window | null;
    }
  | {
      id: 'transfer-flow';
    }
  | {
      id: 'connect-payer-wallet';
      backScreen: SelectedScreen;
    };

export const NATIVE_TOKEN: NativeToken = { nativeToken: true };

export function getBuyTokenAmountFontSize(value: string) {
  return value.length > 10 ? '26px' : value.length > 6 ? '34px' : '50px';
}
