'use client';

import { cn } from '@/lib/utils';
import { Copy, Facebook, Instagram, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import BaseButton from '../../ui/BaseButton';
import { useToast } from '@/hooks/use-toast';

export interface IServerMessage {
  data: string;
  step: number;
}

export default function MintLoader({
  step,
  setStep,
  nftId,
  message,
  modalStatus,
  onClose,
}: {
  step: number;
  setStep: (val: number) => void;
  nftId: string;
  message: IServerMessage | null;
  modalStatus: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<IServerMessage[]>([]);
  const [subStep, setSubStep] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    if (message) {
      if (message.step > subStep) setSubStep(message.step);
      setMessages((prevMessages) => [...prevMessages, message]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  useEffect(() => {
    setMessages([]);
  }, [modalStatus]);

  return (
    <div className="px-10 py-6 bg-[#161616] rounded-md">
      {step === 1 && (
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <p className="text-2xl lg:text-3xl font-extrabold">
              RWA Creation is in Progress{' '}
            </p>
            <p className="text-[#979797] text-sm azeret-mono-font">
              {"Please bear with us. We're almost there!"}
            </p>
          </div>
          <div className="flex flex-col gap-y-3">
            <div
              className={cn(
                'flex gap-x-2 items-start',
                `opacity-${subStep >= 1 ? '100' : '50'}`,
              )}
            >
              <Image
                quality={100}
                src="/icons/refresh.svg"
                alt="step1"
                className="w-10 h-10"
                width={40}
                height={40}
              />
              <div>
                <p className="font-bold text-lg text-white">Upload RWA</p>
                {/* <p className="text-[#979797] text-sm">
                  Uploading the original RWA image to IPFS
                </p> */}
                {messages
                  .filter((item) => item.step == 1)
                  .map((message, index) => {
                    return (
                      <p
                        key={index}
                        className="text-[#979797] text-sm azeret-mono-font"
                      >
                        {message.data}
                      </p>
                    );
                  })}
              </div>
            </div>
            <div
              className={cn(
                'flex gap-x-2 items-start',
                `opacity-${subStep >= 2 ? '100' : '50'}`,
              )}
            >
              <Image
                quality={100}
                src="/icons/refresh.svg"
                alt="step1"
                className="w-10 h-10"
                width={40}
                height={40}
              />
              <div>
                <p className="font-bold text-lg text-white">Mint</p>
                <p className="text-[#979797] text-sm">
                  Sending transaction to create your NFT
                </p>
                {messages
                  .filter((item) => item.step == 2)
                  .map((message, index) => {
                    return (
                      <p
                        key={index}
                        className="text-[#979797] text-sm azeret-mono-font"
                      >
                        {message.data}
                      </p>
                    );
                  })}
              </div>
            </div>
            <div
              className={cn(
                'flex gap-x-2 items-start',
                `opacity-${subStep >= 3 ? '100' : '50'}`,
              )}
            >
              <Image
                quality={100}
                src="/icons/refresh.svg"
                alt="step1"
                className="w-10 h-10"
                width={40}
                height={40}
              />
              <div>
                <p className="font-bold text-lg text-white">Listing for sale</p>
                <p className="text-[#979797] text-sm">
                  Sending transaction to list your NFT
                </p>
                {messages
                  .filter((item) => item.step == 3)
                  .map((message, index) => {
                    return (
                      <p
                        key={index}
                        className="text-[#979797] text-sm azeret-mono-font"
                      >
                        {message.data}
                      </p>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-col gap-y-4">
          <div className="flex gap-x-2 items-center">
            <Image
              quality={100}
              src="/icons/info.svg"
              alt="step1"
              className="w-10 h-10"
              width={40}
              height={40}
            />
            <p className="text-3xl font-extrabold">Caution</p>
          </div>
          <p className="text-white/[53%] text-xs azeret-mono-font">
            <span className="font-semibold">
              Do not disclose buyer shipping information to third parties!
            </span>
            <br />
            <br />
            To maintain the confidentiality of buyer information and ensure
            smooth transactions, please pay close attention to the following
            points:
            <br />
            <br />
            1. Confidentiality of Shipping Information: Buyer shipping
            information should remain confidential to sellers. Be cautious to
            prevent any external disclosures.
            <br />
            <br />
            2. Tips for Safe Transactions: Handle buyer shipping information
            securely to sustain safe and transparent transactions.
            <br />
            <br />
            3. Protection of Personal Information: As a seller, it is imperative
            to treat buyer personal information with utmost care. Avoid
            disclosing it to third parties.We kindly request your strict
            adherence to these guidelines to uphold transparency and trust in
            your transactions. Ensuring a secure transaction environment
            benefits everyone involved.
            <br />
            <br />
            <br />
            <span className="text-white/[77%] font-semibold">Thank You</span>
          </p>

          <div className="flex items-center justify-center">
            <BaseButton
              title="I Agree"
              variant="primary"
              onClick={() => setStep(3)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-y-4">
          <p className="text-neon text-3xl font-extrabold mb-2">
            Congratulations!
          </p>
          <p className="text-sm azeret-mono-font">
            Your NFT is published successfully
          </p>

          <div className="w-full py-4 rounded-xl flex items-center">
            <div className="flex gap-x-8">
              <div className="w-8 h-8 flex justify-center items-center border border-white rounded-full">
                <Link href={'/'}>
                  <svg
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_3474_12420)">
                      <path
                        d="M10.9183 18.3327C15.5207 18.3327 19.2516 14.6017 19.2516 9.99935C19.2516 5.39697 15.5207 1.66602 10.9183 1.66602C6.31592 1.66602 2.58496 5.39697 2.58496 9.99935C2.58496 14.6017 6.31592 18.3327 10.9183 18.3327Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.58496 10H19.2516"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.9183 18.3327C12.7593 18.3327 14.2516 14.6017 14.2516 9.99935C14.2516 5.39697 12.7593 1.66602 10.9183 1.66602C9.07734 1.66602 7.58496 5.39697 7.58496 9.99935C7.58496 14.6017 9.07734 18.3327 10.9183 18.3327Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.02539 4.22461C6.53343 5.73265 8.61676 6.6654 10.9179 6.6654C13.2191 6.6654 15.3025 5.73265 16.8105 4.22461"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.7031 15.4408C15.195 13.9327 13.1117 13 10.8105 13C8.50934 13 6.42601 13.9327 4.91797 15.4408"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3474_12420">
                        <rect
                          width="20"
                          height="20"
                          fill="white"
                          transform="translate(0.917969)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </Link>
              </div>
              <div className="w-8 h-8 flex justify-center items-center border border-white rounded-full">
                <Link href={'/'}>
                  <Twitter className="w-5 h-5 fill-white stroke-none" />
                </Link>
              </div>
              <div className="w-8 h-8 flex justify-center items-center border border-white rounded-full">
                <Link href={'/'}>
                  <Facebook className="w-5 h-5 fill-white stroke-none" />
                </Link>
              </div>
              <div className="w-8 h-8 flex justify-center items-center border border-white rounded-full">
                <Link href={'/'}>
                  <Instagram className="w-5 h-5 " />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="py-3 w-[48%] rounded-xl text-black bg-neon">
              <button
                className="w-full h-full font-bold"
                onClick={() => {
                  if (window) {
                    window.location.href = `/nft/${nftId}`;
                  }
                }}
              >
                View NFT
              </button>
            </div>
            <div className="py-3 w-[48%] rounded-xl text-black bg-light">
              <button
                className="w-full h-full font-bold"
                onClick={() => {
                  onClose();
                }}
              >
                Close
              </button>
            </div>
          </div>

          <div className="p-4 border border-white/30 bg-transparent rounded-xl flex justify-between items-center w-full">
            <p className="text-sm">
              {`${window.location.origin}/nft/${nftId}`.slice(0, 30)}
            </p>
            <Copy
              className="w-5 h-5 text-[#ddf247] cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/nft/${nftId}`,
                );
                toast({
                  title: 'Copied to clipboard',
                  duration: 2000,
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
