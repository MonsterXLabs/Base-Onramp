import { useNFTDetail } from '@/app/components/Context/NFTDetailContext';
import { unlistAsset } from '@/lib/helper';
import { CreateSellService } from '@/services/legacy/createSellService';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';

interface RemoveSaleModalProps {
  onClose: () => void;
}

export const RemoveSaleModal: React.FC<RemoveSaleModalProps> = ({
  onClose,
}: RemoveSaleModalProps) => {
  const [step, setStep] = useState(1);
  const { NFTDetail: data } = useNFTDetail();
  const activeAccount = useActiveAccount();
  const createSellService = new CreateSellService();

  const handleRemove = async () => {
    try {
      let transactionHash;
      if (data?.minted)
        transactionHash = await unlistAsset(data.tokenId, activeAccount);

      await createSellService.endSale({
        nftId: data._id,
        endSaleHash: transactionHash,
      });
      setStep(2);
    } catch (error) {
      onClose();
      console.log(error);
    }
  };

  const hasRun = React.useRef(false);

  useEffect(() => {
    if (!hasRun.current && step === 1) {
      handleRemove();
      hasRun.current = true;
    }
  }, [step]);

  if (step === 1) {
    return (
      <div className="flex flex-col gap-y-9 items-center text-center">
        <Image
          src="/icons/refresh.svg"
          alt="refresh"
          className="w-20 mx-auto"
          width={80}
          height={80}
        />
        <p className="text-[30px] font-medium">
          Please wait while
          <br /> we remove it from sale.
        </p>
      </div>
    );
  } else if (step === 2) {
    return (
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-5 justify-center text-center mb-[40px]">
          <img
            src="/icons/success.svg"
            className="w-[115px] h-[115px] mx-auto"
          />
          <p className="text-[30px] text-[#fff] font-extrabold ">
            Removed From Sale Successfully!
          </p>
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
    );
  } else {
    return null;
  }
};
