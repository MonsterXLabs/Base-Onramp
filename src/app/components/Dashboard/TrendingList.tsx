'use client';

import NftServices from '@/services/legacy/nftService';
import { extractIdFromURL } from '@/utils/helpers';
import { useEffect, useState } from 'react';
import { BaseCarousel } from '../Carousels/BaseCarousel';
import { getSection2AutoBoxes } from '@/services/legacy/supplier';

interface TrendingProps {
  data: any;
}

const createTitleComp = (
  title: string,
  color: Array<{ word: number; color: string }>,
) => {
  if (!title) return null;
  return (
    <h3 className="font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[40px]">
      {title.split(' ').map((word, index) => {
        const colorIndex = color.findIndex((item) => item.word === index + 1);
        return (
          <span
            key={index}
            style={{
              color: colorIndex !== -1 ? color[colorIndex].color : 'white',
            }}
          >
            {word}{' '}
          </span>
        );
      })}
    </h3>
  );
};

export default function TrendingList({ data }: TrendingProps) {
  const [icafNfts, setICAFNfts] = useState<any[]>([]);

  const getTrendingNfts = async () => {
    if (!data) return;
    let tempNfts = [];
    if (data.autoSelect) {
      tempNfts = await getSection2AutoBoxes();
      setICAFNfts(tempNfts);
    } else {
      for (let i = 0; i < data?.box?.length; i++) {
        try {
          const nftService = new NftServices();
          const {
            data: { nft },
          } = await nftService.getNftById(extractIdFromURL(data?.box[i]));
          tempNfts.push(nft);
        } catch (error) {
          console.log({ error });
        }
      }
      setICAFNfts(tempNfts);
    }
  };

  useEffect(() => {
    getTrendingNfts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // const heading = (
  //   <h3 className="font-extrabold text-[40px] text-[#DDF247]">
  //     Weekly Trending
  //   </h3>
  // );

  return (
    <BaseCarousel
      heading={createTitleComp(data?.title, data?.color)}
      discoverLink="/dashboard/appreciate"
      data={icafNfts}
    />
  );
}
