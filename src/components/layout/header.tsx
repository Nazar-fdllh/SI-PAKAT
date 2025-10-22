import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <Link href="/dashboard" className="flex items-center">
            <Shield className="h-6 w-6 text-primary" />
            <span className="sr-only">SI-PAKAT</span>
        </Link>
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        <UserNav />
      </div>
    </header>
  );
}
