'use client';

import { useState } from 'react';
import { useActiveWalletChain } from 'thirdweb/react';

interface IAcceptBidModalProps {
  bidderInfo: {
    url: string;
    name: string;
    bidPrice: number;
  };
}

export default function AcceptBidModal({ bidderInfo }: IAcceptBidModalProps) {
  const activeChain = useActiveWalletChain();
  const [step, setStep] = useState(1);

  // Blockchain transaction

  return (
    <>
      <div className="w-[30rem]">
        {step === 1 ? (
          <div className="flex flex-col gap-y-4">
            <p className="text-lg font-medium">Bid Details</p>

            <div className="flex justify-between p-4 rounded-md bg-gray-800">
              <div className="w-[35%]">
                <img
                  className="aspect-square object-cover w-28"
                  src={bidderInfo.url}
                  alt="work"
                />
              </div>
              <div className="w-[65%] flex justify-between">
                <p>{bidderInfo.name}</p>
                <div className="flex flex-col gap-y-2">
                  <p>{bidderInfo.bidPrice} MATIC</p>
                  <p className="text-sm text-gray-500">
                    ${bidderInfo.bidPrice}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-2 mt-5">
              <div className="flex justify-between items-center">
                <span>Royalties</span>
                <span>5%</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span>VaultX Fee</span>
                <span>2.5 %</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span>You will get</span>
                <div className="flex flex-end flex-col gap-y-2">
                  <span>
                    {Number(
                      bidderInfo.bidPrice - 0.075 * bidderInfo.bidPrice,
                    ).toFixed(2)}{' '}
                    MATIC
                  </span>
                  <span>
                    {Number(
                      bidderInfo.bidPrice - 0.075 * bidderInfo.bidPrice,
                    ).toFixed(2)}{' '}
                    MATIC
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-light">
                <button className="w-full h-full" onClick={() => {}}>
                  Discard
                </button>
              </div>
              <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-neon">
                <button className="w-full h-full" onClick={() => setStep(2)}>
                  Accept
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 && (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2 justify-center text-center">
              <img src="/icons/success.svg" className="w-16 mx-auto" />
              <p className="text-lg font-medium">Payment Success</p>
              <p className="text-gray-500">
                Your payment is completed successfully
              </p>
            </div>

            <div className="flex justify-between p-4 rounded-md bg-gray-800">
              <div className="w-[35%]">
                <img
                  className="aspect-square object-cover w-28"
                  src={bidderInfo.url}
                  alt="work"
                />
              </div>
              <div className="w-[65%] flex justify-between">
                <p>{bidderInfo.name}</p>
                <div className="flex flex-col gap-y-2">
                  <p>{bidderInfo.bidPrice} MATIC</p>
                  <p className="text-sm text-gray-500">
                    ${bidderInfo.bidPrice}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-3">
              <div className="flex justify-between">
                <div className="w-[48%] p-4 rounded-md border border-gray-400">
                  <p className="text-sm text-gray-500">From</p>
                  <p className="text-neon">hhgkjhkjh#$34224</p>
                </div>
                <div className="w-[48%] p-4 rounded-md border border-gray-400">
                  <p className="text-sm text-gray-500">From</p>
                  <p className="text-neon">hhgkjhkjh#$34224</p>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="w-[48%] p-4 rounded-md border border-gray-400">
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-neon">{activeChain?.name}</p>
                </div>
                <div className="w-[48%] p-4 rounded-md border border-gray-400">
                  <p className="text-sm text-gray-500">Payment Time</p>
                  <p className="text-neon">11/19/2023, 11:49:57 PM</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
