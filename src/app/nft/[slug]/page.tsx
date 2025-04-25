'use client';

import { auctionBidListApi, getAuctionApi } from '@/actions/auction';
import { CreateNFTProvider } from '@/app/components/Context/CreateNFTContext';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';
import {
  NFTDetailProvider,
  useNFTDetail,
} from '@/app/components/Context/NFTDetailContext';
import ActivityList from '@/app/components/Modules/nft/ActivityList';
import AuctionBidList from '@/app/components/Modules/nft/auction/AuctionBidList';
import BidList from '@/app/components/Modules/nft/BidList';
import NFTDescription from '@/app/components/Modules/nft/NFTDescription';
import NFTMain from '@/app/components/Modules/nft/NFTMain';
import OthersDetails from '@/app/components/Modules/nft/others-details';
import { useToast } from '@/hooks/use-toast';
import { deliveryTime } from '@/lib/helper';
import { CreateSellService } from '@/services/legacy/createSellService';
import { FavoriteService } from '@/services/legacy/FavoriteService';
import NftServices from '@/services/legacy/nftService';
import { getAllNftActivitys } from '@/services/legacy/supplier';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { GetAuctionDTO } from '../../../dto/auction.dto';

function PageDetail({ params }: { params: { slug: string } }) {
  const nftService = new NftServices();
  const favoriteService = new FavoriteService();
  const createSellService = new CreateSellService();
  const { toast } = useToast();
  const { user, mediaImages } = useGlobalContext();
  const {
    NFTDetail: data,
    setNFTDetail: setData,
    setNftId,
    setLikes,
    setLiked,
    setType,
    setBurnable,
    setActivityList,
    setBids,
    setOwnable,
    setAuction,
    setAuctionBids,
  } = useNFTDetail();

  const getArtitsLikes = async () => {
    try {
      const {
        data: { totalLikedNfts },
      } = await favoriteService.getNftTotalLikes({ nftId: params.slug });
      const {
        data: { favorite },
      } = await favoriteService.getUserReactionToNft({ nftId: params.slug });
      setLikes(totalLikedNfts);
      setLiked(favorite);
    } catch (error) {
      console.log(error);
    }
  };

  const userReaction = async () => {
    try {
      const response = await favoriteService.getUserReactionToNft({
        nftId: params.slug,
      });

      if (response.data) {
        setLiked(response.data.favorite);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleNFTType = async (nft: any) => {
    let ownable = false;
    let burnable = false;
    const ownerWallet = nft?.owner?.wallet?.toLowerCase();
    const userWallet = user?.wallet?.toLowerCase();
    const saleStatus = nft?.saleId?.saleStatus;

    if (ownerWallet === userWallet) {
      ownable = true;
      switch (saleStatus) {
        case 'Sold':
        case 'Cancelled':
        case 'NotForSale':
          setType('resell');
          burnable = true;
          break;
        case 'CancellationRequested':
          setType('cancelRequested');
          break;
        case 'Ordered':
          const purchaseDate = new Date(nft?.saleId?.ItemPurchasedOn).getTime();
          const time = await deliveryTime();
          setType('inEscrow');
          break;
        case 'Dispute':
          setType('dispute');
          break;
        case 'Auction':
          setType('auction');
          break;
        default:
          setType('remove');
      }
    } else if (userWallet) {
      switch (saleStatus) {
        case 'Sold':
        case 'Cancelled':
        case 'NotForSale':
          setType('bid');
          break;
        case 'CancellationRequested':
        case 'Ordered':
        case 'Dispute':
          setType(
            nft?.saleId?.saleWinner === user?._id ? 'release' : 'NotForSale',
          );
          break;
        case 'Active':
          setType('buy');
          break;
        case 'Auction':
          setType('auctionBid');
          break;
        default:
          setType('bid');
      }
    } else {
      setType('');
    }
    setBurnable(burnable);
    setOwnable(ownable);
  };

  const getAllNftActivity = async () => {
    try {
      const {
        data: { data },
      } = await getAllNftActivitys({ nftId: params.slug });
      setActivityList(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBids = async () => {
    try {
      const {
        data: { bids },
      } = await createSellService.getNftBids({ nftId: params.slug });
      setBids(bids);
    } catch (error) {
      console.log(error);
    }
  };

  const getAuction = async () => {
    getAuctionApi(params.slug).then((auction) => {
      setAuction(auction);
    });
  };
  const getAuctionBids = async () => {
    try {
      auctionBidListApi(params.slug).then((auctionBids: GetAuctionDTO[]) => {
        setAuctionBids(auctionBids);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNftData = async () => {
    try {
      // set NFT ID
      setNftId(params.slug);
      getArtitsLikes();
      userReaction();
      getAllNftActivity();
      getBids();
      getAuction();
      getAuctionBids();
      const response = await nftService.getNftById(params.slug);
      setData(response.data.nft);
      if (response.data.nft) {
        await handleNFTType(response.data.nft);
      }
    } catch (error) {
      console.log(error);
      setData(null);
    }
  };

  useEffect(() => {
    fetchNftData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug, user]);

  useEffect(() => {
    if (user && data) {
      handleNFTType(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, data]);

  return (
    <>
      <div className="flex flex-col gap-y-4 py-2 sm:py-3 md:py-5 w-full container !px-5 lg:px-0">
        {data && (
          <>
            <div className="flex flex-col gap-y-6">
              <CreateNFTProvider>
                <NFTMain fetchNftData={fetchNftData} />
              </CreateNFTProvider>
              <NFTDescription />
              <CreateNFTProvider>
                <BidList fetchNftData={fetchNftData} />
              </CreateNFTProvider>
              <ActivityList />
              {data.onAuction && <AuctionBidList fetchNftData={fetchNftData} />}
              <OthersDetails data={data} />
            </div>
            <div className="w-full lg:w-11/12 object-contain pt-7 lg:pt-5 lg:px-5 max-w-[1204px] h-64 lg:pb-[30px] mx-auto rounded-[12px] relative flex justify-center items-center overflow-hidden lg:mt-[55px]">
              {mediaImages?.bottomBaner && (
                <Link href={mediaImages?.bottomBaner.link} target="_blank">
                  <Image
                    quality={100}
                    src={mediaImages?.bottomBaner.image}
                    alt="bottom-banner"
                    fill
                    className="object-contain lg:object-cover"
                  ></Image>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <NFTDetailProvider>
      <PageDetail params={params} />
    </NFTDetailProvider>
  );
}
