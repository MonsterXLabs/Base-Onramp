'use client';

import { globalUserState } from '@/hooks/recoil-state';
import { chain } from '@/lib/contract';
import { createCookie, removeCookie } from '@/lib/cookie';
import { protocolFee } from '@/lib/helper';
import { moonpayApiKey } from '@/lib/ramp';
import {
  authenticationServices,
  getMedia,
  userServices,
} from '@/services/legacy/supplier';
import dynamic from 'next/dynamic';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRecoilState } from 'recoil';
import { Address } from 'thirdweb';
import {
  useActiveAccount,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from 'thirdweb/react';
import { checksumAddress } from 'viem';
import { SignUpModal } from '../Modules/SignUp';
import WelcomeMessage from '../Modules/welcome-message';

const MoonPayProvider = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayProvider),
  { ssr: false },
);

export interface Iimages {
  homeAutority: Array<{ image: string; link: string }>;
  bottomBaner: { image: string; link: string };
  appreciateTop: { image: string; link: string };
  curationTop: { image: string; link: string };
  mintingBanner: { image: string; link: string };
}

interface IGlobalContext {
  fee: number;
  user: any;
  fetchUser: () => void;
  mediaImages: Iimages | null;
  setMediaImages: (data: Iimages | null) => void;
}

interface GlobalProviderProps {
  children: ReactNode;
}

const globalContext = createContext<IGlobalContext | undefined>(undefined);

//context component
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [fee, setFee] = useState<number>(0);
  const [user, setUser] = useRecoilState(globalUserState);
  const [mediaImages, setMediaImages] = useState<Iimages | null>(null);

  const fetchProtocolFee = async () => {
    let fee = await protocolFee();
    setFee(Number(fee) / 100);
  };

  const fetchMedia = async () => {
    try {
      const images = await getMedia();
      setMediaImages(images);
    } catch (error) {
      console.log({ error });
    }
  };

  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const activeAccount = useActiveAccount();

  const fetchUser = async () => {
    if (!activeAccount) return;
    try {
      const address = checksumAddress(
        activeAccount?.address as `0x${string}`,
      ) as Address;
      const { data } = await authenticationServices.connectWallet({
        wallet: address,
      });
      const connectedUser = data.user;
      const connectedToken = data.token;
      createCookie('user', JSON.stringify(connectedUser));
      createCookie('token', connectedToken);
      setUser(connectedUser);
    } catch (error) {
      console.log({ error });
    }
  };

  const checkUser = async () => {
    // const singleUser = await userServices.getSingleUser();
    // if (!singleUser.data) {
    //   // check token expired
    //   removeCookie('token');
    //   removeCookie('user');
    // }
    removeCookie('token');
    removeCookie('user');
  };
  useEffect(() => {
    if (activeAccount?.address) {
      fetchUser();
    } else {
      checkUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount]);

  useEffect(() => {
    fetchProtocolFee();
    fetchMedia();
    if (activeAccount?.address) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeChain && activeChain.id !== chain.id) {
      switchChain(chain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain]);

  return (
    <globalContext.Provider
      value={{
        fee,
        user,
        fetchUser,
        mediaImages,
        setMediaImages,
      }}
    >
      <WelcomeMessage />
      <SignUpModal />
      <MoonPayProvider apiKey={moonpayApiKey} debug>
        {children}
      </MoonPayProvider>
    </globalContext.Provider>
  );
};

// hook
export const useGlobalContext = () => {
  const context = useContext(globalContext);
  if (context === undefined)
    throw new Error('Global context must be used within Global Provider');
  return context;
};
