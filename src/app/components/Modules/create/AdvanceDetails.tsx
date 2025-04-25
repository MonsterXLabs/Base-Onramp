'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CategoryService } from '@/services/legacy/catergoryService';
import { isValidNumber } from '@/utils/helpers';
import { Textarea } from '@headlessui/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { isAddress } from 'thirdweb';
import { useCreateNFT } from '../../Context/CreateNFTContext';
import BaseButton from '../../ui/BaseButton';
import FileInput from '../../ui/FileInput';
import { CreateAuctionDuration } from './CreateAuctionDuration';
import PropertiesTemplate from './PropertiesTemplate';

export default function AdvanceDetails({
  handler,
  nextStep,
}: {
  handler: (data: any, error: any) => void;
  nextStep: (next?: boolean) => void;
}) {
  const {
    advancedOptions: options,
    setAdvancedOptions: setOptions,
    paymentSplits,
    setPaymentSplits,
    advancedDetails,
    setAdvancedDetails,
    auctionDuration,
  } = useCreateNFT();

  const [categories, setCategories] = useState<any[]>([]);
  const [unlockableFiles, setUnlockableFiles] = useState<any[]>(
    advancedDetails.certificates,
  );

  useEffect(() => {
    setAdvancedDetails({
      ...advancedDetails,
      certificates: unlockableFiles,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockableFiles]);

  const [formData, setFormData] = useState<any>({
    royaltyAddress: null,
    royalty: null,
    unlockable: null,
    category: null,
    address: null,
    percentage: null,
  });

  const handleFileChange = (file: any, index: number) => {
    const newFiles = unlockableFiles.map((item: any, i: number) => {
      if (i === index) {
        return file;
      }
      return item;
    });

    setUnlockableFiles(newFiles);
  };

  const removeUnlockable = (index: number) => {
    const newFiles = unlockableFiles.filter(
      (item: any, i: number) => i !== index,
    );

    setUnlockableFiles(newFiles);
  };

  const addSplit = () => {
    setPaymentSplits([
      ...paymentSplits,
      { paymentWallet: '', paymentPercentage: BigInt(0) },
    ]);
  };

  const removeSplit = (index: number) => {
    if (paymentSplits.length > 1) {
      const newSplits = paymentSplits.filter((_, i) => i !== index);
      setPaymentSplits(newSplits);
    }
  };

  const updateSplit = (
    index: number,
    field: 'paymentWallet' | 'paymentPercentage',
    value: string | bigint,
  ) => {
    const newSplits = paymentSplits.map((split, i) => {
      if (i === index) {
        return {
          ...split,
          [field]: field === 'paymentPercentage' ? BigInt(value) : value,
        };
      }
      return split;
    });
    setPaymentSplits(newSplits);
  };

  const toggleSwitch = (e: any) => {
    switch (e) {
      case 'free':
        setOptions({
          freeMint: !options.freeMint,
        });
        break;
      case 'royalty':
        setOptions({
          royalties: !options.royalties,
        });
        break;
      case 'unlockable':
        setOptions({
          unlockable: !options.unlockable,
        });
        break;
      case 'category':
        setOptions({
          category: !options.category,
        });
        break;
      case 'split':
        setOptions({
          split: !options.split,
        });
        break;
      case 'auction':
        setOptions({
          auction: !options.auction,
        });
        break;
      default:
        break;
    }
  };

  const cancelChanges = () => {
    nextStep(false);
  };

  const create = async () => {
    const err = [];
    if (!advancedDetails.attributes) {
      err.push({ path: ['Properties'] });
    }

    if (options.royalties && !isAddress(advancedDetails.royaltyAddress)) {
      err.push({ path: ['Royalties'] });
    }

    if (options.category && !advancedDetails.category) {
      err.push({ path: ['Category'] });
    }

    if (options.unlockable && !advancedDetails.unlockable) {
      err.push({ path: ['Unlockable Content'] });
    }

    if (options.split) {
      if (!paymentSplits.length) err.push({ path: ['Split Payments'] });
      paymentSplits.forEach((split) => {
        if (!isAddress(split.paymentWallet))
          err.push({ path: ['Split Payments'] });
      });
    }

    if (options.auction) {
      if (!auctionDuration) {
        err.push({
          path: ['auction'],
        });
      }
    }

    if (!advancedDetails.propertyTemplateId)
      err.push({ path: ['Property Template'] });

    if (err.length > 0) {
      handler(null, JSON.stringify(err));
      return;
    }

    handler({}, null);
    nextStep(true);
  };

  useEffect(() => {
    if (options.split && paymentSplits.length === 0) {
      setPaymentSplits([
        {
          paymentWallet: '',
          paymentPercentage: BigInt(0),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.split]);

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

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 flex-wrap">
        <div className="bg-dark px-3 py-2 grid-cols-1 sm:grid-cols-2 rounded-lg w-full flex justify-between items-center">
          <div className="w-full flex flex-col gap-y-2">
            <p className="font-semibold">Free Minting</p>
            <p className="text-[#B7B2B2] font-AzeretMono text-xs">{`Free mint your nft. You don't need any gas fee `}</p>
          </div>
          <Switch
            id="free"
            checked={options.freeMint}
            onCheckedChange={() => toggleSwitch('free')}
          />
        </div>

        <div className="bg-dark px-3 py-2 grid-cols-3 rounded-lg w-full flex justify-between items-center">
          <div className="w-full flex flex-col gap-y-2">
            <p className="font-semibold">Royalties</p>
            <p className="text-[#B7B2B2] font-AzeretMono text-xs">
              Earn a % on secondary sales
            </p>
          </div>
          <Switch
            id="royalty"
            checked={options.royalties}
            onCheckedChange={() => toggleSwitch('royalty')}
          />
        </div>

        <div className="bg-dark px-3 py-2 grid-cols-3 rounded-lg w-full flex justify-between items-center">
          <div className="w-full flex flex-col gap-y-2">
            <p className="font-semibold">Unlockable Content</p>
            <p className="text-[#B7B2B2] font-AzeretMono text-xs">
              Only owner can view this content
            </p>
          </div>
          <Switch
            id="unlockable"
            checked={options.unlockable}
            onCheckedChange={() => toggleSwitch('unlockable')}
          />
        </div>

        <div className="bg-dark px-3 py-2 grid-cols-3 rounded-lg w-full flex justify-between items-center">
          <div className="w-full flex flex-col gap-y-2">
            <p className="font-semibold">Category</p>
            <p className="text-[#B7B2B2] font-AzeretMono text-xs">
              Put this item into category
            </p>
          </div>
          <Switch
            id="category"
            checked={options.category}
            onCheckedChange={() => toggleSwitch('category')}
          />
        </div>

        <div className="bg-dark px-3 py-2 grid-cols-3 rounded-lg w-full flex justify-between items-center">
          <div className="w- flex flex-col gap-y-2">
            <p className="font-semibold">Split Payments</p>
            <p className="text-[#B7B2B2] font-AzeretMono text-xs">
              Add multiple address to receive payments
            </p>
          </div>
          <Switch
            id="split"
            checked={options.split}
            onCheckedChange={() => toggleSwitch('split')}
          />
        </div>

        <div className="bg-dark px-3 py-2 grid-cols-3 rounded-lg w-full flex justify-between items-center">
          <div className="w- flex flex-col gap-y-2">
            <p className="font-semibold">Auction</p>
            <p className="text-[#B7B2B2] font-AzeretMono text-xs">
              Only Owner can view this content
            </p>
          </div>
          <Switch
            id="split"
            checked={options.auction}
            onCheckedChange={() => toggleSwitch('auction')}
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-5">
        {options.auction && <CreateAuctionDuration />}

        {options.royalties && (
          <div className="flex flex-col gap-y-3 mt-3">
            <p className="sm:text-base text-sm md:text-lg font-semibold">
              Royalties(%)
            </p>
            <div className="grid grid-cols-12 gap-x-2">
              <div className="md:col-span-6 col-span-8 lg:col-span-4">
                <Input
                  className="border-none w-[500px] grid-cols-3 md:h-[52px] xs:px-4 px-3 sm:px-5 md:px-[26px] disabled:bg-[#232323] py-[15px] bg-[#232323] rounded-xl flex text-[#B7B2B2] placeholder:text-[#B7B2B2] placeholder:text-sm text-sm"
                  onChange={(e) =>
                    setAdvancedDetails({
                      ...advancedDetails,
                      royaltyAddress: e.target.value,
                    })
                  }
                  placeholder="Address"
                  type="text"
                  disabled={true}
                  value={advancedDetails.royaltyAddress ?? ''}
                />
              </div>
              <div className="col-span-4 md:col-span-2 lg:col-span-1">
                <div className="relative">
                  <Input
                    className="md:h-[52px] md:py-[15px] text-[#979797] text-center placeholder:text-lg placeholder:font-extrabold disabled:bg-[#232323] bg-[#232323] rounded-xl justify-center items-center"
                    onChange={(e) => {
                      let val = Number(e.target.value);
                      setAdvancedDetails({
                        ...advancedDetails,
                        royalty: isValidNumber(val) ? val : 0,
                      });
                    }}
                    placeholder="0"
                    min={0}
                    max={100}
                    type="number"
                    disabled={true}
                    value={
                      isValidNumber(advancedDetails.royalty)
                        ? (advancedDetails.royalty / 100).toString()
                        : ''
                    }
                  />
                </div>
              </div>
              {/* <div className="col-span-2 hidden">
                <div
                  className="flex cursor-pointer h-[52px] justify-center relative gap-y-1 items-center px-[14px] py-[16px] border-2 border-[#DDF247] rounded-md"
                  onClick={() => {}}
                >
                  <Image
                    src="/icons/add-new.svg"
                    className="w-6 h-6"
                    alt="add"
                    width={24}
                    height={24}
                    quality={100}
                  />
                  <p className="text-center text-sm text-[#DDF247]">Add New</p>
                </div>
              </div> */}
            </div>
          </div>
        )}

        {options.unlockable && (
          <div className="flex flex-col gap-y-3 mt-3 w-full">
            <p className="sm:text-base text-sm md:text-lg font-semibold">
              Unlockable Content
            </p>
            <Textarea
              className="font-AzeretMono rounded-md focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none text-[#989898] placeholder:text-[#989898] resize-none p-4 placeholder:text-xs bg-[#232323] focus:placeholder-transparent focus:outline-none"
              placeholder="Only the artwork owner can view this content and file. You may also attach a certificate of authenticity issued by a third party and a special image just for the buyer."
              onChange={(e) => {
                setFormData({
                  ...formData,
                  unlockable: (e.target as any).value,
                });
                setAdvancedDetails({
                  ...advancedDetails,
                  unlockable: (e.target as any).value,
                });
              }}
              rows={4}
              value={advancedDetails.unlockable}
            />
            {unlockableFiles.length == 0 && (
              <div className="flex gap-x-4 w-full items-center">
                <FileInput
                  onFileSelect={(file: any) => handleFileChange(file, 0)}
                  maxSizeInBytes={1024 * 1024}
                  className="w-full md:min-w-[400px]"
                  deSelect={true}
                />
                {unlockableFiles.length === 0 ? (
                  <Image
                    src="/icons/trash.svg"
                    alt="trash"
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => removeUnlockable(0)}
                    width={24}
                    height={24}
                    quality={100}
                  />
                ) : null}
                <div
                  className="flex gap-x-2 px-4 h-full py-1 rounded-md items-center border-2 border-neon cursor-pointer"
                  onClick={() => {
                    if (unlockableFiles.length === 0) {
                      setUnlockableFiles([null, null]);
                    } else {
                      setUnlockableFiles([...unlockableFiles, null]);
                    }
                  }}
                >
                  <Image
                    src="/icons/add-new.svg"
                    alt="plus"
                    className="w-4 h-4"
                    width={16}
                    height={16}
                    quality={100}
                  />
                  <p className="text-neon">Add</p>
                </div>
              </div>
            )}
            {unlockableFiles.map((item: any, index: number) => {
              if (index == 0) {
                return (
                  <div
                    className="flex flex-wrap gap-4 items-center w-full"
                    key={index}
                  >
                    <FileInput
                      onFileSelect={(file: any) => handleFileChange(file, 0)}
                      maxSizeInBytes={50 * 1024 * 1024}
                      className="w-full md:min-w-[400px]"
                    />
                    <Image
                      src="/icons/trash.svg"
                      alt="trash"
                      className="w-6 h-6 cursor-pointer"
                      onClick={() => removeUnlockable(0)}
                      width={24}
                      height={24}
                      quality={100}
                    />
                    <div
                      className="flex gap-x-2 px-4 py-1 rounded-md items-center border-2 border-neon cursor-pointer"
                      onClick={() => {
                        if (unlockableFiles.length === 0) {
                          setUnlockableFiles([null, null]);
                        } else {
                          setUnlockableFiles([...unlockableFiles, null]);
                        }
                      }}
                    >
                      <Image
                        src="/icons/add-new.svg"
                        alt="plus"
                        className="w-4 h-4"
                        width={16}
                        height={16}
                        quality={100}
                      />
                      <p className="text-neon">Add</p>
                    </div>
                  </div>
                );
              }
              return (
                <div className="flex gap-x-4 items-center w-full" key={index}>
                  <FileInput
                    onFileSelect={(file: any) => handleFileChange(file, index)}
                    className="w-full md:min-w-[400px]"
                    maxSizeInBytes={50 * 1024 * 1024}
                  />
                  <Image
                    src="/icons/trash.svg"
                    alt="trash"
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => removeUnlockable(index)}
                    width={24}
                    height={24}
                    quality={100}
                  />
                </div>
              );
            })}
          </div>
        )}

        {options.category && (
          <div className="flex flex-col gap-y-2">
            <Label className="sm:text-base text-sm md:text-lg font-semibold">
              Category
            </Label>
            <div className="bg-[#232323] rounded-xl pr-4">
              <select
                aria-label="Select a category"
                className="w-full border-none bg-[#232323] h-[52px] px-[15px] py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                name="country"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    category: (e.target as any).value,
                  });
                  setAdvancedDetails({
                    ...advancedDetails,
                    category: (e.target as any).value,
                  });
                }}
                value={advancedDetails.category}
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
        )}

        {options.split && (
          <div className="flex flex-col gap-y-3">
            <p className="sm:text-base text-sm md:text-lg font-semibold">
              Split Payments (%)
            </p>
            {paymentSplits.map((split, index) => (
              <div key={index} className="grid grid-cols-12 gap-x-2">
                <div className="md:col-span-6 col-span-8 lg:col-span-4">
                  <Input
                    className="border-none w-[500px] grid-cols-3 md:h-[52px] xs:px-4 px-3 sm:px-5 md:px-[26px] disabled:bg-[#232323] py-[15px] bg-[#232323] rounded-xl flex text-[#B7B2B2] placeholder:text-[#B7B2B2] placeholder:text-sm text-sm"
                    onChange={(e) =>
                      updateSplit(index, 'paymentWallet', e.target.value)
                    }
                    placeholder="Address"
                    type="text"
                    disabled={true}
                    value={split.paymentWallet}
                  />
                </div>
                <div className="col-span-2 md:col-span-2 lg:col-span-1">
                  <div className="relative">
                    <Input
                      className="md:h-[52px] md:py-[15px] text-[#979797] text-center placeholder:text-lg placeholder:font-extrabold disabled:bg-[#232323] bg-[#232323] rounded-xl justify-center items-center"
                      onChange={(e) => {
                        const value = BigInt(e.target.value); // Convert the input value to bigint
                        updateSplit(index, 'paymentPercentage', value);
                      }}
                      placeholder="0"
                      min={0}
                      max={100}
                      type="number"
                      disabled={true}
                      value={(Number(split.paymentPercentage) / 100).toString()} // Convert bigint to string for display
                    />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-2 lg:col-span-1">
                  {paymentSplits.length > 1 && (
                    <button
                      disabled={true}
                      className="h-[52px] mx-4 hidden"
                      onClick={() => removeSplit(index)}
                    >
                      <Image
                        src="/icons/trash.svg"
                        alt="trash"
                        className="cursor-pointer w-6 h-6"
                        width={24}
                        height={24}
                        quality={100}
                      />
                    </button>
                  )}
                  {index === paymentSplits.length - 1 && (
                    <div
                      className="hidden cursor-pointer h-[52px] justify-center relative gap-y-1 items-center px-[14px] py-[16px] border-2 border-[#DDF247] rounded-md"
                      onClick={() => {
                        // addSplit();
                      }}
                    >
                      <Image
                        src="/icons/add-new.svg"
                        className="w-6 h-6"
                        alt="add"
                        width={24}
                        height={24}
                        quality={100}
                      />
                      <p className="text-center text-sm text-[#DDF247]">
                        Add New
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <PropertiesTemplate addStatus={false} isCreate />

        <div className="flex gap-x-4 justify-center my-5">
          <BaseButton
            title="Previous"
            variant="secondary"
            onClick={cancelChanges}
          />
          <BaseButton title="Next" variant="primary" onClick={create} />
        </div>
      </div>
    </div>
  );
}
