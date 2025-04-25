import React from 'react';
import BaseFooter from '../components/Footer/BaseFooter';
import { BaseHeader } from '../components/Header/BaseHeader';

export default function NFTLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-y-2">
      <BaseHeader isNFT={true} />
      {children}
      <BaseFooter />
    </section>
  );
}
