import { useCreateNFT } from '@/app/components/Context/CreateNFTContext';
import { ISellerInfo } from '@/types';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { z } from 'zod';
import ShippingInfo from '../../ShippingInfo';
import ContactInfo from '../../ContactInfo';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRecoilState } from 'recoil';
import { listPriceState } from '@/hooks/recoil-state';

const addressSchema = z.object({
  accepted: z.boolean().refine((val) => val === true, {
    message: 'Please click the checkbox to agree',
  }),
  shippingId: z.string().nonempty(),
  contactId: z.string().nonempty(),
});

const priceSchema = z.number().positive();

type AddressSchemaError = z.inferFormattedError<typeof addressSchema>;
type PriceSchemaError = z.inferFormattedError<typeof priceSchema>;

interface AddressTemplateProps {
  handleCancel: () => void;
  handleNext: () => void;
  title: string;
  listPrice?: boolean;
}

export const AddressTemplate: React.FC<AddressTemplateProps> = ({
  handleCancel,
  handleNext,
  title,
  listPrice,
}: AddressTemplateProps) => {
  const [price, setPrice] = useRecoilState(listPriceState);
  const [priceError, setPriceError] = useState<PriceSchemaError | null>(null);
  const [addressError, setAddressError] = useState<AddressSchemaError | null>(
    null,
  );
  const [shipInfo, setShipInfo] = useState<Partial<ISellerInfo> | null>(null);
  const {
    sellerInfo: { shippingId, contactId },
  } = useCreateNFT();
  const [accepted, setAccepted] = useState<boolean>(false);
  const handleAddressError = () => {
    const result = addressSchema.safeParse({
      accepted,
      shippingId,
      contactId,
    });

    const priceResult = priceSchema.safeParse(price);

    let status = false;

    if (!result.success) {
      setAddressError(result.error.format());
    } else {
      setAddressError(null);
      status = true;
    }

    if (!priceResult.success && listPrice) {
      setPriceError(priceResult.error.format());
      status = false;
    } else {
      setPriceError(null);
    }
    return status;
  };

  return (
    <div className="flex flex-col gap-y-5 w-full">
      <div className="flex items-center gap-x-2">
        <Image
          src={'/icons/alert.svg'}
          width={49}
          height={50}
          className="w-8 h-8"
          quality={100}
          alt="alert"
        />
        <h1 className="font-extrabold text-[30px]">{title}</h1>
      </div>
      {listPrice && (
        <div className="rounded-[20px] px-5 py-3 bg-[#232323]">
          <Disclosure as="div" defaultOpen={true}>
            {({ open }) => (
              <>
                <DisclosureButton
                  className={cn(
                    'flex w-full flex-col justify-between py-2 pb-3 text-left   text-lg font-medium text-white text-[18px]',
                    open ? 'border-b border-white/[8%]' : '',
                  )}
                >
                  <div className="flex w-full justify-between items-center">
                    <Label className="font-extrabold text-lg text-white">
                      List Price (USD only)*
                    </Label>
                    <div className="flex justify-center">
                      <ChevronUpIcon
                        className={`${
                          open ? 'rotate-180 transform' : ''
                        } h-5 w-5 text-white/[53%]`}
                      />
                    </div>
                  </div>
                </DisclosureButton>
                <DisclosurePanel className=" pt-4 pb-2 text-sm text-white  rounded-b-lg">
                  <div className="flex justify-between">
                    <Input
                      value={price ? price.toString() : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Validate the value to allow decimals and numbers only
                        if (!isNaN(Number(value)) && Number(value) >= 0) {
                          setPrice(Number(value));
                        }
                      }}
                      className="w-full border-none h-[52px] px-[26px] py-[15px] bg-[#161616] rounded-xl placeholder:text-sm azeret-mono-font justify-start items-center gap-[30px] inline-flex focus:placeholder-transparent focus:outline-none"
                      type="text" // Change to 'text' to allow decimals
                      placeholder="Please write the selling price in USD($), not cryptocurrency."
                    />
                  </div>
                  {priceError && (
                    <p className="text-[#DDF247] text-sm">
                      Please enter list price
                    </p>
                  )}
                </DisclosurePanel>
                <DisclosurePanel className="pt-4 pb-2 text-sm  text-white  rounded-b-lg"></DisclosurePanel>
              </>
            )}
          </Disclosure>
        </div>
      )}
      <div className="rounded-[20px] px-5 py-3 bg-[#232323]">
        <Disclosure as="div" defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton
                className={cn(
                  'flex w-full flex-col justify-between py-2 pb-3 text-left   text-lg font-medium text-white text-[18px]',
                  open ? 'border-b border-white/[8%]' : '',
                )}
              >
                <div className="flex w-full justify-between items-center">
                  <Label className="font-extrabold text-lg text-white">
                    Shipping Information
                  </Label>
                  <div className="flex justify-center">
                    <ChevronUpIcon
                      className={`${
                        open ? 'rotate-180 transform' : ''
                      } h-5 w-5 text-white/[53%]`}
                    />
                  </div>
                </div>
              </DisclosureButton>
              <DisclosurePanel className="pt-4 pb-2 text-sm  text-white  rounded-b-lg">
                <ShippingInfo isSetting />
                {addressError?.shippingId && (
                  <p className="text-[#DDF247] text-sm">
                    Please select a template
                  </p>
                )}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>
      <div className="rounded-[20px] px-5 py-3 bg-[#232323]">
        <Disclosure as="div" defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton
                className={cn(
                  'flex w-full flex-col justify-between py-2 pb-3 text-left   text-lg font-medium text-white text-[18px]',
                  open ? 'border-b border-white/[8%]' : '',
                )}
              >
                <div className="flex w-full justify-between items-center">
                  <Label className="font-extrabold text-lg text-white">
                    Contact Information
                  </Label>
                  <div className="flex justify-center">
                    <ChevronUpIcon
                      className={`${
                        open ? 'rotate-180 transform' : ''
                      } h-5 w-5 text-white/[53%]`}
                    />
                  </div>
                </div>
              </DisclosureButton>
              <DisclosurePanel className="pt-4 pb-2 text-sm  text-white  rounded-b-lg">
                <ContactInfo isSetting />
                {addressError?.contactId && (
                  <p className="text-[#DDF247] text-sm">
                    Please select a template
                  </p>
                )}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>
      {/* <div className="w-full rounded-[20px] px-4 py-3 bg-dark flex flex-col gap-y-6 bg-[#232323]">
        <p>Shipment Information</p>
        <hr />
        <div className="grid grid-cols-12 gap-3">
          <div className="flex col-span-3 flex-col gap-y-2 max-w-[20rem]">
            <Label className="font-medium">Length(cm)</Label>
            <Input
              value={shipInfo?.length ?? ""}
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
              value={shipInfo?.width ?? ""}
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
            <Label className="font-medium">Height(cm)</Label>
            <Input
              value={shipInfo?.height ?? ""}
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
              value={shipInfo?.weight ?? ""}
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
      </div> */}

      <div className="w-full rounded-[20px] px-4 py-3 bg-dark flex flex-col gap-y-6 bg-[#232323]">
        <Disclosure as="div" defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full flex-col justify-between py-2 text-left   text-lg font-medium text-[#fff] text-[18px] border-b border-[#FFFFFF80] ">
                <div className="flex w-full justify-between">
                  <span>
                    Consent for collection and usage of personal information
                  </span>
                  <ChevronUpIcon
                    className={`${
                      open ? 'rotate-180 transform' : ''
                    } h-5 w-5 text-white`}
                  />
                </div>
                <p className="text-[#ffffff53] text-[16px] azeret-mono-font">
                  Please read the following and check the appropriate boxes to
                  indicate your consent:
                </p>
              </DisclosureButton>

              <DisclosurePanel className=" pt-4 pb-2 text-sm text-white  rounded-b-lg">
                <div className="text-white/50 text-base font-normal font-['Azeret Mono'] leading-relaxed">
                  We collect two types of information from you:
                  <br />
                  1. Personal Information: This includes your individual
                  information such as Email, Phone Number, Username, Avatar,
                  Profile Picture, Date of Birth, and more.
                  <br />
                  2. Non-Personal Information: This includes information that
                  does not identify you as an individual, such as your device
                  type, browser type, operating system, IP address, browsing
                  history, and clickstream data.
                  <br />
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>

      <div className="flex flex-col space-y-2 p-4">
        <div className="flex items-center space-x-2">
          <input
            id="terms"
            type="checkbox"
            checked={accepted}
            onChange={() => setAccepted((prev) => !prev)}
          />
          <label
            htmlFor="terms"
            className="text-[14px] azeret-mono-font font-medium leading-none text-[#FFFFFF87]"
          >
            I agree to all terms, privacy policy and fees
          </label>
        </div>

        {addressError?.accepted && (
          <p className="text-[#DDF247] text-sm">
            Please click the checkbox to agree
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-light">
          <button
            className="w-full h-full"
            onClick={() => {
              handleCancel();
            }}
          >
            Discard
          </button>
        </div>
        <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-neon">
          <button
            className="w-full h-full"
            onClick={async () => {
              if (handleAddressError()) {
                handleNext();
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
