import Image from 'next/image';
import React from 'react';

interface SettingLoadingModalProps {
  step: number;
}

export const SettingLoadingModal: React.FC<SettingLoadingModalProps> = ({
  step,
}) => {
  if (step === 1)
    return (
      <div className="flex flex-col gap-y-9 items-center text-center">
        <Image
          src="/icons/refresh.svg"
          alt="refresh"
          className="w-20 mx-auto"
          width={80}
          height={80}
        />
        <p className="text-[30px] font-medium">
          Please Wait while We Update
          <br />
          Your Details
        </p>
      </div>
    );
  else if (step === 2)
    return (
      <div className="flex flex-col gap-y-9 items-center text-center">
        <Image
          src="/icons/success.svg"
          alt="refresh"
          className="w-20 mx-auto"
          width={80}
          height={80}
        />
        <p className="text-[30px] font-medium">Your Information is Updated</p>
      </div>
    );
  else if (step === 3)
    return (
      <div className="flex flex-col gap-y-9 items-center text-center">
        <Image
          src="/icons/info.svg"
          alt="refresh"
          className="w-20 mx-auto"
          width={80}
          height={80}
        />
        <p className="text-[30px] font-medium">
          Something Went Wrong
          <br />
          Please Try Again
        </p>
      </div>
    );
  else return null;
};
