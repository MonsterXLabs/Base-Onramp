import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

interface FectchingPriceProps {
  className?: string;
}

export const FetchingPrice: React.FC<FectchingPriceProps> = ({
  className,
}: FectchingPriceProps) => {
  return (
    <div
      className={cn(
        'h-12 px-5 py-2 bg-yellow-300/20 rounded-3xl justify-center items-center gap-5 inline-flex',
        className,
      )}
    >
      <Image
        src="/icons/loading-price.svg"
        alt="loading-price"
        width={32}
        height={32}
      />
      <div className="text-yellow-300 text-2xl font-bold font-['Manrope'] capitalize">
        Fetching Best Deal
      </div>
    </div>
  );
};
