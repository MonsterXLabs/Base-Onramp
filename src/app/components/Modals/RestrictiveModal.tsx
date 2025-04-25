'use client';

import React from 'react';
import { Modal, Box } from '@mui/material';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { Dialog } from '@headlessui/react';

const style = {
  borderRadius: '10px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  height: '100%',
  bgcolor: 'rgba(200, 200, 200, 0.5)',
  border: '2px solid #000',
  boxShadow: 24,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default function RestrictiveModal({
  children,
  open,
  onClose,
  closeButton = false,
}) {
  return (
    // <Dialog open={open} onClose={onClose}>
    //   <Dialog.Panel>
    //     <div className="relative">
    //       {closeButton && (
    //         <XMarkIcon
    //           className="absolute w-10 top-[1rem] right-[1rem] fill-white cursor-pointer"
    //           onClick={() => {
    //             onClose();
    //           }}
    //         />
    //       )}
    //       {children}
    //     </div>
    //   </Dialog.Panel>
    // </Dialog>
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div className="relative">
          {closeButton && (
            <XMarkIcon
              className="absolute w-10 top-[1rem] right-[1rem] fill-white cursor-pointer"
              onClick={() => {
                onClose();
              }}
            />
          )}
          {children}
        </div>
      </Box>
    </Modal>
  );
}
