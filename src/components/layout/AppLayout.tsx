import type React from 'react';
import type { User } from '@/types';
import Header from './Header';
import SidebarNav from './SidebarNav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
  user?: User; // Make user optional for initial setup
}

export default function AppLayout({ children, user: propsUser }: AppLayoutProps) {
  // Mock user for now, will be replaced by actual auth logic
  const currentUser: User = propsUser || {
    id: 'user1',
    name: 'Dr. Sabine Müller',
    email: 'sabine.mueller@example.com',
    role: 'dentist',
    region: 'Bayern',
    avatarUrl: `https://placehold.co/100x100.png?text=SM`,
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-0">
          <Link href="/dashboard" className="flex h-16 items-center justify-center border-b border-sidebar-border px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-lg">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h1 className="ml-2 text-lg font-bold font-headline group-data-[collapsible=icon]:hidden">
              ZahnKammer
            </h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
            <LogOut className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header user={currentUser} pageTitle="Dashboard" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
