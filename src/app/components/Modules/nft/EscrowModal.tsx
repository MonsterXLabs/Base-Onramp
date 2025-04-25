'use client';

import { useState } from 'react';
import BasicLoadingModal from './BasicLoadingModal';
import { releaseEscrow } from '@/lib/helper';
import { useActiveAccount } from 'thirdweb/react';
import { useNFTDetail } from '../../Context/NFTDetailContext';
import { CreateSellService } from '@/services/legacy/createSellService';
import { useGlobalContext } from '../../Context/GlobalContext';
import { contract } from '@/lib/contract';
import { formatEther, parseEther } from 'viem';
import ErrorModal from '../create/ErrorModal';
import { sendTransactionNotification } from '@/actions/notification';

export default function EscrowModal({
  onClose,
  step,
  setStep,
}: {
  onClose: () => void;
  step: number;
  setStep: (val: number) => void;
}) {
  const { user } = useGlobalContext();
  const { NFTDetail } = useNFTDetail();
  const activeAccount = useActiveAccount();
  const saleService = new CreateSellService();
  const [error, setError] = useState(null);
  const release = async () => {
    try {
      setStep(2);
      const { transactionHash, events } = await releaseEscrow(
        NFTDetail.tokenId,
        activeAccount,
      );
      // add events
      let states = [];
      const splitStatus =
        events.filter((event) => event.eventName === 'PaymentSplited')
          .length !== 1;

      events.forEach((event) => {
        if (event.eventName === 'ProtocolFee') {
          const feeState = {
            nftId: NFTDetail._id,
            state: 'Fee',
            from: NFTDetail?.owner._id,
            toWallet: contract.address,
            date: new Date(),
            actionHash: transactionHash,
            price: formatEther(event.args.amount),
            currency: 'ETH',
          };
          states.push(feeState);
        } else if (event.eventName === 'RoyaltyPurchased') {
          const royaltyState = {
            nftId: NFTDetail._id,
            state: 'Royalties',
            from: NFTDetail?.owner._id,
            toWallet: event.args.user,
            date: new Date(),
            actionHash: transactionHash,
            price: formatEther(event.args.amount),
            currency: 'ETH',
          };
          states.push(royaltyState);
        } else if (event.eventName === 'PaymentSplited') {
          const splitState = {
            nftId: NFTDetail._id,
            state: splitStatus ? 'Split Payments' : 'Payment',
            from: NFTDetail?.owner._id,
            toWallet: event.args.user,
            date: new Date(),
            actionHash: transactionHash,
            price: formatEther(event.args.amount),
            currency: 'ETH',
          };
          states.push(splitState);
        } else if (event.eventName === 'EscrowReleased') {
          const releaseState = {
            nftId: NFTDetail._id,
            state: 'Release escrow',
            from: user._id,
            toWallet: NFTDetail?.owner.wallet,
            to: NFTDetail?.owner,
            date: new Date(),
            actionHash: transactionHash,
            price: NFTDetail.price,
          };
          states.push(releaseState);
        }
      });
      const data = {
        nftId: NFTDetail._id,
        releaseHash: transactionHash,
        states,
      };
      await saleService.release(data);
      await sendTransactionNotification('escrow', NFTDetail._id);
      setStep(3);
    } catch (error) {
      console.log(error);
      setError(JSON.stringify(error));
      onClose();
    }
  };
  return (
    <>
      {error ? (
        <ErrorModal title="Error" data={error} close={() => onClose()} />
      ) : (
        <>
          {step === 1 ? (
            <div className="w-full flex flex-col gap-y-7">
              <div className="flex gap-x-3 items-center">
                <img src="/icons/info.svg" className="w-12" />
                <p className="text-[30px] font-extrabold">
                  Escrow Release Confirmation
                </p>
              </div>

              <p className="text-[24px] azeret-mono-font text-[#fff] font-extrabold">
                Did you receive the physical artwork without any issues?
              </p>
              <p className="text-[16px] azeret-mono-font text-[#FFFFFF53] mb-6">
                When escrow is released, you will receive the NFT created by the
                artist in your wallet, and the purchase price you paid will be
                delivered to the artist.
                <br />
                <br />
                If you have properly received the physical artwork and there
                were no problems during the transaction, click the Escrow
                Release button below to complete the transaction.
              </p>

              <div className="flex justify-between">
                <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-light">
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    Cancel
                  </button>
                </div>
                <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-neon">
                  <button className="w-full h-full" onClick={() => release()}>
                    Escrow Release
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {step === 2 && (
            <BasicLoadingModal message="Please wait while we releasing RWA" />
          )}
          {step === 3 ? (
            <div className="w-[34rem] flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2 justify-center text-center">
                <img src="/icons/success.svg" className="w-16 mx-auto" />
                <p className="text-lg font-medium">Escrow Release Completed</p>
              </div>
              <div className="py-3 w-[100%] rounded-lg text-black font-semibold bg-light">
                <button
                  className="w-full h-full bg-[#DEE8E8]"
                  onClick={() => {
                    onClose();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
