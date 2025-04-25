'use client';

import { cn } from '@/lib/utils';
import { magazineLink } from '@/utils/constants';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AppreciationIcon from '../Icons/appreciation';
import CarbonBoard from '../Icons/carbon-bord';
import CurationIcon from '../Icons/coration-icon';
import CreateIcon from '../Icons/create-icon';
import FavoriteIcon from '../Icons/favorite';
import HelpIcon from '../Icons/help';
import MyOrderIcon from '../Icons/my-order';
import PencilIcon from '../Icons/pencil';
import ProfileIcon from '../Icons/profile';
import SettingsIcon from '../Icons/settings';

const marketPlaceLinks = [
  {
    name: 'Appreciation',
    value: 'appreciate',
    icon: (props) => <AppreciationIcon {...props} />,
  },
  {
    name: 'Curation',
    value: 'curation',
    icon: (props) => <CurationIcon {...props} />,
  },
  {
    name: 'Magazine',
    value: 'magazine',
    icon: (props) => <PencilIcon {...props} />,
    link: magazineLink,
  },
  {
    name: 'How to work',
    value: 'how-to-work',
    link: 'https://help.vault-x.io/en-us',
    icon: (props) => <CarbonBoard {...props} />,
  },
];

const accountLinks = [
  {
    name: 'My Profile',
    value: 'profile',
    icon: (props) => <ProfileIcon {...props} />,
  },
  {
    name: 'My favorite',
    value: 'profile?tab=fav',
    icon: (props) => <FavoriteIcon {...props} />,
  },
  {
    name: 'My Order',
    value: 'profile?tab=order',
    icon: (props) => <MyOrderIcon {...props} />,
  },
  {
    name: 'Settings',
    value: 'settings',
    icon: (props) => <SettingsIcon {...props} />,
  },
  {
    name: 'Help Center',
    value: 'help-center',
    link: 'https://help.vault-x.io/en-us',
    icon: (props) => <HelpIcon {...props} />,
  },
];

export default function SideBar({
  className,
  hide,
}: {
  className?: string;
  hide?: boolean;
}) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [tab, setTab] = useState('appreciate');
  const changeTab = (tab: string) => {
    setTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div
      className={`bg-[#161616] fixed left-0 top-0 h-screen z-10 w-[280px] ${className}`}
    >
      <Link
        href="/"
        className="px-10 flex items-center justify-center py-5 mx-auto"
      >
        <Image
          quality={100}
          src="/logo.png"
          width={164}
          height={32}
          alt="logo"
        />
      </Link>
      {hide ? null : (
        <>
          <div className="w-[80%] mx-auto">
            <hr className="border-[#353535]" />
          </div>
          <Link
            className="flex items-center justify-center gap-x-2 my-7 py-3 px-3 bg-neon rounded-xl w-[80%] mx-auto"
            href="/dashboard/create"
          >
            <span className="font-bold text-[#141414] text-[16px]">Create</span>
            <CreateIcon />
          </Link>
          <div className="w-[80%] mx-auto">
            <hr className="border-[#353535]" />
          </div>
        </>
      )}
      <div
        className={cn(
          'flex flex-col text-white py-6 sidebar_list max-h-[70vh] overflow-auto',
          hide ? 'max-h-screen' : '',
        )}
      >
        <p className="text-sm font-extrabold text-white/40 pl-7 font-Inter mb-4">
          Marketplace
        </p>
        {marketPlaceLinks.map((link, index) => {
          return (
            <Link
              href={link?.link ? link?.link : `/dashboard/${link.value}`}
              key={index}
              target={link?.link ? '_blank' : '_self'}
              className={cn(
                'flex items-center pl-7 gap-x-3 my-3 cursor-pointer hover:text-[#ddf247] font-medium relative transition-all duration-300',
                pathname === `/dashboard/${link.value}`
                  ? 'text-[#ddf247] before:absolute before:w-1 before:h-full before:bg-[#ddf247] before:top-0 before:left-0 before:rounded-r-lg '
                  : '',
              )}
            >
              <link.icon
                className="w-5 h-5"
                stroke={pathname === `/dashboard/${link.value}` && '#ddf247'}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
        <p className="text-sm font-extrabold text-white/40 pl-7 font-Inter mb-4 mt-6">
          Account
        </p>
        {accountLinks.map((link, index) => {
          return (
            <Link
              key={index}
              className={cn(
                'flex items-center pl-7 gap-x-3 my-3 cursor-pointer hover:text-[#ddf247] relative transition-all duration-300',
                pathname === `/dashboard/${link.value}`
                  ? 'text-[#ddf247] before:absolute before:w-1 before:h-full before:bg-[#ddf247] before:top-0 before:left-0 before:rounded-r-lg'
                  : '',
              )}
              target={link?.link ? '_blank' : '_self'}
              href={link?.link ? link?.link : `/dashboard/${link.value}`}
              // onClick={() => {
              //   if (pathname !== `/dashboard/${link.value}`)
              //     window.location.href = `/dashboard/${link.value}`;
              // }}
            >
              {/* <Image 
quality={100}
                src={link.icon}
                width={20}
                height={20}
                alt={link.name}
                className={cn(
                  'hover:stroke-[#ddf247]',
                  pathname === `/dashboard/${link.value}` && 'icon-svg',
                )}
              /> */}
              <link.icon
                className="w-5 h-5"
                stroke={pathname === `/dashboard/${link.value}` && '#ddf247'}
              />
              <span>{link.name}</span>

              {/* {hovered === link.value ? (
                <Image 
quality={100}
                  src="/icons/line_shape.svg"
                  height={10}
                  width={5}
                  alt="line"
                  className="absolute -left-8"
                />
              ) : null} */}
            </Link>
          );
        })}
      </div>
      <p className="pl-8 text-[#ffffff53] text-xs mt-5 leading-[20px]">
        © {new Date().getFullYear()} MonsterX
      </p>
    </div>
  );
}
