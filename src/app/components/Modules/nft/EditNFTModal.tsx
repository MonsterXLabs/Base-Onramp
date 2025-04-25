/* eslint-disable @next/next/no-img-element */
'use client';

import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CategoryService } from '@/services/legacy/catergoryService';
import { CreateNftServices } from '@/services/legacy/createNftService';
import { acceptedFormats, maxFileSize } from '@/utils/helpers';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Textarea,
} from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  CreateNFTProvider,
  useCreateNFT,
} from '../../Context/CreateNFTContext';
import { useNFTDetail } from '../../Context/NFTDetailContext';
import BaseButton from '../../ui/BaseButton';
import ContactInfo from '../ContactInfo';
import ShippingInfo from '../ShippingInfo';
import { ShipmentInfo } from '../ShipmentInfo';

interface IEditNFT {
  category: any;
  description: string;
}

const Modal = ({
  onClose,
  fetchNftData,
}: {
  onClose: () => void;
  fetchNftData: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { NFTDetail, nftId } = useNFTDetail();
  const { toast } = useToast();
  const {
    sellerInfo,
    sellerInfo: { shipping },
    setSellerInfo,
  } = useCreateNFT();
  const [formData, setFormData] = useState<IEditNFT>({
    category: null,
    description: '',
  });
  const [attachments, setAttachments] = useState<any[]>([null]);
  const attachmentRef = useRef(null);
  const [addAttachId, setAddAttachId] = useState(0);

  const nftServices = new CreateNftServices();

  const handleAttachment = (file: any) => {
    const attachment = file.target.files[0];
    const fileExtension = attachment.name.split('.').pop().toLowerCase();
    if (
      attachment.size < maxFileSize &&
      acceptedFormats.includes(`.${fileExtension}`)
    ) {
      const newAttachments = [...attachments];
      newAttachments[addAttachId] = attachment;
      setAttachments(newAttachments);
    }
  };

  const addAttachment = (index) => {
    if (attachmentRef.current) {
      (attachmentRef.current as any).click();
    }
    setAddAttachId(index);
    if (attachments.length - 1 > index) {
      return;
    }
    const newAttachments = [...attachments, null];

    setAttachments(newAttachments);
  };

  const getAttach = (obj) => {
    if (typeof obj === 'string') return obj;
    return URL.createObjectURL(obj);
  };
  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);

    setAttachments(newAttachments);
  };

  const [categories, setCategories] = useState<any[]>([]);

  const fetchCategories = async () => {
    try {
      const categoryService = new CategoryService();
      const {
        data: { categories },
      } = await categoryService.getAllCategories(0, 0);
      setCategories(categories);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('description', formData.description);
      if (formData.category) data.append('category', formData.category);

      attachments.forEach((attachment) => {
        if (attachment && typeof attachment !== 'string') {
          data.append('files', attachment);
        }
      });

      data.append(
        'attachPrevs',
        JSON.stringify(
          attachments.filter((item) => typeof item === 'string' && item),
        ),
      );
      data.append('nftId', nftId);

      const shippingAddress = {
        name: shipping.name,
        email: shipping.email,
        country: shipping.country,
        address: {
          line1: shipping.address.line1,
          line2: shipping.address.line2,
          city: shipping.address.city,
          state: shipping.address.state,
          postalCode: shipping.address.postalCode,
        },
        phoneNumber: shipping.phoneNumber,
      };

      const shipmentInfo = {
        lengths: sellerInfo?.length,
        width: sellerInfo?.width,
        height: sellerInfo?.height,
        weight: sellerInfo?.weight,
      };

      data.append('shippingAddress', JSON.stringify(shippingAddress));
      data.append('shipmentInfo', JSON.stringify(shipmentInfo));
      await nftServices.editNft(data);
      fetchNftData();
      onClose();
    } catch (error) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Pleae check all input forms.',
        duration: 2000,
      });
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (NFTDetail) {
      setFormData({
        ...formData,

        category: NFTDetail.category?._id,
        description: NFTDetail.description,
      });
      setAttachments([...NFTDetail.attachments, null]);
      setSellerInfo({
        ...sellerInfo,
        length: NFTDetail?.shippingInformation?.lengths?.toString() ?? '',
        width: NFTDetail?.shippingInformation?.width?.toString() ?? '',
        height: NFTDetail?.shippingInformation?.height?.toString() ?? '',
        weight: NFTDetail?.shippingInformation?.weight?.toString() ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-col gap-y-6 w-full p-2">
        <h2 className="text-[30px] manrope-font font-bold pb-[2px]">
          Edit RWA
        </h2>
        <div className="w-full rounded-[20px] p-5 flex flex-col gap-y-2 bg-[#232323]">
          <Disclosure as="div" defaultOpen={true}>
            {({ open }) => (
              <>
                <DisclosureButton className="flex w-full justify-between pb-5 text-left text-lg font-medium text-white text-[18px] border-b border-white/[8%]">
                  <span className="font-semibold">Attachment</span>
                  <ChevronUpIcon
                    className={`${
                      open ? 'rotate-180 transform' : ''
                    } h-5 w-5 text-white`}
                  />
                </DisclosureButton>
                <DisclosurePanel className="pt-5 text-sm text-white rounded-b-lg">
                  <div className="flex gap-4 flex-wrap">
                    <input
                      type="file"
                      className="hidden"
                      title="file"
                      ref={attachmentRef}
                      onChange={(e) => handleAttachment(e)}
                    />
                    {attachments?.map((attachment, index) => {
                      return (
                        <div key={index} className="flex flex-col gap-y-2">
                          {!attachment ? (
                            <img
                              src="https://i.ibb.co/c8FMdw1/attachment-link.png"
                              alt="attachment"
                              className="w-[200px] mx-auto h-[200px] rounded-md object-cover"
                            />
                          ) : (
                            <img
                              src={getAttach(attachment)}
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
                              <Image
                                quality={100}
                                src="/icons/trash.svg"
                                alt="attachment"
                                className="w-5 h-5"
                                width={20}
                                height={20}
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
                              <Image
                                quality={100}
                                src="/icons/upload.svg"
                                alt="attachment"
                                className="w-5 h-5"
                                width={20}
                                height={20}
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
        <div className="flex flex-col gap-y-2">
          <Label className="text-lg font-medium">Category</Label>
          <div className="bg-[#232323] rounded-xl pr-4">
            <select
              aria-label="Select category"
              // className="h-10 rounded-md px-2 w-full"
              className="w-full border-none  h-[52px] px-[26px] py-[15px] bg-[#232323] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
              name="country"
              onChange={(e) => {
                setFormData({ ...formData, category: (e.target as any).value });
              }}
              value={formData.category}
            >
              <option value="">Select</option>
              {categories.map((item: any) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex w-full flex-col">
          <h2 className="font-bold text-[#ffffff] text-[14px] mb-[15px]">
            Description
          </h2>

          <Textarea
            className="w-full border-none bg-[#232323] h-[240px] text-[#ffffff] azeret-mono-font placeholder:text-[#ffffff53] p-4 rounded-[24px] resize-none"
            placeholder="Please describe your product"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: (e.target as any).value,
              })
            }
          />
        </div>

        <ShipmentInfo />
        <ShippingInfo />
        <ContactInfo />
        <div className="flex w-full gap-x-4 justify-center my-3">
          <BaseButton
            title="Discard"
            variant="secondary"
            onClick={onClose}
            className="w-full"
          />
          <BaseButton
            title="Submit"
            variant="primary"
            onClick={handleEdit}
            loading={loading}
            className="w-full"
          />
        </div>
      </div>
    </>
  );
};

export default function EditNFTMOdal({
  onClose,
  fetchNftData,
}: {
  onClose: () => void;
  fetchNftData: () => void;
}) {
  return (
    <CreateNFTProvider>
      <Modal onClose={onClose} fetchNftData={fetchNftData} />
    </CreateNFTProvider>
  );
}
