import React, { useEffect, useState } from 'react';
import { FundingCardItem } from './FundingCardItem';
import { FetchingPrice } from './FetchingPrice';
import { useCreateNFT } from '@/app/components/Context/CreateNFTContext';
import { RampDTO, rampDtoSchema } from '@/dto/ramp.dto';
import { useActiveAccount } from 'thirdweb/react';
import {
  Address,
  parseEventLogs,
  PreparedTransaction,
  prepareEvent,
  sendTransaction,
  waitForReceipt,
} from 'thirdweb';
import { createRamp } from '@/actions/ramp';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  fundingMethodState,
  moonpayVisibleState,
  thirdwebVisibleState,
} from '@/hooks/recoil-state';
import { checksumAddress } from 'thirdweb/utils';
import { chain, contract, maxBlocksWaitTime } from '@/lib/contract';
import { CBPayInstanceType, initOnRamp } from '@coinbase/cbpay-js';
import { client } from '@/lib/client';
import { CreateSellService } from '@/services/legacy/createSellService';
import { CreateNftServices } from '@/services/legacy/createNftService';
import { sendTransactionNotification } from '@/actions/notification';

interface FundingModalProps {
  handleCancel: () => void;
  handleNext: () => void;
  tokenAmount: string;
  nftId: string;
  onClose: () => void;
  fetchNftData: () => void;
  fundingTransaction: PreparedTransaction | null;
  fundingData: any;
}

export const FundingModal: React.FC<FundingModalProps> = ({
  handleCancel,
  handleNext,
  tokenAmount,
  nftId,
  onClose,
  fetchNftData,
  fundingTransaction,
  fundingData,
}: FundingModalProps) => {
  const {
    sellerInfo: { shipping, contact },
    setSellerInfo,
  } = useCreateNFT();
  const activeAccount = useActiveAccount();
  const option = useRecoilValue(fundingMethodState);
  const [onrampInstance, setOnrampInstance] =
    useState<CBPayInstanceType | null>();

  const [moonpayVisible, setMoonpayVisible] =
    useRecoilState(moonpayVisibleState);
  const [thirdwebVisible, setThirdwebVisible] =
    useRecoilState(thirdwebVisibleState);

  const handleContinue = async () => {
    if (!activeAccount?.address) return;

    if (option === 'Thirdweb') {
      setThirdwebVisible(true);
      onClose();
      return;
    }

    if (option === 'Coinbase') {
      onrampInstance?.open();
      onClose();
      return;
    }

    if (option !== 'Moonpay') return;

    // Create ramp data here
    const rampData: RampDTO = {
      name: shipping?.name,
      email: shipping?.email,
      country: shipping?.country,
      address: shipping?.address,
      phoneNumber: shipping?.phoneNumber,
      contactInformation: contact?.contactInfo,
      concent: '',
      type: 'moonpay',
      nftId,
      buyerWallet: checksumAddress(activeAccount.address) as Address,
    };

    try {
      rampDtoSchema.parse(rampData);
      const createdRamp = await createRamp(rampData);
      onClose();
      if (option === 'Moonpay') {
        setMoonpayVisible(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const handleFunding = async () => {
    if (fundingData) {
      const { minted, ...rest } = fundingData;
      if (minted) {
        const { transactionHash } = await sendTransaction({
          transaction: fundingTransaction,
          account: activeAccount,
        });

        const receipt = await waitForReceipt({
          client,
          chain,
          transactionHash,
          maxBlocksWaitTime,
        });

        const AssetPurchasedEvent = prepareEvent({
          signature: 'event AssetPurchased(uint256 indexed tokenId)',
        });

        const events = parseEventLogs({
          logs: receipt.logs,
          events: [AssetPurchasedEvent],
        });

        if (events.length === 0) return;

        const saleService = new CreateSellService();
        await saleService.buyItem({
          ...rest,
          buyHash: transactionHash,
        });
      } else {
        const { transactionHash } = await sendTransaction({
          transaction: fundingTransaction,
          account: activeAccount,
        });

        const receipt = await waitForReceipt({
          client,
          chain: chain,
          transactionHash,
          maxBlocksWaitTime,
        });

        const TransferEvent = prepareEvent({
          signature:
            'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
        });

        const events = parseEventLogs({
          logs: receipt.logs,
          events: [TransferEvent],
        });

        if (events.length === 0) return;
        const tokenId = events[0].args.tokenId;
        const createNftService = new CreateNftServices();
        await createNftService.mintAndSale({
          nftId: rest?.nftId,
          mintHash: transactionHash,
          tokenId: Number(tokenId),
        });
        const saleService = new CreateSellService();
        await saleService.buyItem({
          ...rest,
          buyHash: transactionHash,
        });
      }
      await sendTransactionNotification('purchased', rest?.nftId);
    }
  };

  useEffect(() => {
    initOnRamp(
      {
        appId: '7136b4db-0931-4404-8540-edf0c5181ca7',
        widgetParameters: {
          // Specify the addresses and which networks they support
          addresses: { [contract.address]: [chain.name] },
          // (Optional) Filter the available assets on the above networks to just these ones
          assets: ['ETH'],
          presetCryptoAmount: fundingData?.amount,
          defaultExperience: 'buy',
        },
        onSuccess: () => {
          handleFunding();
        },
        onExit: () => {
          console.log('exit');
        },
        onEvent: (event) => {
          console.log('event', event);
        },
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        closeOnExit: true,
        closeOnSuccess: true,
      },
      (_, instance) => {
        setOnrampInstance(instance);
      },
    );

    // When button unmounts destroy the instance
    return () => {
      onrampInstance?.destroy();
    };
  }, []);

  return (
    <>
      <div className="flex flex-col gap-y-5 w-full">
        <p className="text-5xl font text-center text-white font-extrabold mt-10">
          Purchase with Credit Card
        </p>
        <p className="text-xl font-medium text-center text-gray-200 whitespace-pre-line mt-6 mb-6">
          {
            "Compare available rates from our trusted providers. We've sorted all"
          }
          <br />
          options by total price to help you find the best deal.
        </p>

        <FetchingPrice className="mx-16" />
        <div className="mx-16 py-6">
          {/* <FundingCardItem fundingType="Moonpay" tokenAmount={tokenAmount} /> */}
          <FundingCardItem fundingType="Thirdweb" tokenAmount={tokenAmount} />
          {/* <FundingCardItem fundingType="Coinbase" tokenAmount={tokenAmount} /> */}
        </div>

        <div></div>
        <div className="flex justify-between mx-10">
          <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-light">
            <button
              className="w-full h-full"
              onClick={() => {
                handleCancel();
              }}
            >
              Cancel
            </button>
          </div>
          <div className="py-3 w-[48%] rounded-lg text-black bg-neon font-extrabold text-sm">
            <button
              className="w-full h-full"
              onClick={() => {
                handleContinue();
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
