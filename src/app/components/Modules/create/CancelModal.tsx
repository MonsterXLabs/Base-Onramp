import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import React from 'react';

export default function CancelModal() {
  return (
    <div className="w-[32rem] flex flex-col gap-y-4 justfy-center text-center">
      <ExclamationTriangleIcon className="w-16 h-16 fill-[#ddf247] mx-auto" />
      <p className="text-lg font-medium">
        If You Exit This Page, The Minting Information Progress Will Be Lost. Do
        You Still Want To Proceed?
      </p>

      <div className="flex justify-center items-center">
        <div className="py-3 w-[48%] rounded-lg text-black font-semibold bg-neon">
          <button
            className="w-full h-full"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
