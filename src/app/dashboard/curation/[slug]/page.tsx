/* eslint-disable @next/next/no-img-element */
'use client';

import NftCard from '@/app/components/Cards/NftCard';
import NoItem from '@/app/components/Cards/NoItem';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';
import EthereumIcon from '@/app/components/Icons/etheriam-icon';
import PriceWithCurrency from '@/app/components/Modules/nft/common/PriceWithCurrency';
import { GetIcon } from '@/app/components/Modules/nft/GetIcon';
import { BaseDialog } from '@/app/components/ui/BaseDialog';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getExplorerURL } from '@/lib/helper';
import { cn, truncate } from '@/lib/utils';
import { FavoriteService } from '@/services/legacy/FavoriteService';
import { collectionServices } from '@/services/legacy/supplier';
import { ensureValidUrl, getYouTubeVideoId, trimString } from '@/utils/helpers';
import {
  Archive,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Edit,
  Facebook,
  Globe,
  Heart,
  Instagram,
  Search,
  Twitter,
} from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

const badges = [
  {
    label: 'Items',
    value: 'items',
  },
  {
    label: 'Activity',
    value: 'activity',
  },
];

const profileFilters = [
  {
    label: 'Price: high to low',
    value: -1,
    param: 'price',
  },
  {
    label: 'Price: low to high',
    value: 1,
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
  {
    label: 'Highest Last Sale',
    value: -1,
    param: 'price',
  },
  {
    label: 'NFC Minted',
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

export default function Page({ params }: { params: { slug: string } }) {
  const [loadMore, setLoadMore] = useState(false);
  const [filterbadge, setFilterBadge] = useState(badges[0].value);
  const favoriteService = new FavoriteService();
  const { user, mediaImages } = useGlobalContext();
  const { toast } = useToast();

  const [showLess, setShowLess] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [curation, setCuration] = useState<any>({});
  const [curationInfo, setCurationInfo] = useState<any>({});
  const [nfts, setNfts] = useState([]);
  const [filters, setFilters] = useState<any>({
    filterString: '',
    filter: {
      label: 'Recently Listed',
      param: 'updatedAt',
      value: -1,
    },
  });

  const [activities, setActivities] = useState<any[]>([]);

  const [debouncedFilter] = useDebounce(filters, 1000);

  const [debouncedLiked] = useDebounce(liked, 1000);

  const handleLike = async () => {
    try {
      if (!user) {
        toast({
          title: 'Please login',
          duration: 2000,
          variant: 'destructive',
        });
        return;
      }
      setLiked(!liked);
      if (!liked === true) setLikes(Number(likes) + 1);
      else if (!liked === false) setLikes(Number(likes) - 1);
    } catch (error) {
      console.log(error);
    }
  };

  const setMyLike = async () => {
    try {
      await favoriteService.handleLikeCollections({
        collectionId: params.slug,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setMyLike();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLiked]);

  const copyAddr = () => {
    navigator.clipboard.writeText(curation.owner?.wallet);
  };

  const fetchActivities = async () => {
    const {
      data: { activity },
    } = await collectionServices.getAllActivitiesCollection({
      collectionId: params.slug,
      searchInput: filters?.filterString,
      filterInput: filters?.filter,
    });
    setActivities(activity);
  };

  const fetchNFTs = async () => {
    const {
      data: { nfts },
    } = await collectionServices.getCollectionNfts({
      collectionId: params.slug,
      [filters.filter.param]: filters.filter.value,
    });

    setNfts(
      nfts.filter(
        (nft: any) =>
          nft?.active &&
          nft.owner?.active &&
          nft.curation &&
          nft.curation?.active,
      ),
    );
  };

  const fetchLikes = async () => {
    const {
      data: { totalLikedCollection },
    } = await favoriteService.getCollectionTotalLikes({
      collectionId: params.slug,
    });

    const {
      data: { favorite },
    } = await favoriteService.getUserReactionToCollection({
      collectionId: params.slug,
    });
    setLikes(totalLikedCollection);
    setLiked(favorite);
  };
  const fetchData = async () => {
    fetchActivities();
    fetchNFTs();
    fetchLikes();

    const curationRes = await collectionServices.getCollectionById(params.slug);
    const curationInfoRes = await collectionServices.getCollectionInfo(
      params.slug,
    );
    setCuration(curationRes.data.collection);
    setCurationInfo(curationInfoRes.data.collection);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  useEffect(() => {
    if (filterbadge === 'items') {
      setFilters({
        ...filters,
        filter: profileFilters[0],
      });
      fetchNFTs();
    } else if (filterbadge === 'activity') {
      setFilters({
        ...filters,
        filter: activityFilters[0],
      });
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilter, filterbadge]);

  if (!curation) return null;

  const description = truncate(
    curation.description?.replace(/\r\n|\n/g, '<br />'),
    150,
  );

  const checkAllSocialIconsArePresent = () => {
    return (
      curation?.twitter ||
      curation?.instagram ||
      curation?.facebook ||
      curation?.website
    );
  };

  return (
    <div className="flex flex-col gap-y-4 md:px-4 mx-2 md:mx-4 md:my-4">
      <div
        className={cn(
          'relative w-full transition-all duration-500 ease-in-out',
          'h-[340px]',
        )}
      >
        {curation?.bannerImage && (
          <Image
            quality={100}
            src={curation?.bannerImage}
            alt="hero"
            fill
            objectFit="cover"
            className="rounded-xl"
          />
        )}
        <div className="w-full absolute bottom-4 flex items-center justify-between px-5 z-20">
          {curation.owner?.wallet && (
            <div
              className="flex gap-x-3 h-10 text-sm items-center p-3 rounded-xl text-white border border-white/[29%] cursor-pointer mix-blend-difference"
              onClick={() => copyAddr()}
            >
              {trimString(curation.owner?.wallet)}
              <Copy className="w-5 h-5" />
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex px-5 py-3 h-12 rounded-full gap-x-3 p-3 border-[1.15px] items-center border-[#151515]/10 bg-black/[39%] cursor-pointer">
              <span className="font-medium">{likes}</span>
              <div className="checkmark" onClick={() => handleLike()}>
                <Heart
                  className={cn(
                    'w-5 h-5',
                    liked ? 'fill-white' : 'stroke-white',
                  )}
                />
              </div>
            </div>
            {user?.wallet &&
              String(user?.wallet).toLowerCase() ===
                String(curation.owner?.wallet)?.toLowerCase() && (
                <Link href={`/dashboard/curation/edit/${params.slug}`}>
                  <div className="flex px-5 py-3 gap-x-3 p-3 h-12 rounded-full border-[1.15px] items-center border-[#151515]/10 bg-black/[39%] cursor-pointer">
                    <Edit className="w-5 h-5" />
                    <div className="text-white text-base font-medium">Edit</div>
                  </div>
                </Link>
              )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-5 md:flex-row md:gap-x-4">
        <div className="w-full md:w-[60%] flex flex-col">
          <div className="md:my-5 md:gap-x-3">
            <div>
              <p
                className="text-[#ffffff53] text-sm font-normal azeret-mono-font"
                dangerouslySetInnerHTML={{
                  __html: loadMore
                    ? curation.description?.replace(/\r\n|\n/g, '<br />')
                    : description,
                }}
              ></p>
              {description?.length > 150 ? (
                <span
                  className="text-[#DDF247] cursor-pointer"
                  onClick={() => setLoadMore((prev) => !prev)}
                >
                  {loadMore ? 'View less...' : 'More...'}
                </span>
              ) : null}
            </div>
            <div className="flex sm:flex-row flex-col justify-between gap-4 mt-4">
              {curation?.youtube?.length > 0 &&
                curation?.youtube.map((item: any, index: number) => {
                  if (!item.title) return null;
                  const imageId = getYouTubeVideoId(item.url);
                  if (!imageId) return null;
                  return (
                    <div className="sm:w-1/2 flex flex-col gap-y-3" key={index}>
                      <BaseDialog
                        trigger={
                          <div className="relative cursor-pointer rounded-xl">
                            <img
                              src={`https://img.youtube.com/vi/${imageId}/0.jpg`}
                              className="w-full aspect-video xl:aspect-[4/2.5] rounded-2xl object-cover"
                              alt="youtube"
                              width={300}
                              height={311}
                            />
                            <Image
                              quality={100}
                              src="/icons/play.svg"
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                              alt="play"
                              width={40}
                              height={40}
                            />
                          </div>
                        }
                        className="bg-[#111111] lg:min-w-[1400px] max-h-[80%] w-full overflow-y-auto overflow-x-hidden"
                      >
                        <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
                          <iframe
                            width="979"
                            height="675"
                            src={`https://www.youtube.com/embed/${imageId}?autoplay=1`}
                            title="item.title"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="min-w-[979px] min-h-[675px]"
                          ></iframe>
                        </div>
                      </BaseDialog>
                      <p className="text-center text-2xl font-medium font-satoshi truncate">
                        {item.title}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-y-4 lg:gap-y-7 md:w-[40%] md:py-4">
          <div className="flex flex-col border bg-white/[1%] border-white/20 rounded-lg">
            <div className="px-4 py-4 flex justify-between items-center">
              <span className="text-base lg:text-lg font-medium azeret-mono-font text-[#96989B]">
                Items
              </span>
              <span className="font-bold">{curationInfo?.nftCount}</span>
            </div>
            <hr className="border-dashed border-white/10" />
            <div className="px-4 py-4 flex justify-between items-center">
              <span className="text-base lg:text-lg font-medium azeret-mono-font text-[#96989B]">
                Artist
              </span>
              <span className="font-bold">{curationInfo?.artistCount}</span>
            </div>
            <hr className="border-dashed border-white/10" />
            <div className="px-4 py-4 flex justify-between items-center">
              <span className="text-base lg:text-lg font-medium azeret-mono-font text-[#96989B]">
                Owner
              </span>
              <span className="font-bold">{curationInfo?.ownersCount}</span>
            </div>
            <hr className="border-dashed border-white/10" />
            <div className="px-4 py-4 flex justify-between items-center">
              <span className="text-base lg:text-lg font-medium azeret-mono-font text-[#96989B]">
                Volume Ranking
              </span>
              <span className="font-bold">{curationInfo?.volumeRanking}</span>
            </div>
          </div>
          <div
            className={cn(
              'w-full lg:h-20 py-4 rounded-xl border bg-white/[1%] border-white/20 flex justify-center items-center',
              checkAllSocialIconsArePresent() ? 'px-20' : '',
            )}
          >
            <div className="flex gap-x-8">
              {checkAllSocialIconsArePresent() ? (
                <>
                  {curation?.twitter && (
                    <div className="md:w-8 md:h-8 w-6 h-6 flex justify-center items-center border border-white rounded-full">
                      <Link href={ensureValidUrl(curation?.twitter)}>
                        <Globe className="md:w-5 w-4 h-4 md:h-5" />
                      </Link>
                    </div>
                  )}
                  {curation?.website && (
                    <div className="md:w-8 md:h-8 w-6 h-6 flex justify-center items-center border border-white rounded-full">
                      <Link href={ensureValidUrl(curation?.website)}>
                        <Twitter className="md:w-5 w-4 h-4 md:h-5 fill-white stroke-none" />
                      </Link>
                    </div>
                  )}
                  {curation?.facebook && (
                    <div className="md:w-8 md:h-8 w-6 h-6 flex justify-center items-center border border-white rounded-full">
                      <Link href={ensureValidUrl(curation?.facebook)}>
                        <Facebook className="md:w-5 w-4 h-4 md:h-5 fill-white stroke-none" />
                      </Link>
                    </div>
                  )}
                  {curation?.instagram && (
                    <div className="md:w-8 md:h-8 w-6 h-6 flex justify-center items-center border border-white rounded-full">
                      <Link href={ensureValidUrl(curation?.instagram)}>
                        <Instagram className="md:w-5 w-4 h-4 md:h-5 " />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="azeret-mono-font text-center lg:text-lg text-[#96989B] px-2 md:text-base text-sm">
                  The owner has no registered SNS.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div
          data-aos={showLess ? 'fade-up' : 'fade-down'}
          className={cn(
            'rounded-lg w-full transition-all duration-500 ease-in-out relative data-[aos="fade-up"]:h-[200px] data-[aos="fade-down"]:h-full data-[aos="fade-up"]:before:absolute data-[aos="fade-up"]:before:top-0 data-[aos="fade-up"]:before:left-0 data-[aos="fade-up"]:before:w-full data-[aos="fade-up"]:before:h-full data-[aos="fade-up"]:before:z-10 data-[aos="fade-up"]:before:bg-gradient-to-b data-[aos="fade-up"]:before:to-[#111] data-[aos="fade-up"]:before:from-[#111]/[23%] data-[aos="fade-up"]:before:content-[""] overflow-hidden',
            Array.isArray(curation?.descriptionImage) &&
              curation?.descriptionImage.length === 2 &&
              'flex space-x-4',
          )}
        >
          <div
            className={cn(
              showLess ? 'w-full h-full' : 'min-h-[340px] w-full',
              curation?.descriptionImage?.length === 2 &&
                'flex items-start gap-1',
            )}
          >
            {Array.isArray(curation?.descriptionImage) &&
              curation?.descriptionImage.map((image, index) => (
                <div
                  className={cn(
                    'w-full',
                    curation?.descriptionImage?.length === 2 && 'md:w-1/2',
                  )}
                  key={index}
                >
                  <img
                    src={image}
                    alt="hero"
                    className="rounded-xl w-full h-full"
                    width={'100%'}
                    height={'100%'}
                    // quality={100}
                  />
                </div>
              ))}
          </div>
          {showLess ? (
            <ChevronsDown
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 text-[#DDF247] z-20"
              onClick={() => {
                setShowLess(!showLess);
              }}
            />
          ) : (
            <ChevronsUp
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 text-[#DDF247] z-20"
              onClick={() => {
                setShowLess(!showLess);
              }}
            />
          )}
        </div>
      </div>
      <div className="flex gap-x-3 flex-wrap mt-16">
        {badges.map((badge, index) => {
          return (
            <Badge
              key={index}
              onClick={() => setFilterBadge(badge.value)}
              className={`px-4 py-3 rounded-xl font-extrabold text-sm border border-white/[12%] cursor-pointer ${
                filterbadge === badge.value
                  ? 'bg-neon text-black hover:text-black hover:bg-[#ddf247]'
                  : 'hover:bg-[#232323] bg-transparent text-white'
              }`}
            >
              {badge.label}
            </Badge>
          );
        })}
      </div>
      <div className="flex flex-col gap-y-4">
        {/* Filters logic */}
        <div className="flex sm:flex-row flex-col gap-4 sm:my-4">
          <div className="flex gap-x-2 items-center bg-[#232323]/[14%]  border border-white/[12%] rounded-xl px-6 py-[15px] w-full">
            <Search className="w-5 h-5 text-white" />
            <input
              placeholder="Search by name or trait..."
              className="w-full text-sm text-white whitespace-nowrap/[53%] placeholder:text-white/[53%] placeholder:text-sm bg-transparent border-none outline-none focus:outline-none azeret-mono-font"
              value={filters.filterString}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFilters({
                  ...filters,
                  filterString: e.target.value,
                });
              }}
            />
          </div>
          {filterbadge === 'items' && (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex gap-x-1 rounded-[12px] min-w-[14rem] max-w-[16rem] min-h-12 sm:min-h-[52px] max-h-12 h-full items-center p-3 py-[10px] bg-transparent text-white border border-white/[12%]">
                <div className="flex items-center flex-1 gap-x-2">
                  <Archive className="w-4 h-4" />
                  <span className="font-extrabold text-xs">
                    {filters?.filter
                      ? filters.filter.label
                      : profileFilters?.[0].label || 'Price: high to low'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[14rem] max-w-[16rem]">
                <DropdownMenuGroup>
                  {profileFilters.map((item, index: number) => (
                    <DropdownMenuItem
                      onClick={() => {
                        const filteredProfile = profileFilters.filter(
                          (profile) => profile.label === item?.label,
                        )?.[0];
                        if (filteredProfile) {
                          setFilters({
                            ...filters,
                            filter: filteredProfile,
                          });
                        }
                      }}
                      key={index}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* {filterbadge === 'items' && (
            <Select
              onValueChange={(value: string) => {
                if (filterbadge === 'items') {
                  {
                    const filteredProfile = profileFilters.filter(
                      (profile) => profile.label === value,
                    )?.[0];
                    if (filteredProfile) {
                      setFilters({
                        ...filters,
                        filter: filteredProfile,
                      });
                    }
                  }
                }
              }}
              // value={profileFilters[0].label}
              defaultValue={profileFilters?.[0].label}
            >
              <SelectTrigger className="relative flex rounded min-w-[18rem] max-w-[20rem] justify-between items-center px-3 py-2 bg-transparent text-white pl-[37px] border border-[#FFFFFF1F]">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectGroup>
                  {profileFilters.map((filter, index: number) => (
                    <SelectItem value={filter.label} key={index}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )} */}
          {/* <Select
            onValueChange={(value: string) => {
              const filteredProfile = activityFilters.filter(
                (profile) => profile.label === value,
              )?.[0];
              if (filteredProfile) {
                setFilters({
                  ...filters,
                  filter: filteredProfile,
                });
              }
            }}
            // value={profileFilters[0].label}
            defaultValue={activityFilters?.[0].label}
          >
            <SelectTrigger className="relative flex rounded min-w-[18rem] max-w-[20rem] justify-between items-center px-3 py-2 bg-transparent text-white pl-[37px] border border-[#FFFFFF1F]">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectGroup>
                {activityFilters.map((filter, index: number) => (
                  <SelectItem value={filter.label} key={index}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select> */}
          {filterbadge === 'activity' && (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex gap-x-1 rounded-[12px] min-w-[14rem] max-w-[16rem] h-full items-center p-3 py-[10px] bg-transparent text-white border border-white/[12%]">
                <div className="flex items-center flex-1 gap-x-2">
                  <Archive className="w-4 h-4" />
                  <span className="font-extrabold text-xs">
                    {filters?.filter
                      ? filters.filter.label
                      : activityFilters?.[0].label || 'Price: high to low'}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-white/30" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[14rem] max-w-[16rem]">
                <DropdownMenuGroup>
                  {activityFilters.map((item, index: number) => (
                    <DropdownMenuItem
                      onClick={() => {
                        const filteredProfile = activityFilters.filter(
                          (profile) => profile.label === item?.label,
                        )?.[0];
                        if (filteredProfile) {
                          setFilters({
                            ...filters,
                            filter: filteredProfile,
                          });
                        }
                      }}
                      key={index}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* User section */}
        {filterbadge === 'items' ? (
          <div className="grid grid-cols-12 gap-4">
            {nfts?.length > 0 ? (
              nfts.map((item: any, index: number) => {
                return (
                  <Link
                    key={index}
                    href={`/nft/${item._id}`}
                    className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3"
                  >
                    <NftCard data={item} className="w-full" />
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
        {filterbadge === 'activity' ? (
          <div>
            {activities?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[8%] font-extrabold">
                    <TableHead className="w-[100px] text-sm text-[#818181] whitespace-nowrap">
                      Event
                    </TableHead>
                    <TableHead className="text-sm text-[#818181] whitespace-nowrap">
                      Item
                    </TableHead>
                    <TableHead className="text-sm text-[#818181] whitespace-nowrap">
                      Price
                    </TableHead>
                    <TableHead className="text-sm text-[#818181] whitespace-nowrap">
                      From
                    </TableHead>
                    <TableHead className="text-sm text-[#818181] whitespace-nowrap">
                      To
                    </TableHead>
                    <TableHead className="text-sm text-[#818181] whitespace-nowrap">
                      Date
                    </TableHead>
                    <TableHead className="text-sm text-[#818181] whitespace-nowrap">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities?.map((item: any, index: number) => (
                    <TableRow
                      key={index}
                      className="border-white/[8%] font-normal azeret-mono-font"
                    >
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-x-2 items-center text-sm font-normal">
                          <GetIcon state={item.state} />
                          {item.actionHash ? (
                            <a
                              target="_blank"
                              className="font-normal"
                              href={getExplorerURL(
                                'transaction',
                                item?.actionHash,
                              )}
                            >
                              {item.state}
                            </a>
                          ) : (
                            <span className="text-sm font-normal">
                              {item.state}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-x-3 w-max">
                        <Link href={`/nft/${item.nftId?._id}`}>
                          <div className="flex items-center gap-x-2">
                            <Image
                              src={item.nftId.cloudinaryUrl}
                              className="w-10 h-10 lg:w-12 lg:h-12 object-contain rounded aspect-square"
                              alt="nft"
                              width={48}
                              height={48}
                              quality={100}
                            />
                            <span
                              className="azeret-mono-font text-sm font-medium whitespace-nowrap max-w-60 overflow-hidden text-ellipsis"
                              title={item.nftId.name}
                            >
                              {item.nftId.name}
                            </span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {item.price ? <EthereumIcon /> : null}
                          <PriceWithCurrency
                            price={item.price}
                            currency={item.currency}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="azeret-mono-font text-sm text-[#DDF247] whitespace-nowrap">
                        {item?.from?.username
                          ? item.from.username
                          : item?.from?.wallet
                            ? trimString(item.from.wallet)
                            : item?.fromWallet
                              ? trimString(item?.fromWallet)
                              : '-/-'}
                      </TableCell>
                      <TableCell className="azeret-mono-font text-sm text-[#DDF247] whitespace-nowrap">
                        {item?.to?.username
                          ? item?.to?.username
                          : item?.to?.wallet
                            ? trimString(item.to.wallet)
                            : item?.toWallet
                              ? trimString(item?.toWallet)
                              : '-/-'}
                      </TableCell>
                      <TableCell className="azeret-mono-font text-sm text-white whitespace-nowrap">
                        {moment(item.createdAt).format('DD MMM, YY')}
                      </TableCell>
                      <TableCell className="text-right azeret-mono-font text-sm text-white whitespace-nowrap">
                        {moment(item.createdAt).format('hh:mm A')}
                        {/* {item?.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString()
                          : '-/-'} */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="w-full col-span-12">
                <NoItem />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
