'use client';

import { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Curation from './content/Curation';
import Rwa from './content/Rwa';

export default function BaseModal({
  show,
  type,
}: {
  show: boolean;
  type: string;
}) {
  const [open, setOpen] = useState(true);

  const closeModal = () => {
    setOpen(false);

    const url = new URL(window.location.href);
    url.searchParams.delete('show');
  };

  return (
    <Dialog open={open} onClose={closeModal} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-dark text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {type == 'curation' ? <Curation /> : null}

            {type == 'rwa' ? <Rwa /> : null}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
