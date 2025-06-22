
import type React from 'react';
import type { User } from '@/types'; // User might still be used if SidebarNav needs it directly passed
import Header from './Header';
import { AppSidebar } from './SidebarNav'; // Corrected import name
import {
  SidebarProvider,
  Sidebar,
  // SidebarHeader, // No longer directly used here, SidebarNav handles its own header
  // SidebarContent, // No longer directly used here
  // SidebarFooter, // No longer directly used here
  SidebarInset,
} from '@/components/ui/sidebar';
// import { ShieldCheck, LogOut } from 'lucide-react'; // Moved to SidebarNav or not needed
// import { Button } from '@/components/ui/button'; // Moved to SidebarNav
// import Link from 'next/link'; // Moved to SidebarNav

interface AppLayoutProps {
  children: React.ReactNode;
  user?: User; // This prop might become optional or removed if Header/SidebarNav fetch user via context
  pageTitle: string; 
  locale: string; 
}

export default function AppLayout({ children, user: propsUser, pageTitle, locale }: AppLayoutProps) {
  // Mock user or user from props/context - SidebarNav now uses useAuth() context
  // const currentUser: User | undefined = propsUser; // Or fetched from context if Header/SidebarNav don't take prop

  return (
    <SidebarProvider defaultOpen>
      {/* AppSidebar now fetches its own user data via useAuth context */}
      <AppSidebar /> 
      <SidebarInset>
        {/* Header no longer needs user prop for avatar/dropdown */}
        <Header pageTitle={pageTitle} currentLocale={locale} /> 
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

