'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CreateSellService } from '@/services/legacy/createSellService';
import { ArrowUpTrayIcon } from '@heroicons/react/20/solid';
import { ChevronUpIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import { z } from 'zod';
import { useNFTDetail } from '../../Context/NFTDetailContext';
import BasicLoadingModal from './BasicLoadingModal';

const validateSchema = z.object({
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().nonempty('Phone number is required.'),
  request: z.string().nonempty('Dispute request is required.'),
});

export default function CancelOrderModal({
  onClose,
  fetchNftData,
}: {
  onClose: () => void;
  fetchNftData: () => void;
}) {
  const { toast } = useToast();
  const { nftId: id } = useNFTDetail();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [numberOfInputs, setNumberOfInputs] = useState(1);
  const [unlockableFiles, setUnlockableFiles] = useState([null]);
  const [imageId, setImageId] = useState(0);

  const descriptionImageRef = useRef<HTMLInputElement>(null);
  const salesService = new CreateSellService();

  const submit = async () => {
    let validError = false;
    try {
      const result = validateSchema.safeParse({
        email,
        phoneNumber,
        request: description,
      });

      if (!result.success) {
        validError = true;
        throw new Error(result.error.message);
      }
      setStep(2);
      const formData = new FormData();
      formData.append('nftId', id);
      formData.append('request', description);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      for (const file of unlockableFiles) {
        formData.append('files', file);
      }
      await salesService.cancelRequest(formData);
      await fetchNftData();
      setStep(3);
    } catch (error) {
      if (validError) {
        toast({
          title: 'Input is invalid.',
          variant: 'destructive',
        });
        return;
      } else {
        toast({
          title: 'Already cancel requested or input is invalid.',
          variant: 'destructive',
        });
      }
      console.log(error);
      onClose();
    }
  };

  const changeUnlockable = (file: any, index: number) => {
    setUnlockableFiles((prevFiles) =>
      prevFiles.map((item, i) => (index === i ? file : item)),
    );
  };

  const removeUnlockable = (index: number) => {
    const newFiles = unlockableFiles.filter(
      (item: any, i: number) => i !== index,
    );

    setUnlockableFiles(newFiles);
  };

  const addUnlockable: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (unlockableFiles.length === 0) {
      setUnlockableFiles([null, null]);
    } else {
      setUnlockableFiles([...unlockableFiles, null]);
    }
  };

  return (
    <>
      {step === 1 && (
        <div className="flex flex-col gap-y-4 w-full">
          <div className="flex flex-col gap-y-2 items-center">
            <img src="/icons/success.svg" className="w-16 mx-auto" />
            <p className="text-lg font-medium">Order Cancellation Request</p>
          </div>

          <p>
            We are sad to see your cancellation request! However, please be
            informed that cancellations due to a change of mind are not in our
            terms and conditions. But if you have other reasons like shipping
            delays, product defects, and more, your cancellation request may be
            approved.
            <br />
            <br />
            Kindly explain the reasons for your cancellation in the field down
            below. After careful review, we will contact you with further
            details through the email and messenger ID that you provided. We
            value your feedback as it helps us deliver the best possible
            service. Thank You!
          </p>

          <div className="flex flex-col gap-y-2">
            <h2 className="font-bold text-[#fff] text-[14px]">Email*</h2>

            <Input
              value={email}
              onChange={(e) => setEmail((e.target as any).value)}
              className="w-full border-none bg-[#161616] h-[52px] text-[#ffffff] azeret-mono-font placeholder:text-[#ffffff53]"
              type="text"
              placeholder="Enter your email"
            />
          </div>
          <PhoneInput
            enableLongNumbers={true}
            containerClass="phone-container"
            buttonClass="phone-dropdown"
            inputClass="phone-control"
            country={'us'}
            value={phoneNumber}
            inputStyle={{
              width: '100%',
              height: '2.5rem',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              marginTop: '0.5rem',
              color: '#fff',
              backgroundColor: '#161616',
            }}
            onChange={(val) => setPhoneNumber(val)}
          />

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#161616] border border-[#3a3a3a] h-[240px] text-[#ffffff] azeret-mono-font placeholder:text-[#ffffff53] p-4 rounded-md"
            placeholder="Reason for cancellation"
          />

          <div className="w-full rounded-[20px] px-4 py-3 bg-dark flex flex-col gap-y-6 bg-[#232323]">
            <div className="flex w-full justify-between">
              <span>Attachment</span>
              <div className="flex items-center">
                <div
                  className="flex gap-x-2 px-4 h-[52px] py-1 rounded-md items-center cursor-pointer"
                  onClick={addUnlockable}
                >
                  <img
                    src="/icons/add-new.svg"
                    alt="plus"
                    className="w-4 h-4"
                  />
                  <p className="text-neon">Add New</p>
                </div>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-white`}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-between">
              <input
                type="file"
                id="discription-image"
                ref={descriptionImageRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const newFile = e.target.files[0];
                  changeUnlockable(newFile, imageId);
                }}
              />
              {unlockableFiles.map((item: any, index: number) => {
                return (
                  <div className="pb-2 w-full" key={index}>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="px-[10px] py-[10px] cursor-pointer w-[174px] border-0 rounded-[14px] bg-[#dee8e8] text-[#161616] text-[14px] 
                  font-extrabold capitalize flex items-center gap-[10px] flex-shrink-0 justify-center transition-all duration-300"
                        onClick={() => {
                          setImageId(index);
                          descriptionImageRef &&
                            (descriptionImageRef.current as any).click();
                        }}
                      >
                        Upload{' '}
                        <span>
                          <ArrowUpTrayIcon className="w-5" />
                        </span>
                      </button>
                      <span id="custom-text">
                        {item ? item.name : 'Choose File'}
                      </span>
                      <img
                        src="/icons/trash.svg"
                        className="w-6 mr-3"
                        onClick={() => {
                          removeUnlockable(index);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-light">
              <button className="w-full h-full" onClick={() => {}}>
                Cancel
              </button>
            </div>
            <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-neon">
              <button
                className="w-full h-full"
                onClick={async () => await submit()}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <BasicLoadingModal message="Please wait while we are cancelling NFT Request" />
      )}
      {step === 3 && (
        <div className="flex w-full justify-center flex-col gap-y-4 text-center">
          <img src="/icons/success.svg" className="w-16 mx-auto" />
          <p className="text-lg font-medium">Application Success</p>
          <p className="text-gray-500">
            Your Request to release escrow request has been successfully
            received. We will carefully review it and contact you as soon as
            possible. Thank you for your patience.
          </p>
        </div>
      )}
    </>
  );
}
