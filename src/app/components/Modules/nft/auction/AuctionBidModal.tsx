import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTokenAmount, placeBid, placeBidBeforeMint } from '@/lib/helper';
import { CreateNftServices } from '@/services/legacy/createNftService';
import { CreateSellService } from '@/services/legacy/createSellService';
import { INFTVoucher } from '@/types';
import { roundToDecimals, trimString } from '@/utils/helpers';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { z } from 'zod';
import ConnectedCard from '@/app/components/Cards/ConnectedCard';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';
import { useNFTDetail } from '@/app/components/Context/NFTDetailContext';
import BaseButton from '@/app/components/ui/BaseButton';
import { BidDuration } from '../bid/BidDuration';
import { useDebounce } from 'use-debounce';
import { useCreateNFT } from '@/app/components/Context/CreateNFTContext';
import { AddressTemplate } from '../AddressTemplate';
import { NFTPriceCard } from '@/app/components/Cards/NFTPriceCard';
import { Address } from 'thirdweb';
import { sendTransactionNotification } from '@/actions/notification';
import ErrorModal from '../../create/ErrorModal';
import { bidAuction, createFreeMintAuction } from '@/lib/auction';
import { auctionBidApi, createAuctionApi } from '@/actions/auction';

const bidSchema = z.object({
  price: z.number().positive(),
});

export type BidSchemaError = z.inferFormattedError<typeof bidSchema>;

export default function AuctionBidModal({
  onClose,
  fetchNftData,
}: {
  onClose: () => void;
  fetchNftData: () => void;
}) {
  const [value, setValue] = useState<number>(0);
  const { fee, user } = useGlobalContext();
  const { NFTDetail, nftId: id, auction } = useNFTDetail();
  const [tokenAmount, setTokenAmount] = useState<string | null>(null);
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const [error, setError] = useState(null);
  const [bidPriceError, setBidPriceError] = useState<BidSchemaError | null>(
    null,
  );
  const [errorActive, setErrorActive] = useState(false);

  const [step, setStep] = useState(1);

  const {
    sellerInfo: { shipping, shippingId, contact, contactId },
  } = useCreateNFT();

  const address = useMemo(() => {
    if (activeAccount?.address)
      return (
        activeAccount?.address.slice(0, 6) +
        '...' +
        activeAccount?.address.slice(-4)
      );
    return 'Connect Wallet';
  }, [activeAccount]);
  const saleService = new CreateSellService();

  const cancelChanges = () => {
    onClose();
  };

  const bidPriceStep = () => {
    if (!errorActive) setErrorActive(true);
    if (handleBidPriceForm()) {
      checkAmount();
      setStep(2);
    }
  };

  const handleBidPriceForm = () => {
    const result = bidSchema.safeParse({
      price: value,
    });

    if (!result.success) {
      setBidPriceError(result.error.format());
      return false;
    }

    setBidPriceError(null);
    return true;
  };

  const [debouncedBidPrice] = useDebounce([value], 500);
  useEffect(() => {
    if (errorActive) handleBidPriceForm();
  }, [debouncedBidPrice]);

  const bidAsset = async () => {
    try {
      setStep(5);
      const tokenAmount = await getTokenAmount(value.toString(), 'Wei');
      const { transactionHash } = await bidAuction(
        auction.auctionId,
        tokenAmount as bigint,
        activeAccount,
      );

      await auctionBidApi({
        nftId: id,
        auctionId: auction.auctionId,
        bidValue: Number(tokenAmount),
        bidder: user._id,
        bidHash: transactionHash,
        bidderShippingDetail: {
          name: shipping?.name,
          email: shipping?.email,
          country: shipping?.country,
          address: shipping?.address,
          phoneNumber: shipping?.phoneNumber,
          contactInformation: contact?.contactInfo,
          concent: '',
        },
      });
      fetchNftData();
      setStep(6);
    } catch (error) {
      console.log(error);
      setError(JSON.stringify(error));
      onClose();
    }
  };

  const bidFreeMint = async () => {
    try {
      setStep(5);
      const voucher: INFTVoucher = JSON.parse(
        NFTDetail.voucher,
        (key, value) => {
          // Check if the value is a number and can be safely converted to BigInt
          if (typeof value === 'number') {
            return BigInt(value);
          }
          return value;
        },
      );

      // create free mint auction
      const {
        transactionHash: createHash,
        endTime,
        auctionId,
      } = await createFreeMintAuction(
        voucher as Omit<INFTVoucher, 'signature'> & {
          signature: `0x${string}`;
        },
        BigInt(auction.minBid),
        BigInt(auction.duration),
        activeAccount,
      );

      await createAuctionApi({
        id: auction.id,
        actionHash: createHash,
        auctionId: Number(auctionId),
        status: 'active',
        endTime: Number(endTime),
      });
      const tokenAmount = await getTokenAmount(value.toString(), 'Wei');

      const { transactionHash } = await bidAuction(
        Number(auctionId),
        tokenAmount as bigint,
        activeAccount,
      );

      await auctionBidApi({
        nftId: id,
        auctionId: Number(auctionId),
        bidValue: Number(tokenAmount),
        bidder: user._id,
        bidHash: transactionHash,
        bidderShippingDetail: {
          name: shipping?.name,
          email: shipping?.email,
          country: shipping?.country,
          address: shipping?.address,
          phoneNumber: shipping?.phoneNumber,
          contactInformation: contact?.contactInfo,
          concent: '',
        },
      });
      fetchNftData();
      setStep(6);
    } catch (error) {
      console.log(error);
      setError(JSON.stringify(error));
      onClose();
    }
  };

  const handleAuctionBid = async () => {
    if (NFTDetail.minted) await bidAsset();
    else await bidFreeMint();
    if (!error) await sendTransactionNotification('bid', id, user._id);
  };

  const checkAmount = async () => {
    const tokenAmount = await getTokenAmount(value.toString());
    setTokenAmount(tokenAmount as string);
    const expectedAmount = (Number(tokenAmount) * 100) / (100 - fee);
    setExpectedAmount(roundToDecimals(expectedAmount ?? null, 5));
  };

  useEffect(() => {
    checkAmount();
  }, []);

  // view logic
  if (error)
    return <ErrorModal title="Error" data={error} close={() => onClose()} />;

  if (step == 1)
    return (
      <div className="flex flex-col gap-y-5 w-full">
        <Label className="text-lg font-medium">Place a bid</Label>
        <ConnectedCard />

        {/* Wallet part */}
        <div className="flex flex-col gap-y-2">
          <Label>Price</Label>
          <Input
            placeholder="Price"
            className="w-full"
            type="number"
            value={value.toString()}
            onChange={(e) => setValue(Number(e.target.value))}
          />
          {bidPriceError?.price && (
            <p className="text-[#DDF247] text-sm">Please enter bid price</p>
          )}
        </div>

        <div className="flex gap-x-4 justify-center my-3 px-4">
          <BaseButton
            title="Cancel"
            variant="secondary"
            onClick={cancelChanges}
          />
          <BaseButton
            title="Next"
            variant="primary"
            onClick={() => {
              bidPriceStep();
            }}
          />
        </div>
      </div>
    );

  if (step == 2)
    return (
      <AddressTemplate
        handleCancel={() => {
          setStep(1);
        }}
        handleNext={() => {
          setStep(3);
        }}
        title="Buyer Information"
      />
    );

  if (step == 3)
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <div className="flex gap-x-3 items-center">
          <img src="/icons/info.svg" className="w-12" />
          <p className="text-[30px] text-[#fff] font-extrabold">
            Bid Information
          </p>
        </div>

        <p className="text-[16px] azeret-mono-font font-extrabold text-[#FFFFFF87]">
          Bid Success
          <br />
          <br />
        </p>

        <p className="text-[16px] azeret-mono-font text-[#FFFFFF87]">
          {`If the seller accepts your bid, the transaction will automatically proceed to the purchase stage. Once the purchase is confirmed, you will be granted access to the seller's contact information, allowing you to directly communicate with the seller to discuss shipping details`}
          <br />
          <br />
          Bid Cancellation
          <br />
          <br />
          Your bid will be automatically cancelled if the seller does not accept
          your bid within the period set during the bid registration, or if
          another bidder offers a higher amount for the item than your bid.
          Additionally, you may cancel your bid at any time before the seller
          accepts it. In the event of a cancellation, the amount you deposited
          at the time of bidding will be fully refunded, excluding the Gas fee.
          <br />
          <br />
          If you have any questions regarding Bid, please contact us.
          <br />
          <br />
          <br />
          <span className="text-[#fff] font-extrabold">Thank You</span>
        </p>

        <div className="flex justify-between">
          <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-light">
            <button
              className="w-full h-full"
              onClick={() => {
                setStep(2);
              }}
            >
              Cancel
            </button>
          </div>
          <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-neon">
            <button className="w-full h-full" onClick={() => setStep(4)}>
              Next
            </button>
          </div>
        </div>
      </div>
    );

  if (step == 4)
    return (
      <div className="flex flex-col gap-y-6 w-full text-[#fff]">
        <p className="text-[30px] font-extrabold">Checkout</p>
        <p className="text-[16px] azeret-mono-font text-[#FFFFFF87]">
          You are about to purchase {NFTDetail?.name} from ${address}
        </p>
        <ConnectedCard />
        <NFTPriceCard
          imgUrl={NFTDetail?.cloudinaryUrl}
          name={NFTDetail?.name}
          price={value}
        />
        <div className="flex flex-col gap-y-6 mt-5">
          <div className="flex justify-between items-center text-[16px] azeret-mono-font text-[#FFFFFF]">
            <span className="text-[16px] azeret-mono-font text-[#FFFFFF]">
              Price
            </span>
            <span>{tokenAmount} ETH</span>
          </div>
          <div className="flex justify-between items-center text-[16px] azeret-mono-font text-[#FFFFFF]">
            <span>VaultX Fee</span>
            <span>{fee} %</span>
          </div>
          <hr />
          <div className="flex justify-between items-center text-[16px] azeret-mono-font text-[#FFFFFF]">
            <span>You will pay</span>
            <span>{expectedAmount} ETH</span>
          </div>
          <div className="flex justify-between items-center text-[14px] azeret-mono-font text-[#FFFFFF]">
            <p>Gas fee is not included in this statement.</p>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-light">
            <button
              className="w-full h-full"
              onClick={() => {
                setStep(3);
              }}
            >
              Cancel
            </button>
          </div>
          <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-neon">
            <button className="w-full h-full" onClick={handleAuctionBid}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    );

  if (step == 5)
    return (
      <div className="flex flex-col gap-y-4 items-center text-center">
        <img src="/icons/refresh.svg" className="w-20 mx-auto" />
        <p className="text-lg font-medium">Please wait while we place bid</p>
      </div>
    );

  if (step == 6)
    return (
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-5 justify-center text-center mb-[40px]">
          <img
            src="/icons/success.svg"
            className="w-[115px] h-[115px] mx-auto"
          />
          <p className="text-[30px] text-[#fff] font-extrabold ">
            Bid Deposit Success
          </p>
          <p className=" azeret-mono-font text-[#FFFFFF87]">
            Your bid amount has been successfully deposited.
          </p>
        </div>

        <div className="flex flex-col gap-y-3 mb-[20px]">
          <div className="flex justify-between">
            <div className="w-[48%] p-4 rounded-md border border-[#FFFFFF24]">
              <p className=" azeret-mono-font text-[#FFFFFF87]">From</p>
              <p className="text-neon azeret-mono-font">
                {trimString(activeAccount.address)}
              </p>
            </div>
            <div className="w-[48%] p-4 rounded-md border border-[#FFFFFF24]">
              <p className=" azeret-mono-font text-[#FFFFFF87]">To</p>
              <p className="text-neon azeret-mono-font">
                {trimString(NFTDetail.owner.wallet)}
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="w-[48%] p-4 rounded-md border border-[#FFFFFF24]">
              <p className=" azeret-mono-font text-[#FFFFFF87]">
                Payment Method
              </p>
              <p className="text-neon azeret-mono-font">{activeChain.name}</p>
            </div>
            <div className="w-[48%] p-4 rounded-md border border-[#FFFFFF24]">
              <p className=" azeret-mono-font text-[#FFFFFF87]">Payment Time</p>
              <p className="text-neon azeret-mono-font">
                {moment().format('DD MMM, YY')}
              </p>
            </div>
          </div>
        </div>

        <div className="py-3 w-full rounded-lg text-black font-semibold bg-[#DEE8E8]">
          <button
            className="w-full h-full bg-[#DEE8E8]"
            onClick={() => {
              setStep(7);
            }}
          >
            close
          </button>
        </div>
      </div>
    );

  if (step == 7) {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <div className="flex flex-col items-center justify-center text-center">
          <img src="/icons/triangle-alert.svg" className="w-28" />

          <p className="text-[30px] text-[#fff] font-extrabold mt-4 mb-4">
            Do not disclose buyer shipping information to third parties!
          </p>
        </div>

        <p className="text-[16px] azeret-mono-font font-extrabold text-[#FFFFFF87]">
          To maintain the confidentiality of buyer information and ensure smooth
          transactions, please pay close attention to the following points:
          <br />
          <br />
          1. Confidentiality of Shipping Information: Buyer shipping information
          should remain confidential to sellers. Be cautious to prevent any
          external disclosures.
          <br />
          <br />
          2. Tips for Safe Transactions: Handle buyer shipping information
          securely to sustain safe and transparent transactions.
          <br />
          <br />
          3. Protection of Personal Information: As a seller, it is imperative
          to treat buyer personal information with utmost care. Avoid disclosing
          it to third parties. We kindly request your strict adherence to these
          guidelines to uphold transparency and trust in your transactions.
          Ensuring a secure transaction environment benefits everyone involved.
          <br />
          <br />
          <br />
        </p>
        <span className="text-[#fff] font-extrabold text-center mb-4">
          {' '}
          Thank You !
        </span>
        <div className="py-3 w-full rounded-lg text-black font-semibold bg-neon px-20">
          <button
            className="w-full h-full bg-neon"
            onClick={() => {
              onClose();
            }}
          >
            I Agree
          </button>
        </div>
      </div>
    );
  }

  return null;
}
