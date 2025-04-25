import { useNFTDetail } from '@/app/components/Context/NFTDetailContext';
import { GetAuctionDTO } from '@/dto/auction.dto';
import React, { useEffect, useState } from 'react';
import moment from 'moment';

const calculateTimeRemaining = (
  bidTime: Date,
  durationInSeconds: number,
): string => {
  if (!bidTime || !durationInSeconds) return '';

  const bidEndTime = moment(bidTime).add(durationInSeconds, 'seconds');
  const now = moment();
  const timeDifference = moment.duration(bidEndTime.diff(now));

  if (timeDifference.asSeconds() <= 0) {
    return 'Auction ended';
  }

  const days = Math.floor(timeDifference.asDays());
  const hours = timeDifference.hours().toString().padStart(2, '0');
  const minutes = timeDifference.minutes().toString().padStart(2, '0');
  const seconds = timeDifference.seconds().toString().padStart(2, '0');

  return days > 0
    ? `${days} days ${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}:${seconds}`;
};

export const AuctionMainCountDown: React.FC = () => {
  const { auction } = useNFTDetail();

  const [timeRemaining, setTimeRemaining] = useState<string>(
    calculateTimeRemaining(auction?.createdAt, auction?.duration),
  );

  useEffect(() => {
    if (!auction?.duration) return;

    const updateTimer = () => {
      setTimeRemaining(
        calculateTimeRemaining(auction?.createdAt, auction?.duration),
      );
      setTimeout(updateTimer, 1000); // Update every second
    };

    const timeout = setTimeout(updateTimer, 1000);

    return () => clearTimeout(timeout);
  }, [auction]);

  return (
    <div className="flex gap-x-3">
      <div className="flex gap-x-1 items-center border font-extrabold border-white border-opacity-[12%] text-white px-3 py-2 rounded-xl bg-[#232323]">
        <span className="text-white text-sm">Remaining Schedule</span>
        <span className="text-yellow-400 text-sm">{timeRemaining}</span>
      </div>
      <div className="flex gap-x-1 items-center border font-extrabold border-white border-opacity-[12%] text-white px-3 py-2 rounded-xl bg-[#232323]">
        <span className="text-yellow-400 text-sm">
          Bid {auction?.bidCount ?? ''}
        </span>
      </div>
    </div>
  );
};
