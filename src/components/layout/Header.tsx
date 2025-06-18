'use client';

import type { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, UserCircle, LogOut, Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useRouter } from 'next/navigation'; // For locale

interface HeaderProps {
  user: User;
  pageTitle: string; 
  currentLocale?: string;
}

// A simple way to get translations on the client for this specific component
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    return require('../../../locales/en.json'); // Fallback
  }
};


export default function Header({ user, pageTitle, currentLocale }: HeaderProps) {
  const router = useRouter();
  const locale = currentLocale || router.locale || 'en';
  const t = getClientTranslations(locale);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      
      {pageTitle && (
         <h1 className="flex-1 text-xl font-semibold font-headline whitespace-nowrap hidden md:block">{pageTitle}</h1>
      )}
      
      <div className="ml-auto flex items-center gap-4"> {/* Ensured LanguageSwitcher is part of this group */}
        <LanguageSwitcher initialLocale={locale} />
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full h-9 w-9">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png`} alt={user.name} data-ai-hint="avatar person" />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t.header_my_account || "My Account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t.header_settings || "Settings"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>{t.header_profile || "Profile"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t.header_logout || "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
