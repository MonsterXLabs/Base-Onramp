'use client';

import ProfileTabs, {
  ProfileTabEnum,
} from '@/app/components/Modules/profile/ProfileTabs';
import { globalUserState } from '@/hooks/recoil-state';
import { useToast } from '@/hooks/use-toast';
import { cn, truncate } from '@/lib/utils';
import { FavoriteService } from '@/services/legacy/FavoriteService';
import { UserType } from '@/types';
import { trimString } from '@/utils/helpers';
import { Copy, Heart } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import HorizontalScrollWithArrows from './tabs';

const badges = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Owned',
    value: 'owned',
  },
  {
    label: 'Created',
    value: 'created',
  },
  {
    label: 'Curation',
    value: 'curation',
  },
  {
    label: 'Activity',
    value: 'activity',
  },
  {
    label: 'Favorite',
    value: 'fav',
  },
  {
    label: 'Order',
    value: 'order',
  },
  {
    label: 'Earn',
    value: 'earn',
  },
];

interface ProfileProps {
  user: UserType | null;
}

const Profile: React.FC<ProfileProps> = ({ user }: ProfileProps) => {
  const searchParams = useSearchParams();
  const favoriteService = new FavoriteService();
  const [loadMore, setLoadMore] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [filterbadge, setFilterBadge] = useState(badges[0].value);
  const { toast } = useToast();
  const globalUser = useRecoilValue(globalUserState);

  useEffect(() => {
    const getTab = searchParams.get('tab');
    if (getTab) setFilterBadge(getTab);
    else setFilterBadge('all');
  }, [searchParams]);

  const handleLike = async () => {
    try {
      if (!globalUser) {
        toast({
          title: 'Please login',
          duration: 2000,
          variant: 'destructive',
        });
        return;
      }
      const value = !liked;
      setLiked(value);
      if (value === true) setLikes(Number(likes) + 1);
      else if (value === false) setLikes(Number(likes) - 1);
      setMyLike();
    } catch (error) {
      console.log(error);
    }
  };

  const setMyLike = async () => {
    try {
      await favoriteService.handleLikeArtists({
        artistId: user?._id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const copyAddr = () => {
    navigator.clipboard.writeText(user?.wallet);
    toast({
      title: 'Copied to clipboard',
      duration: 2000,
    });
  };

  const fetchData = async () => {
    try {
      let artistId = null;

      artistId = user?._id;

      if (!artistId) return;

      const likedArtist = await favoriteService.getArtistsTotalLikes({
        artistId: artistId,
      });
      const reaction = await favoriteService.getUserReactionToArtist({
        artistId: artistId,
      });

      setLikes(likedArtist.data.totalLikedArtist);
      setLiked(reaction.data.favorite);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const description = truncate(user?.bio?.replace(/\r\n|\n/g, '<br />'), 300);

  return (
    <div className="flex flex-col gap-y-4 sm:px-2 md:px-4">
      <div className="relative w-full h-[340px]">
        <Image
          quality={100}
          src="/images/work-default.png"
          alt="hero"
          fill
          objectFit="cover"
          className="rounded-xl"
        />
        <div className="w-full absolute bottom-14 sm:bottom-4 flex justify-between px-5 z-20">
          <div>
            {user?.wallet && (
              <div
                className="flex gap-x-3 h-10 text-sm backdrop-blur-sm items-center p-3 rounded-xl text-white border border-white/[29%] cursor-pointer"
                onClick={() => copyAddr()}
              >
                {trimString(user?.wallet)}
                <Copy className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex w-[80px] px-[20px] py-[11px] rounded-[61px] gap-x-3 p-3 border items-center border-none bg-[#00000063] cursor-pointer">
            <span className="font-medium">{likes}</span>
            <div>
              <div
                className="checkmark"
                onClick={(e) => {
                  e.preventDefault();
                  handleLike();
                }}
              >
                <Heart
                  className={cn(
                    'w-5 h-5',
                    liked ? 'fill-white' : 'stroke-white',
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          `flex flex-col gap-y-6 justify-center items-center text-2xl font-medium relative w-full -mt-16 sm:-mt-20`,
          // user ? 'top-[-84px]' : 'top-[-48px]',
        )}
      >
        <div className="rounded-full w-24 h-24 sm:w-28 sm:h-28 border-[3px] border-[#DDF247] flex items-center justify-center">
          <Image
            quality={100}
            src={
              user?.avatar?.url ? user.avatar.url : '/icons/default_profile.svg'
            }
            alt={user?.username}
            className="w-full h-full rounded-full object-cover"
            width={112}
            height={112}
          />
        </div>
        <span className="text-xl sm:text-2xl manrope-font font-semibold">
          {user
            ? user?.username
              ? user?.username
              : trimString(user?.wallet)
            : null}
        </span>
      </div>
      <div className="w-full">
        {user?.bio && (
          <div className="w-full bg-[#232323] rounded-lg p-[15px] text-white/50 text-sm azeret-mono-font">
            <span
              className="text-[#ffffff53] text-sm font-normal azeret-mono-font"
              dangerouslySetInnerHTML={{
                __html: loadMore
                  ? description?.replace(/\r\n|\n/g, '<br />')
                  : description,
              }}
            ></span>
            {description?.length > 300 ? (
              <span
                className="text-[#DDF247] cursor-pointer inline-block ml-3"
                onClick={() => setLoadMore((prev) => !prev)}
              >
                {loadMore ? 'View less' : 'View More'}
              </span>
            ) : null}
          </div>
        )}
      </div>
      <HorizontalScrollWithArrows
        badges={badges}
        filterbadge={filterbadge}
        setFilterBadge={setFilterBadge}
      />
      {/* <div className="flex md:gap-3 lg:gap-5 flex-wrap mt-5 md:mt-10">
        {badges.map((badge, index) => {
          return (
            <Badge
              key={index}
              onClick={() => setFilterBadge(badge.value)}
              className={`px-3 py-3 rounded-xl font-extrabold text-[14px] border border-white/[12%] cursor-pointer ${
                filterbadge === badge.value
                  ? 'bg-neon text-black hover:text-black hover:bg-[#ddf247]'
                  : 'hover:bg-[#232323] bg-transparent text-white'
              }`}
            >
              {badge.label}
            </Badge>
          );
        })}
      </div> */}
      <ProfileTabs tab={filterbadge as ProfileTabEnum} userId={user?._id} />
    </div>
  );
};

export default Profile;
