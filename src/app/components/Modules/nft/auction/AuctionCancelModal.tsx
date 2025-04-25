'use client';

import { cancelAuctionApi } from '@/actions/auction';
import { useNFTDetail } from '@/app/components/Context/NFTDetailContext';
import { useToast } from '@/hooks/use-toast';
import { cancelAuction } from '@/lib/auction';
import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import BasicLoadingModal from '../BasicLoadingModal';
import BaseButton from '@/app/components/ui/BaseButton';
import { sendTransactionNotification } from '@/actions/notification';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';

interface AuctionCancelModalProps {
  fetchNftData: () => void;
  onClose: () => void;
}

export default function AuctionCancelModal({
  fetchNftData,
  onClose,
}: AuctionCancelModalProps) {
  const [step, setStep] = useState(1);
  const activeAccount = useActiveAccount();
  const { nftId, auction } = useNFTDetail();
  const { user } = useGlobalContext();
  const { toast } = useToast();

  const handleCancelAuction = async () => {
    try {
      setStep(2);

      const { transactionHash } = await cancelAuction(
        auction.auctionId,
        activeAccount,
      );
      await cancelAuctionApi({
        nftId,
        auctionId: auction.auctionId,
        actionHash: transactionHash,
      });
      await sendTransactionNotification('auction_cancel', nftId, user._id);

      fetchNftData();
      setStep(3);
    } catch (error) {
      console.error('auction cancel', error);
      toast({
        title: 'Failed to cancel the auction.',
        variant: 'destructive',
      });
      onClose();
    }
  };

  if (step === 1)
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <div className="flex items-center gap-x-3">
          <img src="/icons/receipt.svg" className="w-12" />
          <p className="text-[30px] font-extrabold azeret-mono-font ">
            Auction Cancel
          </p>
        </div>

        <p className="text-[16px] azeret-mono-font text-[#FFFFFF53] mb-6">
          {`We're sorry to see you cancel your auction. Please note that cancellations due to a change of mind are not covered under our terms and conditions. However, if you have other reasons such as issues with the auction process or other valid concerns, your cancellation request may be considered.`}
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
              onClick={async () => await handleCancelAuction()}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    );
  else if (step === 2)
    return (
      <BasicLoadingModal message="Please wait while we are processing your auction cancellation" />
    );
  else if (step === 3)
    return (
      <div className="flex w-full justify-center flex-col gap-y-4 text-center">
        <img src="/icons/success.svg" className="w-16 mx-auto" />
        <p className="text-[30px] font-extrabold">Auction Cancelled</p>
        <p className="text-[16px] azeret-mono-font text-[#ffffff53]">
          Your auction has been successfully cancelled.
          <br />
          We appreciate your feedback and will review your reasons for
          cancellation.
          <br />
          Thank you for your understanding.
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
