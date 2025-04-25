import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  collectionServices,
  IGetSearchResponse,
} from '@/services/legacy/supplier';
import { CurationType, NFTItemType, UserType } from '@/types';
import { SearchIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { shortenAddress } from 'thirdweb/utils';
import { useDebounce } from 'use-debounce';

interface ISearchDropDownProps {
  searchText: string;
}

interface IButtonProps {
  type: 'artist' | 'nft' | 'curation' | 'user';
  url: string;
  img: string;
  name: string;
  price?: number;
  symbol?: string;
}

const SearchDropDown = ({ searchText }: ISearchDropDownProps) => {
  const [artists, setArtists] = useState<Array<Partial<NFTItemType>>>([]);
  const [nfts, setNFTs] = useState<Array<Partial<NFTItemType>>>([]);
  const [curations, setCurations] = useState<Array<Partial<CurationType>>>([]);
  const [users, setUsers] = useState<Array<Partial<UserType>>>([]);

  useEffect(() => {
    const getSearchResult = () => {
      collectionServices
        .getSearch({ filterString: searchText })
        .then((searchResponse: IGetSearchResponse) => {
          if (searchResponse.success) {
            setArtists(searchResponse.artistsNfts);
            setNFTs(searchResponse.nfts);
            setCurations(searchResponse.curations);
            setUsers(searchResponse.users);
          }
        })
        .catch((err) => {
          console.log('Error in search result', err);
        });
    };

    getSearchResult();
  }, [searchText]);
  const ButtonContainer = (buttonInfo: IButtonProps) => {
    return (
      <>
        <Link href={buttonInfo.url}>
          <div className="w-full h-[81px] py-4 relative cursor-pointer">
            <div className="left-1 top-0 justify-start items-center gap-3.5 flex">
              <div className="w-[66px] h-[66px] relative rounded-xl">
                <Image
                  quality={100}
                  width={66}
                  height={66}
                  className={cn(
                    'shrink-0 aspect-square',
                    buttonInfo.type === 'user' ? 'rounded-full' : 'rounded-xl',
                  )}
                  src={buttonInfo.img}
                  alt="default_profile"
                />
              </div>
              <div className="flex-col justify-start items-start gap-[5px] flex">
                <div className="text-white text-sm font-semibold font-['Azeret Mono'] leading-snug">
                  {buttonInfo.name}
                </div>
                {buttonInfo.price ? (
                  <div className="text-white text-sm font-normal font-['Azeret Mono'] leading-snug">
                    Price: {buttonInfo.price} MATIC
                  </div>
                ) : null}
                {buttonInfo.symbol ? (
                  <div className="text-white text-sm font-normal font-['Azeret Mono'] leading-snug">
                    {buttonInfo.symbol}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Link>
      </>
    );
  };

  const ArtistContainer = () => (
    <div className="flex flex-col pb-2 ml-3 w-full max-h-[10rem] overflow-auto">
      {artists.map((artist) => (
        <ButtonContainer
          key={artist?._id}
          type="artist"
          name={artist?.artist ?? ''}
          url={`/nft/${artist?._id}`}
          img={artist?.cloudinaryUrl ?? ''}
        />
      ))}
    </div>
  );

  const NFTContainer = () => (
    <div className="flex flex-col pb-2 ml-3 w-full">
      {nfts.map((nft) => (
        <ButtonContainer
          key={nft?._id}
          type="nft"
          name={nft?.name ?? ''}
          url={`/nft/${nft?._id}`}
          img={nft?.cloudinaryUrl ?? ''}
          price={nft?.price ?? 0}
        />
      ))}
    </div>
  );

  const CurationContainer = () => (
    <div className="flex-col pb-2 ml-3 w-full">
      {curations.map((curation) => (
        <ButtonContainer
          key={curation?._id}
          type="curation"
          url={`/dashboard/curation/${curation?._id}`}
          img={curation?.logo ?? ''}
          name={curation?.name ?? ''}
          symbol={curation?.symbol ?? ''}
        />
      ))}
    </div>
  );

  const UserContainer = () => (
    <div className="flex flex-col pb-2 ml-3 w-full">
      {users.map((user) => (
        <ButtonContainer
          key={user?._id}
          type="user"
          url={`/dashboard/profile/${user?._id}`}
          img={
            user?.avatar?.url ? user.avatar.url : '/icons/default_profile.svg'
          }
          name={
            user?.username ? user.username : shortenAddress(user?.wallet) ?? ''
          }
        />
      ))}
    </div>
  );

  return (
    <Tabs
      className="absolute left-0 top-14 w-full pl-2 pr-[8.50px] pb-3 pt-1.5 bg-neutral-800 rounded-xl flex-col justify-start items-start gap-[18px] inline-flex 
    z-10 text-white transition-transform duration-500 transform"
      defaultValue="artist"
    >
      <TabsList className="grid w-full grid-cols-4 text-white">
        <TabsTrigger value="artist">Artist</TabsTrigger>
        <TabsTrigger value="nft">RWA</TabsTrigger>
        <TabsTrigger value="curation">Curation</TabsTrigger>
        <TabsTrigger value="user">Users</TabsTrigger>
      </TabsList>
      <TabsContent value="artist" className="w-full pr-4">
        <ArtistContainer />
      </TabsContent>
      <TabsContent value="nft" className="w-full pr-4">
        <NFTContainer />
      </TabsContent>
      <TabsContent value="curation" className="w-full pr-4">
        <CurationContainer />
      </TabsContent>
      <TabsContent value="user" className="w-full pr-4">
        <UserContainer />
      </TabsContent>
    </Tabs>
  );
};

export function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedText] = useDebounce(searchText, 1000);
  function toggle(
    e:
      | React.FocusEvent<HTMLInputElement>
      | null
      | React.MouseEvent<HTMLInputElement>,
  ) {
    setOpen(e !== null && e.target === inputRef.current);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative hidden h-full xl:block" ref={searchRef}>
      <div className="min-w-[450px] h-full px-[26px] py-3 bg-[#232323] rounded-xl justify-start items-center gap-7 inline-flex text-white">
        <input
          ref={inputRef}
          className="flex-1 w-full bg-[#232323] text-opacity-50 rounded-lg py-2 azeret-mono-font focus:outline-none focus:border-bg-neutral-800 placeholder:text-sm placeholder:text-white/[53%] text-white/[53%] font-normal"
          type="text"
          placeholder="Search artwork, collection..."
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={toggle}
          onClick={toggle}
        />
        <SearchIcon size={16} className="cursor-pointer" />
      </div>
      {open && <SearchDropDown searchText={debouncedText} />}
    </div>
  );
}
