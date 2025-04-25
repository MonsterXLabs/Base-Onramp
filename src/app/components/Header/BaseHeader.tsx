'use client';
import Logo from '@/components/Icon/Logo';
import WalletIcon from '@/components/Icon/WalletIcon';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { globalUserState } from '@/hooks/recoil-state';
import { client, wallets } from '@/lib/client';
import { cn } from '@/lib/utils';
import { magazineLink } from '@/utils/constants';
import { List } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useConnectModal } from 'thirdweb/react';
import NotificationSheet from '../Chat/notification/notificationSheet';
import { WalletAutoConnect } from '../provider/theme-provider';
import SideBar from '../ui/SideBar';
import Menu from './Menu';
import { Search } from './Search';

const socials = [
  {
    link: '',
    image: '/icons/facebook-tag.svg',
  },
  {
    link: '',
    image: '/icons/linkedin.svg',
  },
  {
    link: '',
    image: '/icons/tiktok.svg',
  },
  {
    link: '',
    image: '/icons/instagram.svg',
  },
  {
    link: '',
    image: '/icons/youtube.svg',
  },
];

type Props = {
  isNFT?: boolean;
};

export function BaseHeader({ isNFT = false }: Props) {
  const user = useRecoilValue(globalUserState);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Get the current scroll position
      const currentScrollY =
        window.pageYOffset || document.documentElement.scrollTop;
      // Only hide the element if scrolling down and not at the top of the page
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down, hide element
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        // Scrolling up or at the top of the page, show element
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY); // Update last scroll position
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // const detailsModal = useWalletDetailsModal();
  const { connect } = useConnectModal();

  function handleConnect() {
    connect({ client, wallets });
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 left-0 w-full bg-[#161616]/95 backdrop-blur supports-[backdrop-filter]:bg-[#161616]/60 transition-transform duration-300',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
      )}
    >
      <div className="container !px-3 xs:!px-5 sm:!px-0 h-[88px] w-full py-5 justify-between items-center flex">
        <div className="flex gap-x-4 items-center">
          <div className="h-8 relative inline-flex gap-1.5 top-1">
            <div className="hidden max-xl:block">
              <Sheet>
                <SheetTrigger asChild>
                  <List size={24} className="my-auto"></List>
                </SheetTrigger>
                <SheetContent side="left" className="bg-dark w-[18rem]">
                  <SheetHeader className="text-left">
                    <SheetDescription>
                      <SideBar className="bg-transparent" hide />
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              {/* <Sheet>
                <SheetTrigger asChild>
                  <List size={24} className="my-auto"></List>
                </SheetTrigger>
                <SheetContent side="left" className="bg-dark">
                  <SheetHeader className="text-left space-y-10">
                    <SheetTitle>VaultX</SheetTitle>
                    <SheetDescription>
                      <div className="flex flex-col gap-y-4 text-white">
                        <Link href="/dashboard/appreciate">
                          <Label className="text-sm">Appreciation</Label>
                        </Link>
                        <Link href="/dashboard/curation">
                          <Label className="text-sm">Curation</Label>
                        </Link>
                        <Link
                          href="https://hansdca380cf4f5.wpcomstaging.com"
                          target="_blank"
                        >
                          <Label className="text-sm">Magazine</Label>
                        </Link>
                        <Label className="text-sm">Artist</Label>
                      </div>
                      <hr className="my-4 bg-white" />
                      <Link
                        href="https://monsterx.gitbook.io/whitepaper"
                        target="_blank"
                        className="text-sm text-white"
                      >
                        How to work
                      </Link>
                      <div className="flex mt-4 gap-3.5 self-stretch text-sm max-md:flex-wrap">
                        {user ? (
                          <Menu />
                        ) : (
                          <div
                            className="sm:max-w-[200px] h-12 px-5 py-3 bg-[#DDF247] rounded-xl border border-[#DDF247] justify-center items-center gap-2 inline-flex hover:bg-white hover:text-gray-900 cursor-pointer"
                            onClick={handleConnect}
                          >
                            <div className="text-neutral-900 text-xs sm:text-sm md:text-base font-semibold leading-normal">
                              Connect Wallet
                            </div>
                            <WalletIcon />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-x-2 my-4">
                      {socials.map((social, index) => {
                        return (
                          <Link key={index} href={social.link} target="_blank">
                            <img
                              src={social.image}
                              className="w-6 fill-white stroke-white"
                            />
                          </Link>
                        );
                      })}
                    </div>
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet> */}
            </div>
          </div>
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="hidden xl:block">
          <div className="justify-start items-center gap-x-7 flex text-base text-white">
            <Link
              className="p-1 hover:cursor-pointer hover:text-[#DDF247] transition-all duration-200 font-medium"
              href="/dashboard/appreciate"
            >
              Appreciation
            </Link>
            <Link
              className="p-1 hover:cursor-pointer hover:text-[#DDF247] transition-all duration-200 font-medium"
              href="/dashboard/curation"
            >
              Curation
            </Link>
            <Link
              className="p-1 hover:cursor-pointer hover:text-[#DDF247] transition-all duration-200 font-medium"
              href={magazineLink}
              target="_blank"
            >
              Magazine
            </Link>
            <Link
              className="p-1 hover:cursor-pointer hover:text-[#DDF247] transition-all duration-200 font-medium"
              href="https://help.vault-x.io/en-us"
              target="_blank"
            >
              How it Works
            </Link>
          </div>
        </div>
        {!isNFT && <Search />}

        <div className="flex gap-3.5 items-center text-sm max-md:flex-wrap">
          {user ? (
            <>
              {isNFT && (
                <Link
                  href="/dashboard/create"
                  className={
                    'px-4 py-2.5 bg-[#DDF247] rounded-xl border border-[#DDF247] justify-center items-center gap-2 cursor-pointer mr-2 self-center sm:flex hidden font-extrabold'
                  }
                >
                  <div className="text-neutral-900 text-sm leading-normal">
                    Create RWA
                  </div>
                </Link>
              )}
              <div className="flex gap-3.5 text-sm max-md:flex-wrap">
                <NotificationSheet />
              </div>
              <Menu />
            </>
          ) : (
            <div
              className="md:max-w-[200px] h-max sm:h-12 px-2 py-1 xs:px-4 xs:py-2 sm:px-5 sm:py-3 bg-[#DDF247] rounded-xl border border-[#DDF247] justify-center items-center gap-2 inline-flex cursor-pointer"
              onClick={handleConnect}
            >
              <div className="text-neutral-900 truncate xs:untruncate text-[10px] xs:text-xs sm:text-sm md:text-base font-bold leading-normal">
                Connect Wallet
              </div>
              <WalletIcon className="sm:w-5 sm:h-5 h-3 w-3" />
            </div>
          )}
          <WalletAutoConnect />
        </div>
      </div>
    </header>
  );
}
