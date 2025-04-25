'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@headlessui/react';
import { useCreateNFT } from '../../Context/CreateNFTContext';
import BaseButton from '../../ui/BaseButton';
import ContactInfo from '../ContactInfo';
import ShippingInfo from '../ShippingInfo';

export default function SellerInformation({
  handler,
  nextStep,
}: {
  handler: (data: any, error: any) => void;
  nextStep: (next?: boolean) => void;
}) {
  const { sellerInfo, setSellerInfo } = useCreateNFT();
  const cancelChanges = () => {
    nextStep(false);
  };

  const create = () => {
    const err = [];
    if (!sellerInfo.shippingId) {
      err.push({ path: ['Shipping Information'] });
    }

    if (!sellerInfo.contactId) {
      err.push({ path: ['Contact Information'] });
    }

    if (
      !sellerInfo?.length &&
      !sellerInfo?.height &&
      !sellerInfo?.weight &&
      !sellerInfo?.width
    ) {
      err.push({ path: ['Shipping Dimensions'] });
    }

    if (!sellerInfo.accepted) {
      err.push({
        path: ['shipping_accept'],
      });
    }

    if (err.length > 0) {
      handler(null, JSON.stringify(err));
      return;
    } else {
      handler(null, null);
      nextStep(true);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <ShippingInfo />
      <ContactInfo />
      <div className="bg-dark p-4 gap-y-4 rounded-lg flex flex-col">
        <p className="sm:text-base text-sm md:text-lg">Shipping Dimensions</p>
        <hr />
        <div className="grid grid-cols-12 gap-3">
          <div className="flex xs:col-span-6 sm:col-span-4 col-span-12 md:col-span-3 flex-col gap-y-2 max-w-[20rem]">
            <Label className="font-medium sm:text-base text-sm">
              Height(cm)
            </Label>
            <Input
              value={sellerInfo.length}
              type="number"
              placeholder="--"
              className="bg-[#161616] border border-none sm:h-[52px] focus:placeholder-transparent number-input"
              onChange={(e) => {
                setSellerInfo({
                  ...sellerInfo,
                  length: (e.target as any).value,
                });
              }}
            />
          </div>
          <div className="flex xs:col-span-6 sm:col-span-4 col-span-12 md:col-span-3 flex-col gap-y-2 max-w-[20rem]">
            <Label className="font-medium sm:text-base text-sm">
              Width(cm)
            </Label>
            <Input
              value={sellerInfo.width}
              type="number"
              placeholder="--"
              className="bg-[#161616] border border-none sm:h-[52px] focus:placeholder-transparent number-input"
              onChange={(e) => {
                setSellerInfo({
                  ...sellerInfo,
                  width: (e.target as any).value,
                });
              }}
            />
          </div>
          <div className="flex xs:col-span-6 sm:col-span-4 col-span-12 md:col-span-3 flex-col gap-y-2 max-w-[20rem]">
            <Label className="font-medium sm:text-base text-sm">
              Depth(cm)
            </Label>
            <Input
              value={sellerInfo.height}
              type="number"
              placeholder="--"
              className="bg-[#161616] border border-none sm:h-[52px] focus:placeholder-transparent number-input"
              onChange={(e) => {
                setSellerInfo({
                  ...sellerInfo,
                  height: (e.target as any).value,
                });
              }}
            />
          </div>
          <div className="flex xs:col-span-6 sm:col-span-4 col-span-12 md:col-span-3 flex-col gap-y-2 max-w-[20rem]">
            <Label className="font-medium sm:text-base text-sm">
              Weight(kg)
            </Label>
            <Input
              value={sellerInfo.weight}
              type="number"
              placeholder="--"
              className="bg-[#161616] border border-none sm:h-[52px] focus:placeholder-transparent number-input"
              onChange={(e) => {
                setSellerInfo({
                  ...sellerInfo,
                  weight: (e.target as any).value,
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-dark p-4 gap-y-4 rounded-lg flex flex-col">
        <div>
          <p className="sm:text-base text-sm font-medium mb-1">
            Consent for collection and usage of personal information
          </p>
          <p className="text-white/[53%] azeret-mono-font text-xs sm:text-xs">
            Please read the following and check the appropriate boxes to
            indicate your consent:
          </p>
        </div>
        <hr className="border-white/[8%]" />
        <Textarea
          disabled={true}
          className="p-4 rounded-md azeret-mono-font overflow-hidden w-full border-none placeholder:text-white/[53%] bg-[#161616] text-sm placeholder:text-xs font-AzeretMono"
          rows={4}
          placeholder={`We collect two types of information from you: 
1. Personal Information: This includes your individual information such as Email, Phone Number, Username, Avatar, Profile Picture, Date of Birth, and more.  
2. Non-Personal Information: This includes information that does not identify you as an individual, such as your device type, browser type, operating system, IP address, browsing history, and clickstream data.`}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="terms"
          type="checkbox"
          checked={sellerInfo.accepted}
          onChange={() =>
            setSellerInfo({
              ...sellerInfo,
              accepted: !sellerInfo.accepted,
            })
          }
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to all terms, privacy policy and fees
        </label>
      </div>

      <div className="flex gap-x-4 justify-center my-5">
        <BaseButton
          title="Previous"
          variant="secondary"
          onClick={cancelChanges}
        />

        <BaseButton
          title="Proceed To Create NFT"
          variant="primary"
          onClick={create}
        />
      </div>
    </div>
  );
}
