import { useNFTDetail } from '@/app/components/Context/NFTDetailContext';
import BaseButton from '@/app/components/ui/BaseButton';
import { BaseDialog } from '@/app/components/ui/BaseDialog';
import { getUsdAmount } from '@/lib/helper';
import { formatNumberWithCommas } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import AuctionCancelModal from './AuctionCancelModal';
import AuctionCompleteModal from './AuctionCompleteModal';
import AuctionBidModal from './AuctionBidModal';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';
import { useToast } from '@/hooks/use-toast';

interface AuctionCurrentPriceProps {
  fetchNftData: () => void;
}

export const AuctionCurrentPrice: React.FC<AuctionCurrentPriceProps> = ({
  fetchNftData,
}: AuctionCurrentPriceProps) => {
  const { user } = useGlobalContext();
  const { auction, type } = useNFTDetail();
  const [auctionUsd, setAuctionUsd] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<{
    auctionBid: boolean;
    cancelAuction: boolean;
    completeAuction: boolean;
  }>({
    auctionBid: false,
    cancelAuction: false,
    completeAuction: false,
  });
  const { toast } = useToast();

  const fetchUsd = async () => {
    const weiAmount = BigInt(auction?.highBidAmount ?? auction?.minBid ?? 0);
    const usdAmount = (await getUsdAmount(weiAmount)) as string;
    setAuctionUsd(usdAmount);
  };
  useEffect(() => {
    if (auction) fetchUsd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction]);

  return (
    <div className="flex justify-between items-center gap-y-2 w-full mt-2">
      <p className="text-[32px] font-extrabold">
        $ {formatNumberWithCommas(Number(auctionUsd))}
      </p>
      {type === 'auctionBid' && (
        <div className="flex flex-col gap-x-2 items-center">
          {auction?.bidWinnerId !== user._id && (
            <BaseDialog
              trigger={
                <BaseButton
                  title="Auction Bid"
                  variant="primary"
                  className={'!rounded-[14px]'}
                  onClick={(e) => {
                    e.preventDefault();
                    // check highBidder is not the current user
                    if (auction.bidWinnerId === user._id) {
                      toast({
                        title: 'Error',
                        description: 'You are already the highest bidder.',
                        variant: 'destructive',
                      });
                    } else {
                      setModalStatus({
                        ...modalStatus,
                        auctionBid: true,
                      });
                    }
                  }}
                />
              }
              isOpen={modalStatus.auctionBid}
              onClose={(val) => {
                setModalStatus({
                  ...modalStatus,
                  auctionBid: val,
                });
              }}
              className="bg-[#161616] max-h-[80%] mx-auto overflow-y-auto overflow-x-hidden"
              modal={true}
            >
              <AuctionBidModal
                onClose={() => {
                  setModalStatus({
                    ...modalStatus,
                    auctionBid: false,
                  });
                }}
                fetchNftData={fetchNftData}
              />
            </BaseDialog>
          )}
        </div>
      )}
      {type === 'auction' ? (
        <div className="flex flex-col gap-2 items-center justify-between">
          <BaseDialog
            trigger={
              <BaseButton
                title="Auction Cancel"
                variant="secondaryOutline"
                className={'!rounded-[14px]'}
                displayIcon="left"
                iconPath="/icons/cross_ico.svg"
                onClick={() => {
                  setModalStatus({
                    ...modalStatus,
                    cancelAuction: true,
                  });
                }}
              />
            }
            isOpen={modalStatus.cancelAuction}
            onClose={(val) => {
              setModalStatus({
                ...modalStatus,
                cancelAuction: val,
              });
            }}
            className="bg-[#161616] max-h-[80%] mx-auto overflow-y-auto overflow-x-hidden"
            modal={true}
          >
            <AuctionCancelModal
              onClose={() => {
                setModalStatus({
                  ...modalStatus,
                  cancelAuction: false,
                });
              }}
              fetchNftData={fetchNftData}
            />
          </BaseDialog>
          <BaseDialog
            trigger={
              <BaseButton
                title="Auction Complete"
                variant="primary"
                className={'!rounded-[14px]'}
                onClick={() => {
                  setModalStatus({
                    ...modalStatus,
                    completeAuction: true,
                  });
                }}
              />
            }
            isOpen={modalStatus.completeAuction}
            onClose={(val) => {
              setModalStatus({
                ...modalStatus,
                completeAuction: val,
              });
            }}
            className="bg-[#161616] max-h-[80%] mx-auto overflow-y-auto overflow-x-hidden"
            modal={true}
          >
            <AuctionCompleteModal
              onClose={() => {
                setModalStatus({
                  ...modalStatus,
                  completeAuction: false,
                });
              }}
              fetchNftData={fetchNftData}
            />
          </BaseDialog>
        </div>
      ) : null}
    </div>
  );
};
