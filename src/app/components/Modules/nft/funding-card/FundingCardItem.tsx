import { fundingMethodState } from '@/hooks/recoil-state';
import { client } from '@/lib/client';
import { chain, isDev } from '@/lib/contract';
import { cn } from '@/lib/utils';
import { FundingType } from '@/types';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { NATIVE_TOKEN_ADDRESS } from 'thirdweb';
import {
  useActiveAccount,
  useActiveWalletChain,
  useBuyWithFiatQuote,
} from 'thirdweb/react';

interface FundingCardItemProps {
  fundingType: FundingType;
  tokenAmount: string;
  className?: string;
}

interface ThirdwebCardItemProps {
  tokenAmount: string;
}

const ThirdwebFundingItem: React.FC<ThirdwebCardItemProps> = ({
  tokenAmount,
}: ThirdwebCardItemProps) => {
  const activeAccount = useActiveAccount();
  const fiatQuoteQuery = useBuyWithFiatQuote({
    fromCurrencySymbol: 'USD',
    toChainId: chain.id,
    toAddress: activeAccount?.address,
    toTokenAddress: NATIVE_TOKEN_ADDRESS,
    toAmount: tokenAmount,
    client: client,
    isTestMode: isDev,
    fromAddress: activeAccount?.address,
  });

  return (
    <p className="text-2xl text-[#8B8B8B]">
      {fiatQuoteQuery.data
        ? `= $${fiatQuoteQuery?.data?.fromCurrencyWithFees.amount} USD`
        : '= loading...'}
    </p>
  );
};

export const FundingCardItem: React.FC<FundingCardItemProps> = ({
  fundingType,
  tokenAmount,
  className,
}: FundingCardItemProps) => {
  const activeChain = useActiveWalletChain();
  const [option, setOption] = useRecoilState(fundingMethodState);
  const [usdAmount, setUsdAmount] = useState<number>(1);

  return (
    <div
      className={cn(
        'lg:w-full h-[219px] px-10 py-[30px] bg-[#111111] rounded-[15px] border-2 flex justify-start items-start gap-[30px] my-6 flex-col',
        option === fundingType ? 'border-yellow-400' : 'border-[#3a3a3a]',
        className,
      )}
      onClick={() => {
        setOption(fundingType);
      }}
    >
      <div className="flex justify-between w-full">
        <p className="font-extrabold text-2xl text-white">{fundingType}</p>
        <div className="flex gap-2">
          <Image
            src="/icons/formkit-info.svg"
            alt="info"
            width={18}
            height={18}
          />
          <p className="text-yellow-400 text-base">Details</p>
        </div>
      </div>
      <div className="items-start">
        <p className="text-3xl font-extrabold text-white">
          {`${tokenAmount} ${activeChain?.nativeCurrency?.symbol}`}
        </p>
        {fundingType === 'Thirdweb' ? (
          <ThirdwebFundingItem tokenAmount={tokenAmount} />
        ) : null}
        {fundingType === 'Moonpay' ? (
          <p className="text-2xl text-[#8B8B8B]">{`= $${usdAmount} USD`}</p>
        ) : null}
        {fundingType === 'Coinbase' ? (
          <p className="text-2xl text-[#8B8B8B]">{`= $${usdAmount} USD`}</p>
        ) : null}
      </div>
    </div>
  );
};
