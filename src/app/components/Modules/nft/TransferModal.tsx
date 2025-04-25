import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import BaseButton from '../../ui/BaseButton';
import { useNFTDetail } from '../../Context/NFTDetailContext';
import { Address, isAddress } from 'thirdweb';
import { transferNFT } from '@/lib/helper';
import { useActiveAccount } from 'thirdweb/react';
import NftServices from '@/services/legacy/nftService';
import { nftServices } from '@/services/legacy/supplier';

export default function TransferModal({
  onClose,
  fetchNftData,
}: {
  onClose: () => void;
  fetchNftData: () => void;
}) {
  const { NFTDetail, nftId, burnable } = useNFTDetail();
  const activeAccount = useActiveAccount();
  const [toAddress, setToAddress] = useState('');
  const nftService = new NftServices();

  const handleTransfer = async () => {
    try {
      if (!isAddress(toAddress)) {
        throw new Error('Transfer address is not valid.');
      }

      let transactionHash = '';
      if (NFTDetail?.minted) {
        transactionHash = await transferNFT(
          activeAccount?.address as Address,
          toAddress,
          NFTDetail.tokenId,
          activeAccount,
        );
      }

      await nftServices.transfer({
        nftId,
        toAddress,
        transferHash: transactionHash,
      });

      await fetchNftData();
    } catch (error) {
      console.log(error);
    }
  };

  if (!burnable)
    return (
      <div className="flex flex-col gap-y-5 w-full">
        <Label className="text-lg font-medium">Transfer RWA</Label>
        <p>
          {`You can't transfer current NFT. Only owner and not saled NFT can be transfered.`}
        </p>
        <div className="flex gap-x-4 justify-center my-3 px-4">
          <BaseButton title="Close" variant="secondary" onClick={onClose} />
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-y-5 w-full">
      <Label className="text-lg font-medium">Transfer RWA</Label>
      <p>Transfer this token from your wallet to other wallet.</p>

      <div className="flex flex-col gap-y-2">
        <Label>Recepient Address*</Label>
        <Input
          placeholder="Recipient Address..."
          className="w-full"
          value={toAddress ?? ''}
          onChange={(e) => setToAddress((e.target as any).value)}
        />
      </div>

      <div className="flex gap-x-4 justify-center my-3 px-4">
        <BaseButton title="Cancel" variant="secondary" onClick={onClose} />
        <BaseButton
          title="Confirm"
          variant="primary"
          onClick={() => handleTransfer()}
        />
      </div>
    </div>
  );
}
