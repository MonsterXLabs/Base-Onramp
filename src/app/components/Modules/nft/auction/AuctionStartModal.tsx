import { createAuctionApi } from '@/actions/auction';
import { useNFTDetail } from '@/app/components/Context/NFTDetailContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createAuction, createFreeMintAuction } from '@/lib/auction';
import { getTokenAmount } from '@/lib/helper';
import { getSeconds } from '@/lib/utils';
import { INFTVoucher, PaymentSplitType } from '@/types';
import { duration } from 'moment';
import React, { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { z } from 'zod';

interface AuctionStartModalProps {
  onClose: () => void;
}

const formSchema = z.object({
  minBid: z.number().positive(),
  duration: z.number().positive(),
});

type FormSchemaError = z.inferFormattedError<typeof formSchema>;

const days = Array.from({ length: 30 }, (_, i) => i);

const AuctionStartModal: React.FC<AuctionStartModalProps> = ({
  onClose,
}: AuctionStartModalProps) => {
  const [minBid, setMinBid] = useState<number>(0);
  const [step, setStep] = useState(1);
  const { NFTDetail: nftInfo, nftId } = useNFTDetail();
  const [day, setDay] = useState<string>('');
  const activeAccount = useActiveAccount();
  const [formError, setFormError] = useState<FormSchemaError | null>(null);
  const { toast } = useToast();

  const handleAuction = async () => {
    try {
      const valid = formSchema.safeParse({
        minBid,
        duration: Number(day),
      });

      if (!valid.success) {
        setFormError(valid.error.format());
        return;
      } else {
        setFormError(null);
        setStep(2);
      }

      if (nftInfo?.minted) {
        await createMintedAuction();
      } else {
        await createFreeAuction();
      }
      setStep(3);
    } catch (err) {
      toast({
        title: 'Could not create auction',
        duration: 2000,
        variant: 'destructive',
      });
      onClose();
    }
  };

  const createMintedAuction = async () => {
    const minBidAmount = await getTokenAmount(minBid.toString(), 'Wei');
    const duration = getSeconds(day, '0');
    const { transactionHash, auctionId, endTime } = await createAuction(
      BigInt(nftInfo?.tokenId),
      BigInt(minBidAmount),
      BigInt(duration),
      activeAccount,
    );
    await createAuctionApi({
      auctionId: Number(auctionId),
      actionHash: transactionHash as string,
      nftId: nftId,
      duration,
      minBid: Number(minBid),
      status: 'active',
      endTime: Number(endTime),
    });
  };

  const createFreeAuction = async () => {
    if (nftInfo?.voucher) {
      const voucher: INFTVoucher = JSON.parse(nftInfo.voucher, (key, value) => {
        // Check if the value is a number and can be safely converted to BigInt
        if (typeof value === 'number') {
          return BigInt(value);
        }
        return value;
      });
      let paymentSplits: PaymentSplitType[] = [];
      if (voucher.paymentPercentages.length !== voucher.paymentWallets.length)
        throw new Error('Free minted Voucher information is incorrect.');

      voucher.paymentPercentages.forEach((percentage, index) => {
        paymentSplits.push({
          paymentWallet: voucher.paymentWallets[index],
          paymentPercentage: percentage,
        });
      });

      const minBidAmount = await getTokenAmount(minBid.toString(), 'Wei');
      const duration = getSeconds(day, '0');
      const { transactionHash, auctionId } = await createFreeMintAuction(
        voucher as Omit<INFTVoucher, 'signature'> & {
          signature: `0x${string}`;
        },
        BigInt(minBidAmount),
        BigInt(duration),
        activeAccount,
      );
      await createAuctionApi({
        auctionId: Number(auctionId),
        actionHash: transactionHash as string,
        nftId: nftId,
        duration,
        minBid: Number(minBid),
        status: 'active',
      });
    } else {
      throw new Error('Only NFTs with a signature can be auctioned.');
    }
  };

  if (step === 1)
    return (
      <div className="flex flex-col gap-y-6 w-full text-[#fff]">
        <p className="text-[30px] font-extrabold">Auction Start</p>
        <p className="text-[16px] azeret-mono-font text-[#858585]">
          Please note: Once a bid has been placed after the auction begins, the
          auction cannot be canceled.
        </p>

        <div className="flex flex-col gap-y-3 mt-3 w-full text-lg my-5">
          <p className="text-lg font-semibold">Min Bid</p>
          <Input
            placeholder="Price"
            className="w-full bg-[#232323]"
            type="number"
            value={minBid.toString()}
            onChange={(e) => setMinBid(Number(e.target.value))}
          />
          {formError?.minBid && (
            <p className="text-[#DDF247] text-sm">
              Please enter starting price.
            </p>
          )}
          <p className="text-lg font-semibold">Closing Time</p>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger className="bg-[#232323]">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent className="bg-[#232323]">
              <SelectGroup>
                {days.map((val, index) => (
                  <SelectItem
                    value={(val + 1).toString()}
                    key={index}
                  >{`${val + 1} day`}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {formError?.duration && (
            <p className="text-[#DDF247] text-sm">
              Please select closing time.
            </p>
          )}
        </div>

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
          <div className="py-3 w-[48%] rounded-lg text-black bg-neon font-extrabold text-sm">
            <button className="w-full h-full" onClick={handleAuction}>
              Auction Start
            </button>
          </div>
        </div>
      </div>
    );
  else if (step === 2)
    return (
      <div className="flex flex-col gap-y-4 items-center text-center">
        <img src="/icons/refresh.svg" alt="refresh" className="w-20 mx-auto" />
        <p className="text-lg font-medium">
          Please wait while creating auction
        </p>
      </div>
    );
  else if (step === 3)
    return (
      <div className="flex flex-col gap-y-4 items-center text-center">
        <img src="/icons/success.svg" alt="refresh" className="w-20 mx-auto" />
        <p className="text-lg font-medium">Auction created Successfully</p>
      </div>
    );
  else return null;
};

export default AuctionStartModal;
