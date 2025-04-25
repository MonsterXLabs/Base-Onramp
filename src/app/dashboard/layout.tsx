'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import AppHeader from '../components/Header/AppHeader';
import SideBar from '../components/ui/SideBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  const isHeader =
    pathName?.includes('how-to-work') || pathName?.includes('help-center');
  return (
    <section className="flex gap-x-2 relative">
      <div className="hidden lg:block lg:w-[280px] shrink-0">
        <SideBar />
      </div>
      <div className="w-full overflow-hidden flex flex-col gap-y-2 px-2">
        {!isHeader && <AppHeader />}
        {children}
      </div>
    </section>
  );
}
