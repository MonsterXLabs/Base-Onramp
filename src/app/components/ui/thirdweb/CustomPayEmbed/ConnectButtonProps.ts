import {
  BuyWithCryptoStatus,
  Chain,
  PayOnChainTransactionDetails,
  PayTokenInfo,
  PreparedTransaction,
} from 'thirdweb';
import { PaymentInfo, TokenInfo } from 'thirdweb/react';

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type FiatProvider = 'STRIPE' | 'TRANSAK' | 'KADO';

export type BuyWithFiatStatus =
  | {
      status: 'NOT_FOUND';
    }
  | {
      /**
       * Intent ID of the "Buy with fiat" transaction. You can get the intent ID from the quote object returned by the [`getBuyWithFiatQuote`](https://portal.thirdweb.com/references/typescript/v5/getBuyWithFiatQuote) function
       */
      intentId: string;
      /**
       * The status of the transaction
       * - `NONE` - No status
       * - `PENDING_PAYMENT` - Payment is not done yet in the on-ramp provider
       * - `PAYMENT_FAILED` - Payment failed in the on-ramp provider
       * - `PENDING_ON_RAMP_TRANSFER` - Payment is done but the on-ramp provider is yet to transfer the tokens to the user's wallet
       * - `ON_RAMP_TRANSFER_IN_PROGRESS` - On-ramp provider is transferring the tokens to the user's wallet
       * - `ON_RAMP_TRANSFER_COMPLETED` - On-ramp provider has transferred the tokens to the user's wallet
       * - `ON_RAMP_TRANSFER_FAILED` - On-ramp provider failed to transfer the tokens to the user's wallet
       * - `CRYPTO_SWAP_REQUIRED` - On-ramp provider has sent the tokens to the user's wallet but a swap is required to convert it to the desired token
       * - `CRYPTO_SWAP_IN_PROGRESS` - Swap is in progress
       * - `CRYPTO_SWAP_COMPLETED` - Swap is completed and the user has received the desired token
       * - `CRYPTO_SWAP_FALLBACK` - Swap failed and the user has received a fallback token which is not the desired token
       */
      status:
        | 'NONE'
        | 'PENDING_PAYMENT'
        | 'PAYMENT_FAILED'
        | 'PENDING_ON_RAMP_TRANSFER'
        | 'ON_RAMP_TRANSFER_IN_PROGRESS'
        | 'ON_RAMP_TRANSFER_COMPLETED'
        | 'ON_RAMP_TRANSFER_FAILED'
        | 'CRYPTO_SWAP_REQUIRED'
        | 'CRYPTO_SWAP_COMPLETED'
        | 'CRYPTO_SWAP_FALLBACK'
        | 'CRYPTO_SWAP_IN_PROGRESS'
        | 'CRYPTO_SWAP_FAILED';
      /**
       * The wallet address to which the desired tokens are sent to
       */
      toAddress: string;
      /**
       * The wallet address that started the transaction.
       *
       * If onramp provider supports buying the destination token directly, the tokens are sent to "toAddress" directly.
       * Otherwise, the tokens are sent to "fromAddress" and a swap is performed by the payer wallet and the tokens are converted to the desired token and sent to "toAddress".
       */
      fromAddress: string;
      /**
       * The quote object for the transaction
       */
      quote: {
        estimatedOnRampAmount: string;
        estimatedOnRampAmountWei: string;

        estimatedToTokenAmount: string;
        estimatedToTokenAmountWei: string;

        fromCurrency: {
          amount: string;
          amountUnits: string;
          decimals: number;
          currencySymbol: string;
        };
        fromCurrencyWithFees: {
          amount: string;
          amountUnits: string;
          decimals: number;
          currencySymbol: string;
        };
        onRampToken: PayTokenInfo;
        toToken: PayTokenInfo;
        estimatedDurationSeconds?: number;
        createdAt: string;
      };
      /**
       * The on-ramp transaction details
       *
       * This field is only present when on-ramp transaction is completed or failed
       */
      source?: PayOnChainTransactionDetails;
      /**
       * The destination transaction details
       *
       * This field is only present when swap transaction is completed or failed
       */
      destination?: PayOnChainTransactionDetails;
      /**
       * Message indicating the reason for failure
       */
      failureMessage?: string;

      /**
       * Arbitrary data sent at the time of fetching the quote
       */
      purchaseData?: object;
    };

export type PayUIOptions = Prettify<
  {
    /**
     * Configure options for buying tokens using other token ( aka Swap )
     *
     * By default, the "Crypto" option is enabled. You can disable it by setting `buyWithCrypto` to `false`
     *
     * You can prefill the source token and chain using `prefillSource`
     * You can also disable the edits for the prefilled values by setting `prefillSource.allowEdits` - By default all are editable
     *
     * For example, if you want to allow selecting chain and but disable selecting token, you can set `allowEdits` to `{ token: false, chain: true }`
     */
    buyWithCrypto?:
      | false
      | {
          testMode?: boolean;
          prefillSource?: {
            chain: Chain;
            token?: TokenInfo;
            allowEdits?: {
              token: boolean;
              chain: boolean;
            };
          };
        };

    /**
     * By default "Credit card" option is enabled. you can disable it by setting `buyWithFiat` to `false`
     *
     * You can also enable the test mode for the on-ramp provider to test on-ramp without using real credit card.
     */
    buyWithFiat?:
      | {
          testMode?: boolean;
          prefillSource?: {
            currency?: 'USD' | 'CAD' | 'GBP' | 'EUR' | 'JPY';
          };
          preferredProvider?: FiatProvider;
        }
      | false;

    /**
     * Extra details to store with the purchase.
     *
     * This details will be stored with the purchase and can be retrieved later via the status API or Webhook
     */
    purchaseData?: object;

    /**
     * Callback to be called when the user successfully completes the purchase.
     */
    onPurchaseSuccess?: (
      info:
        | {
            type: 'crypto';
            status: BuyWithCryptoStatus;
          }
        | {
            type: 'fiat';
            status: BuyWithFiatStatus;
          },
    ) => void;
    /**
     * Customize the display of the PayEmbed UI.
     */
    metadata?: {
      name?: string;
      image?: string;
    };
  } & (FundWalletOptions | DirectPaymentOptions | TranasctionOptions)
>;

export type FundWalletOptions = {
  mode?: 'fund_wallet';
  /**
   * Prefill the Buy Token amount, chain and/or token.
   * You can also disable the edits for the prefilled values using `allowEdits` - By default all are editable
   *
   * For example, if you want to allow changing the amount, but disable changing the token and chain,
   * you can set `allowEdits` to `{ amount: true, token: false, chain: false }`
   *
   * If no `token` object is not specified, native token will be prefilled by default
   */
  prefillBuy?: {
    chain: Chain;
    token?: TokenInfo;
    amount?: string;
    allowEdits?: {
      amount: boolean;
      token: boolean;
      chain: boolean;
    };
  };
};

export type DirectPaymentOptions = {
  mode: 'direct_payment';
  /**
   * The payment information
   */
  paymentInfo: PaymentInfo;
};

export type TranasctionOptions = {
  mode: 'transaction';
  /**
   * The transaction to be executed.
   */
  transaction: PreparedTransaction;
};
