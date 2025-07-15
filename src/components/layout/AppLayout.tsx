import type React from 'react';
import Header from './Header';
import { AppSidebar } from './SidebarNav';
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
        <main className="flex-1 overflow-auto p-2">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}