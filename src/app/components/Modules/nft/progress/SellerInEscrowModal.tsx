import React from 'react';

interface SellerInEscrowModalProps {
  onClose: () => void;
}
export const SellerInEscrowModal: React.FC<SellerInEscrowModalProps> = ({
  onClose,
}: SellerInEscrowModalProps) => {
  return (
    <div className="flex flex-col gap-y-5 w-full">
      <p className="text-xl azeret-mono-font font-extrabold text-center">
        This transaction is currently in escrow
      </p>
      <p className="azeret-mono-font text-[#858585]">
        {`Both the seller's RWA and buyer's payment are now safely stored in VaultX's escrow smart contract. The following steps will guide you through the process:`}
        <ol className="list-decimal ml-10 mt-5">
          <li className="mb-3">
            Artwork Delivery: The buyer receives the artwork
          </li>
          <li className="mb-3">
            {`Quality Check: The buyer will request 'Escrow Release' after confirming the artwork's satisfactory condition`}
          </li>
          <li className="mb-3">
            {`Escrow Release: Following the buyer's release confirmation, two transfers will occur: the seller's asset (RWA) to the buyer and the purchase amount to the seller's wallet. This completes the transaction.`}
          </li>
        </ol>
      </p>

      <p className="text-white azeret-mono-font text-[18px] font-extrabold text-center">
        Thank You !
      </p>

      <div className="py-3 w-full rounded-lg text-black font-semibold bg-neon">
        <button
          className="w-full h-full font-extrabold text-sm"
          onClick={() => {
            onClose();
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
};
