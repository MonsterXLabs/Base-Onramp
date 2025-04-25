/* eslint-disable @next/next/no-img-element */
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn, decimalRegex, truncate } from '@/lib/utils';
import { collectionServices } from '@/services/legacy/supplier';
import { acceptedFormats, maxFileSize } from '@/utils/helpers';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronUpIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { useCreateNFT } from '../../Context/CreateNFTContext';
import { useGlobalContext } from '../../Context/GlobalContext';
import BaseButton from '../../ui/BaseButton';
import { BaseDialog } from '../../ui/BaseDialog';
import CancelModal from './CancelModal';
import UserArtist from './UserArtist';
import UserArtistModal from './UserArtistModal';

const basicDetailsSchema = z.object({
  productName: z.string(),
  productDescription: z.string(),
  price: z.number().positive(),
  selectedArtist: z.string(),
  curation: z.string(),
});

export default function BasicDetails({
  handler,
  nextStep,
}: {
  handler: (data: any, error: any) => void;
  nextStep: (next?: boolean) => void;
}) {
  const { basicDetail, setBasicDetail, selectedArtist } = useCreateNFT();

  const { fee } = useGlobalContext();
  const fileInputRef = useRef(null);
  const attachmentRef = useRef(null);
  const [addAttachId, setAddAttachId] = useState(0);

  const [file, setFile] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [curations, setCurations] = useState([]);

  const cancelChanges = () => {
    setBasicDetail({
      productName: null,
      productDescription: null,
      artistName: null,
      price: 0,
      curation: null,
      file: null,
      imageSrc: null,
      attachments: null,
    });
  };

  const leftAmount = useMemo(() => {
    if (isNaN(basicDetail.price)) return 0;
    return Number(basicDetail.price) - (Number(basicDetail.price) * fee) / 100;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicDetail.price]);

  const create = async () => {
    const result = basicDetailsSchema.safeParse({
      ...basicDetail,
      selectedArtist,
    });
    if (!result.success || !basicDetail.file) {
      let message = [];
      try {
        message = JSON.parse(result.error.message);
      } catch (err) {}

      if (!basicDetail.file) {
        message.push({
          code: 'invalid_type',
          expected: 'string',
          received: 'null',
          path: ['Logo Image'],
          message: 'Expected string, received null',
        });
      }
      handler(null, JSON.stringify(message));
      // console.log(result.error.message);
      return;
    }

    handler({}, null);
    nextStep(true);
  };

  const handleLogoChange = (event: any) => {
    const file = event.target.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (
      file.size < maxFileSize &&
      acceptedFormats.includes(`.${fileExtension}`)
    ) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
      setFile(file);
      setBasicDetail({
        ...basicDetail,
        file: file,
        imageSrc: URL.createObjectURL(file),
      });
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).click();
    }
  };

  const handleAttachment = (file: any, index: number) => {
    const attachment = file.target.files[0];
    const fileExtension = attachment.name.split('.').pop().toLowerCase();
    if (
      attachment.size < maxFileSize &&
      acceptedFormats.includes(`.${fileExtension}`)
    ) {
      const newAttachments = [...basicDetail?.attachments];
      newAttachments[addAttachId] = attachment;
      if (addAttachId >= newAttachments.length - 1) {
        newAttachments.push(null);
      }

      setBasicDetail({
        ...basicDetail,
        attachments: newAttachments,
      });
    }
  };

  const addAttachment = (index) => {
    if (basicDetail?.attachments.length - 1 > index) {
      return;
    }
    if (attachmentRef.current) {
      (attachmentRef.current as any).click();
    }
    setAddAttachId(index);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = basicDetail?.attachments.filter(
      (_, i) => i !== index,
    );

    setBasicDetail({
      ...basicDetail,
      attachments: newAttachments,
    });
  };

  const fetchUserCollections = async () => {
    try {
      const res = await collectionServices.getUserCollections({});
      setCurations(res.data.collection.length > 0 ? res.data.collection : []);
      setBasicDetail({
        ...basicDetail,
        curations: res.data.collection.length > 0 ? res.data.collection : [],
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (curations.length === 0) {
      fetchUserCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-12 md:gap-4 lg:gap-[20px] xl:gap-[40px] gap-y-5 flex-col lg:flex-row lg:justify-between">
        <div className="col-span-12 md:col-span-6  lg:col-span-7 xl:col-span-6 xl2:col-span-5 bg-[#232323] border-dashed rounded-[30px] border-2 border-[#3a3a3a] flex-col justify-center items-center gap-y-[23px] inline-flex self-start py-10 xs:py-16 sm:py-24 px-3 xs:px-5 sm:px-10 lg:min-h-[721px] lg:max-h-[721px]">
          {basicDetail.file ? (
            <div className="flex flex-col text-center gap-y-[23px]">
              {basicDetail.imageSrc && (
                <img
                  src={basicDetail.imageSrc}
                  alt="logo"
                  className="max-w-[90%] object-contain mx-auto max-h-[400px] "
                />
              )}
              <span
                className="break-words"
                title={basicDetail.file ? basicDetail.file.name : ''}
              >
                {basicDetail.file
                  ? truncate(basicDetail.file.name, 100)
                  : 'No files selected'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center gap-y-4 sm:gap-y-[23px]">
              <Image
                quality={100}
                src="/icons/upload.svg"
                alt="upload"
                className="w-[66px] h-[66px]"
                width={66}
                height={66}
              />
              <div className="flex flex-col gap-y-1 font-manrope">
                <p className="text-center text-white text-lg font-extrabold">
                  Upload original RWA File
                </p>
                <div>
                  <p className="mt-2 text-white/[53%] mb-[4px] font-normal text-center text-sm azeret-mono-font">
                    Drag or choose your file to IPFS upload
                  </p>
                  <p className="text-center text-white/30 text-xs azeret-mono-font">
                    PNG, GIF, WEBP, MP4 or MP3. Max 50mb.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-y-4">
            <button
              className="py-3 w-[20rem] h-[50px] text-black font-semibold bg-[#dee8e8]  p-2.5 rounded-[14px] justify-center items-center gap-2.5"
              onClick={handleButtonClick}
            >
              <span className="flex gap-x-[10px] items-center justify-center">
                <p className="text-[#161616] text-sm font-extrabold font-Manrope capitalize">
                  Browse file
                </p>
                <Image
                  quality={100}
                  src="/icons/arrow_ico.svg"
                  alt=""
                  className="w-[18px] h-[18px] "
                  width={18}
                  height={18}
                />
              </span>{' '}
            </button>
            <input
              className="hidden"
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              title="file"
            />
            {file && (
              <BaseButton
                title="Reset"
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setBasicDetail({
                    ...basicDetail,
                    file: null,
                    imageSrc: null,
                  });
                }}
                className={
                  'rounded-[14px] font-manrope py-3 w-full min-w-40 sm:w-[20rem]'
                }
              />
            )}
          </div>
        </div>
        <div className="flex flex-col col-span-12 md:col-span-6  lg:col-span-5 xl:col-span-6 xl2:col-span-7 gap-y-[30px]">
          <div className="flex flex-col gap-y-4">
            <Label className="font-extrabold text-xs sm:test-sm text-white manrope-font">
              Product name*
            </Label>
            <Input
              value={basicDetail.productName ? basicDetail.productName : ''}
              onChange={(e) =>
                setBasicDetail({
                  ...basicDetail,
                  productName: (e.target as any).value,
                })
              }
              className="w-full border-none  h-[52px] px-[26px] py-[15px] bg-[#232323] rounded-xl azeret-mono-font justify-start items-center gap-[30px] inline-flex placeholder:text-sm focus:placeholder-transparent focus:outline-none"
              type="text"
              placeholder="Enter Product Name"
            />
          </div>

          <div className="flex flex-col gap-y-4">
            <Label className="font-extrabold text-xs sm:test-sm text-white manrope-font">
              Description*
            </Label>
            <Textarea
              value={
                basicDetail.productDescription
                  ? basicDetail.productDescription
                  : ''
              }
              onChange={(e) =>
                setBasicDetail({
                  ...basicDetail,
                  productDescription: (e.target as any).value,
                })
              }
              className="w-full border-none bg-[#232323] azeret-mono-font rounded-[20px] placeholder:text-white/[53%] h-[180px] resize-none py-[15px] px-[26px] focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none placeholder:text-sm focus:placeholder-transparent focus:outline-none"
              // className="w-full border-none bg-[#232323] py-[15px]  px-[25px] rounded-xl text-[11px]"
              placeholder="Please describe your product"
            />
          </div>

          <div className="flex flex-col gap-y-4">
            <Label className="font-extrabold text-xs sm:test-sm text-white manrope-font">
              Price(USD)*
            </Label>
            <Input
              value={basicDetail.price?.toString() ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                if (!decimalRegex.test(e.target.value)) return;
                // Validate the value to allow decimals and numbers only
                setBasicDetail({
                  ...basicDetail,
                  price: parseFloat(e.target.value) || 0, // Convert the value to number to allow decimals
                });
              }}
              className="w-full border-none h-[52px] px-[26px] py-[15px] bg-[#232323] rounded-xl placeholder:text-sm azeret-mono-font justify-start items-center gap-[30px] inline-flex number-input focus-visible:outline-none focus:placeholder-transparent focus-visible:shadow-none border-0 outline-none"
              type="number" // Change to 'text' to allow decimals
              placeholder="Please write the selling price in USD($), not cryptocurrency."
            />
          </div>

          <div className="w-full rounded-[17px] px-5 py-[12px] bg-[#232323] flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-3">
              <div className="flex justify-between">
                <Label className="font-bold text-xs sm:text-sm">
                  Marketplace Fee
                </Label>
                <Label className="font-bold">${fee}%</Label>
              </div>
              <hr className="border-white/[8%]" />
              <div className="flex justify-between">
                <Label className="font-bold text-xs sm:text-sm">
                  You will receive
                </Label>
                <Label className="">${leftAmount}</Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <Label className="font-extrabold text-xs sm:test-sm text-white manrope-font">
              Artist name*
            </Label>
            <div className="grid grid-cols-12 gap-x-2 p-3 bg-[#232323] rounded-[17px]">
              <div className="col-span-9">
                <UserArtist />
              </div>
              <div className="col-span-3">
                <BaseDialog
                  className="bg-[#111111] lg:min-w-[1400px] max-h-[80%] w-full overflow-y-auto overflow-x-hidden"
                  trigger={
                    <div className="flex h-[42px] py-3 px-4 cursor-pointer justify-center relative gap-x-2 items-center w-full bg-[#DDF247]/[9%] rounded-md">
                      <Image
                        quality={100}
                        width={20}
                        height={20}
                        alt="icon"
                        src="/icons/add-new.svg"
                        className="w-5 h-5"
                      />
                      <p className="text-center font-bold text-xs text-white">
                        Add Artist
                      </p>
                    </div>
                  }
                >
                  <UserArtistModal editUser={null} />
                </BaseDialog>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <Label className="font-extrabold text-xs sm:test-sm text-white manrope-font">
              Curation*
            </Label>
            <div className="bg-[#232323] rounded-xl pr-4">
              <select
                aria-label="Select curation"
                className="w-full border-none bg-[#232323] h-[52px] px-[15px] py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                name="curation"
                onChange={(e) =>
                  setBasicDetail({
                    ...basicDetail,
                    curation: (e.target as any).value,
                  })
                }
                value={basicDetail.curation ?? ''}
              >
                <option value="" className="">
                  You must choose Curation*
                </option>
                {basicDetail.curations.length > 0
                  ? basicDetail?.curations?.map((item: any, index: number) => (
                      <option key={index} value={JSON.stringify(item)}>
                        {item.name}
                      </option>
                    ))
                  : null}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-y-4 bg-dark px-[20px] py-3 rounded-lg">
            <Disclosure as="div" defaultOpen={true}>
              {({ open }) => (
                <>
                  <DisclosureButton
                    className={cn(
                      'flex w-full flex-col justify-between py-2 pb-3 text-left text-lg font-medium text-white text-[18px]',
                      open ? 'border-b border-white/[8%]' : '',
                    )}
                  >
                    <div className="flex w-full justify-between items-center">
                      <Label className="font-extrabold test-[20] text-white">
                        Attachment
                      </Label>
                      {/* <Label className="font-extrabold text-xs sm:test-sm text-white manrope-font">
                        Your l÷inks
                      </Label> */}
                      <ChevronUpIcon
                        className={`${
                          open ? 'rotate-180 transform' : ''
                        } h-5 w-5 text-white/[53%]`}
                      />
                    </div>
                  </DisclosureButton>
                  <DisclosurePanel className="pt-4 pb-2 text-sm  text-white  rounded-b-lg">
                    <div className="flex gap-4 flex-wrap my-2">
                      {basicDetail?.attachments?.map((attachment, index) => {
                        return (
                          <div key={index} className="flex flex-col gap-y-4">
                            <input
                              type="file"
                              className="hidden"
                              title="file"
                              ref={
                                index === basicDetail?.attachments.length - 1
                                  ? attachmentRef
                                  : null
                              }
                              onChange={(e) => handleAttachment(e, index)}
                            />
                            {!attachment ? (
                              <img
                                src="https://i.ibb.co/c8FMdw1/attachment-link.png"
                                alt="attachment"
                                className="w-[200px] mx-auto h-[200px] rounded-md object-cover"
                              />
                            ) : (
                              <img
                                src={URL.createObjectURL(attachment)}
                                alt="attachment"
                                className="w-[200px] mx-auto h-[200px] rounded-md object-cover"
                              />
                            )}
                            {attachment ? (
                              <div className="flex gap-x-2 justify-center items-center cursor-pointer">
                                <span
                                  className="text-neon font-bold text-[13px]"
                                  onClick={() => addAttachment(index)}
                                >
                                  Change
                                </span>
                                <img
                                  src="/icons/trash.svg"
                                  alt="attachment"
                                  className="w-5 h-5"
                                  onClick={() => removeAttachment(index)}
                                />
                              </div>
                            ) : (
                              <div
                                className="flex gap-x-2 justify-center items-center cursor-pointer"
                                onClick={() => addAttachment(index)}
                              >
                                <span className="text-neon  font-bold text-[13px]">
                                  Upload
                                </span>
                                <img
                                  src="/icons/upload.svg"
                                  alt="attachment"
                                  className="w-5 h-5"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>
        </div>
      </div>
      <div className="flex w-full gap-x-4 justify-center  items-center my-5">
        <BaseDialog
          trigger={
            <BaseButton
              title="Cancel"
              variant="secondary"
              onClick={cancelChanges}
              className="w-[49%]"
            />
          }
          className="bg-dark max-h-[80%]  overflow-y-auto overflow-x-hidden items-center w-[35rem]"
        >
          <CancelModal />
        </BaseDialog>

        <BaseButton
          title="Next"
          variant="primary"
          onClick={create}
          className="w-[49%]"
          displayIcon="right"
          iconPath={'/icons/arrow_ico.svg'}
        />
      </div>
    </div>
  );
}
