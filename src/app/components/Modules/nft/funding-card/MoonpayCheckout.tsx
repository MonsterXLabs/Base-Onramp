import { moonpayVisibleState } from '@/hooks/recoil-state';
import { contract } from '@/lib/contract';
import dynamic from 'next/dynamic';
import React from 'react';
import { useRecoilState } from 'recoil';

const MoonPayNftCheckoutWidget = dynamic(
  () =>
    import('@moonpay/moonpay-react').then(
      (mod) => mod.MoonPayNftCheckoutWidget,
    ),
  { ssr: false },
);

export interface MoonpayCheckoutProps {
  nftId: string;
  fetchNftData: () => void;
}

export const MoonpayCheckout: React.FC<MoonpayCheckoutProps> = ({
  nftId,
  fetchNftData,
}: MoonpayCheckoutProps) => {
  const [visible, setVisible] = useRecoilState(moonpayVisibleState);

  return (
    <MoonPayNftCheckoutWidget
      variant="overlay"
      contractAddress={contract?.address}
      tokenId={nftId}
      visible={visible}
      onCloseOverlay={() => {
        fetchNftData();
        setVisible(false);
      }}
    />
  );
};
