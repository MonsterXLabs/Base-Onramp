import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  deleteProperty,
  getProperties,
  upsertProperty,
} from '@/services/legacy/supplier';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCreateNFT } from '../../Context/CreateNFTContext';
import PropertiesInfo from '../Properties';

const defaultAttributes = [
  { type: 'Type', value: '' },
  { type: 'Medium', value: '' },
  { type: 'Support', value: '' },
  { type: 'Dimensions (cm)', value: '' },
  { type: 'Signature', value: '' },
  { type: 'Authentication', value: '' },
];
// const defaultAttributes = [
//   { type: '', value: '' },
//   { type: '', value: '' },
//   { type: '', value: '' },
//   { type: '', value: '' },
//   { type: '', value: '' },
//   { type: '', value: '' },
// ];

export default function PropertiesTemplate({
  addStatus,
  isSetting,
  isCreate,
}: {
  addStatus: boolean;
  isSetting?: boolean;
  isCreate?: boolean;
}) {
  const { toast } = useToast();
  const { advancedDetails, setAdvancedDetails } = useCreateNFT();
  const [data, setData] = useState(advancedDetails.attributes);
  const [isModalOpenTemplate, setIsModalOpenTemplate] = useState(false);
  const [editableProperties, setEditableProperties] =
    useState(defaultAttributes);

  useEffect(() => {
    setAdvancedDetails({
      ...advancedDetails,
      attributes: editableProperties,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editableProperties]);

  useEffect(() => {
    fetchProperties();
    if (advancedDetails.propertyTemplateId) {
    }
    setAdvancedDetails({
      ...advancedDetails,
      propertyTemplateId: 'basic',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTemplate = (updatedProperties) => {
    let updateData = data.map((item) => {
      if (item._id !== advancedDetails.propertyTemplateId) return item;
      return {
        ...item,
        attributes: updatedProperties,
      };
    });
    setData(updateData);
  };

  const fetchProperties = async () => {
    const response = await getProperties();
    setData(response);
  };

  const handleTemplateSelect = (template) => {
    setEditableProperties(template.attributes);
    setAdvancedDetails({
      ...advancedDetails,
      propertyTemplateId: template._id || null,
    });
  };

  const handleTemplateEdit = async (editedTemplate) => {
    try {
      const response = await upsertProperty({
        id: editedTemplate._id,
        name: editedTemplate.name,
        attributes: editedTemplate.attributes,
      });

      if (response) {
        toast({
          title: 'Properties Template',
          description: 'Edited successfully',
          duration: 2000,
        });

        await fetchProperties();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        duration: 2000,
      });
    }
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

  const handlePropertyChange = (index, field, value) => {
    const updatedProperties = editableProperties.map((prop, i) =>
      i === index ? { ...prop, [field]: value } : prop,
    );
    setEditableProperties(updatedProperties);
    updateTemplate(updatedProperties);
  };

  const handleAddProperty = () => {
    const newProperty = { type: '', value: '' };
    setEditableProperties([...editableProperties, newProperty]);
    updateTemplate([...editableProperties, newProperty]);
  };

  const handleRemoveProperty = (index) => {
    const updatedProperties = editableProperties.filter((_, i) => i !== index);
    setEditableProperties(updatedProperties);
    updateTemplate(updatedProperties);
  };

  return (
    <div className="bg-template-gradient p-4 gap-y-2 rounded-lg flex flex-col">
      <p className="text-lg font-semibold">Properties</p>
      <span className="text-white/[53%] font-AzeretMono text-xs">
        Textual Traits that show up as rectangle.
      </span>
      <div className="flex flex-col gap-y-3 mt-4">
        <p className="font-medium">Select Properties Template</p>
        <div className="flex flex-wrap gap-5 font-medium text-lg">
          <div
            onClick={() =>
              handleTemplateSelect({
                name: 'Basic Template',
                attributes: defaultAttributes,
                _id: 'basic',
              })
            }
            className={cn(
              `w-[18rem] h-[15rem] bg-[#232323] border-2 flex justify-center items-center rounded-md relative ${
                advancedDetails.propertyTemplateId === 'basic'
                  ? 'border-neon'
                  : 'border-none'
              }`,
              isCreate && 'h-[136px]',
            )}
          >
            <p>Basic Template</p>
          </div>
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => handleTemplateSelect(item)}
              className={cn(
                `w-[18rem] h-[15rem] bg-[#232323] border-2 flex justify-center items-center rounded-md relative font-medium text-lg ${
                  advancedDetails.propertyTemplateId === item._id
                    ? 'border-neon'
                    : 'border-none'
                }`,
                isCreate && 'h-[136px]',
              )}
            >
              <p>{item.name}</p>
              <button
                className="absolute bottom-2 font-semibold right-2 text-[#DDF247] border border-white/[20%] px-[10px] rounded-[6px] py-[3px] text-[14px]"
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
                <Image
                  src="/icons/trash.svg"
                  className="w-4 h-4"
                  alt="trash"
                  width={20}
                  height={20}
                  quality={100}
                />
              </div>
            </div>
          ))}

          <div
            onClick={() => setIsModalOpenTemplate(true)}
            className={cn(
              'w-[18rem] h-[15rem] bg-[#232323] flex flex-col gap-y-2 justify-center items-center rounded-md relative',
              isCreate && 'h-[136px]',
            )}
          >
            <div className="w-12 h-12 rounded-full bg-[#111] border border-white/[30%] flex items-center justify-center">
              <Image
                quality={100}
                src="/icons/plus.svg"
                className="w-5 h-5"
                alt="plus"
                width={20}
                height={20}
              />
            </div>
            <p className="text-[#828282] font-semibold text-lg">
              Add new template
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3 my-5">
          {editableProperties.map((item, index) => (
            <div
              key={index}
              className="flex justify-center relative md:min-h-[93px] bg-[#232323] py-3 gap-y-1 flex-col border border-white/[12%] rounded-[12px] md:w-[10rem] outline outline-transparent"
            >
              <input
                type="text"
                className="text-white/70 text-center w-[65%] rounded-md bg-transparent mx-auto flex justify-start items-center gap-[30px] focus:placeholder-transparent focus:outline-none text-sm placeholder:text-white/70 placeholder:text-sm placeholder:font-medium"
                placeholder="Title"
                value={item.type}
                onChange={(e) =>
                  handlePropertyChange(index, 'type', e.target.value)
                }
              />
              <input
                type="text"
                className="text-[#979797] placeholder:text-[#888888] placeholder:font-medium text-center w-[65%] rounded-md bg-transparent mx-auto flex justify-start items-center gap-[30px] focus:placeholder-transparent focus:outline-none azeret-mono-font"
                value={item.value}
                placeholder="Write it here"
                onChange={(e) =>
                  handlePropertyChange(index, 'value', e.target.value)
                }
              />
              <div
                className="absolute top-2 right-2 cursor-pointer w-[26px] h-[26px] flex items-center justify-center rounded-full border border-[#ffffff12]"
                onClick={() => handleRemoveProperty(index)}
              >
                <Image
                  src="/icons/trash.svg"
                  className="w-4 h-4"
                  alt="trash"
                  width={20}
                  height={20}
                  quality={100}
                />
              </div>
            </div>
          ))}
          {addStatus && (
            <div
              className="flex cursor-pointer justify-center min-h-[85px] relative bg-[#161613] gap-x-[10px] items-center w-[10rem] border-2 border-[#DDF247] rounded-[12px]"
              onClick={handleAddProperty}
            >
              <Image
                src="/icons/add-new.svg"
                alt="icon"
                className="w-6 h-6"
                width={24}
                height={24}
                quality={100}
              />
              <p className="text-center text-sm font-extrabold text-[#DDF247]">
                Add
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-x-3 item-center">
          <Image
            src="/icons/dot.svg"
            className="w-4 h-4"
            alt="dot"
            width={20}
            height={20}
            quality={100}
          />
          <span className="text-sm">
            You can freely change properties values by clicking on the title and
            content.
          </span>
        </div>
      </div>

      <PropertiesInfo
        close={() => setIsModalOpenTemplate(false)}
        isOpen={isModalOpenTemplate}
        onTemplateAdd={fetchProperties}
      />
    </div>
  );
}
