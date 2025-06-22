
import type React from 'react';
import type { Person } from '@/types'; // Changed from User to Person
import Header from './Header';
import { AppSidebar } from './SidebarNav'; // Corrected import name
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle: string; 
  locale: string; 
}

export default function AppLayout({ children, pageTitle, locale }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar /> 
      <SidebarInset>
        <Header pageTitle={pageTitle} currentLocale={locale} /> 
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
