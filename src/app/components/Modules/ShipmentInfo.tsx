import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useCreateNFT } from '../Context/CreateNFTContext';

export const ShipmentInfo: React.FC = () => {
  const { sellerInfo: shipInfo, setSellerInfo: setShipInfo } = useCreateNFT();
  return (
    <div className="w-full rounded-[20px] px-4 py-3 bg-dark flex flex-col gap-y-6 bg-[#232323]">
      <p>Shipment Information</p>
      <hr />
      <div className="grid grid-cols-12 gap-3">
        <div className="flex col-span-3 flex-col gap-y-2 max-w-[20rem]">
          <Label className="font-medium">Height(cm)</Label>
          <Input
            value={shipInfo?.length ?? ''}
            type="number"
            placeholder="--"
            className="bg-[#161616] border border-none h-[52px]"
            onChange={(e) => {
              setShipInfo({
                ...shipInfo,
                length: (e.target as any).value,
              });
            }}
          />
        </div>
        <div className="flex col-span-3 flex-col gap-y-2 max-w-[20rem]">
          <Label className="font-medium">Width(cm)</Label>
          <Input
            value={shipInfo?.width ?? ''}
            type="number"
            placeholder="--"
            className="bg-[#161616] border border-none h-[52px]"
            onChange={(e) => {
              setShipInfo({
                ...shipInfo,
                width: (e.target as any).value,
              });
            }}
          />
        </div>
        <div className="flex col-span-3 flex-col gap-y-2 max-w-[20rem]">
          <Label className="font-medium">Depth(cm)</Label>
          <Input
            value={shipInfo?.height ?? ''}
            type="number"
            placeholder="--"
            className="bg-[#161616] border border-none h-[52px]"
            onChange={(e) => {
              setShipInfo({
                ...shipInfo,
                height: (e.target as any).value,
              });
            }}
          />
        </div>
        <div className="flex col-span-3 flex-col gap-y-2 max-w-[20rem]">
          <Label className="font-medium">Weight(kg)</Label>
          <Input
            value={shipInfo?.weight ?? ''}
            type="number"
            placeholder="--"
            className="bg-[#161616] border border-none h-[52px]"
            onChange={(e) => {
              setShipInfo({
                ...shipInfo,
                weight: (e.target as any).value,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
