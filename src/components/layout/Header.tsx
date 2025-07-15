'use client';

import type { User } from '@/lib/types'; // User might still be needed if other header features depend on it in future
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './ThemeToggle';
import NotificationBell from './NotificationBell';

// LanguageSwitcher and user-specific imports like Avatar, DropdownMenu, UserCircle, LogOut, Settings are removed

interface HeaderProps {
  // user: User; // User prop might be removed if no longer needed by any header feature
  pageTitle: string; 
  currentLocale?: string; // currentLocale might also be removable if LanguageSwitcher is gone and no other feature uses it
}

export default function Header({ pageTitle }: HeaderProps) {
  // const router = useRouter(); // Removed as locale logic was for LanguageSwitcher & dropdown
  // const locale = currentLocale || router.locale || 'en'; // Removed
  // const t = getClientTranslations(locale); // Removed

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 py-2 sm:static sm:h-auto sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      
      {pageTitle && (
         <h1 className="flex-1 text-xl font-semibold font-headline whitespace-nowrap hidden md:block">{pageTitle}</h1>
      )}
      
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
        {/* User Avatar DropdownMenu and LanguageSwitcher are removed from here */}
      </div>
    </header>
  );
}
