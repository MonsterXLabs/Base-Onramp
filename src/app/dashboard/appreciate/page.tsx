'use client';

import NftCard from '@/app/components/Cards/NftCard';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';
import { NftSkeletonCard } from '@/app/components/Skelton/nft-skeleton';
import Filters from '@/app/components/ui/Filters';
import { useToast } from '@/hooks/use-toast';
import NftServices from '@/services/legacy/nftService';
import { ensureValidUrl } from '@/utils/helpers';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export default function Page() {
  const nftService = new NftServices();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState<any[]>([]);
  const { mediaImages } = useGlobalContext();
  const [filters, setFilters] = useState<any>({
    searchInput: '',
    filter: {
      createdAt: -1,
    },
    category: null,
  });
  const [debounceFilter] = useDebounce(filters, 2000);
  const { toast } = useToast();

  const handleFilters = (data: any) => {
    if (data && typeof data === 'object') {
      setFilters({
        searchInput: data.search,
        filter: {
          [data?.price.param]: data.price.value,
        },
        category:
          data.category.label === 'Category' ? null : data.category.label,
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        toast({
          title: 'Fetching RWAs...',
          duration: 2000,
        });

        const queryObject = {
          skip: 0,
          limit: 0,
          searchInput: filters.searchInput,
          filter: filters.filter,
        };
        if (filters.category) {
          queryObject['category'] = filters.category;
        }

        const response = await nftService.getAllNfts(queryObject);

        if (response.data.nfts && response.data.nfts.length > 0) {
          const nfts = response.data.nfts[0]?.data;
          setNfts(
            nfts.filter(
              (nft: any) =>
                nft?.active &&
                nft.ownerInfo?.[0]?.active &&
                nft.curationInfo?.[0] &&
                nft.curationInfo?.[0].active,
            ),
          );
        }
      } catch (error) {
        toast({
          title: 'Error fetching RWAs',
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceFilter]);

  return (
    <div className="flex flex-col gap-y-4 sm:px-2 md:px-4">
      {mediaImages?.appreciateTop?.image && mediaImages?.appreciateTop.link ? (
        <a
          href={ensureValidUrl(mediaImages?.appreciateTop.link)}
          target="_blank"
        >
          <div className="w-full rounded-xl aspect-video sm:h-[350px] md:h-[370px] relative">
            <Image
              quality={100}
              src={mediaImages?.appreciateTop.image}
              alt="hero"
              fill
              objectFit="cover"
              className="rounded-lg "
            />
          </div>
        </a>
      ) : null}
      <Filters setState={handleFilters} />
      {loading ? (
        <NftSkeletonCard items={8} />
      ) : (
        <div className="grid gap-3 mb-3 md:gap-4 lg:gap-4 xl:gap-y-[52px] xl:gap-x-[10px] grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nfts.length > 0
            ? nfts.map((nft: any, index: number) => {
                if (
                  !nft.active ||
                  !nft.curationInfo ||
                  !nft.curationInfo.length ||
                  !nft.curationInfo?.[0].active
                )
                  return null;
                return (
                  <Link key={index} href={`/nft/${nft._id}`}>
                    <NftCard data={nft} />
                  </Link>
                );
              })
            : null}
        </div>
      )}
    </div>
  );
}
