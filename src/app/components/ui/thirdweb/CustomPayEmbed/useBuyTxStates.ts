import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getChainMetadata } from 'thirdweb/chains';
import { NATIVE_TOKEN_ADDRESS, PreparedTransaction } from 'thirdweb';
import { getContract } from 'thirdweb';
import { getCurrencyMetadata } from 'thirdweb/extensions/erc20';
import { getGasPrice } from 'thirdweb';
import { estimateGasCost } from 'thirdweb';
import { Hex } from 'thirdweb';
import { resolvePromisedValue } from 'thirdweb/utils';
import { Account, getWalletBalance } from 'thirdweb/wallets';
import { encode } from 'thirdweb';

export function useTransactionCostAndData(args: {
  transaction: PreparedTransaction;
  account: Account | undefined;
}) {
  const { transaction, account } = args;
  // Compute query key of the transaction first
  const [txQueryKey, setTxQueryKey] = useState<
    | {
        value: string | undefined;
        erc20Value: string | undefined;
        erc20Currency: string | undefined;
        to: string | undefined;
        data: Hex | undefined;
      }
    | undefined
  >();
  useEffect(() => {
    Promise.all([
      resolvePromisedValue(transaction.value),
      resolvePromisedValue(transaction.erc20Value),
      resolvePromisedValue(transaction.to),
      encode(transaction),
    ]).then(([value, erc20Value, to, data]) => {
      setTxQueryKey({
        value: value?.toString(),
        erc20Value: erc20Value?.amountWei?.toString(),
        erc20Currency: erc20Value?.tokenAddress,
        to,
        data,
      });
    });
  }, [transaction]);

  return useQuery({
    queryKey: [
      'transaction-cost',
      transaction.chain.id,
      account?.address,
      txQueryKey,
    ],
    queryFn: async () => {
      if (!account) {
        throw new Error('No account');
      }

      const erc20Value = await resolvePromisedValue(transaction.erc20Value);
      if (erc20Value) {
        const [tokenBalance, tokenMeta, gasCostWei] = await Promise.all([
          getWalletBalance({
            address: account.address,
            chain: transaction.chain,
            client: transaction.client,
            tokenAddress: erc20Value.tokenAddress,
          }),
          getCurrencyMetadata({
            contract: getContract({
              address: erc20Value.tokenAddress,
              chain: transaction.chain,
              client: transaction.client,
            }),
          }),
          getTransactionGasCost(transaction, account?.address),
        ]);
        const transactionValueWei = erc20Value.amountWei;
        const walletBalance = tokenBalance;
        const currency = {
          address: erc20Value.tokenAddress,
          name: tokenMeta.name,
          symbol: tokenMeta.symbol,
          icon: '',
        };
        return {
          token: currency,
          decimals: tokenMeta.decimals,
          walletBalance,
          gasCostWei,
          transactionValueWei,
        };
      }

      const [nativeWalletBalance, chainMetadata, gasCostWei] =
        await Promise.all([
          getWalletBalance({
            address: account.address,
            chain: transaction.chain,
            client: transaction.client,
          }),
          getChainMetadata(transaction.chain),
          getTransactionGasCost(transaction, account?.address),
        ]);

      const walletBalance = nativeWalletBalance;
      const transactionValueWei =
        (await resolvePromisedValue(transaction.value)) || 0n;
      return {
        token: {
          address: NATIVE_TOKEN_ADDRESS,
          name: chainMetadata.nativeCurrency.name,
          symbol: chainMetadata.nativeCurrency.symbol,
          icon: chainMetadata.icon?.url,
        },
        decimals: 18,
        walletBalance,
        gasCostWei,
        transactionValueWei,
      };
    },
    enabled: !!transaction && !!account && !!txQueryKey,
    refetchInterval: () => {
      if (transaction.erc20Value) {
        // if erc20 value is set, we don't need to poll
        return undefined;
      }
      return 30_000;
    },
  });
}

async function getTransactionGasCost(tx: PreparedTransaction, from?: string) {
  try {
    const gasCost = await estimateGasCost({
      transaction: tx,
      from,
    });

    const bufferCost = gasCost.wei / 10n;

    // Note: get tx.value AFTER estimateGasCost
    // add 10% extra gas cost to the estimate to ensure user buys enough to cover the tx cost
    return gasCost.wei + bufferCost;
  } catch {
    if (from) {
      // try again without passing from
      return await getTransactionGasCost(tx);
    }
    // fallback if both fail, use the tx value + 2M * gas price
    const gasPrice = await getGasPrice({
      client: tx.client,
      chain: tx.chain,
    });

    return 2_000_000n * gasPrice;
  }
}
