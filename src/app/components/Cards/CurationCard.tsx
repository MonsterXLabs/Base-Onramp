'use client';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumberWithCommas } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useGlobalContext } from '../Context/GlobalContext';

interface ICurationCard {
  name: string;
  artistCount: number;
  nftCount: number;
  totalVolume: number;
  image: string;
  id: string;
}

export default function CurationCard({ data }: { data: ICurationCard }) {
  const { mediaImages } = useGlobalContext();
  return (
    <Link href={`/dashboard/curation/${data.id}`}>
      <Card className="text-white border-none max-w-[100%] rounded-none bg-[#232323]">
        <CardContent className="p-3 flex flex-col gap-y-4">
          <div className="w-full overflow-hidden">
            <Image
              quality={100}
              src={data.image ? data.image : mediaImages?.curationTop.image}
              height={368}
              width={482}
              className="w-full !aspect-[4/3] !object-cover hover:scale-110 transition-transform duration-300"
              alt="nft-image"
              blurDataURL={
                data.image ? data.image : mediaImages?.curationTop.image
              }
              placeholder="blur"
            />
          </div>
          <div className="flex flex-col gap-y-5">
            <p className="text-lg xl:text-xl 2xl:text-2xl manrope-font font-bold text-center">
              {data.name}
            </p>
            <div className="flex justify-between gap-x-[10px]">
              <div className="flex flex-col gap-y-1 bg-white/[7%] py-2 justify-center w-1/3">
                <p className="curation_text text-center text-white/30 azeret-mono-font text-base lg:text-sm  xl:text-base">
                  Artworks
                </p>
                <p className="text-center font-extrabold curation_value text-base lg:text-sm  xl:text-base">
                  {data.nftCount}
                </p>
              </div>
              <div className="flex flex-col gap-y-1 bg-white/[7%] py-2 justify-center w-1/3">
                <p className="curation_text text-center text-white/30 azeret-mono-font text-base lg:text-sm  xl:text-base">
                  Artists
                </p>
                <p className="text-center font-extrabold curation_value text-base lg:text-sm  xl:text-base">
                  {data.artistCount}
                </p>
              </div>
              <div className="flex flex-col gap-y-1 bg-white/[7%] py-2 justify-center w-1/3">
                <p className="curation_text text-center text-white/30 azeret-mono-font text-base lg:text-sm  xl:text-base">
                  Volume
                </p>
                <p className="text-center font-extrabold curation_value text-base lg:text-sm  xl:text-base">
                  ${formatNumberWithCommas(data.totalVolume)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
