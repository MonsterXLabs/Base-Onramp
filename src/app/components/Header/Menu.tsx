'use client';

import { DropdownIcon } from '@/components/Icon/ProfileIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { globalUserState } from '@/hooks/recoil-state';
import { client } from '@/lib/client';
import { chain, isDev } from '@/lib/contract';
import { removeCookie } from '@/lib/cookie';
import { Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  useActiveAccount,
  useActiveWallet,
  useActiveWalletChain,
  useDisconnect,
  useWalletBalance,
  useWalletDetailsModal,
  useWalletImage,
} from 'thirdweb/react';
import { shortenAddress, shortenHex } from 'thirdweb/utils';
import { WalletId } from 'thirdweb/wallets';

interface WalletDetailProps {
  walletId: WalletId;
  size: number;
}
export const WalletImage = ({ walletId, size }: WalletDetailProps) => {
  // Always call the hooks unconditionally
  const walletImage = useWalletImage(walletId || 'walletConnect');
  const { data: walletImageData } = walletImage;

  const { data: defaultImageData } = useWalletImage('io.metamask');

  const imageData = walletImageData || defaultImageData;

  if (imageData) {
    return (
      <Image
        quality={100}
        width={size}
        height={size}
        src={imageData}
        alt="wallet_img"
        className="rounded-full"
      />
    );
  }

  return null;
};

export default function Menu() {
  const [copied, setCopied] = useState(false);
  const [copyDelayed, setCopyDelayed] = useState(false);
  const [copyHover, setCopyHover] = useState(false);
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const activeChain = useActiveWalletChain();
  const { disconnect } = useDisconnect();

  const { data, isLoading, isError } = useWalletBalance({
    client,
    address: activeAccount?.address,
    chain: chain,
  });
  const [user, setUser] = useRecoilState(globalUserState);

  const detailsModal = useWalletDetailsModal();

  function handleDetail() {
    detailsModal.open({
      client,
      showTestnetFaucet: true,
      payOptions: {
        buyWithFiat: {
          testMode: isDev, // defaults to false
        },
      },
    });
  }

  useEffect(() => {
    console.log(user);
  }, [user]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(activeAccount?.address);
      setCopied(true);
      setCopyDelayed(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setCopyDelayed(false), 2500);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  const checkUserName = () => {
    if (user?.username) {
      if (user?.username.length > 10) {
        return shortenHex(user?.username, 4);
      }
    } else {
      return activeAccount ? shortenAddress(activeAccount?.address) : '';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="max-w-[159px] h-12 justify-start items-center gap-3 inline-flex text-white text-sm font-extrabold capitalize cursor-pointer">
          <Image
            quality={100}
            className="shrink-0 rounded-full object-cover w-8 sm:w-10 h-8 sm:h-10"
            width={40}
            height={40}
            src={
              user?.avatar?.url ? user.avatar.url : '/icons/default_profile.svg'
            }
            alt="user_profile"
          />
          <div className="justify-start items-center gap-1.5 flex flex-1 shrink-0">
            <span className="sm:text-base text-sm hidden sm:block truncate flex-1 shrink-0">
              {checkUserName()}
            </span>
            <DropdownIcon className="shrink-0 my-auto w-3 aspect-square" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[425px] border-0 p-4 relative bg-[#161616] rounded-[20px] shadow !text-base">
        <DropdownMenuLabel>
          <div className="justify-start items-center gap-3 inline-flex text-white text-sm font-extrabold capitalize cursor-pointer">
            <Image
              quality={100}
              className="shrink-0 rounded-full object-cover h-10 w-10"
              width={40}
              height={40}
              src={
                user?.avatar?.url
                  ? user.avatar.url
                  : '/icons/default_profile.svg'
              }
              alt="default_profile"
            />
            <div className="justify-start items-center gap-1.5 flex-col">
              <div>
                {user?.username ??
                  (activeAccount ? shortenAddress(activeAccount?.address) : '')}
              </div>
              {user?.email && (
                <div className="opacity-40 text-left text-white text-sm font-medium">
                  {user.email}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0 border-white/[4%]" />
        <DropdownMenuItem className="py-4 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold">
          <Link href="/dashboard/profile">
            <div className="flex gap-2.5">
              <Image
                src="/menu/MyProfile.svg"
                quality={50}
                width={18}
                height={18}
                alt="my_profile"
              />
              My Profile
            </div>
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem className="py-4 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold">
          <Link href="/dashboard/profile?tab=fav">My Favorite</Link>
        </DropdownMenuItem> */}
        <DropdownMenuItem className="py-4 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold">
          <Link href="/dashboard/profile?tab=order">
            <div className="flex gap-2.5">
              <Image
                src="/menu/MyOrder.svg"
                quality={50}
                width={18}
                height={18}
                alt="my_order"
              />
              My Order
            </div>
          </Link>
        </DropdownMenuItem>
        {/* <div className="py-4 flex justify-between items-center px-2 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold">
          <p className="text-sm">Language</p>
          <div className="justify-start items-center gap-14 inline-flex">
            <Select defaultValue="en">
              <SelectTrigger className="w-[100px] border-0 py-0 shadow-none focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none bg-[#161616] focus:ring-0">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-[#161616] border-white/10">
                <SelectGroup>
                  <SelectLabel>Language</SelectLabel>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="cn">China</SelectItem>
                  <SelectItem value="gr">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="it">Italy</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div> */}
        <DropdownMenuItem className="py-4 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold">
          <Link href="/dashboard/settings">
            <div className="flex gap-2.5">
              <Image
                src="/menu/Settings.svg"
                quality={50}
                width={18}
                height={18}
                alt="settings"
              />
              Settings
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="py-4 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold">
          <Link href="https://help.vault-x.io/en-us" target="_blank">
            <div className="flex gap-2.5">
              <Image
                src="/menu/HelpCenter.svg"
                quality={50}
                width={18}
                height={18}
                alt="help_center"
              />
              Help Center
            </div>
          </Link>
        </DropdownMenuItem>
        <div className="w-full mt-4">
          <div className="mx-auto flex rounded-lg border border-white border-opacity-5 px-2 py-2">
            <div className="justify-center w-full items-center">
              <div className="float-left">
                <div className="justify-start items-center gap-5 inline-flex">
                  <WalletImage
                    walletId={activeWallet?.id || 'walletConnect'}
                    size={50}
                  ></WalletImage>
                  <div className="justify-start items-start flex-col">
                    <div className="text-left text-white text-base font-medium capitalize flex gap-2 justify-center items-center">
                      <span>{activeChain?.name}</span>
                      <Image
                        src="/icons/menu-dot.svg"
                        alt="dot"
                        width={5}
                        height={5}
                      />
                      <span className="opacity-40 text-sm">
                        {activeAccount
                          ? shortenAddress(activeAccount?.address)
                          : ''}
                      </span>
                    </div>
                    <div className="text-left text-neutral-400 text-base font-semibold capitalize">
                      {data
                        ? Number(
                            Number(data?.value) /
                              Math.pow(10, Number(data?.decimals)),
                          ).toFixed(3)
                        : 0}
                      {` ${activeChain?.nativeCurrency?.symbol}`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="float-right justify-center items-center gap-3 inline-flex my-auto">
                <div className="bg-white bg-opacity-10 rounded-[18px] w-10 h-10 items-center justify-center inline-flex cursor-pointer hover:bg-gray-500">
                  <TooltipProvider>
                    <Tooltip open={copyHover || copied}>
                      <TooltipTrigger>
                        <Copy
                          size={20}
                          onMouseEnter={() => {
                            setCopyHover(true);
                          }}
                          onMouseLeave={() => {
                            setCopyHover(false);
                          }}
                          onClick={() => {
                            copyText();
                          }}
                        ></Copy>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copyDelayed ? 'Copied' : 'Click to copy'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="py-4 flex justify-between items-center px-2 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          handleDetail();
        }}
        >
          <div className='flex gap-2.5'>
              <Image
                src="/menu/Transaction.svg"
                quality={50}
                width={18}
                height={18}
                alt='transaction'
              />
              <p className="text-sm">
                Transactions
              </p>
            </div>
        </div> */}
        <div
          className="py-4 flex justify-between items-center px-2 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            handleDetail();
          }}
        >
          <div className="flex gap-2.5">
            <Image
              src="/menu/ManageWallet.svg"
              quality={50}
              width={18}
              height={18}
              alt="manage_wallet"
            />
            <p className="text-sm">Manage Wallet</p>
          </div>
        </div>
        <div className="py-4 flex justify-between items-center px-2 border-b border-white/[4%] bg-transparent hover:bg-transparent font-extrabold">
          <div
            className="flex gap-2.5 cursor-pointer"
            onClick={() => {
              setUser(null);
              removeCookie('token');
              removeCookie('user');
              if (activeWallet) {
                disconnect(activeWallet);
              }
              window.location.href = '/';
            }}
          >
            <Image
              src="/menu/Disconnect.svg"
              quality={50}
              width={18}
              height={18}
              alt="disconnect"
            />
            <p className="text-sm">Disconnect Wallet</p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
