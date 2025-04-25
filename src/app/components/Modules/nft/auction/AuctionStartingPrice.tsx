import { useNFTDetail } from '@/app/components/Context/NFTDetailContext';
import { getTokenAmount, getUsdAmount } from '@/lib/helper';
import { formatNumberWithCommas } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

export const AuctionStartingPrice: React.FC = () => {
  const { auction, type } = useNFTDetail();
  const [startingPrice, setStartingPrice] = useState<string>('');
  const fetchPrice = async () => {
    const minBidInUSD = await getUsdAmount(BigInt(auction.minBid));
    setStartingPrice(formatNumberWithCommas(Number(minBidInUSD)));
  };
  useEffect(() => {
    fetchPrice();
  }, [auction]);

  if (type !== 'auction') {
    return null;
  }

  return (
    <>
      <div className="items-center grid grid-cols-12 justify-between">
        <p className="text-xs text-white/60 col-span-8 azeret-mono-font">
          {'Starting Price'}
        </p>
      </div>
      <div className="flex flex-col justify-between w-full">
        <div className="flex justify-between items-center gap-y-2 w-full mt-2">
          <p className="text-[32px] font-extrabold">$ {startingPrice}</p>
        </div>
      </div>
    </>
  );
};
