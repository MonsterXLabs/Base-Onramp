/* eslint-disable @next/next/no-img-element */
'use client';
import {
  CreateNFTProvider,
  useCreateNFT,
} from '@/app/components/Context/CreateNFTContext';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';
import ContactInfo from '@/app/components/Modules/ContactInfo';
import UserArtistSetting from '@/app/components/Modules/create/UserArtistSetting';
import { SettingLoadingModal } from '@/app/components/Modules/setting/SettingLoadingModal';
import SettingPropertiesInfo from '@/app/components/Modules/setting/SettingProperties';
import ShippingInfo from '@/app/components/Modules/ShippingInfo';
import BaseButton from '@/app/components/ui/BaseButton';
import { BaseDialog } from '@/app/components/ui/BaseDialog';
import FileInput from '@/app/components/ui/FileInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn, sleep } from '@/lib/utils';
import {
  deleteProperty,
  getProperties,
  userServices,
} from '@/services/legacy/supplier';
import { checkUrl } from '@/utils/helpers';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { isAxiosError } from 'axios';
import { ChevronUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

const defaultAttributes = [
  { type: 'Type', value: 'Write it here' },
  { type: 'Medium', value: 'Write it here' },
  { type: 'Support', value: 'Write it here' },
  { type: 'Dimensions (cm)', value: 'Write it here' },
  { type: 'Signature', value: 'Write it here' },
  { type: 'Authentication', value: 'Write it here' },
];
export default function Page() {
  return (
    <CreateNFTProvider>
      <MainComponent />
    </CreateNFTProvider>
  );
}
const profileSchema = z.object({
  email: z.string().email().nullable().optional(),
  website: z
    .string()
    .nullable()
    .optional()
    .refine((url) => url === '' || checkUrl(url, 'website'), {
      message: 'Invalid URL',
    }),
  twitter: z
    .string()
    .nullable()
    .optional()
    .refine((url) => url === '' || checkUrl(url, 'twitter'), {
      message: 'Invalid URL',
    }),
  facebook: z
    .string()
    .nullable()
    .optional()
    .refine((url) => url === '' || checkUrl(url, 'facebook'), {
      message: 'Invalid URL',
    }),
  instagram: z
    .string()
    .nullable()
    .optional()
    .refine((url) => url === '' || checkUrl(url, 'instagram'), {
      message: 'Invalid URL',
    }),
});
type ProfileSchemaError = z.inferFormattedError<typeof profileSchema>;

const MainComponent = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<number>(0);
  const { user } = useGlobalContext();
  const [formData, setFormData] = useState({
    avatar: null,
    cover: null,
    username: null,
    email: null,
    bio: null,
    facebook: null,
    twitter: null,
    instagram: null,
    website: null,
  });
  const [formDataError, setFormDataError] = useState<ProfileSchemaError | null>(
    null,
  );
  const [serverError, setSErverError] = useState<string | null>(null);
  const handleFileChange = (file: any, type: string) => {
    if (type === 'avatar') setFormData({ ...formData, avatar: file });
    if (type === 'cover') setFormData({ ...formData, cover: file });
  };

  const update = async () => {
    setSErverError(null);
    toast({
      title: 'Updating Profile',
      description: 'Please wait...',
      duration: 2000,
    });

    const json = {
      ...formData,
      userImage: formData.avatar,
      bannerImage: formData.cover,
    };

    try {
      const result = profileSchema.safeParse(json);
      if (!result.success) {
        setFormDataError(result.error.format());
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An error occurred while updating your profile',
          duration: 2000,
        });
        return;
      } else {
        setFormDataError(null);
      }
      setStep(1);

      const formDataForm = new FormData();
      formDataForm.append('userImage', formData.avatar);
      formDataForm.append('bannerImage', formData.cover);
      formDataForm.append('username', formData.username ?? '');
      formDataForm.append('email', formData.email ?? '');
      formDataForm.append('bio', formData.bio ?? '');
      formDataForm.append('facebook', formData.facebook ?? '');
      formDataForm.append('twitter', formData.twitter ?? '');
      formDataForm.append('instagram', formData.instagram ?? '');
      formDataForm.append('website', formData.website ?? '');

      await Promise.all([
        sleep(2),
        (async () => {
          const response = await userServices.updateProfile(
            formDataForm as any,
          );
          if (response) {
            toast({
              title: 'Profile Updated',
              duration: 2000,
            });
          }
        })(),
      ]);
      setStep(2);
    } catch (error) {
      setStep(3);
      if (isAxiosError(error)) {
        if (error.response) {
          setSErverError(error.response?.data?.message);
        }
      } else {
        console.error('Unexpected error:', error);
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while updating your profile',
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        website: user.website,
        bio: user.bio,
        email: user.email,
        username: user.username,
        instagram: user.instagram,
        twitter: user.twitter,
        facebook: user.facebook,
        avatar: user.avatar ? user.avatar.url : null,
        cover: user.banner ? user.banner.url : null,
      });

      fetchProperties();
      if (advancedDetails.propertyTemplateId) {
      }
      setAdvancedDetails({
        ...advancedDetails,
        propertyTemplateId: 'basic',
      });
    }
  }, [user]);

  const { advancedDetails, setAdvancedDetails } = useCreateNFT();
  const [data, setData] = useState(advancedDetails.attributes);
  const [isModalOpenTemplate, setIsModalOpenTemplate] = useState(false);
  const [selectedTemplate, selectTemplate] = useState(null);

  useEffect(() => {
    setAdvancedDetails({
      ...advancedDetails,
      attributes: data,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const fetchProperties = async () => {
    const response = await getProperties();
    // select first template
    if (response?.length) {
      setAdvancedDetails({
        ...advancedDetails,
        propertyTemplateId: response?.[0]._id,
      });
    }
    setData(response);
  };

  const handleTemplateSelect = (template) => {
    setAdvancedDetails({
      ...advancedDetails,
      propertyTemplateId: template._id || null,
    });
  };

  const handleTemplateEdit = async (editedTemplate) => {
    selectTemplate(editedTemplate);
    setIsModalOpenTemplate(true);
  };

  const handleTemplateDelete = async (editedTemplate) => {
    try {
      const response = await deleteProperty({
        id: editedTemplate._id,
      });

      if (response) {
        toast({
          title: 'Properties Template',
          description: 'Deleted successfully',
          duration: 2000,
        });

        await fetchProperties();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex flex-col px-2 sm:px-4">
      <BaseDialog
        isOpen={step > 0}
        isClose={false}
        modal={step === 1}
        onClose={() => {
          setStep(0);
        }}
        className="bg-[#161616] max-h-[80%] min-w-[500px] max-w-[500px] mx-auto overflow-y-auto overflow-x-hidden border-0"
      >
        <SettingLoadingModal step={step} />
      </BaseDialog>
      <div className="w-full justify-center items-center md:mb-8 mb-5 lg:mb-[40px]">
        <p className="sm:text-center md:text-2xl text-xl lg:text-[32px] font-extrabold">
          Edit Profile
        </p>
      </div>
      <div className="w-full flex flex-col gap-y-5">
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
                    <Label className="font-extrabold sm:text-lg text-white">
                      Edit your avatar
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
                <DisclosurePanel className="pt-4 pb-2 text-sm text-white rounded-b-lg">
                  <div className=" flex sm:flex-row md:flex-nowrap flex-wrap flex-col gap-4 items-center my-5">
                    {formData.avatar ? (
                      <img
                        src={
                          typeof formData.avatar === 'string'
                            ? formData.avatar
                            : URL.createObjectURL(formData.avatar)
                        }
                        alt="cover"
                        className="w-28 h-28 shrink-0 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-28 h-28 shrink-0 rounded-full bg-[#2d2d2d]"></div>
                    )}
                    <div className="w-full md:max-w-[550px] md:min-w-[550px]">
                      <FileInput
                        title="Upload a profile image"
                        subtitle="100*100 size is recommended"
                        isProfile
                        titleStyles={'text-sm font-extrabold'}
                        onFileSelect={(file: any) =>
                          handleFileChange(file, 'avatar')
                        }
                      />
                    </div>
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
                    <Label className="font-extrabold sm:text-lg text-white">
                      Edit your Cover Image
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
                <DisclosurePanel className="pt-4 pb-2 text-sm text-white rounded-b-lg">
                  <div className=" flex sm:flex-row md:flex-nowrap flex-wrap flex-col gap-4 items-center my-5">
                    {formData.cover ? (
                      <img
                        src={
                          typeof formData.cover === 'string'
                            ? formData.cover
                            : URL.createObjectURL(formData.cover)
                        }
                        alt="cover"
                        className="w-28 h-28 shrink-0 object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-28 h-28 shrink-0 rounded-2xl bg-[#2d2d2d]"></div>
                    )}
                    <div className="w-full md:max-w-[550px] md:min-w-[550px]">
                      <FileInput
                        title="Upload my profile cover"
                        subtitle="1200*400 size is recommended"
                        isProfile
                        onFileSelect={(file: any) =>
                          handleFileChange(file, 'cover')
                        }
                      />
                    </div>
                  </div>
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        </div>

        {/* <span>Basic Information</span> */}
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
                    <Label className="font-extrabold sm:text-lg text-white">
                      Basic Information
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
                <DisclosurePanel className="pt-4 pb-2 text-sm text-white rounded-b-lg">
                  <div className="mt-5 flex sm:flex-row flex-col gap-3">
                    <div className="flex flex-col gap-y-2 basis-1/2 mb-4">
                      <Label className="font-semibold text-sm text-white manrope-font">
                        Username
                      </Label>
                      <Input
                        value={formData.username ? formData.username : ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            username: (e.target as any).value,
                          })
                        }
                        className="w-full border-none bg-[#161616] h-[52px] rounded-xl placeholder:text-white/[53%] azeret-mono-font placeholder:text-xs focus-within:border-0 shadow-none outline-0 border-0 focus-visible:shadow-none focus-visible:outline-0 focus-visible:border-0"
                        type="text"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="flex flex-col gap-y-2 basis-1/2 mb-4">
                      <Label className="font-semibold text-sm text-white manrope-font">
                        Email Address
                      </Label>
                      <Input
                        value={formData.email ? formData.email : ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: (e.target as any).value,
                          })
                        }
                        className="w-full border-none bg-[#161616] h-[52px] rounded-xl placeholder:text-white/[53%] azeret-mono-font placeholder:text-xs focus-within:border-0 shadow-none outline-0 border-0 focus-visible:shadow-none focus-visible:outline-0 focus-visible:border-0"
                        type="text"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  {formDataError?.email && (
                    <p className="text-[#DDF247] text-sm mb-5">
                      Please check your email
                    </p>
                  )}
                  {serverError && (
                    <p className="text-[#DDF247] text-sm mb-5">{serverError}</p>
                  )}
                  <div className="flex flex-col gap-y-2 mt-2">
                    <Label className="font-semibold text-sm text-white manrope-font">
                      Your Bio
                    </Label>
                    <Textarea
                      value={formData.bio ? formData.bio : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bio: (e.target as any).value,
                        })
                      }
                      className="h-[180px] resize-none py-4 px-3 border-none bg-[#161616] rounded-xl placeholder:text-white/[53%] azeret-mono-font placeholder:text-xs focus-within:border-0 shadow-none outline-0 border-0 focus-visible:shadow-none focus-visible:outline-0 focus-visible:border-0"
                      placeholder="Introduce yourself..."
                    />
                  </div>
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        </div>
        {user && (
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
                      <Label className="font-extrabold sm:text-lg text-white">
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
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>
        )}
        {user && (
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
                      <Label className="font-extrabold sm:text-lg text-white">
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
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>
        )}
        {user?.isCurator && (
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
                      <Label className="font-extrabold sm:text-lg text-white">
                        Properties management
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
                  <DisclosurePanel className="pt-4 pb-2 text-sm text-white rounded-b-lg">
                    <div className="flex flex-wrap gap-5 sm:text-base text-sm  md:text-lg font-medium">
                      <div
                        onClick={() => {
                          handleTemplateSelect({
                            name: 'Basic Template',
                            attributes: defaultAttributes,
                            _id: 'basic',
                          });
                        }}
                        className={`w-[18rem] h-[15rem] bg-[#161616] border-2 flex justify-center items-center rounded-md relative ${
                          advancedDetails.propertyTemplateId === 'basic'
                            ? 'border-neon'
                            : 'border-none'
                        }`}
                      >
                        <p>Basic Template</p>
                      </div>
                      {data.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleTemplateSelect(item)}
                          className={`w-[18rem] h-[15rem] bg-[#161616] border-2 flex justify-center items-center rounded-md relative sm:text-base text-sm  md:text-lg font-medium ${
                            advancedDetails.propertyTemplateId === item._id
                              ? 'border-neon'
                              : 'border-none'
                          }`}
                        >
                          <p>{item.name}</p>
                          <button
                            className="absolute bottom-2 right-2 text-[#DDF247] border border-white/[20%] px-[10px] rounded py-1 text-[14px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTemplateEdit(item);
                            }}
                          >
                            Edit
                          </button>
                          <div
                            className="absolute top-2 right-2 cursor-pointer w-[26px] h-[26px] flex items-center justify-center rounded-full border border-white/[20%]"
                            onClick={() => handleTemplateDelete(item)}
                          >
                            <img
                              src="/icons/trash.svg"
                              alt="iamge"
                              className="w-4 h-4"
                            />
                          </div>
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          selectTemplate(null);
                          setIsModalOpenTemplate(true);
                        }}
                        className="w-[18rem] h-[15rem] bg-[#161616] flex flex-col gap-y-2 justify-center items-center rounded-md relative"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#111] border border-white/[30%] flex items-center justify-center">
                          <img src="/icons/plus.svg" alt="plus" />
                        </div>
                        <p className="text-[#7C8282] sm:text-base text-sm  md:text-lg font-medium">
                          Add new template
                        </p>
                      </div>
                    </div>
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>
        )}

        {user?.isCurator && <UserArtistSetting isSetting />}

        <SettingPropertiesInfo
          close={() => setIsModalOpenTemplate(false)}
          isOpen={isModalOpenTemplate}
          onTemplateAdd={fetchProperties}
          selectedTemplate={selectedTemplate}
        />

        <div className="flex xs:flex-row flex-col gap-4 justify-center my-10">
          <BaseButton
            className={'sm:w-[20rem] w-full'}
            title="Cancel"
            variant="secondary"
            onClick={() => {}}
          />
          <BaseButton
            className={'sm:w-[20rem] w-full'}
            title="Save"
            variant="primary"
            onClick={update}
          />
        </div>
      </div>
    </div>
  );
};
