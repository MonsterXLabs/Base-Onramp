'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  deleteContactInfo,
  getContactsInfo,
  upsertContactInfo,
} from '@/services/legacy/supplier';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useCreateNFT } from '../Context/CreateNFTContext';
import BaseButton from '../ui/BaseButton';
import { BaseDialog } from '../ui/BaseDialog';

export default function ContactInfo({ isSetting }: any) {
  const { toast } = useToast();
  const [data, setData] = useState<null | any[]>(null);
  const [newContact, setNewContact] = useState({
    id: null,
    contactInfo: '',
    name: '',
  });
  const nftContext = useCreateNFT();
  const [selectedContact, setSelectedContact] = useState(
    nftContext.sellerInfo.contact,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const update = async (id?: string) => {
    let response = null;
    if (id) {
      response = await upsertContactInfo({ ...newContact, id: id ? id : null });
    } else {
      response = await upsertContactInfo(newContact);
    }

    if (response) {
      await fetchContacts();
    }
  };

  const cancelChanges = () => {
    setNewContact({
      id: null,
      contactInfo: '',
      name: '',
    });
    setIsModalOpen(false);
    setIsUpdateModalOpen(false);
  };

  const isSelected = useMemo(
    () => (item: any) => {
      const id = nftContext.sellerInfo.contactId;

      if (id !== null && item !== null) {
        return id == item._id;
      }

      if (selectedContact !== null && item !== null) {
        return selectedContact._id == item._id;
      }

      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedContact, nftContext.sellerInfo.contactId],
  );

  useEffect(() => {
    nftContext.setSellerInfo({
      contactId: selectedContact?._id,
      contact: selectedContact,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact]);

  useEffect(() => {
    selectFirst(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const selectFirst = (list: Array<any>) => {
    if (!Array.isArray(list) || list.length === 0) {
      nftContext.setSellerInfo({
        contactId: null,
        contact: null,
      });
    } else {
      const firstContact = list[0];
      nftContext.setSellerInfo({
        contactId: firstContact._id,
        contact: firstContact,
      });
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const response = await getContactsInfo();
    setData(response);
  };

  const handleDeleteContact = async (item: any) => {
    try {
      const response = await deleteContactInfo({
        id: item._id,
      });

      if (response) {
        toast({
          title: 'Properties Template',
          description: 'Delete contact information successfully',
          duration: 2000,
        });
      }
      await fetchContacts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete contact information',
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex flex-col gap-y-5">
      {isSetting ? null : (
        <p className="sm:text-base text-sm md:text-lg font-extrabold text-white font-manrope">
          Select Contact Information
        </p>
      )}
      <div className="flex flex-wrap gap-5">
        {data && data.length > 0
          ? data.map((item: any, index: number) => (
              <div
                key={index}
                className={cn(
                  `w-[18rem] cursor-pointer h-[230px] bg-[#232323] flex flex-col relative gap-y-4 p-4 rounded-[12px] border-2 border-transparent ${isSelected(item) ? 'border-[#DDF247]' : ''}`,
                  isSetting ? ' bg-[#161616]' : '',
                )}
                onClick={() => setSelectedContact(item)}
              >
                <span className="sm:text-lg font-semibold">
                  {item.name ? item.name : `#${index + 1}`}
                </span>
                <div>
                  <p className="text-[#A6A6A6] py-1 font-AzeretMono text-xs">
                    {item?.contactInfo?.length > 150
                      ? `${item.contactInfo.slice(0, 150)}...`
                      : item.contactInfo}
                    ...
                  </p>
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                  <span
                    onClick={() => {
                      handleDeleteContact(item);
                    }}
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
                      setIsUpdateModalOpen(true);
                      setNewContact({
                        ...newContact,
                        id: item._id,
                        name: item.name,
                        contactInfo: item.contactInfo,
                      });
                    }}
                  >
                    Edit
                  </div>
                </div>

                <div className="flex justify-end">
                  <BaseDialog
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    className="max-h-[80%] overflow-y-auto overflow-x-hidden bg-[#161616]"
                  >
                    <div className="flex flex-col gap-y-2">
                      <div className="px-4 mb-5">
                        <h1 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-[32px]">
                          Edit Contact Information Template
                        </h1>
                      </div>
                      <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
                        <div className="flex flex-col gap-y-4">
                          <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                            Contact Information Name
                          </Label>
                          <hr className="border-white/10" />
                          <Input
                            value={newContact.name ? newContact.name : ''}
                            onChange={(e) =>
                              setNewContact({
                                ...newContact,
                                name: e.target.value,
                              })
                            }
                            autoFocus={false}
                            tabIndex={-1}
                            className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                            type="text"
                            placeholder="Enter Template Title * (e.g., #1, Basic, Etc)"
                          />
                        </div>
                      </div>
                      <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
                        <div className="flex flex-col gap-y-4">
                          <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                            Contact Information For Seller
                          </Label>
                          <hr className="border-white/10" />
                          <Textarea
                            value={
                              newContact.contactInfo
                                ? newContact.contactInfo
                                : ''
                            }
                            tabIndex={-2}
                            onChange={(e) =>
                              setNewContact({
                                ...newContact,
                                contactInfo: e.target.value,
                              })
                            }
                            className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                            placeholder="Please share your preferred contact method or messenger ID for shipping arrangements.

At VaultX, we prioritize the safe delivery of each artwork through shipping methods mutually agreed upon between sellers and buyers, taking into account the unique characteristics of each piece.  After completing a transaction, both parties can use this space to share contact information and discuss shipping arrangements. Your message will remain confidential and will only be shared with the relevant parties once the transaction is finalized."
                          />
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
                              await update(newContact?.id);
                              setIsUpdateModalOpen(false);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </BaseDialog>
                </div>
              </div>
            ))
          : null}
        <div
          className={cn(
            'w-[18rem] h-[230px] bg-[#232323] flex flex-col gap-y-2 justify-center items-center rounded-[12px] relative',
            isSetting ? 'bg-[#161616]' : '',
          )}
          onClick={() => setIsModalOpen(true)}
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
                'text-[#828282] sm:text-base text-sm  md:text-lg font-medium',
                isSetting ? 'text-[#7C8282]' : '',
              )}
            >
              Add New Information
            </p>
          </div>
        </div>
        <BaseDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="max-h-[80%] overflow-y-auto overflow-x-hidden bg-[#161616]"
        >
          <div className="flex flex-col gap-y-4">
            <div className="px-4">
              <h1 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-[32px]">
                Add New Contact Information Template
              </h1>
            </div>
            <div className="flex flex-col gap-y-5">
              <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
                <div className="flex flex-col gap-y-4">
                  <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                    Template Title
                  </Label>
                  <hr className="border-white/10" />
                  {/* <Label className="text-lg font-medium">
                  Contact Information Name
                </Label> */}
                  <Input
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                    className="w-full border-none  h-[52px] px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                    type="text"
                    tabIndex={-1}
                    placeholder="Enter Template Title * (e.g., #1, Basic, Etc)"
                  />
                </div>
              </div>

              <div className="rounded-[20px] px-3 py-2 sm:px-5 sm:py-3 bg-[#232323]">
                <div className="flex flex-col gap-y-4">
                  <Label className="font-extrabold md:text-base text-sm lg:text-lg text-white manrope-font">
                    Contact Information
                  </Label>
                  <hr className="border-white/10" />
                  <Textarea
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        contactInfo: e.target.value,
                      })
                    }
                    tabIndex={-2}
                    className="w-full border-none resize-none px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                    rows={8}
                    placeholder="Please share your preferred contact method or messenger ID for shipping arrangements. 
                  &#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;
                  At VaultX, we prioritize the safe delivery of each artwork through shipping methods mutually agreed upon between sellers and buyers, taking into account the unique characteristics of each piece.  After completing a transaction, both parties can use this space to share contact information and discuss shipping arrangements. Your message will remain confidential and will only be shared with the relevant parties once the transaction is finalized."
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
                    await update();
                    setIsModalOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        </BaseDialog>
      </div>
    </div>
  );
}
