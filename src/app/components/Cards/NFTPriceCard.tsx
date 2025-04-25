import { formatNumberWithCommas } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

interface NFTPriceCardProps {
  imgUrl: string;
  name: string;
  price: number;
}
export const NFTPriceCard: React.FC<NFTPriceCardProps> = ({
  imgUrl,
  name,
  price,
}: NFTPriceCardProps) => {
  return (
    <div className="flex h-36 justify-between bg-neutral-800 rounded-2xl p-5 items-center">
      <div className="flex gap-6 items-center">
        <div className="w-28 h-28 rounded-2xl relative">
          <Image
            quality={100}
            src={imgUrl}
            alt="bottom-banner"
            fill
            objectFit="cover"
          ></Image>
        </div>
        <p className="azeret-mono-font">{name}</p>
      </div>
      <p className="azeret-mono-font">$ {formatNumberWithCommas(price)}</p>
    </div>
  );
};
