'use client';
import NftServices from '@/services/legacy/nftService';
import { useEffect, useState } from 'react';
import { BaseCarousel } from '../Carousels/BaseCarousel';

const createTitleComp = (
  title: string,
  color: Array<{ word: number; color: string }>,
) => {
  if (!title || !color) return null;
  return (
    <h3 className="font-extrabold text-[40px]">
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

export default function NFTList({ color }: { color: any }) {
  const [nfts, setNfts] = useState([]);
  const getNfts = async () => {
    try {
      const nftService = new NftServices();
      const {
        data: { nfts },
      } = await nftService.getAllNfts({ limit: 0, skip: 0, searchInput: '' });
      const filterNFTs = nfts[0]?.data
        .filter(
          (nft: any) =>
            nft?.active &&
            nft.ownerInfo?.[0]?.active &&
            nft.curationInfo?.[0] &&
            nft.curationInfo?.[0].active,
        )
        ?.slice(0, 4);
      setNfts(filterNFTs);
    } catch (error) {
      setNfts([]);
      console.log(error);
    }
  };

  useEffect(() => {
    getNfts();
  }, []);

  const heading = (
    <h3 className="font-extrabold md:text-4xl sm:text-3xl text-xl xs:text-2xl  lg:text-[40px] ">
      Appreciate & Explore
    </h3>
  );

  return (
    <BaseCarousel
      // heading={createTitleComp('Appreciate & Explore', color)}
      discoverLink="/dashboard/appreciate"
      heading={heading}
      data={nfts}
    />
  );
}
