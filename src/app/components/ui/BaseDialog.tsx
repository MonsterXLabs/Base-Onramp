import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import React from 'react';

interface IBaseDialogProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  footer?: React.ReactNode;
  isOpen?: boolean;
  onClose?: (value: boolean) => void; // Function to close the dialog
  modal?: boolean;
  isClose?: boolean;
}

export function BaseDialog({
  trigger,
  children,
  title,
  description,
  className,
  footer,
  isOpen,
  onClose,
  modal,
  isClose = true,
}: IBaseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={modal}>
      {!isOpen && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          'md:max-w-5xl focus-visible:ring-0 focus-visible:border-0 focus-visible:outline-none',
          className,
        )}
        onInteractOutside={(e: Event) => {
          if (modal) {
            e.preventDefault();
          }
        }}
        isClose={isClose}
      >
        <DialogHeader>
          {title ? (
            <DialogTitle>{title}</DialogTitle>
          ) : (
            <DialogTitle className="hidden"></DialogTitle>
          )}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="w-full relative">{children}</div>
        <DialogFooter className="sm:justify-start">
          {footer && footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
