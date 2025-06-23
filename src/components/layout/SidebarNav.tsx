
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
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
import { User, Settings, GraduationCap, CalendarDays, FileText, LayoutDashboard, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

// Helper for client-side translations (similar to Header)
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found, falling back to en for SidebarNav");
    return require('../../../locales/en.json'); // Fallback
  }
};


export function AppSidebar() {
  const { user, logout, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const { state } = useSidebar(); 
  
  const potentialLocale = pathname.split('/')[1];
  const locale = ['en', 'de'].includes(potentialLocale) ? potentialLocale : 'en';
  
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);


  if (authLoading || !t) {
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

  if (!user) return null;
  
  const userNavItems = navConfig[user.role] || [];
  const isPending = user.status === 'pending';

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <Logo iconSize={190} portalText={t.login_logo_text_portal || "Portal"} />
        </Link>
      </SidebarHeader>

      {/* User Profile Section */}
      <div className="p-4">
        <div className="w-full h-auto p-4 justify-start items-center gap-3 flex bg-muted rounded-lg">
          <User className="h-10 w-10 text-primary flex-shrink-0" />
          <div className="text-sm overflow-hidden text-left">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">ID: {user.dentistId || "N/A"}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">{t[user.role] || user.role}</p>
          </div>
        </div>
      </div>


      <SidebarContent className="flex-grow p-4">
        <SidebarMenu>
          {userNavItems.map((item) => {
            const isNavItemDisabled = isPending && item.href !== '/settings';
            return (
              <SidebarMenuItem key={item.href}>
                <Link 
                  href={item.href}
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
                      (!isPending && (pathname.endsWith(item.href) || (item.href !== "/dashboard" && pathname.includes(item.href))))
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
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto">
         <SidebarMenu>
            <SidebarMenuItem>
               <div className="px-2">
                 <LanguageSwitcher />
               </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={logout}
                    className="text-sidebar-foreground font-medium"
                >
                    <LogOut className="h-5 w-5"/>
                    <span>{t.sidebar_logout || "Abmelden"}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
