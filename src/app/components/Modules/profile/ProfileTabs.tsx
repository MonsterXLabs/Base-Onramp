/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popOver';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CreateSellService } from '@/services/legacy/createSellService';
import { FavoriteService } from '@/services/legacy/FavoriteService';
import NftServices from '@/services/legacy/nftService';
import {
  collectionServices,
  getAllActivityByUserId,
} from '@/services/legacy/supplier';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Archive, Check, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import CurationCard from '../../Cards/CurationCard';
import NftCard from '../../Cards/NftCard';
import NoItem from '../../Cards/NoItem';
import ProfileArtistCard from '../../Cards/ProfileArtistCard';
import { ActivityTab } from './ActivityTab';
import { EarnTab } from './EarnTab';
import { OrderTab } from './OrderTab';

const profileFilters = [
  {
    label: 'Price: Low To High',
    value: 1,
    param: 'price',
  },
  {
    label: 'Price: High To Low',
    value: -1,
    param: 'price',
  },
  {
    label: 'Recently Minted',
    value: -1,
    param: 'mintingTime',
  },
  {
    label: 'Recently Listed',
    value: -1,
    param: 'updatedAt',
  },
  {
    label: 'Most Favorited',
    value: -1,
    param: 'likes',
  },
  // {
  //   label: 'Highest Last Sale',
  //   value: -1,
  //   param: 'price',
  // },
  // {
  //   label: 'NFC Minted',
  //   value: -1,
  //   param: 'createdAt',
  // },
];

const earnFilters = [
  {
    label: 'All',
    value: '',
  },
  {
    label: 'Royalties',
    value: 'Royalties',
  },
  {
    label: 'Split Payment',
    value: 'Split Payments',
  },
];

const curationFilters = [
  {
    label: 'Number of Artworks',
    value: -1,
    param: 'nftCount',
  },
  {
    label: 'Number of Artists',
    value: -1,
    param: 'artistCount',
  },
  {
    label: 'Highest Volume',
    value: -1,
    param: 'totalVolume',
  },
  {
    label: 'New Curation',
    value: -1,
    param: 'createdAt',
  },
];

const activityFilters = [
  {
    label: 'All',
    param: '',
  },
  {
    label: 'Minted',
    param: 'Minted',
  },
  {
    label: 'Listed',
    param: 'Listed',
  },
  {
    label: 'Unlisted',
    param: 'End Sale',
  },
  {
    label: 'Purchased',
    param: 'Purchased',
  },
  {
    label: 'In Escrow',
    param: 'In Escrow',
  },
  {
    label: 'Transfer',
    param: 'Transfer',
  },
  {
    label: 'Burn',
    param: 'Burn',
  },
  {
    label: 'Royalties',
    param: 'Royalties',
  },
  {
    label: 'Split Payments',
    param: 'Split Payments',
  },
];

const orderFilters = [
  {
    label: 'Recently Activity',
    value: -1,
    param: 'updatedAt',
  },
];

export enum ProfileTabEnum {
  All = 'all',
  Own = 'owned',
  Created = 'created',
  Curation = 'curation',
  Activity = 'activity',
  Favorite = 'fav',
  Order = 'order',
  Earn = 'earn',
}

interface ProfileTabProps {
  tab: ProfileTabEnum;
  userId: string;
}
export default function ProfileTabs({ tab, userId }: ProfileTabProps) {
  const favoriteService = new FavoriteService();
  const nftService = new NftServices();
  const createAndSellService = new CreateSellService();
  const { toast } = useToast();

  const [favType, setFavType] = useState<string>('nft');
  const [categoryActive, setCategoryActive] = useState(false);
  const [filters, setFilters] = useState<any>({
    searchInput: '',
    earnFilter: {
      label: earnFilters[0].label,
      value: earnFilters[0].value,
    },
    filter: {
      value: profileFilters[3].value,
      label: profileFilters[3].label,
      param: profileFilters[3].param,
    },
    curationFilter: {
      label: curationFilters[0].label,
      value: curationFilters[0].value,
    },
    activityFilter: activityFilters[0],
    orderFilter: orderFilters[0],
  });

  const [data, setData] = useState<any>({
    [ProfileTabEnum.All]: null,
    [ProfileTabEnum.Own]: null,
    [ProfileTabEnum.Created]: null,
    [ProfileTabEnum.Curation]: null,
    [ProfileTabEnum.Activity]: null,
    [ProfileTabEnum.Favorite]: null,
    [ProfileTabEnum.Order]: null,
    [ProfileTabEnum.Earn]: null,
  });

  const isEarn = useMemo(() => {
    if (tab === ProfileTabEnum.Earn) {
      return true;
    }

    return false;
  }, [tab]);

  const categoryTab = useMemo(() => {
    if (tab == ProfileTabEnum.Earn) return 'earnFilter';
    else if (tab == ProfileTabEnum.Curation) return 'curationFilter';
    else if (tab == ProfileTabEnum.Activity) return 'activityFilter';
    else if (tab == ProfileTabEnum.Order) return 'orderFilter';
    else if (tab == ProfileTabEnum.Favorite) {
      if (favType == 'user' || favType == 'nft') {
        return 'filter';
      } else return 'curationFilter';
    }
    return 'filter';
  }, [tab, favType]);

  const categoryList = useMemo(() => {
    if (tab == ProfileTabEnum.Earn) return earnFilters;
    else if (tab == ProfileTabEnum.Curation) return curationFilters;
    else if (tab == ProfileTabEnum.Activity) return activityFilters;
    else if (tab == ProfileTabEnum.Order) return orderFilters;
    else if (tab == ProfileTabEnum.Favorite) {
      if (favType == 'user' || favType == 'nft') {
        return profileFilters;
      } else return curationFilters;
    }
    return profileFilters;
  }, [tab, favType]);

  const [debouncedFilter] = useDebounce(filters, 1000);

  const fetchUser = async () => {
    try {
      const nft = await nftService.getNftAllByUserId({
        searchInput: filters.searchInput,
        filter: {
          [filters.filter.param]: filters.filter.value,
        },
        userId,
      });

      setData({
        ...data,
        [ProfileTabEnum.All]: nft.data.nfts.filter(
          (nft: any) =>
            nft?.active && nft?.owner?.active && nft.curation?.active,
        ),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOwn = async () => {
    try {
      const response = await nftService.getNftByUserId({
        searchInput: filters.searchInput,
        filter: {
          [filters.filter.param]: filters.filter.value,
        },
        userId,
      });

      if (response.data) {
        setData({
          ...data,
          [ProfileTabEnum.Own]: response.data.nfts.filter(
            (nft: any) =>
              nft?.active && nft?.owner?.active && nft.curation?.active,
          ),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCreated = async () => {
    try {
      const response = await nftService.getNftMintedByUser({
        searchInput: filters.searchInput,
        filter: {
          [filters.filter.param]: filters.filter.value,
        },
        userId,
      });

      if (response.data) {
        setData({
          ...data,
          [ProfileTabEnum.Created]: response.data.nfts
            ? response.data.nfts.filter(
                (nft: any) =>
                  nft?.active && nft?.owner?.active && nft.curation?.active,
              )
            : [],
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCuration = async () => {
    try {
      const response = await collectionServices.getCollectionsByUserId({
        searchInput: filters.searchInput,
        filter: {
          [filters.curationFilter.param]: filters.curationFilter.value,
        },
        userId,
      });

      const collections = response.data.collection;
      const detailedInfo = await Promise.all(
        collections
          .filter((item: any) => item.active)
          .map(async (collection: any) => {
            return {
              ...collection,
              id: collection?._id,
              image: collection?.logo,
            };
          }),
      );

      setData({
        ...data,
        [ProfileTabEnum.Curation]: detailedInfo,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await getAllActivityByUserId({
        searchInput: filters?.searchInput,
        filterInput: filters?.activityFilter,
        userId,
      });

      if (response.data) {
        setData({
          ...data,
          [ProfileTabEnum.Activity]: response.data.data
            ? response.data.data
            : [],
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFav = async () => {
    try {
      const likedNft = await favoriteService.getUserLikedNfts({
        searchInput: filters.searchInput,
        filter: {
          [filters.filter.param]: filters.filter.value,
        },
        userId,
      });
      const likedArtist = await favoriteService.getUserLikedArtists({
        searchInput: filters.searchInput,
        userId,
      });
      const likedCuration = await favoriteService.getUserLikedCollections({
        searchInput: filters.searchInput,
        userId,
      });

      const nfts = likedNft.data
        ? likedNft.data.nfts.map((item: any) => {
            return {
              ...item.nftId,
            };
          })
        : [];

      const artists = likedArtist.data
        ? likedArtist.data.artists.map((item: any) => {
            return {
              ...item.artistId,
            };
          })
        : [];

      let collections = likedCuration.data
        ? likedCuration.data.curations.map((item: any) => {
            return {
              ...item.collectionId,
            };
          })
        : [];

      const detailedInfo = await Promise.all(
        collections
          .filter((item: any) => item.active)
          .map(async (collection: any) => {
            const info = await collectionServices.getCollectionInfo(
              collection._id,
            );

            const extra = {
              nftCount: info.data.collection.nftCount,
              totalVolume: info.data.collection.totalVolume,
              artistCount: info.data.collection.artistCount,
            };

            return {
              ...extra,
              id: collection?._id,
              name: collection.name,
              image: collection?.logo,
            };
          }),
      );
      setData({
        ...data,
        [ProfileTabEnum.Favorite]: {
          likedNft: nfts,
          likedArtist: artists,
          likedCuration: detailedInfo,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await createAndSellService.getOrdersByUserId({
        filters: {
          [filters.filter.param]: filters.filter.value,
        },
        searchInput: filters.searchInput,
        userId,
      });

      if (response.data) {
        setData({
          ...data,
          [ProfileTabEnum.Order]: response.data.nfts,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await createAndSellService.getEarnings({
        filter: filters.earnFilter.value,
        userId,
      });

      if (response.data) {
        setData({
          ...data,
          [ProfileTabEnum.Earn]: response.data.earnings,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = () => {
    toast({
      title: 'Loading...',
    });

    if (tab === ProfileTabEnum.All) {
      fetchUser();
    }

    if (tab === ProfileTabEnum.Own) {
      fetchOwn();
    }

    if (tab === ProfileTabEnum.Created) {
      fetchCreated();
    }

    if (tab === ProfileTabEnum.Curation) {
      fetchCuration();
    }

    if (tab === ProfileTabEnum.Activity) {
      fetchActivity();
    }

    if (tab === ProfileTabEnum.Favorite) {
      fetchFav();
    }

    if (tab === ProfileTabEnum.Order) {
      fetchOrders();
    }

    if (tab === ProfileTabEnum.Earn) {
      fetchEarnings();
    }
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debouncedFilter, userId]);

  return (
    <div className="flex flex-col gap-y-4">
      {/* Filters logic */}
      <div className="flex sm:flex-row flex-col sm:items-center gap-4 my-4">
        <div className="flex gap-x-2 px-5 py-3 items-center border border-white/[12%] bg-[#232323]/[14%] rounded-xl w-full">
          <Search className="w-5 h-5 text-white" />
          <input
            placeholder="Search by artwork or artist..."
            className="w-full bg-transparent border-none outline-none focus:outline-none azeret-mono-font placeholder:text-sm placeholder:text-white/50 text-white/50"
            value={filters.searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFilters({
                ...filters,
                searchInput: e.target.value,
              });
            }}
          />
        </div>
        <div className="sm:w-full max-w-[18rem] relative flex bg-[#232323]/[14%] rounded-xl min-w-[18rem] justify-between items-center border border-white/10">
          <Popover
            open={categoryActive}
            onOpenChange={(val) => {
              setCategoryActive(val);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full font-extrabold text-sm justify-between bg-transparent m-0 border-0 hover:bg-transparent"
              >
                <div className="flex items-center gap-x-2 flex-1">
                  <Archive className="w-5 h-5" />
                  <span>{filters[categoryTab]?.label}</span>
                </div>
                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[18rem] p-0 ">
              <Command className="w-full bg-[#121212] border-white/10">
                <CommandList>
                  <CommandGroup>
                    {categoryList &&
                      categoryList.map((item, index) => (
                        <CommandItem
                          key={index}
                          value={item.label}
                          onSelect={() => {
                            setCategoryActive(false);
                            if (isEarn) {
                              setFilters({
                                ...filters,
                                earnFilter: {
                                  label: item.label,
                                  value: item.value,
                                  param: item.param,
                                },
                              });
                            } else {
                              setFilters({
                                ...filters,
                                [categoryTab]: {
                                  label: item.label,
                                  value: item.value,
                                  param: item.param,
                                },
                              });
                            }
                          }}
                          className="text-sm cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              filters[categoryTab]?.label === item.label
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {/* User section */}
      {tab === ProfileTabEnum.All && data?.[ProfileTabEnum.All] ? (
        <div className="grid grid-cols-1 xss:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 my-4">
          {data?.[ProfileTabEnum.All]?.length > 0 ? (
            data?.[ProfileTabEnum.All]?.map((item: any, index: number) => {
              return (
                <Link key={index} href={`/nft/${item._id}`}>
                  <NftCard data={item} />
                </Link>
              );
            })
          ) : (
            <div className="w-full col-span-12">
              <NoItem />
            </div>
          )}
        </div>
      ) : null}

      {/* Owned Section */}
      {tab === ProfileTabEnum.Own && data?.[ProfileTabEnum.Own] ? (
        <div className="grid grid-cols-1 xss:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 my-4">
          {data?.[ProfileTabEnum.Own]?.length > 0 ? (
            data?.[ProfileTabEnum.Own]?.map((item: any, index: number) => {
              return (
                <Link key={index} href={`/nft/${item._id}`}>
                  <NftCard data={item} />
                </Link>
              );
            })
          ) : (
            <div className="w-full col-span-12">
              <NoItem />
            </div>
          )}
        </div>
      ) : null}
      {/* {tab === ProfileTabEnum.Own && data?.[ProfileTabEnum.Own] ? (
        <div className="grid grid-cols-12 flex-wrap justify-center gap-5 my-4">
          {data?.[ProfileTabEnum.Own]?.length > 0 ? (
            data?.[ProfileTabEnum.All].map((item: any, index: number) => {
              return (
                <Link
                  className="col-span-12 xss:col-span-2 md:col-span-3 xl:col-span-4"
                  key={index}
                  href={`/nft/${item._id}`}
                >
                  <NftCard data={item} />
                </Link>
              );
            })
          ) : (
            <div className="w-full col-span-12">
              <NoItem />
            </div>
          )}
        </div>
      ) : null} */}

      {/* Created section */}
      {tab === ProfileTabEnum.Created && data?.[ProfileTabEnum.Created] ? (
        <div className="grid grid-cols-1 xss:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 my-4">
          {data?.[ProfileTabEnum.Created]?.length > 0 ? (
            data?.[ProfileTabEnum.Created]?.map((item: any, index: number) => {
              return (
                <Link key={index} href={`/nft/${item._id}`}>
                  <NftCard data={item} />
                </Link>
              );
            })
          ) : (
            <div className="w-full col-span-12">
              <NoItem />
            </div>
          )}
        </div>
      ) : null}
      {/* {tab === ProfileTabEnum.Created && data?.[ProfileTabEnum.Created] ? (
        <div className="grid grid-cols-12 flex-wrap justify-center gap-5 my-4">
          {data?.[ProfileTabEnum.Created]?.length > 0 ? (
            data?.[ProfileTabEnum.Created]?.map((item: any, index: number) => {
              return (
                <Link
                  className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-3"
                  key={index}
                  href={`/nft/${item._id}`}
                >
                  <NftCard data={item} />
                </Link>
              );
            })
          ) : (
            <div className="w-full col-span-12">
              <NoItem />
            </div>
          )}
        </div>
      ) : null} */}

      {/* Curation section */}
      {tab === ProfileTabEnum.Curation && data?.[ProfileTabEnum.Curation] ? (
        <div className="grid grid-cols-12 flex-wrap justify-center gap-5 my-4">
          {data?.[ProfileTabEnum.Curation]?.length > 0 ? (
            data?.[ProfileTabEnum.Curation]?.map((item: any, index: number) => {
              return (
                <Link
                  className="col-span-12 xss:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-3"
                  key={index}
                  href={`/dashboard/curation/${item._id}`}
                >
                  <CurationCard data={item} />
                </Link>
              );
            })
          ) : (
            <div className="w-full col-span-12">
              <NoItem />
            </div>
          )}
        </div>
      ) : null}

      {/* Activity section */}
      {tab === ProfileTabEnum.Activity && data?.[ProfileTabEnum.Activity] && (
        <ActivityTab activity={data?.activity ?? []} />
      )}

      {/* Favorite section */}
      {tab === ProfileTabEnum.Favorite && data?.[ProfileTabEnum.Favorite] ? (
        <div className="flex flex-col gap-y-5">
          <div className="flex gap-x-5 my-3">
            <Label
              onClick={() => setFavType('nft')}
              className={cn(
                `font-extrabold`,
                favType === 'nft' ? 'text-neon underline' : '',
              )}
            >
              RWA
            </Label>
            <Label
              onClick={() => setFavType('curation')}
              className={cn(
                `font-extrabold`,
                favType === 'curation' ? 'text-neon underline' : '',
              )}
            >
              Curation
            </Label>
            <Label
              onClick={() => setFavType('user')}
              className={cn(
                `font-extrabold`,
                favType === 'user' ? 'text-neon underline' : '',
              )}
            >
              User
            </Label>
          </div>

          <div className="grid grid-cols-12 flex-wrap justify-center gap-5 my-4">
            {favType === 'nft' && data?.[ProfileTabEnum.Favorite]?.likedNft ? (
              data?.[ProfileTabEnum.Favorite]?.likedNft?.length > 0 ? (
                data?.[ProfileTabEnum.Favorite]?.likedNft?.map(
                  (item: any, index: number) => {
                    return (
                      <Link
                        className="col-span-12 xss:col-span-6 md:col-span-4 xl:col-span-3"
                        key={index}
                        href={`/nft/${item._id}`}
                      >
                        <NftCard data={item} />
                      </Link>
                    );
                  },
                )
              ) : (
                <div className="w-full col-span-12">
                  <NoItem />
                </div>
              )
            ) : null}

            {favType === 'curation' &&
            data?.[ProfileTabEnum.Favorite]?.likedCuration ? (
              data?.[ProfileTabEnum.Favorite]?.likedCuration?.length > 0 ? (
                data?.[ProfileTabEnum.Favorite]?.likedCuration?.map(
                  (item: any, index: number) => {
                    return (
                      <Link
                        className="col-span-12 xss:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-3"
                        key={index}
                        href={`/dashboard/curation/${item.id}`}
                      >
                        <CurationCard data={item} />
                      </Link>
                    );
                  },
                )
              ) : (
                <div className="w-full col-span-12">
                  <NoItem />
                </div>
              )
            ) : null}

            {favType === 'user' &&
            data?.[ProfileTabEnum.Favorite]?.likedArtist ? (
              data?.[ProfileTabEnum.Favorite]?.likedArtist?.length > 0 ? (
                data?.[ProfileTabEnum.Favorite]?.likedArtist?.map(
                  (item: any, index: number) => {
                    return (
                      <Link
                        className="col-span-12 xss:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-3 2xl:col-span-3"
                        key={index}
                        href={`/dashboard/profile/${item._id}`}
                      >
                        <ProfileArtistCard
                          key={index}
                          image={item?.avatar?.url ? item.avatar.url : ''}
                          title={item.username}
                          subtitle2={item?.bio}
                        />
                      </Link>
                    );
                  },
                )
              ) : (
                <div className="w-full col-span-12">
                  <NoItem />
                </div>
              )
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Orders section */}
      {tab === ProfileTabEnum.Order && (
        <OrderTab orders={data?.[ProfileTabEnum.Order]} />
      )}

      {/* Earn section */}
      {tab === ProfileTabEnum.Earn ? (
        <EarnTab earn={data?.[ProfileTabEnum.Earn]} />
      ) : null}
    </div>
  );
}
