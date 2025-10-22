'use client';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Database,
  Users,
  Settings,
  FileText,
  Shield,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { type User } from '@/lib/definitions';
import { useSidebar } from '@/components/ui/sidebar';

type SidebarNavProps = {
  user: User;
};

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dasbor',
      icon: <LayoutDashboard />,
      roles: ['Administrator', 'Manajer Aset', 'Auditor/Pimpinan'],
    },
    {
      href: '/assets',
      label: 'Inventaris Aset',
      icon: <Database />,
      roles: ['Administrator', 'Manajer Aset', 'Auditor/Pimpinan'],
    },
    {
      href: '/reports',
      label: 'Pelaporan',
      icon: <FileText />,
      roles: ['Administrator', 'Auditor/Pimpinan'],
    },
    {
      href: '/users',
      label: 'Manajemen Pengguna',
      icon: <Users />,
      roles: ['Administrator'],
    },
    {
      href: '/settings',
      label: 'Pengaturan',
      icon: <Settings />,
      roles: ['Administrator'],
    },
  ];

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
         <div className="flex items-center gap-2">
            <Shield className="size-7 text-sidebar-foreground" />
            <div className="flex flex-col">
              <h2 className="text-base font-semibold font-headline text-sidebar-foreground">
                SI-PAKAT
              </h2>
               <p className="text-xs text-sidebar-foreground/80">Digital</p>
            </div>
          </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    icon={item.icon}
                    tooltip={item.label}
                  >
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2 bg-sidebar-border" />
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleSidebar} icon={state === 'expanded' ? <ChevronsLeft /> : <ChevronsRight />}>
                <span>
                    {state === 'expanded' ? 'Collapse' : 'Expand'}
                </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
