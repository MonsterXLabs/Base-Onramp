import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

type Props = {
  triggerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
};

const CustomTooltip = ({
  triggerClassName,
  contentClassName,
  children,
  trigger,
}: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={triggerClassName}>{trigger}</TooltipTrigger>
        <TooltipContent className={contentClassName}>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomTooltip;
