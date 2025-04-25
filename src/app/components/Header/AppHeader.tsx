'use client';

import WalletIcon from '@/components/Icon/WalletIcon';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { thirdwebVisibleState } from '@/hooks/recoil-state';
import { client, wallets } from '@/lib/client';
import { List } from 'lucide-react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useActiveAccount, useConnectModal } from 'thirdweb/react';
import NotificationSheet from '../Chat/notification/notificationSheet';
import { useGlobalContext } from '../Context/GlobalContext';
import { WalletAutoConnect } from '../provider/theme-provider';
import SideBar from '../ui/SideBar';
import Menu from './Menu';

export default function AppHeader() {
  const { user } = useGlobalContext();
  const { connect } = useConnectModal();
  const handleConnect = async () => {
    await connect({ client, wallets });
  };

  const [thirdwebVisible, setThirdwebVisible] =
    useRecoilState(thirdwebVisibleState);
  const activeAccount = useActiveAccount();

  useEffect(() => {}, []);

  return (
    <div className="flex justify-between lg:justify-end px-3 md:py-4 md:pt-4 pt-4 py-2 items-center">
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <List size={24} className="my-auto"></List>
          </SheetTrigger>
          <SheetContent side="left" className="bg-dark w-[18rem]">
            <SheetHeader className="text-left">
              <SheetDescription>
                <SideBar className="bg-transparent" />
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex gap-3.5 items-center self-stretch text-sm max-md:flex-wrap">
        {user ? (
          <>
            <div className="flex gap-3.5 text-sm max-md:flex-wrap mx-2">
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
      </div>
      <WalletAutoConnect />
    </div>
  );
}
