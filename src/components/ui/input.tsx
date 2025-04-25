import * as React from 'react';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  showIcon?: boolean;
  onPressIcon?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onChange, showIcon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent focus-visible:border-0 focus-visible:outline-none focus-visible:shadow-none file:text-sm file:font-medium placeholder:text-white/[53%] disabled:cursor-not-allowed disabled:opacity-50',
            className,
            showIcon && 'pr-10',
          )}
          ref={ref}
          value={value}
          onChange={onChange}
          {...props}
        />
        {showIcon && (
          <button onClick={props.onPressIcon}>
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
    );
  },
);
Input.displayName = 'Input';

const LinkInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onChange, showIcon, ...props }, ref) => {
    return (
      <div className="relative w-full border-none pl-3 sm:pl-6 py-1 bg-[#161616] rounded-xl placeholder:text-white/[53%] justify-start items-center inline-flex font-AzeretMono placeholder:text-xs">
        <Image
          quality={100}
          src="/icons/link-shape-white.svg"
          alt="link"
          className="w-5 h-5"
          width={20}
          height={20}
        />
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
            className,
            'pl-7',
            showIcon && 'pr-10',
          )}
          ref={ref}
          value={value}
          onChange={onChange}
          {...props}
        />
        {showIcon && (
          <button onClick={props.onPressIcon}>
            <Image
              quality={100}
              src="/icons/trash.svg"
              alt="image"
              width={20}
              height={20}
              className="absolute top-3 right-3 w-7 h-5"
            />
          </button>
        )}
      </div>
    );
  },
);
LinkInput.displayName = 'LinkInput';

export { Input, LinkInput };
