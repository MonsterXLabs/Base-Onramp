'use client';

import { GetAuctionDTO } from '@/dto/auction.dto';
import { IBid, INFTActivity, NFTItemType } from '@/types';
import { createContext, ReactNode, useContext, useState } from 'react';
import { formatEther } from 'viem';

interface INFTDetailContext {
  NFTDetail: null | NFTItemType;
  setNFTDetail: (data: null | NFTItemType) => void;
  nftId: null | string;
  setNftId: (data: string) => void;
  mainImage: null | string;
  setMainImage: (data: null | string) => void;
  likes: number;
  setLikes: (data: number) => void;
  liked: boolean;
  setLiked: (data: boolean) => void;
  type: string;
  setType: (data: string) => void;
  burnable: boolean;
  setBurnable: (data: boolean) => void;
  activityList: INFTActivity[];
  setActivityList: (data: INFTActivity[]) => void;
  bids: IBid[];
  setBids: (data: IBid[]) => void;
  ownable: boolean;
  setOwnable: (data: boolean) => void;
  auction: null | GetAuctionDTO;
  setAuction: (data: GetAuctionDTO | null) => void;
  auctionBids: GetAuctionDTO[];
  setAuctionBids: (data: GetAuctionDTO[]) => void;
}

interface NFTDetailProviderProps {
  children: ReactNode;
}

// create a NFT detail context
const NFTDetailContext = createContext<INFTDetailContext | undefined>(
  undefined,
);

//context component
export const NFTDetailProvider: React.FC<NFTDetailProviderProps> = ({
  children,
}) => {
  const [NFTDetail, setNFTDetail] = useState<null | NFTItemType>(null);
  const [nftId, setNftId] = useState<null | string>(null);
  const [mainImage, setMainImage] = useState<null | string>(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [type, setType] = useState('');
  const [burnable, setBurnable] = useState(false);
  const [activityList, setActivityList] = useState<INFTActivity[]>([]);
  const [bids, setBids] = useState<IBid[]>([]);
  const [ownable, setOwnable] = useState(false);
  const [auction, setAuction] = useState<GetAuctionDTO | null>(null);
  const [auctionBids, setAuctionBids] = useState<GetAuctionDTO[]>([]);

  const setNFTDetailCustom = (data: null | NFTItemType) => {
    if (data?.lastPrice) {
      data.lastPrice = Number(formatEther(BigInt(data?.lastPrice)));
    }
    setNFTDetail(data);
  };

  return (
    <NFTDetailContext.Provider
      value={{
        NFTDetail,
        setNFTDetail: setNFTDetailCustom,
        nftId,
        setNftId,
        mainImage,
        setMainImage,
        likes,
        setLikes,
        liked,
        setLiked,
        type,
        setType,
        burnable,
        setBurnable,
        activityList,
        setActivityList,
        bids,
        setBids,
        ownable,
        setOwnable,
        auction,
        setAuction,
        auctionBids,
        setAuctionBids,
      }}
    >
      {children}
    </NFTDetailContext.Provider>
  );
};

// hook
export const useNFTDetail = () => {
  const context = useContext(NFTDetailContext);
  if (context === undefined)
    throw new Error(
      'NFT Detail context must be used within NFT Detail Provider',
    );
  return context;
};
