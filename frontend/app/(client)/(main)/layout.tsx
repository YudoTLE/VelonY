import React from 'react';

import { cookies } from 'next/headers';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-[100dvh] w-[100dvw]">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <SidebarTrigger className="absolute z-1000" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
