import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SessionProvider } from '@/app/providers/session-provider';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <SessionProvider user={user}>
      <SidebarProvider>
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <SidebarRail />
        <SidebarInset>
          <Header />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
