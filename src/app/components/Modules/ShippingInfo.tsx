'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  deleteSellerInfo,
  getSellerInfo,
  upsertSellerInfo,
} from '@/services/legacy/supplier';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { City, Country, State } from 'country-state-city';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import { z } from 'zod';
import { useCreateNFT } from '../Context/CreateNFTContext';
import BaseButton from '../ui/BaseButton';
import { BaseDialog } from '../ui/BaseDialog';

const addressSchema = z.object({
  name: z.string().nonempty('User name is invalid'),
  email: z.string().email({ message: 'Email is invalid' }),
  country: z.object({
    name: z.string().nonempty('country name is invalid'),
  }),
  state: z.object({
    name: z.string().nonempty('state name is invalid'),
  }),
  line1: z.string().nonempty('address 1 is invalid'),
  postalCode: z.string(),
  phoneNumber: z.string().nonempty(),
});

interface addressErrorType {
  name?: string;
  email?: string;
  country?: string;
  state?: string;
  line1?: string;
  postalCode?: string;
  phoneNumber?: string;
}

export default function ShippingInfo({ isSetting }: any) {
  const nftContext = useCreateNFT();
  const { toast } = useToast();
  const [data, setData] = useState<null | any[]>(null);
  const [sellerInfo, setSellerInfo] = useState({
    id: null,
    type: '',
    name: '',
    email: '',
    shippingAddr: '',
    country: '',
    line1: '',
    line2: '',
    state: '',
    city: '',
    postalCode: '',
    phoneNumber: '',
  });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryCode, setCountryCode] = useState('');
  const countries = Country.getAllCountries();

  const {
    sellerInfo: { shipping: selectedShipping },
    setSellerInfo: setContextSellerInfo,
  } = useCreateNFT();

  const setSelectedShipping = (val) => {
    setContextSellerInfo({
      shipping: val,
      shippingId: val?._id,
    });
  };
  const [addressError, setAddressError] = useState<addressErrorType>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const update = async (id: any) => {
    let response = null;

    const result = addressSchema.safeParse(sellerInfo);

    if (!result.success) {
      const addressErrors = result.error.errors.reduce((acc, error) => {
        acc[error.path[0]] = error.message;
        return acc;
      }, {});

      setAddressError(addressErrors);
      return;
    }
    setAddressError({});

    setIsModalOpen(false);
    setIsUpdateModalOpen(false);
    try {
      if (id) {
        response = await upsertSellerInfo({
          id,
          type: sellerInfo.type,
          name: sellerInfo.name,
          email: sellerInfo.email,
          country: (sellerInfo.country as any).name
            ? (sellerInfo.country as any).name
            : sellerInfo.country,
          shippingAddr: sellerInfo.shippingAddr,
          address: {
            line1: sellerInfo.line1,
            line2: sellerInfo.line2,
            state: (sellerInfo.state as any).name
              ? (sellerInfo.state as any).name
              : sellerInfo.state,
            city: (sellerInfo.city as any).name
              ? (sellerInfo.city as any).name
              : sellerInfo.city,
            postalCode: sellerInfo.postalCode,
          },
          phoneNumber: sellerInfo.phoneNumber,
        });
      } else {
        response = await upsertSellerInfo({
          id: '',
          type: sellerInfo.type,
          name: sellerInfo.name,
          email: sellerInfo.email,
          country: (sellerInfo.country as any).name
            ? (sellerInfo.country as any).name
            : sellerInfo.country,
          shippingAddr: sellerInfo.shippingAddr,
          address: {
            line1: sellerInfo.line1,
            line2: sellerInfo.line2,
            state: (sellerInfo.state as any).name
              ? (sellerInfo.state as any).name
              : sellerInfo.state,
            city: (sellerInfo.city as any).name
              ? (sellerInfo.city as any).name
              : sellerInfo.city,
            postalCode: sellerInfo.postalCode,
          },
          phoneNumber: sellerInfo.phoneNumber,
        });
      }
      // console.log('response:', response);

      if (response) {
        await fetchSellers();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update shipping information',
        duration: 2000,
      });
    }
  };

  const handleUpdateSeller = (e: any) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const parsedVal = JSON.parse(value);
      const countryStates = State.getStatesOfCountry(parsedVal.isoCode);

      // @ts-ignore
      setStates(countryStates);
      setCountryCode(parsedVal.isoCode);
      setSellerInfo({
        ...sellerInfo,
        [name]: parsedVal,
      });
      return null;
    } else if (name === 'state') {
      const parsedVal = JSON.parse(value);
      const stateCities = City.getCitiesOfState(countryCode, parsedVal.isoCode);

      // @ts-ignore
      setCities(stateCities);
      setSellerInfo({
        ...sellerInfo,
        [name]: parsedVal,
      });
      return null;
    } else if (name === 'city') {
      const parsedVal = JSON.parse(value);
      setSellerInfo({
        ...sellerInfo,
        [name]: parsedVal,
      });
      return null;
    }
    setSellerInfo({
      ...sellerInfo,
      [name]: value,
    });
  };

  const handleDeleteSeller = async (item: any) => {
    try {
      const response = await deleteSellerInfo({
        id: item._id,
      });

      if (response) {
        toast({
          title: 'Properties Template',
          description: 'Delete shipping information successfully',
          duration: 2000,
        });
      }
      await fetchSellers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete shipping information',
        duration: 2000,
      });
    }
  };

  const cancelChanges = () => {
    setSellerInfo({
      id: null,
      type: '',
      name: '',
      email: '',
      shippingAddr: '',
      country: '',
      line1: '',
      line2: '',
      state: '',
      city: '',
      postalCode: '',
      phoneNumber: '',
    });
    setIsModalOpen(false);
    setIsUpdateModalOpen(false);
  };

  const resetState = () => {
    setStates([]);
    setCities([]);
    setCountryCode('');
    setSellerInfo({
      id: null,
      type: '',
      name: '',
      email: '',
      shippingAddr: '',
      country: '',
      line1: '',
      line2: '',
      state: '',
      city: '',
      postalCode: '',
      phoneNumber: '',
    });
    setIsModalOpen(true);
    console.log('sellerInfo', sellerInfo);
  };

  const preserveState = (value: any) => {
    const countryJSON = Country.getAllCountries().find(
      (item) => item.name === value.country,
    );
    if (!countryJSON?.isoCode) {
      return null;
    }
    const stateJSON = State.getStatesOfCountry(countryJSON.isoCode).find(
      (item) => item.name === value.address.state,
    );
    if (!stateJSON?.isoCode) {
      return null;
    }
    const cityJSON = City.getCitiesOfState(
      countryJSON.isoCode,
      stateJSON.isoCode,
    ).find((item) => item.name === value.address.city);

    const states = State.getStatesOfCountry(countryJSON.isoCode);
    const cities = City.getCitiesOfState(
      countryJSON.isoCode,
      stateJSON.isoCode,
    );

    setSellerInfo({
      ...sellerInfo,
      id: value._id,
      type: value.type,
      name: value.name,
      email: value.email,
      shippingAddr: value.shippingAddr,
      phoneNumber: value.phoneNumber,
      line1: value.address?.line1,
      line2: value.address?.line2,
      city: cityJSON ? cityJSON : value.address.city,
      country: countryJSON ? countryJSON : value.country,
      state: stateJSON ? stateJSON : value.address.state,
      postalCode: value.address?.postalCode,
    });
    setStates(states as any);
    setCities(cities as any);
  };

  const fetchDropDowns = (hasData: boolean, value: any) => {
    if (hasData) {
      // @ts-ignore
      const countryJSON = Country.getAllCountries().find(
        (item) => item.name === value.country,
      );
      if (!countryJSON?.isoCode) {
        return null;
      }
      const stateJSON = State.getStatesOfCountry(countryJSON.isoCode).find(
        (item) => item.name === value.address.state,
      );
      if (!stateJSON?.isoCode) {
        return null;
      }
      const cityJSON = City.getCitiesOfState(
        countryJSON.isoCode,
        stateJSON.isoCode,
      ).find((item) => item.name === value.address.city);

      const states = State.getStatesOfCountry(countryJSON.isoCode);
      const cities = City.getCitiesOfState(
        countryJSON.isoCode,
        stateJSON.isoCode,
      );

      return {
        country: countryJSON,
        state: stateJSON,
        city: cityJSON,
        states,
        cities,
      };
    }

    return null;
  };

  const isSelected = useMemo(
    () => (item: any) => {
      const id = nftContext.sellerInfo.shippingId;
      if (id !== null && item !== null) {
        return id === item._id;
      }
      if (selectedShipping !== null && item !== null) {
        return selectedShipping._id === item._id;
      }
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedShipping, nftContext.sellerInfo.shippingId],
  );

  // useEffect(() => {
  //     nftContext.setSellerInfo({
  //       ...nftContext.sellerInfo,
  //       shippingId: selectedShipping?._id,
  //       shipping: selectedShipping,
  //     });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedShipping]);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    selectFirst(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const selectFirst = (list: Array<any>) => {
    if (!Array.isArray(list) || list.length === 0) {
      nftContext.setSellerInfo({
        shippingId: null,
        shipping: null,
      });
    } else {
      const firstShipping = list[0];
      nftContext.setSellerInfo({
        shippingId: firstShipping?._id,
        shipping: firstShipping,
      });
    }
  };
  const fetchSellers = async () => {
    const response = await getSellerInfo();
    setData(response);
  };

  return (
    <div className="flex flex-col gap-y-5">
      {isSetting ? null : (
        <p className="sm:text-base text-sm md:text-lg font-extrabold text-white font-manrope">
          Select Shipping Information
        </p>
      )}
      <div className="flex flex-wrap gap-5">
        {data && data.length > 0
          ? data?.map((item: any, index: number) => {
              return (
                <div
                  key={index}
                  className={cn(
                    `w-[18rem] cursor-pointer h-[230px] bg-[#232323] relative flex flex-col gap-y-4 p-4 border-2 border-transparent rounded-[12px] ${isSelected(item) ? ' border-[#DDF247]' : ''}`,
                    isSetting ? ' bg-[#161616]' : '',
                  )}
                  onClick={() => {
                    setSelectedShipping(item);
                  }}
                >
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-y-2">
                      <span className="md:text-lg font-semibold">
                        {item.name}
                      </span>
                      <span className="text-[#A6A6A6] text-xs">
                        {item.phoneNumber}
                      </span>
                    </div>
                    <div className="text-white text-xs sm:text-sm">
                      {item.type}
                    </div>
                  </div>
                  <div>
                    {item.address && item.country ? (
                      <p className="text-[#A6A6A6] azeret-mono-font text-xs">
                        {`${item.address.line1 + item.address.line2 + item.address.state + item.address.city + item.country}`
                          .length > 100
                          ? `${item.address.line1 + ' ' + item.address.line2 + ' ' + item.address.state + item.address.city + ' ' + item.country}`.slice(
                              0,
                              100,
                            ) + '...'
                          : `${item.address.line1 + ' ' + item.address.line2 + ' ' + item.address.state + ' ' + item.address.city + ' ' + item.country}`}{' '}
                      </p>
                    ) : null}

                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <span
                        onClick={() => handleDeleteSeller(item)}
                        className="text-[#DDF247] cursor-pointer px-2 py-1 rounded-md"
                      >
                        <Image
                          quality={100}
                          width={16}
                          height={16}
                          alt="delete"
                          src="/icons/trash.svg"
                          className="w-5 h-5"
                        />
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <div
                        className="text-[#DDF247] text-sm h-full cursor-pointer px-2 py-1 rounded-md border-2 border-white/[12%]"
                        onClick={() => {
                          preserveState(item);
                          setIsUpdateModalOpen(true);
                        }}
                      >
                        Edit
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end ">
                    <BaseDialog
                      isOpen={isUpdateModalOpen}
                      onClose={() => setIsUpdateModalOpen(false)}
                      className="max-h-[80%] overflow-y-auto overflow-x-hidden bg-[#161616]"
                    >
                      <div className="flex flex-col gap-y-5">
                        <div className="px-4">
                          <h1 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-[32px]">
                            Edit Contact Information Template
                          </h1>
                        </div>
                        <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
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
                                    <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                                      Template Title
                                    </Label>
                                  </div>
                                </DisclosureButton>
                                <DisclosurePanel className="pt-4 pb-2 text-sm  text-white  rounded-b-lg">
                                  <div className="flex flex-col gap-y-3">
                                    <Input
                                      onChange={(e) => {
                                        setSellerInfo({
                                          ...sellerInfo,
                                          type: e.target.value,
                                        });
                                      }}
                                      className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                                      type="text"
                                      value={sellerInfo.type}
                                      placeholder="Enter Template Title * (e.g., Home, Gallery, Office, Etc)"
                                    />
                                  </div>
                                </DisclosurePanel>
                              </>
                            )}
                          </Disclosure>
                        </div>
                        <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
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
                                    <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                                      Basic information
                                    </Label>
                                    {/* <div className="flex justify-center">
                          <ChevronUpIcon
                            className={`${
                              open ? 'rotate-180 transform' : ''
                            } h-5 w-5 text-white/[53%]`}
                          />
                        </div> */}
                                  </div>
                                </DisclosureButton>
                                <DisclosurePanel className="pt-4 pb-2 text-sm  text-white  rounded-b-lg">
                                  <div className="flex md:flex-row flex-col gap-2">
                                    <div className="flex flex-col gap-y-2 w-full md:w-1/2 lg:w-[32%]">
                                      <Label className="text-sm font-bold">
                                        Name*
                                      </Label>
                                      <Input
                                        onChange={(e) =>
                                          setSellerInfo({
                                            ...sellerInfo,
                                            name: e.target.value,
                                          })
                                        }
                                        className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                                        type="text"
                                        value={sellerInfo.name ?? ''}
                                        placeholder="Enter name"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-y-2 w-full md:w-1/2 lg:w-[32%]">
                                      <Label className="text-sm font-bold">
                                        E-mail*
                                      </Label>
                                      <Input
                                        onChange={(e) =>
                                          setSellerInfo({
                                            ...sellerInfo,
                                            email: e.target.value,
                                          })
                                        }
                                        className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                                        type="text"
                                        value={sellerInfo.email ?? ''}
                                        placeholder="Enter email"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-y-2 w-full md:w-1/2 lg:w-[32%]">
                                      <Label className="text-sm font-bold">
                                        Country*
                                      </Label>
                                      <div className="rounded-md bg-[#161616]">
                                        <select
                                          aria-label="select curation"
                                          className="h-10 rounded-md px-2 bg-[#161616] text-xs font-AzeretMono focus-visible:border-none focus-visible:outline-none focus-visible:shadow-none"
                                          name="country"
                                          value={JSON.stringify(
                                            sellerInfo.country,
                                          )}
                                          onChange={handleUpdateSeller}
                                        >
                                          <option value="">Select</option>
                                          {countries.map((item: any) => (
                                            <option
                                              key={item.isoCode}
                                              value={JSON.stringify(item)}
                                            >
                                              {item.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </DisclosurePanel>
                              </>
                            )}
                          </Disclosure>
                        </div>

                        <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
                          <div className="flex flex-col gap-y-3">
                            <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                              Shipping Address
                            </Label>
                            <hr className="border-white/10" />
                            <div className="grid grid-cols-12 gap-2 mb-2 justify-between items-center">
                              <div className="flex flex-col gap-y-2 sm:col-span-6 col-span-12">
                                <Label className="text-sm font-bold">
                                  Address 1*
                                </Label>
                                <Input
                                  onChange={(e) =>
                                    setSellerInfo({
                                      ...sellerInfo,
                                      line1: e.target.value,
                                    })
                                  }
                                  className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                                  type="text"
                                  value={sellerInfo.line1 ?? ''}
                                  placeholder="Enter Address 1"
                                />
                              </div>
                              <div className="flex flex-col gap-y-2 sm:col-span-6 col-span-12">
                                <Label className="text-sm font-bold">
                                  Address 2*
                                </Label>
                                <Input
                                  onChange={(e) =>
                                    setSellerInfo({
                                      ...sellerInfo,
                                      line2: e.target.value,
                                    })
                                  }
                                  value={sellerInfo.line2 ?? ''}
                                  className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                                  type="text"
                                  placeholder="Enter Address 2"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-12 gap-2 mb-2 justify-between items-center">
                              <div className="flex flex-col gap-y-2 md:col-span-4 sm:col-span-6 col-span-12">
                                <Label className="text-sm font-bold">
                                  State*
                                </Label>
                                <div className="bg-[#161616] rounded-xl pr-4">
                                  <select
                                    aria-label="Select curation"
                                    className="w-full border-none bg-[#161616] h-[52px] px-[15px] py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                                    name="state"
                                    value={JSON.stringify(sellerInfo.state)}
                                    onChange={handleUpdateSeller}
                                  >
                                    <option value="">Select</option>
                                    {states.map((item: any) => (
                                      <option
                                        key={item.isoCode}
                                        value={JSON.stringify(item)}
                                      >
                                        {item.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="flex flex-col gap-y-2 md:col-span-4 sm:col-span-6 col-span-12">
                                <Label className="text-sm font-bold">
                                  City*
                                </Label>
                                <div className="bg-[#161616] rounded-xl pr-4">
                                  <select
                                    aria-label="Select curation"
                                    className="w-full border-none bg-[#161616] h-[52px] px-[15px] py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                                    name="city"
                                    value={
                                      sellerInfo.city
                                        ? JSON.stringify(sellerInfo.city)
                                        : ''
                                    }
                                    onChange={handleUpdateSeller}
                                  >
                                    <option value="">Select</option>
                                    {cities.map((item: any) => (
                                      <option
                                        key={item.isoCode}
                                        value={JSON.stringify(item)}
                                      >
                                        {item.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="flex flex-col gap-y-2 md:col-span-4 sm:col-span-6 col-span-12">
                                <Label className="text-sm font-bold">
                                  Postal Code*
                                </Label>
                                <Input
                                  onChange={(e) =>
                                    setSellerInfo({
                                      ...sellerInfo,
                                      postalCode: e.target.value,
                                    })
                                  }
                                  value={sellerInfo.postalCode ?? ''}
                                  className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                                  type="text"
                                  placeholder="Enter Zip Code"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-y-3">
                            <PhoneInput
                              enableLongNumbers={true}
                              containerClass="phone-container flex flex-col gap-y-2 [&>div.special-label]:text-sm [&>div.special-label]:font-bold"
                              buttonClass="phone-dropdown"
                              inputClass="phone-control !h-[52px] !px-[26px] !mt-0 !py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex placeholder:text-white/[53%] text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                              specialLabel="Phone Number*"
                              country={'us'}
                              value={sellerInfo.phoneNumber}
                              inputStyle={{
                                width: '100%',
                                height: '2.5rem',
                                borderRadius: '0.375rem',
                                padding: '0.5rem',
                                marginTop: '0.5rem',
                              }}
                              onChange={(e) =>
                                setSellerInfo({ ...sellerInfo, phoneNumber: e })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex xs:flex-row flex-col gap-4 justify-center my-3 px-4">
                          <BaseButton
                            title="Cancel"
                            variant="secondary"
                            onClick={cancelChanges}
                          />
                          <BaseButton
                            title="Save"
                            variant="primary"
                            onClick={async () => {
                              await update(sellerInfo?.id);
                            }}
                          />
                        </div>
                      </div>
                    </BaseDialog>
                  </div>
                </div>
              );
            })
          : null}
        <div
          className={cn(
            'w-[18rem] h-[230px] bg-[#232323] flex flex-col gap-y-2 justify-center items-center rounded-[12px] relative',
            isSetting ? ' bg-[#161616]' : '',
          )}
          onClick={resetState}
        >
          <div className="flex flex-col gap-y-6 items-center">
            <div className="w-14 h-14 rounded-full bg-[#111] border border-white/[30%] flex items-center justify-center">
              <Image
                quality={100}
                src="/icons/plus.svg"
                className="w-5 h-5"
                alt="plus"
                width={20}
                height={20}
              />
            </div>
            <p
              className={cn(
                'text-[#828282] sm:text-base text-sm md:text-lg font-medium',
                isSetting ? 'text-[#7C8282]' : '',
              )}
            >
              Add New Address
            </p>
          </div>
        </div>

        <BaseDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="bg-dark p-2 sm:p-5 max-h-[80%] overflow-y-auto overflow-x-hidden max-w-3xl bg-[#161616]"
        >
          <div className="flex flex-col gap-y-5 w-full">
            <div className="px-4">
              <h1 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-[32px]">
                Add New Contact Information Template
              </h1>
            </div>
            <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
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
                        <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                          Template Title
                        </Label>
                        {/* <div className="flex justify-center">
                          <ChevronUpIcon
                            className={`${
                              open ? 'rotate-180 transform' : ''
                            } h-5 w-5 text-white/[53%]`}
                          />
                        </div> */}
                      </div>
                    </DisclosureButton>
                    <DisclosurePanel className="pt-4 pb-2 text-sm  text-white  rounded-b-lg">
                      <div className="flex flex-col gap-y-3">
                        {/* <Label className="text-sm font-bold">
                            Shipping Address Name
                          </Label> */}
                        <Input
                          onChange={(e) =>
                            setSellerInfo({
                              ...sellerInfo,
                              type: e.target.value,
                            })
                          }
                          className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                          type="text"
                          placeholder="Enter Template Title * (e.g., Home, Gallery, Office, Etc)"
                        />
                      </div>
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            </div>
            <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
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
                        <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                          Basic information
                        </Label>
                        {/* <div className="flex justify-center">
                          <ChevronUpIcon
                            className={`${
                              open ? 'rotate-180 transform' : ''
                            } h-5 w-5 text-white/[53%]`}
                          />
                        </div> */}
                      </div>
                    </DisclosureButton>
                    <DisclosurePanel className="pt-4 pb-2 text-sm text-white rounded-b-lg">
                      <div className="flex flex-col gap-y-3">
                        <div className="flex md:flex-row flex-col gap-2">
                          <div className="flex flex-col gap-y-2 w-full md:w-1/2 lg:w-[32%]">
                            <Label className="text-sm font-bold">Name*</Label>
                            <Input
                              onChange={(e) =>
                                setSellerInfo({
                                  ...sellerInfo,
                                  name: e.target.value,
                                })
                              }
                              className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                              type="text"
                              placeholder="Enter name"
                            />
                            {addressError?.name && (
                              <p className="text-red-500 text-sm">
                                {addressError.name}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-y-2 w-full md:w-1/2 lg:w-[32%]">
                            <Label className="text-sm font-bold">E-mail*</Label>
                            <Input
                              onChange={(e) =>
                                setSellerInfo({
                                  ...sellerInfo,
                                  email: e.target.value,
                                })
                              }
                              className="w-full border-none h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                              type="text"
                              placeholder="Enter email"
                            />
                            {addressError?.email && (
                              <p className="text-red-500 text-sm">
                                {addressError.email}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-y-2 w-full md:w-1/2 lg:w-[32%]">
                            <Label className="text-sm font-bold">
                              Country*
                            </Label>
                            <div className="bg-[#161616] rounded-xl pr-4">
                              <select
                                aria-label="Select curation"
                                className="w-full border-none bg-[#161616] h-[52px] px-[15px] py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                                name="country"
                                value={JSON.stringify(sellerInfo.country)}
                                onChange={handleUpdateSeller}
                              >
                                <option value="">Select</option>
                                {countries.map((item: any) => (
                                  <option
                                    key={item.isoCode}
                                    value={JSON.stringify(item)}
                                  >
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {addressError?.country && (
                              <p className="text-red-500 text-sm">
                                {addressError.country}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            </div>
            <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
              <div className="flex flex-col gap-y-3">
                <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                  Shipping Address
                </Label>
                <hr className="border-white/10" />
                <div className="grid grid-cols-12 gap-2 mb-2 justify-between items-center">
                  <div className="flex flex-col gap-y-2 sm:col-span-6 col-span-12">
                    <Label className="font-extrabold test-sm text-white manrope-font">
                      Address 1*
                    </Label>
                    <Input
                      onChange={(e) =>
                        setSellerInfo({
                          ...sellerInfo,
                          line1: e.target.value,
                        })
                      }
                      className="w-full border-none h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                      type="text"
                      placeholder="Address 1"
                    />
                    {addressError?.line1 && (
                      <p className="text-red-500 text-sm">
                        {addressError.line1}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-y-2 sm:col-span-6 col-span-12">
                    <Label className="text-sm font-bold">Address 2*</Label>
                    <Input
                      onChange={(e) =>
                        setSellerInfo({
                          ...sellerInfo,
                          line2: e.target.value,
                        })
                      }
                      className="w-full border-none h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                      type="text"
                      placeholder="Address 2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 items-center gap-2 justify-between">
                  <div className="flex flex-col gap-y-2 md:col-span-4 sm:col-span-6 col-span-12">
                    <Label className="text-sm font-bold">State*</Label>
                    <div className="bg-[#161616] rounded-xl pr-4">
                      <select
                        aria-label="Select curation"
                        className="w-full border-none bg-[#161616] h-[52px] px-[15px] py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                        name="state"
                        value={JSON.stringify(sellerInfo.state)}
                        onChange={handleUpdateSeller}
                      >
                        <option value="">Select</option>
                        {states.map((item: any) => (
                          <option
                            key={item.isoCode}
                            value={JSON.stringify(item)}
                          >
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {addressError?.state && (
                      <p className="text-red-500 text-sm">
                        {addressError.state}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-y-2 md:col-span-4 sm:col-span-6 col-span-12">
                    <Label className="text-sm font-bold">City*</Label>
                    <div className="bg-[#161616] rounded-xl pr-4">
                      <select
                        aria-label="Select curation"
                        className="w-full border-none bg-[#161616] h-[52px] px-[15px] py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                        name="city"
                        value={
                          sellerInfo.city ? JSON.stringify(sellerInfo.city) : ''
                        }
                        onChange={handleUpdateSeller}
                      >
                        <option value="">Select</option>
                        {cities.map((item: any) => (
                          <option
                            key={item.isoCode}
                            value={JSON.stringify(item)}
                          >
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-2 md:col-span-4 sm:col-span-6 col-span-12">
                    <Label className="text-sm font-bold">Postal Code*</Label>
                    <Input
                      onChange={(e) =>
                        setSellerInfo({
                          ...sellerInfo,
                          postalCode: e.target.value,
                        })
                      }
                      className="w-full border-none bg-[#161616] h-[52px] px-[15px] py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                      type="text"
                      placeholder="Enter Zip Code"
                    />
                    {addressError?.postalCode && (
                      <p className="text-red-500 text-sm">
                        {addressError.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-y-3">
                <PhoneInput
                  enableLongNumbers={true}
                  containerClass="phone-container flex flex-col gap-y-2 [&>div.special-label]:text-sm [&>div.special-label]:font-bold"
                  buttonClass="phone-dropdown"
                  inputClass="phone-control !h-[52px] !px-[26px] !mt-0 !py-[15px] rounded-xl placeholder:text-xs azeret-mono-font justify-start items-center gap-[30px] inline-flex placeholder:text-white/[53%] text-white/[53%] text-sm focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none"
                  specialLabel="Phone Number*"
                  country={'us'}
                  value={sellerInfo.phoneNumber}
                  inputStyle={{
                    width: '100%',
                    height: '2.5rem',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    marginTop: '0.5rem',
                  }}
                  onChange={(e) =>
                    setSellerInfo({ ...sellerInfo, phoneNumber: e })
                  }
                />
                {addressError?.phoneNumber && (
                  <p className="text-red-500 text-sm">
                    {addressError.phoneNumber}
                  </p>
                )}
              </div>
            </div>
            <div className="flex xs:flex-row flex-col gap-4 justify-center my-3 px-4">
              <BaseButton
                title="Cancel"
                variant="secondary"
                onClick={cancelChanges}
              />
              <BaseButton
                title="Save"
                variant="primary"
                onClick={async () => {
                  await update('');
                }}
              />
            </div>
          </div>
        </BaseDialog>
      </div>
    </div>
  );
}
