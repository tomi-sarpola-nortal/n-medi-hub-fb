
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
import { LogOut, Landmark, User, Settings, GraduationCap, CalendarDays, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
             <Landmark className="h-8 w-8 flex-shrink-0 text-primary" />
            <div className="flex flex-col">
              <span className="font-headline text-lg font-bold text-foreground truncate">ZAHNÄRZTE KAMMER</span>
              <span className="font-headline text-md font-medium text-primary -mt-1">Portal</span>
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
          <Landmark className="h-10 w-10 flex-shrink-0 text-destructive" />
          <div className="flex flex-col">
            <span className="font-headline text-sm font-bold text-foreground leading-tight">ÖSTERREICHISCHE</span>
            <span className="font-headline text-lg font-bold text-foreground -mt-1 leading-tight">ZAHNÄRZTE KAMMER</span>
            <span className="font-headline text-lg font-medium text-primary -mt-1 leading-tight">Portal</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* User Profile Section */}
      <div className="p-3 mx-2 my-1 rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
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
                  className="text-sidebar-foreground data-[active=true]:text-primary data-[active=true]:bg-sidebar-accent font-medium data-[active=true]:border-0 hover:bg-sidebar-accent hover:text-primary"
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
