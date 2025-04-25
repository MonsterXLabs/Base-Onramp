import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { upsertProperty } from '@/services/legacy/supplier';
import Image from 'next/image';
import { useState } from 'react';
import BaseButton from '../ui/BaseButton';
import { BaseDialog } from '../ui/BaseDialog';

export default function PropertiesInfo({ close, onTemplateAdd, isOpen }) {
  // const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [property, setProperty] = useState({
    id: null,
    name: '',
    attributes: [
      { type: 'Length', value: '150cm' },
      { type: 'Height', value: '5cm' },
      { type: 'Width', value: '150cm' },
      { type: 'Weight', value: '5kg' },
    ],
  });

  const handleSave = async () => {
    try {
      const response = await upsertProperty({
        id: property.id,
        name: property.name,
        attributes: property.attributes,
      });

      if (response) {
        toast({
          title: 'Properties Template',
          description: 'Saved successfully',
          duration: 2000,
        });

        onTemplateAdd();

        close();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        duration: 2000,
      });
    }
  };

  const handleCancel = () => {
    setProperty({
      id: null,
      name: '',
      attributes: [
        { type: 'Length', value: '150cm' },
        { type: 'Height', value: '5cm' },
        { type: 'Width', value: '150cm' },
        { type: 'Weight', value: '5kg' },
      ],
    });
    close();
  };

  const addNewProp = () => {
    setProperty({
      ...property,
      attributes: [
        ...property.attributes,
        { type: 'New Property', value: 'Value' },
      ],
    });
  };

  const updateProp = (index, field, value) => {
    const updatedAttributes = [...property.attributes];
    updatedAttributes[index][field] = value;
    setProperty({ ...property, attributes: updatedAttributes });
  };

  const removeProp = (index) => {
    const updatedAttributes = property.attributes.filter((_, i) => i !== index);
    setProperty({ ...property, attributes: updatedAttributes });
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleCancel}
      className="max-h-[80%] overflow-y-auto overflow-x-hidden bg-[#161616]"
    >
      <div className="flex flex-col gap-y-5">
        <div className="px-4">
          <h1 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-[32px]">
            Add New Properties Template
          </h1>
        </div>
        <div className="rounded-[20px] md:px-5 md:py-3 sm:px-4 sm:py-2 px-3 py-2 bg-[#232323]">
          <div className="flex flex-col gap-y-5">
            <Label className="font-extrabold sm:text-lg text-white">
              Template Title
            </Label>
            <hr className="border-white/10" />
            <div className="">
              <Input
                value={property.name}
                onChange={(e) =>
                  setProperty({ ...property, name: e.target.value })
                }
                className="w-full border-none md:h-[52px] xs:px-4 px-3 sm:px-5 md:px-[26px] placeholder:text-xs py-[15px] bg-[#161616] azeret-mono-font rounded-xl justify-start items-center gap-[30px] inline-flex  focus:placeholder-transparent focus:outline-none"
                type="text"
                placeholder="Enter Template Title * (e.g., #1, Curation Name, Etc)"
                autoFocus={false}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[20px] md:px-5 py-3 sm:px-4 px-3 bg-[#232323]">
          <div className="flex flex-col gap-y-5">
            <Label className="font-extrabold sm:text-lg text-white">
              Properties Value
            </Label>
            <hr className="border-white/10" />
            <div className="lg:flex grid xs:grid-cols-2 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:flex-wrap">
              {property.attributes.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-center relative min-h-[93px] bg-[#161613] py-3 gap-y-1 flex-col border border-white/[12%] rounded-[12px] w-full lg:w-[10rem] outline outline-transparent"
                >
                  <input
                    type="text"
                    className="text-white text-center w-[65%] rounded-md bg-transparent mx-auto flex justify-start items-center gap-[30px] focus:placeholder-transparent focus:outline-none text-sm"
                    value={item.type}
                    onChange={(e) => updateProp(index, 'type', e.target.value)}
                  />
                  <input
                    type="text"
                    className="text-[#979797] text-center w-[65%] rounded-md bg-transparent mx-auto flex justify-start items-center gap-[30px] focus:placeholder-transparent focus:outline-none azeret-mono-font"
                    value={item.value}
                    onChange={(e) => updateProp(index, 'value', e.target.value)}
                  />
                  <div
                    className="absolute top-2 right-2 cursor-pointer w-[26px] h-[26px] flex items-center justify-center rounded-full border border-white/[12%]"
                    onClick={() => removeProp(index)}
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
                className="flex cursor-pointer justify-center min-h-[85px] relative bg-[#161613] gap-x-[10px] items-center w-[10rem] border-2 border-[#DDF247] rounded-[12px]"
                onClick={addNewProp}
              >
                <Image
                  src="/icons/add-new.svg"
                  alt="icon"
                  className="w-6 h-6"
                  width={20}
                  height={20}
                  quality={100}
                />
                <p className="text-center text-sm font-extrabold text-[#DDF247]">
                  Add
                </p>
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <Image
                src="/icons/ractangle.svg"
                alt="info"
                width={10}
                height={10}
                quality={100}
              />
              <p className="sm:text-base text-sm md:text-lg font-medium">
                You can freely change properties values ​​by clicking on the
                title and content.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-x-4 justify-center my-3">
          <BaseButton
            title="Cancel"
            variant="secondary"
            onClick={handleCancel}
          />
          <BaseButton title="Save" variant="primary" onClick={handleSave} />
        </div>
      </div>
    </BaseDialog>
  );
}
