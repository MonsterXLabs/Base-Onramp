'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { AutoConnect } from 'thirdweb/react';
import { client, wallets } from '@/lib/client';
import { RecoilRoot } from 'recoil';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <RecoilRoot>{children}</RecoilRoot>
    </NextThemesProvider>
  );
}

export function WalletAutoConnect() {
  return (
    <AutoConnect wallets={wallets} client={client} timeout={3600 * 1000} />
  );
}
