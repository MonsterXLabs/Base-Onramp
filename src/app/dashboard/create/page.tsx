'use client';

import { CreateNFTProvider } from '@/app/components/Context/CreateNFTContext';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';
import RestrictiveModal from '@/app/components/Modals/RestrictiveModal';
import Curation from '@/app/components/Modals/content/Curation';
import Rwa from '@/app/components/Modals/content/Rwa';
import CreateCuration from '@/app/components/Modules/CreateCuration';
import CreateNft from '@/app/components/Modules/CreateNft';
import { cn } from '@/lib/utils';
import { ensureValidUrl } from '@/utils/helpers';
import { Info } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';

export default function Page() {
  const { mediaImages, user } = useGlobalContext();
  const [step, setStep] = useState<any>({
    active: false,
    stage: 1,
    type: null,
  });

  const [hovered, setHovered] = useState<any>(false);
  const [modal, setModal] = useState<any>({
    active: false,
    type: null,
  });

  const activeAccount = useActiveAccount();

  const processModal = (type: string) => {
    setModal({
      active: true,
      type: type,
    });
  };

  const checkCurator = async (type: 'curation' | 'nft') => {
    let hasAccess = false;
    // if (activeAccount) {
    //   hasAccess = await isCurator(activeAccount?.address);
    // }

    hasAccess = true || user?.isCurator;

    if (!hasAccess) {
      processModal(type);
    } else {
      setStep({
        active: true,
        stage: 1,
        type: type,
      });
    }
  };

  return (
    <>
      <RestrictiveModal
        closeButton={true}
        open={modal.active}
        // open={true}
        onClose={() => setModal({ active: false, type: null })}
      >
        {modal.type === 'curation' && <Curation />}
        {modal.type === 'nft' && <Rwa />}
      </RestrictiveModal>

      {!step.active && (
        <div className="flex px-2 sm:px-4 justify-between w-full flex-col xl:flex-row lg:flex-col items-center lg:justify-between gap-y-3 xl:gap-0 lg:gap-4">
          <div className="flex flex-col gap-y-10 w-full md:w-7/12 lg:w-full xl:w-[48%]">
            <div className="flex gap-x-4 items-center">
              <Image
                quality={100}
                alt="add"
                height={100}
                width={100}
                src="/images/plus_file.svg"
                className="w-8 h-8"
              />
              <span className="text-3xl font-medium text-yellow-400">
                Create
              </span>
            </div>
            <div className="flex flex-col flex-wrap items-center justify-between md:flex-row ">
              <div className="flex flex-col gap-y-7 w-full">
                <div
                  className="cursor-pointer sm:min-h-[131px] w-full xl:max-w-[615px] flex flex-col gap-y-2 p-3 py-6 sm:p-6 relative rounded-xl border border-white/[17%] bg-white/5 hover:bg-yellow-400  hover:text-black text-white"
                  onMouseEnter={() => setHovered('curation')}
                  onMouseLeave={() => setHovered(false)}
                  onClick={async () => await checkCurator('curation')}
                >
                  <svg
                    className="hidden xs:block absolute top-1/2 right-5 transform -translate-y-1/2 hover:fill-black"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    color="#fff hover:fill-black"
                  >
                    <path
                      d="M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <div className="flex gap-x-2 sm:gap-x-4 w-full xs:w-11/12">
                    <Image
                      quality={100}
                      alt="add"
                      height={100}
                      width={100}
                      src={
                        hovered !== 'curation'
                          ? '/images/create-curation.svg'
                          : '/icons/curation_black.svg'
                      }
                      className="w-8 h-8 hover:fill-black"
                    />
                    <div className="flex flex-col gap-y-2">
                      <span
                        className={`text-base md:text-lg lg:text-[22px] ${hovered === 'curation' ? 'font-bold' : 'font-extrabold'}`}
                      >
                        Create Curation
                      </span>
                      <p
                        className={`w-[100%] azeret-mono-font text-xs sm:text-sm ${hovered === 'curation' ? 'text-black' : 'text-[#959595]'}`}
                      >
                        Create your own Curation for becoming a pioneering
                        curator in the Web3 world.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="cursor-pointer flex flex-col gap-y-2 p-3 py-6 sm:p-6 sm:min-h-[131px] w-full xl:max-w-[615px] relative rounded-xl border border-white/[17%] bg-white/5 hover:bg-yellow-400 hover:text-black text-white transition-colors duration-200"
                  onMouseEnter={() => setHovered('nft')}
                  onMouseLeave={() => setHovered(false)}
                  onClick={async () => await checkCurator('nft')}
                >
                  <svg
                    className="hidden xs:block absolute top-1/2 right-5 transform -translate-y-1/2 hover:fill-black"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    color="#fff hover:fill-black"
                  >
                    <path
                      d="M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <div className="flex gap-x-2 sm:gap-x-4 w-full xs:w-11/12">
                    <Image
                      quality={100}
                      alt="add"
                      height={100}
                      width={100}
                      src={
                        hovered !== 'nft'
                          ? '/images/create-nft.svg'
                          : '/icons/nft_black.svg'
                      }
                      className="w-8 h-8"
                    />
                    <div className="flex flex-col gap-y-2">
                      <span
                        className={`text-base md:text-lg lg:text-[22px] ${hovered === 'nft' ? 'font-bold' : 'font-extrabold'}`}
                      >
                        Create Artwork NFTs
                      </span>
                      <p
                        className={`w-[100%] azeret-mono-font  text-xs sm:text-sm ${hovered === 'nft' ? 'text-black' : 'text-[#959595]'}`}
                      >
                        Transform your art into a RWA, with one simple tap.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="cursor-pointer flex flex-col gap-y-2 p-3 py-6 sm:p-6 sm:min-h-[131px] w-full xl:max-w-[615px] relative rounded-xl border border-white/[17%] bg-white/5 hover:bg-yellow-400 hover:text-black text-white transition-colors duration-200"
                  onMouseEnter={() => setHovered('mint')}
                  onMouseLeave={() => setHovered(false)}
                >
                  <svg
                    className="hidden xs:block absolute top-1/2 right-5 transform -translate-y-1/2 hover:fill-black"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    color="#fff hover:fill-black"
                  >
                    <path
                      d="M3 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>

                  <div className="flex gap-x-2 sm:gap-x-4 w-full xs:w-11/12">
                    <Image
                      quality={100}
                      alt="add"
                      height={100}
                      width={100}
                      src={
                        hovered !== 'mint'
                          ? '/icons/nfc.svg'
                          : '/icons/nfc-hover.svg'
                      }
                      className="w-8 h-8"
                    />
                    <div className="flex flex-col gap-y-2 flex-1">
                      <div className="flex items-start justify-between flex-1 align-middle">
                        <span
                          className={`text-base md:text-lg lg:text-[22px] ${hovered === 'mint' ? 'font-bold ' : 'font-extrabold'}`}
                        >
                          NFC-Powered RWA
                        </span>
                        <div
                          className={cn(
                            'flex sm:relative absolute top-1 right-1 xs:top-3 md:top-1/2 md:-translate-y-1/2 xs xs:right-3 md:right-0 xs w-max h-[22px] px-3 py-1.5 rounded-lg border border-yellow-400 justify-center items-center gap-1.5',
                            hovered === 'mint' && 'border-black',
                          )}
                        >
                          <Info
                            className={cn(
                              'w-[13px] h-[13px] relative text-yellow-400',
                              hovered === 'mint' && 'text-black',
                            )}
                          />
                          <div
                            className={cn(
                              'text-center text-yellow-400 text-[10px] font-bold font-manrope capitalize',
                              hovered === 'mint' && 'text-black',
                            )}
                          >
                            Coming soon
                          </div>
                        </div>
                      </div>
                      <p
                        className={`w-[100%] azeret-mono-font  text-xs sm:text-sm ${hovered === 'mint' ? 'text-black' : 'text-[#959595]'}`}
                      >
                        Digitize physical assets to blockchain entries in
                        minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full min-h-[calc(100vh-88px)] max-h-[calc(100vh-88px)] md:w-5/12 lg:w-full xl:w-[49%] relative">
            {mediaImages?.mintingBanner.image && (
              <a
                href={ensureValidUrl(mediaImages?.mintingBanner.link)}
                target="_blank"
              >
                <Image
                  quality={100}
                  src={mediaImages?.mintingBanner.image}
                  alt="hero"
                  fill
                  objectFit="cover"
                ></Image>
              </a>
            )}
          </div>
        </div>
      )}
      {step.active && step.type === 'curation' && <CreateCuration />}
      {step.active && step.type === 'nft' && (
        <CreateNFTProvider>
          <CreateNft />
        </CreateNFTProvider>
      )}
    </>
  );
}
