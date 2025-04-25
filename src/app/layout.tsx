import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { ThirdwebProvider } from 'thirdweb/react';
import { GlobalProvider } from './components/Context/GlobalContext';
import { NotificationProvider } from './components/Context/NotificationContext';
import { ThemeProvider } from './components/provider/theme-provider';
import './globals.css';

// const ManropeFont = localFont({
//   src: './fonts/manrope.woff2',
//   variable: '--manrope',
// });
// const AzeretMonoFont = localFont({
//   src: './fonts/AzeretMono.woff2',
//   variable: '--azeret-mono',
// });

// const manrope = Manrope({ subsets: ['latin'] });
// export const AzeretMono = Azeret_Mono({
//   subsets: ['latin'],
//   variable: '--azeret-mono',
// });

export const metadata: Metadata = {
  title: 'VaultX',
  description: 'Monstorx frontend real world NFT marketplace',
};
// latin trust fiscal sadness danger hawk surge spin impact august tattoo process
const CrispWithNoSSR = dynamic(() => import('./components/Crisp'), {
  ssr: false,
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`manrope-font`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <ThirdwebProvider>
            <GlobalProvider>
              <NotificationProvider>{children}</NotificationProvider>
              <CrispWithNoSSR />
              <Toaster />
            </GlobalProvider>
          </ThirdwebProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
