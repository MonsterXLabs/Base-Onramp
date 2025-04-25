'use client';

import { cn } from '@/lib/utils';
import {
  acceptedFormats as acceptedFileFormats,
  maxFileSize,
} from '@/utils/helpers';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import BaseButton from './BaseButton';

interface IFileInputProps {
  title?: string;
  subtitle?: string;
  onFileSelect: any;
  deSelect?: any;
  maxSizeInBytes?: number;
  acceptedFormats?: string[];
  editMode?: any;
  titleStyles?: any;
  showIcon?: boolean;
  onPressIcon?: () => void;
  isProfile?: boolean;
  className?: string;
}

export default function FileInput({
  title,
  subtitle,
  onFileSelect,
  deSelect,
  maxSizeInBytes = maxFileSize,
  acceptedFormats = acceptedFileFormats,
  editMode,
  titleStyles,
  showIcon,
  onPressIcon,
  isProfile,
  className,
}: IFileInputProps) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState<any>(null);

  const handleFileChange = (event: any) => {
    event.preventDefault();
    const file = event.target.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (
      file.size < maxSizeInBytes &&
      acceptedFormats.includes(`.${fileExtension}`)
    ) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleButtonClick = (e) => {
    console.log(fileInputRef, fileInputRef.current);
    if (fileInputRef.current) {
      (fileInputRef.current as any).click();
    }
  };

  useEffect(() => {
    if (deSelect) {
      setFileName(null);
    }
  }, [deSelect]);

  /*
  <div class="h-[52px] py-[15px] ">
    <div class="px-10 py-3.5 bg-[#dee8e8] rounded-[14px] justify-center items-center gap-2.5 flex">
        <div class="text-[#161616] text-sm font-extrabold font-['Manrope'] capitalize">Upload</div>
    </div>
    <div class="grow shrink basis-0 text-white/50 text-sm font-normal font-['Azeret Mono'] leading-snug">Choose File</div>
</div> */
  return (
    <div className={cn('flex flex-col gap-y-2', className)}>
      {title && (
        <p className={`text-xs sm:text-sm font-medium ${titleStyles}`}>
          {title}
        </p>
      )}
      <input
        type="file"
        className="file-input hidden "
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div
        className={cn(
          'relative file-upload !p-0 !bg-[#161616] flex-1 !w-full !rounded-xl justify-start items-center gap-[30px] inline-flex',
          showIcon && 'pr-10',
          isProfile ? '!py-1.5 !px-2 !bg-transparent' : '',
        )}
      >
        <BaseButton
          title={isProfile ? 'Choose File' : 'Upload'}
          variant="secondary"
          onClick={handleButtonClick}
          displayIcon="right"
          iconPath={isProfile ? '/icons/galary.svg' : '/icons/uploadBlack.svg'}
          className={cn(
            'py-2 sm:py-3 w-max sm:w-[30%] h-max xs:py-3 sm:px-0 px-1 xs:px-3  sm:max-w-[20rem]',
            isProfile ? '!bg-[#ddf247] text-black' : '',
          )}
          buttonStyles={cn(isProfile ? 'flex-row-reverse' : 'flex-row')}
          iconStyles={'stroke-black'}
        />
        <p className="azeret-mono-font text-[10px] xs:text-xs sm:text-sm">
          {fileName
            ? fileName
            : editMode
              ? 'File Selected'
              : 'No files selected'}
        </p>
        {showIcon && (
          <button onClick={onPressIcon}>
            <Image
              quality={100}
              src="/icons/trash.svg"
              alt="image"
              width={20}
              height={20}
              className="absolute top-3 right-3 w-5 h-5"
            />
          </button>
        )}
      </div>
      {subtitle && (
        <p
          className={cn(
            'text-xs sm:text-sm text-white/50 font-medium azeret-mono-font',
            isProfile ? 'font-normal' : '',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
