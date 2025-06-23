
"use client";

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
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, GraduationCap, CalendarDays, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const t = getClientTranslations(locale);


  if (authLoading) {
    return (
       <Sidebar collapsible="none">
        <SidebarHeader className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
             <Skeleton className="h-8 w-8 rounded-md" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-grow">
          <div className="bg-sidebar-user-info-background p-3 rounded-md m-2 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
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
        <SidebarFooter className="p-2">
            <SidebarMenuSkeleton showIcon={true}/>
        </SidebarFooter>
      </Sidebar>
    );
  }

  if (!user) return null;

  const userNavItems = navConfig[user.role] || [];

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="flex items-center justify-between p-3">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <Logo portalText={t.login_logo_text_portal || "Portal"} />
        </Link>
      </SidebarHeader>

      {/* User Profile Section */}
      <div className="p-3 mx-2 my-1 rounded-md bg-muted text-sidebar-foreground">
        <div className="w-full h-auto p-0 justify-start items-center gap-3 flex">
          <User className="h-10 w-10 text-primary flex-shrink-0" />
          <div className="text-sm overflow-hidden text-left">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">ID: {user.dentistId}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">{t[user.role] || user.role}</p>
          </div>
        </div>
      </div>

      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {userNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior={false} passHref={false}>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{ children: t[item.title] || item.title, side: "right", align: "center" }}
                  aria-label={t[item.title] || item.title}
                  className="font-medium"
                >
                  {item.icon && <item.icon className="h-5 w-5"/>}
                  <span>{t[item.title] || item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
         <SidebarMenu>
            <SidebarMenuItem>
               <div className="px-2">
                 <LanguageSwitcher />
               </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={logout}
                    className="text-sidebar-foreground font-medium hover:bg-sidebar-accent hover:text-primary"
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
