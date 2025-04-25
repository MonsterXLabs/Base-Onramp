import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useMemo } from 'react';

interface IBaseButtonProps {
  title: string;
  variant: 'primary' | 'secondary' | 'secondaryOutline';
  onClick: any;
  className?: any;
  displayIcon?: 'left' | 'right';
  iconPath?: any;
  iconStyles?: any;
  loading?: boolean;
  buttonStyles?: any;
}

export default function BaseButton({
  title,
  variant,
  onClick,
  className,
  displayIcon,
  iconPath,
  iconStyles,
  buttonStyles,
  loading,
}: IBaseButtonProps) {
  const isPrimary = useMemo(() => variant === 'primary', [variant]);
  const isSecondaryOutline = useMemo(
    () => variant === 'secondaryOutline',
    [variant],
  );

  return (
    <div
      className={`py-3 w-[20rem] rounded-lg text-black font-extrabold text-[10px] xs:text-xs sm:text-sm 
         ${isPrimary ? 'bg-neon ' : 'bg-[#dee8e8]'} 
          ${isSecondaryOutline ? '!bg-transparent border-2 border-[#ddf247] !text-[#DDF24799]' : 'bg-[#dee8e8]'}
          ${loading ? 'opacity-50' : ''}
         ${className}`}
    >
      <button
        className={cn(
          'w-full h-full gap-[10px] flex items-center justify-center relative',
          buttonStyles,
        )}
        onClick={onClick}
        disabled={loading}
      >
        {loading && (
          <span
            className={cn(
              'flex h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white',
              isPrimary ? 'border-white' : 'border-[#ddf247]',
            )}
          ></span>
        )}
        {displayIcon === 'left' && (
          <Image
            quality={100}
            width={18}
            height={18}
            src={iconPath ?? '/icons/arrow_ico.svg'}
            alt="icon"
            className={`xs:block hidden w-4 h-4 sm:w-[18px] sm:h-[18px] ${iconStyles}`}
          />
        )}
        {title}
        {displayIcon === 'right' && (
          <Image
            quality={100}
            width={18}
            height={18}
            src={iconPath ?? '/icons/arrow_ico.svg'}
            alt="icon"
            className={`xs:block hidden w-4 h-4 sm:w-[18px] sm:h-[18px] ${iconStyles}`}
          />
        )}
      </button>
    </div>
  );
}
