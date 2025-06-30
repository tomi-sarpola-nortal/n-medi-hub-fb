
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { navConfig } from "@/config/nav";
import { LogOut, UserCircle, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { Button } from "../ui/button";

// Helper for client-side translations (similar to Header)
const getClientTranslations = (locale: string) => {
  try {
    const layout = locale === 'de' ? require('../../../locales/de/layout.json') : require('../../../locales/en/layout.json');
    const common = locale === 'de' ? require('../../../locales/de/common.json') : require('../../../locales/en/common.json');
    return { ...layout, ...common };
  } catch (e) {
    console.warn("Translation file not found, falling back to en for SidebarNav");
    const layout = require('../../../locales/en/layout.json');
    const common = require('../../../locales/en/common.json');
    return { ...layout, ...common };
  }
};


export function AppSidebar() {
  const { user, logout, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar(); 
  
  const potentialLocale = pathname.split('/')[1];
  const locale = ['en', 'de'].includes(potentialLocale) ? potentialLocale : 'en';
  
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);

  const handleLogoutClick = () => {
    if (user) {
      logout();
    } else {
      router.push(`/${locale}/login`);
    }
  };


  if (!t) {
    return (
      <Sidebar collapsible="none">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
             <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-4 flex-grow">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <SidebarMenuSkeleton key={i} showIcon={true} />
          ))}
        </SidebarContent>
        <SidebarFooter className="p-4">
            <SidebarMenuSkeleton showIcon={true}/>
        </SidebarFooter>
      </Sidebar>
    );
  }

  const isPending = user?.status === 'pending';
  const userNavItems = user ? (navConfig[user.role] || []) : [];

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href={`/${user ? locale + '/dashboard' : locale + '/login'}`} className="block overflow-hidden">
           <div className="flex flex-col">
              <Logo iconSize={190} />
              <p
                className="pl-4 font-headline text-xl font-bold"
                style={{ color: '#372165' }}
              >
                Medical Hub
              </p>
            </div>
        </Link>
      </SidebarHeader>

      {/* User Profile Section */}
      {user && (
        <div className="p-4">
            <Link href={`/${locale}/settings`} className="block">
                <div className="w-full h-auto p-4 justify-start items-center gap-3 flex bg-muted rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <UserCircle className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                    <div className="text-sm overflow-hidden text-left">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">ID: {user.dentistId || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground capitalize truncate">{t[user.role] || user.role}</p>
                    </div>
                </div>
            </Link>
        </div>
      )}

      <SidebarContent className="flex-grow p-4">
        {user && (
          <SidebarMenu>
            {userNavItems.map((item) => {
              const isNavItemDisabled = isPending && item.href !== '/settings';
              const itemHref = `/${locale}${item.href}`;
              return (
                <SidebarMenuItem key={item.href}>
                  <Link 
                    href={itemHref}
                    legacyBehavior={false}
                    passHref={false}
                    className={isNavItemDisabled ? "pointer-events-none" : ""}
                    onClick={(e) => {
                        if (isNavItemDisabled) e.preventDefault();
                    }}
                  >
                    <SidebarMenuButton
                      disabled={isNavItemDisabled}
                      isActive={
                        (isPending && item.href === '/settings') ||
                        (!isPending && (pathname === itemHref || (item.href !== "/dashboard" && pathname.startsWith(itemHref))))
                      }
                      tooltip={{ children: t[item.title] || item.title, side: "right", align: "center" }}
                      aria-label={t[item.title] || item.title}
                      className="font-medium"
                    >
                      {item.icon && <item.icon className="h-5 w-5"/>}
                      <span>{t[item.title] || item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
         <SidebarMenu className="flex flex-col gap-2">
            <SidebarMenuItem>
               <LanguageSwitcher />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button asChild variant="outline" className="w-full justify-start h-9 px-3 text-sm">
                  <Link href={`/${locale}/developer`}>
                      <Database className="h-5 w-5"/>
                      <span>{t.sidebar_developer_module || "Developer Module"}</span>
                  </Link>
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Button
                    onClick={handleLogoutClick}
                    variant="outline"
                    className="w-full justify-start h-9 px-3 text-sm"
                >
                    <LogOut className="h-5 w-5"/>
                    <span>{t.sidebar_logout || "Logout"}</span>
                </Button>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
