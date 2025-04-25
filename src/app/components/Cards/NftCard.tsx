import { getAuctionApi } from '@/actions/auction';
import { Card, CardContent } from '@/components/ui/card';
import { GetAuctionDTO } from '@/dto/auction.dto';
import { cn, formatNumberWithCommas } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface INftCardProps {
  _id: string;
  name: string;
  cloudinaryUrl: string;
  cloudinaryPlaceholderUrl: string;
  curation: {
    name: string;
  };
  curationInfo?: any[];
  onAuction: boolean;
  auctionId: string;
  price: string;
  artist?: string;
}

export default function NftCard({
  data,
  className,
}: {
  data: INftCardProps;
  className?: string;
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [auction, setAuction] = useState<GetAuctionDTO | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_APP_BACKEND_URL || 'https://api.vault-x.io/api/v2';

  const nftImage = `${backendUrl}/nft/image?quality=30&url=${data.cloudinaryUrl}`;

  if (data.curationInfo?.length) {
    data.curation = data.curationInfo[0];
  }

  useEffect(() => {
    if (data.onAuction) {
      getAuctionApi(data._id).then((auction) => {
        setAuction(auction);
        // calculate end date
        const createdDate = new Date(auction.createdAt);
        const endDate = new Date(
          createdDate.getTime() + auction.duration * 1000,
        );
        const options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        } as const;
        setEndDate(endDate.toLocaleDateString('en-US', options));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.onAuction]);

  return (
    <Card
      className={cn(
        'bg-transparent text-white border-none w-full bg-[#232323]',
        className,
      )}
    >
      <CardContent className="rounded-[20px] p-0">
        <div className="w-full overflow-hidden rounded-[8px] p-5">
          <Image
            width={296}
            height={296}
            src={isImageLoaded ? nftImage : data.cloudinaryPlaceholderUrl}
            className="w-full !aspect-[4/3] !object-contain hover:scale-110 transition-transform duration-300"
            alt="nft-image"
            // blurDataURL={data.cloudinaryPlaceholderUrl || ''}
            // placeholder="blur"
            quality={100}
            onLoadingComplete={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)}
          />
        </div>
        <div className="flex flex-col px-5 py-3 gap-y-2.5 rounded-b-[20px]">
          {data.onAuction ? (
            <div className="flex justify-between">
              <span className="text-xs text-[#fff]  azeret-mono-font">
                Ends on {endDate}
              </span>
              <span className="inline-block bg-lime-400 text-black font-bold text-xs px-6 rounded-full cursor-pointer">
                Bidding {auction?.bidCount}
              </span>
            </div>
          ) : (
            <div className="h-4"></div>
          )}
          <p className="font-extrabold truncate">{data?.name}</p>
          <div className="flex justify-between">
            <span className="text-xs text-white/30  azeret-mono-font">
              Created by:{' '}
            </span>
            <span className="text-[12px] leading-[160%] azeret-mono-font">
              {data.artist}
            </span>
          </div>
          {data.curation?.name && (
            <p className="text-[13px] text-[#fff] font-bold azeret-mono-font italic underline">
              <Link className="italic " href={`/nft/${data._id}`}>
                {data.curation?.name}
              </Link>
            </p>
          )}
          <hr className={'border-white/10 my-[6px]'} />
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/30 azeret-mono-font">
              {!data.onAuction ? `Price` : `The winning bid`}
            </span>
            <div className="flex gap-x-2 items-center font-extrabold">
              <Image
                src="/icons/Base.svg"
                height={20}
                width={20}
                alt="matic"
                loading="lazy"
                quality={100}
              />
              $
              {formatNumberWithCommas(
                !data.onAuction ? data.price : auction?.winBidAmount || 0,
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
