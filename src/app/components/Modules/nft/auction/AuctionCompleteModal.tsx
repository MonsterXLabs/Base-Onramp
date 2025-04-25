'use client';

import { completeAuctionApi } from '@/actions/auction';
import { useNFTDetail } from '@/app/components/Context/NFTDetailContext';
import { useToast } from '@/hooks/use-toast';
import { endAuction } from '@/lib/auction';
import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import BasicLoadingModal from '../BasicLoadingModal';
import BaseButton from '@/app/components/ui/BaseButton';
import { sendTransactionNotification } from '@/actions/notification';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';

interface AuctionCompleteModalProps {
  fetchNftData: () => void;
  onClose: () => void;
}

export default function AuctionCompleteModal({
  fetchNftData,
  onClose,
}: AuctionCompleteModalProps) {
  const [step, setStep] = useState(1);
  const activeAccount = useActiveAccount();
  const { nftId, auction } = useNFTDetail();
  const { user } = useGlobalContext();
  const { toast } = useToast();

  const handleCompleteAuction = async () => {
    try {
      setStep(2);

      const { transactionHash } = await endAuction(
        auction.auctionId,
        activeAccount,
      );
      await completeAuctionApi({
        nftId,
        auctionId: auction.auctionId,
        actionHash: transactionHash,
      });
      await sendTransactionNotification('auction_complete', nftId, user._id);

      fetchNftData();
      setStep(3);
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Failed to complete the auction.',
        variant: 'destructive',
      });
      onClose();
    }
  };
  if (step === 1)
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <div className="flex items-center gap-x-3">
          <img src="/icons/info.svg" className="w-12" />
          <p className="text-[30px] font-extrabold azeret-mono-font ">
            Auction Complete
          </p>
        </div>

        <p className="text-[16px] azeret-mono-font text-[#FFFFFF53] mb-6">
          {`We're glad to see you complete your auction. Please note that the completion process is final and cannot be undone. If you have any issues or concerns regarding the auction process, please reach out to our support team for assistance.`}
          <br />
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
            <button
              className="w-full h-full"
              onClick={async () => await handleCompleteAuction()}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    );
  else if (step === 2)
    return (
      <BasicLoadingModal message="Please wait while we are processing your auction completion" />
    );
  else if (step === 3)
    return (
      <div className="flex w-full justify-center flex-col gap-y-4 text-center">
        <img src="/icons/success.svg" className="w-16 mx-auto" />
        <p className="text-[30px] font-extrabold">Auction Cancelled</p>
        <p className="text-[16px] azeret-mono-font text-[#ffffff53]">
          Your auction has been successfully completed.
          <br />
          We appreciate your participation and hope you had a great experience.
          <br />
          Thank you for using our platform.
        </p>
        <BaseButton
          title="Close"
          variant="primary"
          onClick={() => {
            onClose();
          }}
          className="w-full"
        />
      </div>
    );
  return null;
}
