/* eslint-disable @next/next/no-img-element */
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { decimalRegex, isZodAddress } from '@/lib/utils';
import { getUserArtists, upsertUserArtist } from '@/services/legacy/supplier';
import { IUserArtist } from '@/types';
import { acceptedFormats, maxFileSize } from '@/utils/helpers';
import { DialogClose } from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { isAddress } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { z } from 'zod';
import { useCreateNFT } from '../../Context/CreateNFTContext';
import BaseButton from '../../ui/BaseButton';
import { BaseDialog } from '../../ui/BaseDialog';
import ErrorModal from './ErrorModal';

const paymentSplitSchema = z.object({
  paymentWallet: isZodAddress,
  paymentPercentage: z
    .number()
    .refine((val) => /^\d*\.?\d{0,2}$/.test(val.toString()), {
      message:
        'Payment percentage must be a number with up to 2 decimal places',
    }),
});

const fileSchema = z.object({
  file: z.any(),
});

const userArtistSchema = z
  .object({
    name: z.string().nonempty(),
    wallet: isZodAddress,
    royalty: z
      .number()
      .refine((val) => /^\d*\.?\d{0,2}$/.test(val.toString()), {
        message:
          'Payment percentage must be a number with up to 2 decimal places',
      }),
    royaltyAddress: isZodAddress,
    mySplit: z
      .number()
      .refine((val) => /^\d*\.?\d{0,2}$/.test(val.toString()), {
        message:
          'Payment percentage must be a number with up to 2 decimal places',
      }),
    paymentSplits: z.array(paymentSplitSchema),
  })
  .refine(
    (data) => {
      // calculate sum
      const totalSplit = data.paymentSplits.reduce(
        (sum, current) => sum + current.paymentPercentage,
        data.mySplit,
      );
      if (totalSplit === 100) return true;
      return false;
    },
    {
      path: ['totalPercent'],
      message: 'Total percent should be 100',
    },
  );

const fieldMapping = {
  name: 'Artist Name',
  wallet: 'Royalty Wallet Address',
  royalty: 'Royalty',
  mySplit: 'My Wallet Payment',
  paymentSplits: 'Split Payment',
};

interface FormDataType {
  _id: null | string;
  name: string;
  wallet: string;
  royalty: string | null;
  royaltyAddress: string;
  mySplit: string | null;
}

export default function UserArtistModal({
  editUser,
}: {
  editUser: null | IUserArtist;
}) {
  const { toast } = useToast();
  const { setUserArtists } = useCreateNFT();
  const imageRef = useRef(null);
  const closeRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState<FormDataType>({
    _id: null,
    name: '',
    wallet: '',
    royalty: null,
    royaltyAddress: '',
    mySplit: null,
  });
  const [artistWallet, setArtistWallet] = useState<string>('');

  const [errors, setErrors] = useState({
    active: false,
    data: [],
  });
  const [loading, setLoading] = useState(false);
  const [paymentSplits, setPaymentSplits] = useState<any[]>([null]);
  const activeAccount = useActiveAccount();

  const handleFileChange = (event: any) => {
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
    }
  };

  const handleButtonClick = () => {
    if (imageRef.current) {
      (imageRef.current as any).click();
    }
  };

  const formatArtistError = (error, mapping) => {
    return error.issues.map((issue) => {
      return {
        path: issue.path.map((p) => mapping[p] || p),
        message: issue.message,
      };
    });
  };

  useEffect(() => {
    if (isAddress(artistWallet)) {
      setFormData({
        ...formData,
        wallet: artistWallet,
        royaltyAddress: artistWallet,
      });

      if (paymentSplits.length === 0) {
        setPaymentSplits([
          {
            paymentWallet: artistWallet,
            paymentPercentage: BigInt(0),
          },
        ]);
      } else {
        let newSplits = [...paymentSplits];
        newSplits[0] = {
          ...newSplits[0],
          paymentWallet: artistWallet,
        };
        setPaymentSplits(newSplits);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistWallet]);

  const addSplit = () => {
    setPaymentSplits([
      ...paymentSplits,
      { paymentWallet: '', paymentPercentage: BigInt(0) },
    ]);
  };

  const removeSplit = (index: number) => {
    if (index === 0) return;

    if (paymentSplits.length > 1) {
      const newSplits = paymentSplits.filter((_, i) => i !== index);
      setPaymentSplits(newSplits);
    }
    if (paymentSplits.length == 1) {
      setPaymentSplits([null]);
    } else {
      const newSplits = paymentSplits.filter((split, i) => i !== index);
      setPaymentSplits(newSplits);
    }
  };

  const updateSplit = (
    index: number,
    field: 'paymentWallet' | 'paymentPercentage',
    value: string,
  ) => {
    if (!decimalRegex.test(value)) {
      return;
    }
    const newSplits = paymentSplits.map((split, i) => {
      if (i === index) {
        return {
          ...split,
          [field]: field === 'paymentPercentage' ? value : value,
        };
      }
      return split;
    });
    setPaymentSplits(newSplits);
  };

  const cancel = () => {
    if (closeRef.current) {
      closeRef.current.click();
    }
  };
  const create = async () => {
    // validate values
    const result = userArtistSchema.safeParse({
      ...formData,
      royalty: Number(formData.royalty),
      mySplit: Number(formData.mySplit),
      paymentSplits: paymentSplits.map((split) => {
        return {
          ...split,
          paymentPercentage: Number(split.paymentPercentage),
        };
      }),
    });

    if (!result.success) {
      const message = formatArtistError(result.error, fieldMapping);

      setErrors({
        active: true,
        data: message,
      });
      console.log(result.error.message);
      return;
    }

    if (!editUser || file) {
      const fileResult = fileSchema.safeParse({
        file,
      });

      if (!fileResult.success) {
        const message = JSON.parse(fileResult.error.message);
        setErrors({
          active: true,
          data: message,
        });
        console.log(fileResult.error.message);
        return;
      }
    }
    try {
      setLoading(true);
      const data = new FormData();
      data.append('id', formData._id ?? '');
      data.append('name', formData.name);
      data.append('wallet', formData.wallet);
      data.append('royaltyAddress', formData.royaltyAddress);
      data.append('royalty', formData.royalty.toString());
      data.append('mySplit', formData.mySplit.toString());
      data.append('paymentSplits', JSON.stringify(paymentSplits));
      if (file) data.append('file', file);

      await upsertUserArtist(data);

      const userArtists = await getUserArtists();
      setUserArtists(userArtists);
      cancel();
    } catch (error) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to save artist',
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    if (editUser) {
      setFormData({
        ...formData,
        _id: editUser._id,
        name: editUser.name,
        wallet: editUser.wallet,
        royalty: editUser.royalty.toString(),
        royaltyAddress: editUser.royaltyAddress,
        mySplit: editUser.mySplit.toString(),
      });

      setArtistWallet(editUser?.wallet);
      if (editUser.paymentSplits.length > 0) {
        setPaymentSplits(editUser.paymentSplits);
      }
      setImageSrc(editUser.image);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editUser]);

  return (
    <div className="grid grid-cols-12 gap-4 h-auto relative">
      {/* Header Section */}
      <div className="col-span-12 flex flex-col gap-y-7 mb-3 sm:mb-5 text-[#DEE8E8] lg:w-11/12 mx-auto justify-center items-center gap-4 pt-5 sm:pt-6 md:pt-8">
        <div className="text-center text-lg sm:text-xl md:text-2xl lg:text-[32px] font-extrabold">
          Registering affiliated artists
        </div>
        <p className="self-stretch md:text-lg lg:text-2xl text-center azeret-mono-font font-medium leading-normal text-white/[53%]">
          We use artist templates to avoid mistakes that can arise from
          repetitive artist information entry. Entering artist information can
          shorten the mint time.
        </p>
      </div>
      {/* Upload Artist Profile Image Section */}
      <div className="col-span-12 md:col-span-5 lg:col-span-4 2xl:col-span-3 px-10 py-5 bg-dark-700 rounded-2xl border-2 border-dark-600 flex-col justify-center items-center gap-6 inline-flex border-dashed h-[450px]">
        {file || (editUser && imageSrc) ? (
          <div className="flex flex-col text-center gap-y-[23px]">
            {imageSrc && (
              <div className="w-[90%] object-cover mx-auto">
                <Image
                  quality={100}
                  src={imageSrc}
                  alt="logo"
                  layout="responsive"
                  width={100} // Required prop
                  height={100} // Required prop
                />
              </div>
            )}
            {file ? file.name : 'No files selected'}
          </div>
        ) : (
          <>
            <div className="relative w-16 h-16">
              <Image
                quality={100}
                className="relative"
                src="/icons/upload.svg"
                width={66}
                height={66}
                alt="upload"
              ></Image>
            </div>
            <div className="self-stretch h-14 flex-col justify-center items-center gap-3 flex font-manrope">
              <div className="self-stretch text-center text-white text-lg font-extrabold">
                Upload Artist Profile Image
              </div>
              <div className="self-stretch text-center text-xs azeret-mono-font text-white/30 font-normal leading-tight">
                PNG, GIF, WEBP, MP4 or MP3. Max 50mb.
              </div>
            </div>
          </>
        )}
        <button
          className="w-44 !h-12 bg-light-200 rounded-lg justify-center items-center gap-2.5 inline-flex"
          onClick={handleButtonClick}
        >
          <p className="text-dark-900 text-sm font-extrabold capitalize">
            Browse file
          </p>
          <div className="w-4 h-4 relative">
            <Image
              quality={100}
              src="/icons/arrow_ico.svg"
              alt="arrow"
              width={18}
              height={18}
            />
          </div>
        </button>
        <input
          className="hidden"
          type="file"
          ref={imageRef}
          onChange={handleFileChange}
          title="file"
        />
        {file && (
          <BaseButton
            title="Reset"
            variant="secondary"
            onClick={() => {
              setFile(null);
            }}
            className="!w-44 !h-12 bg-light-200 rounded-lg justify-center items-center"
          />
        )}
      </div>

      {/* Artist Information Section */}
      <div className="col-span-12 md:col-span-7 lg:col-span-8 2xl:col-span-9 flex-col justify-start items-start gap-8 inline-flex w-full">
        <div className="self-stretch px-5 pt-5 pb-8 bg-dark-700 rounded-xl flex-col justify-start items-start gap-2 flex">
          <Label className="text-white text-base font-extrabold">
            Artist Name *
          </Label>
          <hr className="border-white/[8%] my-4 w-full" />
          <Input
            value={formData.name ? formData.name : ''}
            onChange={(e) =>
              setFormData({ ...formData, name: (e.target as any).value })
            }
            className="w-full h-12 px-6 py-4 bg-[#161616] azeret-mono-font placeholder:text-white/[53%] focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none placeholder:text-xs focus:placeholder-transparent text-sm font-normal rounded-xl"
            type="text"
            placeholder="Enter Artist Name"
          />
        </div>

        <div className="self-stretch px-5 pt-5 pb-8 bg-dark-700 rounded-xl flex-col justify-start items-start gap-2 flex">
          <div className="self-stretch flex items-center">
            <div className="text-white text-base font-extrabold">
              Artist Wallet Address *
            </div>
          </div>
          <hr className="border-white/[8%] my-4 w-full" />
          <Input
            value={artistWallet ?? ''}
            onChange={(e) => {
              setArtistWallet((e.target as any).value);
            }}
            className="w-full border-none  h-12 px-6 py-4 bg-[#161616] azeret-mono-font placeholder:text-white/[53%] focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none placeholder:text-xs focus:placeholder-transparent rounded-xl flex items-center gap-4"
            type="text"
            placeholder="Please enter the artist's wallet address"
          />
        </div>

        <div className="self-stretch px-5 pt-5 pb-8 bg-dark-700 rounded-xl flex-col justify-start items-start gap-2 flex">
          <div className="self-stretch flex items-center">
            <div className="text-white text-base font-extrabold">
              Royalties (%) *
            </div>
          </div>
          <hr className="border-white/[8%] my-4 w-full" />
          <div className="self-stretch flex items-center gap-3 grid-cols-6">
            <div className="flex-1">
              <Input
                className="h-12 px-5 py-4 bg-[#161616] rounded-xl flex items-center azeret-mono-font text-[#B7B2B2] placeholder:text-white/[53%] focus-visible:border-0 number-input focus-visible:outline-none focus:placeholder-transparent focus-visible:shadow-none border-0 outline-none placeholder:text-xs text-sm font-normal col-span-4"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    royaltyAddress: e.target.value,
                  })
                }
                placeholder="Please enter the percentage of royalties agreed upon with the artist in numbers."
                type="text"
                value={formData.royaltyAddress ?? ''}
              />
            </div>
            <div>
              <Input
                className="h-12 px-5 py-4 bg-[#161616] rounded-xl flex items-center azeret-mono-font text-[#B7B2B2] placeholder:text-[#545454] placeholder:font-bold focus-visible:border-0 number-input focus-visible:outline-none focus:placeholder-transparent focus-visible:shadow-none border-0 outline-none placeholder:text-lg text-sm font-normal text-center"
                onChange={(e) => {
                  if (!decimalRegex.test(e.target.value)) return;

                  setFormData({
                    ...formData,
                    royalty: e.target.value ?? null,
                  });
                }}
                placeholder="%"
                min={0}
                max={100}
                type="number"
                value={formData.royalty?.toString() ?? ''}
              />
            </div>
            <div className="h-10 min-w-[95px] px-4 py-3 bg-transparent rounded-lg border-2 border-yellow-400 flex items-center gap-2.5">
              <div className="w-6 h-6 relative flex cursor-pointer">
                <Image
                  quality={100}
                  src="/icons/add-new.svg"
                  alt="add-royalty"
                  width={24}
                  height={24}
                />
              </div>
              <p className="text-center text-sm text-[#DDF247]">Add</p>
            </div>
          </div>
        </div>

        <div className="self-stretch px-5 pt-5 pb-8 bg-dark-700 rounded-xl flex-col justify-start items-start gap-5 flex">
          <div className="self-stretch flex items-center">
            <div className="text-white text-base font-extrabold">
              Split Payments (%) *
            </div>
          </div>
          <div className="text-[#949494] text-sm font-normal">
            The sum of all numbers (percentages) must equal 100%.
          </div>
          <div className="self-stretch grid grid-cols-12 items-start gap-3">
            <div className="col-span-12 xl:col-span-3 h-12 px-6 py-4 bg-[#1F1F1F] rounded-xl justify-center flex items-center">
              <span className="text-[#B7B2B2] text-center azeret-mono-font text-sm xl:text-xs 2xl:text-sm font-normal">
                My wallet address
              </span>
            </div>
            <div className="col-span-12 sm:col-span-6 h-12 px-6 py-4 bg-[#161616] rounded-xl flex items-center flex-1">
              <div className="text-[#696969] text-sm font-normal truncate">
                {activeAccount?.address}
              </div>
            </div>
            <div className="col-span-6 sm:col-span-3 xl:col-span-1">
              <Input
                className="h-12 px-5 py-4 bg-[#161616] rounded-xl text-[#B7B2B2] flex items-center azeret-mono-font placeholder:text-[#545454] placeholder:font-bold number-input focus-visible:outline-none focus:placeholder-transparent focus-visible:shadow-none border-0 outline-none placeholder:text-lg text-sm font-normal text-center"
                onChange={(e) => {
                  if (!decimalRegex.test(e.target.value)) return;
                  setFormData({
                    ...formData,
                    mySplit: e.target.value ?? null,
                  });
                }}
                placeholder="%"
                min={0}
                max={100}
                type="number"
                value={formData.mySplit?.toString() ?? ''}
              />
            </div>
            <div className="col-span-6 sm:col-span-3 xl:col-span-2"></div>
          </div>
          {paymentSplits.map((split, index) => (
            <div
              className="self-stretch grid grid-cols-12 items-start gap-3"
              key={index}
            >
              <div className="col-span-12 xl:col-span-3 h-12 px-6 py-4 bg-[#1F1F1F] rounded-xl justify-center flex items-center">
                <span className="text-[#B7B2B2] text-center azeret-mono-font text-sm xl:text-xs 2xl:text-sm font-normal">
                  Artist wallet address
                </span>
              </div>
              <div className="col-span-12 sm:col-span-6 flex-1 px-0 py-0">
                <Input
                  className="h-12 px-5 py-4 bg-[#161616] rounded-xl flex items-center azeret-mono-font text-[#B7B2B2] placeholder:text-white/[53%] focus-visible:border-0 number-input focus-visible:outline-none focus:placeholder-transparent focus-visible:shadow-none border-0 outline-none placeholder:text-xs text-sm font-normal"
                  onChange={(e) =>
                    updateSplit(
                      index,
                      'paymentWallet',
                      e.target.value as string,
                    )
                  }
                  placeholder="Please enter the split payment rate you wish to pay to others."
                  type="text"
                  value={split?.paymentWallet ?? ''}
                  disabled={index === 0}
                />
              </div>
              <div className="col-span-6 sm:col-span-3 xl:col-span-1">
                <Input
                  className="h-12 px-5 py-4 bg-[#161616] rounded-xl flex items-center azeret-mono-font placeholder:text-[#545454] placeholder:font-bold focus-visible:border-0 number-input focus-visible:outline-none focus:placeholder-transparent focus-visible:shadow-none border-0 outline-none placeholder:text-lg text-sm font-normal text-center"
                  onChange={(e) => {
                    const value = e.target.value as string;
                    updateSplit(index, 'paymentPercentage', value);
                  }}
                  placeholder="%"
                  min={0}
                  max={100}
                  type="number"
                  value={
                    split?.paymentPercentage
                      ? split.paymentPercentage.toString()
                      : ''
                  } // Convert bigint to string for display
                />
              </div>
              <div className="col-span-6 sm:col-span-3 xl:col-span-2 flex">
                {paymentSplits.length > 1 && (
                  <div className="h-10 py-3 mx-4 cursor-pointer">
                    <button
                      className="w-6 h-6"
                      onClick={() => removeSplit(index)}
                    >
                      <img
                        src="/icons/trash.svg"
                        alt=""
                        className="cursor-pointer w-6 h-6"
                      />
                    </button>
                  </div>
                )}
                {index === paymentSplits.length - 1 && (
                  <div
                    className="h-11 px-4 py-3 bg-transparent rounded-lg border-2 border-yellow-400 flex items-center gap-2.5 cursor-pointer"
                    onClick={addSplit}
                  >
                    <div className="w-6 h-6 relative flex">
                      <Image
                        quality={100}
                        src="/icons/add-new.svg"
                        alt="add-royalty"
                        width={24}
                        height={24}
                      />
                    </div>
                    <p className="text-center text-sm text-[#DDF247]">Add</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Cancel and Submit Buttons */}
        <div className="flex gap-x-4 justify-center my-5 w-full">
          <DialogClose asChild={false}>
            <button className="hidden" ref={closeRef} />
          </DialogClose>
          <BaseButton title="Cancel" variant="secondary" onClick={cancel} />
          <BaseButton
            title="Save"
            variant="primary"
            onClick={create}
            loading={loading}
          />
        </div>

        <BaseDialog
          isOpen={errors.active}
          onClose={(val) => setErrors({ active: val, data: [] })}
          isClose={false}
          className="bg-[#161616] max-h-[80%] w-[617px] mx-auto overflow-y-auto overflow-x-hidden border-0 outline-none rounded-2xl"
        >
          <ErrorModal
            title={'Please fill in the required field'}
            data={errors.data}
            close={() => {
              setErrors({ active: false, data: [] });
            }}
          />
        </BaseDialog>
      </div>
    </div>
  );
}
