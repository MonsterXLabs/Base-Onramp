'use client';

import React, { useEffect, useState } from 'react';
import { roundToDecimals, trimString } from '@/utils/helpers';
import { useActiveWalletChain } from 'thirdweb/react';
import { contract } from '@/lib/contract';
import { useNFTDetail } from '../../Context/NFTDetailContext';
import { getTokenAmount, getUsdAmount } from '@/lib/helper';
import { useGlobalContext } from '../../Context/GlobalContext';
import { formatEther } from 'viem';

const ORACLE_DELTA = 30;
export default function Quotes({
  gasFee,
  onClose,
}: {
  gasFee: number;
  onClose: () => void;
}) {
  const { NFTDetail, auction } = useNFTDetail();
  const { fee } = useGlobalContext();
  const activeChain = useActiveWalletChain();
  // State variables
  const [tokenAmount, setTokenAmount] = useState<string | null>(null);
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(ORACLE_DELTA); // Countdown timer in seconds
  const [timerKey, setTimerKey] = useState(0); // Key to reset timer
  const [auctionUsd, setAuctionUsd] = useState<string>('');
  // Fetch data function
  const getQuote = async () => {
    let tokenAmount: string;
    if (NFTDetail.onAuction) {
      const weiAmount = BigInt(auction?.highBidAmount ?? auction?.minBid ?? 0);
      const usdAmount = (await getUsdAmount(weiAmount)) as string;
      setAuctionUsd(usdAmount);
      tokenAmount = formatEther(weiAmount) as string;
    } else {
      tokenAmount = (await getTokenAmount(
        NFTDetail.price.toString(),
      )) as string;
    }
    setTokenAmount(tokenAmount);
    const expectedAmount = (Number(tokenAmount) * 100) / (100 - fee) + gasFee;
    setExpectedAmount(roundToDecimals(expectedAmount ?? null, 5));
  };

  useEffect(() => {
    getQuote();

    const countdown = () => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setTimeout(countdown, 1000); // Repeat every 1 second
    };

    // Start the recursive timeouts
    const timeoutId = setTimeout(countdown, 1000);

    // Cleanup the timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [timerKey]);

  // Manual reset function
  const handleReset = () => {
    setSeconds(ORACLE_DELTA);
    setTimerKey((timerKey) => timerKey + 1);
  };

  return (
    <div className="p-3 text-white">
      <h2 className="text-xl font-medium text-white">
        Quantity of cryptocurrency required
      </h2>
      <p className="text-sm">
        To purchase this artwork, you will need approximately the following
        amount of cryptocurrency.
      </p>
      <div className="mt-4 flex justify-between items-center my-3">
        <span className="text-sm">Sale Price (USD)</span>
        <span>${NFTDetail?.onAuction ? auctionUsd : NFTDetail.price}</span>
      </div>
      <div className="p-4 rounded-md border-2 border-dashed border-[#3A3A3A]">
        <div className="flex mb-3 gap-x-4">
          <img src="/icons/ether.svg" className="w-10" />
          <div className="">
            <p>
              Eth{' '}
              <span
                className="text-sm"
                style={{
                  color: 'rgba(255, 255, 255, 0.53)',
                }}
              >
                {activeChain?.name}
              </span>
            </p>
            <p>{trimString(contract.address)}</p>
          </div>
        </div>
        <hr />
        <div className="flex flex-col gap-y-4 mt-3">
          <div className="flex justify-between">
            <span>Cryptocurrency Price</span>
            <span>{tokenAmount} Eth</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Gas fee</span>
            <span>{gasFee} Eth</span>
          </div>
          <div className="flex items-center justify-center">
            <button
              className="text-white px-4 py-2 rounded-xl bg-[#535353]"
              disabled={seconds > 0}
              onClick={handleReset}
            >
              {seconds ? (
                <span>New Quotes in 0:{seconds}</span>
              ) : (
                <span>New Quotes</span>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between my-3">
        <span className="text-sm">Marketplace fee</span>
        <span>{fee}%</span>
      </div>
      <hr />
      <div className="flex justify-between my-3">
        <span className="text-sm">The expected payment is</span>
        <span>{expectedAmount} ETH</span>
      </div>
      <button
        className="bg-[#DEE8E8] w-full my-3 py-2 text-center rounded-md text-black font-medium"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
