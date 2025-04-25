'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CreateSellService } from '@/services/legacy/createSellService';
import { useNFTDetail } from '../../Context/NFTDetailContext';
import { useGlobalContext } from '../../Context/GlobalContext';
import { parseEther } from 'viem';
import {
  getPaymentSplitsByTokenId,
  IListAsset,
  listAsset,
  resaleAsset,
} from '@/lib/helper';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import ConnectedCard from '../../Cards/ConnectedCard';
import ErrorModal from '../create/ErrorModal';
import { INFTVoucher, ISellerInfo, PaymentSplitType } from '@/types';
import { CreateNftServices } from '@/services/legacy/createNftService';
import { formatNumberWithCommas } from '@/lib/utils';
import { trimString } from '@/utils/helpers';
import moment from 'moment';
import Image from 'next/image';
import { useCreateNFT } from '../../Context/CreateNFTContext';
import { AddressTemplate } from './AddressTemplate';
import { useRecoilValue } from 'recoil';
import { listPriceState } from '@/hooks/recoil-state';
import { contract } from '@/lib/contract';
import { sendTransactionNotification } from '@/actions/notification';

export default function PutSaleModal({
  onClose,
  parentStep,
  parentSetStep, // Function to update step from parent
}: {
  onClose: () => void;
  parentStep: number; // Accept step as a prop
  parentSetStep: (value: number) => void;
}) {
  const { nftId, NFTDetail: nft } = useNFTDetail();
  const price = useRecoilValue(listPriceState);
  const { fee } = useGlobalContext();
  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const [error, setError] = useState(null);
  const {
    sellerInfo: { shipping, contact },
  } = useCreateNFT();

  const salesService = new CreateSellService();
  const nftService = new CreateNftServices();

  const [step, setStep] = useState(1);

  const [expectedAmount, setExpectedAmount] = useState(0);
  const [paymentSplits, setPaymentSplits] = useState<Array<PaymentSplitType>>(
    [],
  );
  const calculateExpectedAmount = async () => {
    let value = 0;
    let splitDetails: PaymentSplitType[] = [];
    if (!nft?.minted) {
      if (nft?.voucher) {
        const voucher: INFTVoucher = JSON.parse(nft.voucher, (key, val) => {
          // Check if the value is a number and can be safely converted to BigInt
          if (typeof val === 'number') {
            return BigInt(val);
          }
          return val;
        });
        if (voucher.paymentPercentages.length !== voucher.paymentWallets.length)
          return 0;

        voucher.paymentPercentages.forEach((percentage, index) => {
          splitDetails.push({
            paymentWallet: voucher.paymentWallets[index],
            paymentPercentage: percentage,
          });
        });
      } else {
        return 0;
      }
    } else {
      splitDetails = [...(await getPaymentSplitsByTokenId(nft?.tokenId))];
    }
    setPaymentSplits(splitDetails);
    if (splitDetails.length === 0) {
      value = (((price * (100 - fee)) / 100) * (100 - nft?.royalty)) / 100;
    } else {
      const filterSplit = splitDetails.filter(
        (split) =>
          split.paymentWallet.toLowerCase() ===
          activeAccount?.address.toLowerCase(),
      );
      if (filterSplit.length) {
        value =
          (((price * (100 - fee)) / 100) *
            Number(filterSplit[0].paymentPercentage)) /
          10000;
      }
    }
    return value;
  };
  useEffect(() => {
    calculateExpectedAmount().then(setExpectedAmount);
  }, [price, nft]);

  const resellNft = async () => {
    try {
      const parsedPrice = parseEther(price.toString());
      const transactionHash = await resaleAsset(
        nft.tokenId,
        parsedPrice,
        activeAccount,
      );
      const data = {
        nftId: nftId,
        name: shipping?.name,
        email: shipping?.email,
        country: shipping?.country,
        address: shipping?.address,
        phoneNumber: shipping?.phoneNumber,
        contactInformation: contact?.contactInfo,
        concent: '',
        saleHash: transactionHash,
        price: price,
      };

      await salesService.resellItem(data);
    } catch (error) {
      setError(JSON.stringify(error));
      console.log(error);
    }
  };

  const handleMint = async () => {
    try {
      parentSetStep(3);
      let splitPayments = [];
      // blockchain logic
      const parsedPrice = parseEther(price.toString());
      let nftPayload = {};
      if (nft?.voucher) {
        const voucher: INFTVoucher = JSON.parse(nft.voucher, (key, value) => {
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

        nftPayload = {
          curationId: Number(voucher.curationId),
          tokenURI: voucher.tokenURI,
          price: parsedPrice,
          royaltyWallet: voucher.royaltyWallet,
          royaltyPercentage: voucher.royaltyPercentage,
          paymentSplits,
          account: activeAccount,
        } as IListAsset;
      } else {
        throw new Error('Only free minted NFT can list in resale progress.');
      }
      const { tokenId, transactionHash } = await listAsset(
        nftPayload as IListAsset,
      );
      await nftService.mintAndSale({
        nftId,
        mintHash: transactionHash,
        tokenId: Number(tokenId),
      });
    } catch (error) {
      setError(JSON.stringify(error));
      console.log(error);
    }
  };

  const submit = async () => {
    setStep(3);
    try {
      if (nft?.minted) await resellNft();
      else await handleMint();
      await sendTransactionNotification('minted', nft?._id);
      setStep(4);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {error ? (
        <ErrorModal title="Error" data={error} close={() => onClose()} />
      ) : (
        <>
          {step === 1 && (
            <AddressTemplate
              handleCancel={onClose}
              handleNext={() => {
                setStep(2);
              }}
              title="Seller Information"
              listPrice
            />
          )}
          {step === 2 && (
            <div className="flex flex-col gap-y-4">
              <p className="font-extrabold text-[30px] leading-[40px]">
                List item for sale
              </p>
              <ConnectedCard isPutOnSale />

              {/* Blockchain card  */}

              <div className="flex flex-col gap-y-2">
                <p className="text-[#ffffff] text-[16px] azeret-mono-font">
                  Price
                </p>
                <div className="flex justify-start items-center border border-gray-400 rounded-md p-3 my-1 azeret-mono-font">
                  <span className="gap-x-2 mx-2">$</span>
                  <span>{formatNumberWithCommas(price)}</span>
                </div>

                <div className="flex justify-between py-3 items-center azeret-mono-font">
                  <span>Marketplace fee</span>
                  <span>{fee}%</span>
                </div>

                {nft?.royalty && (
                  <div className="flex justify-between py-3 items-center azeret-mono-font">
                    <span>Royalties</span>
                    <span>{nft.royalty}%</span>
                  </div>
                )}

                {nft?.walletAddresses.map((split, index) => (
                  <div
                    className="flex justify-between py-3 items-center azeret-mono-font"
                    key={index}
                  >
                    <span>Split payment</span>
                    <span>{split.percentage}%</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 px-2 items-center azeret-mono-font font-bold text-2xl">
                  <span>You will get</span>
                  <span>{Number(expectedAmount).toFixed(2)} $</span>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-light">
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    Discard
                  </button>
                </div>
                <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-neon">
                  <button
                    className="w-full h-full"
                    onClick={async () => await submit()}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-y-9 items-center text-center">
              <img src="/icons/refresh.svg" className="w-20 mx-auto" />
              <p className="text-[30px] font-medium leading-[40px]">
                Please wait while we put
                <br /> it on sale
              </p>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-5 justify-center text-center mb-[40px]">
                <img
                  src="/icons/success.svg"
                  className="w-[115px] h-[115px] mx-auto"
                />
                <p className="text-[30px] text-[#fff] font-extrabold ">
                  List Success!
                </p>
                <div className="flex h-36 justify-between bg-neutral-800 rounded-2xl p-5 items-center">
                  <div className="flex gap-6 items-center">
                    <div className="w-28 h-28 rounded-2xl relative">
                      <Image
                        quality={100}
                        src={nft.cloudinaryUrl}
                        alt="bottom-banner"
                        fill
                        objectFit="cover"
                      ></Image>
                    </div>
                    <p className="azeret-mono-font">{nft?.name}</p>
                  </div>
                  <p className="azeret-mono-font">
                    $ {formatNumberWithCommas(price)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-y-3 mb-[20px]">
                <div className="flex justify-between">
                  <div className="w-[48%] p-4 rounded-md border border-[#FFFFFF24]">
                    <p className=" azeret-mono-font text-[#FFFFFF87]">From</p>
                    <p className="text-neon azeret-mono-font">
                      {trimString(activeAccount?.address)}
                    </p>
                  </div>
                  <div className="w-[48%] p-4 rounded-md border border-[#FFFFFF24]">
                    <p className=" azeret-mono-font text-[#FFFFFF87]">To</p>
                    <p className="text-neon azeret-mono-font">
                      {trimString(contract?.address)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="w-[48%] p-4 rounded-md border border-[#FFFFFF24]">
                    <p className=" azeret-mono-font text-[#FFFFFF87]">
                      Payment Network
                    </p>
                    <p className="text-neon azeret-mono-font">
                      {activeChain.name}
                    </p>
                  </div>
                  <div className="w-[48%] p-4 rounded-md border border-[#FFFFFF24]">
                    <p className=" azeret-mono-font text-[#FFFFFF87]">
                      Payment Time
                    </p>
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
                    onClose();
                  }}
                >
                  close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
