
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarMenuSub, // Uncomment if submenus are used later
  // SidebarMenuSubItem, // Uncomment if submenus are used later
  // SidebarMenuSubButton, // Uncomment if submenus are used later
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from './LanguageSwitcher'; // Import LanguageSwitcher
import { useAuth } from "@/context/auth-context";
import { navConfig, commonNavItems } from "@/config/nav";
import type { NavItem } from "@/lib/types"; // UserRole removed as it's part of User from useAuth
import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeftSquare, Landmark, UserCircle, Settings } from "lucide-react";
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
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar(); 
  const locale = router.locale || 'en';
  const t = getClientTranslations(locale);


  if (authLoading) {
    return (
       <Sidebar collapsible="icon">
        <SidebarHeader className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
             <Landmark className="h-7 w-7 flex-shrink-0 text-primary" />
            {state === "expanded" && <span className="font-headline text-lg font-bold text-primary truncate">ÖZÄK Portal</span>}
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-grow">
          <div className="bg-sidebar-user-info-background p-3 rounded-md m-2 space-y-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
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
  const allNavItems = [...userNavItems, ...commonNavItems.filter(item => !item.roles || item.roles.includes(user.role))]; // Removed filtering by roles here, assuming roles are handled by navConfig

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="flex items-center justify-between p-3">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Landmark className="h-7 w-7 flex-shrink-0 text-primary" />
          {state === "expanded" && (
            <span className="font-headline text-lg font-bold text-primary truncate">
              ÖZÄK <span className="font-medium text-foreground/80">Portal</span>
            </span>
          )}
        </Link>
        {/* Toggle button commented out to keep sidebar fully visible by default */}
        {/* <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex ml-auto h-7 w-7 text-sidebar-foreground hover:bg-sidebar-item-hover-background">
            <ChevronLeftSquare />
        </Button> */}
      </SidebarHeader>

      {/* User Profile Section with Dropdown */}
      {/* Always show user profile section when sidebar is not collapsed */}
      {/* {state === "expanded" && ( */}
        <div className="p-3 mx-2 my-1 rounded-md bg-sidebar-user-info-background text-sidebar-user-info-foreground">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full h-auto p-0 justify-start items-center gap-3 hover:bg-sidebar-user-info-hover-background">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profileImage || `https://avatar.vercel.sh/${user.email}.png?size=40`} alt={user.name || "User"} data-ai-hint="avatar person" />
                  <AvatarFallback>
                    <UserCircle className="h-10 w-10 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm overflow-hidden text-left">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize truncate">{user.role.replace("_", " ")}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="w-56 ml-2">
              <DropdownMenuLabel>{t.header_my_account || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>{t.header_profile || "Profile"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t.header_settings || "Settings"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t.header_logout || "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      {/* )} */}

      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {allNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior={false} passHref={false}>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{ children: item.title, side: "right", align: "center" }}
                  aria-label={item.title}
                  className="text-sidebar-foreground data-[active=true]:text-sidebar-item-active-foreground data-[active=true]:bg-sidebar-item-active-background data-[active=true]:border-sidebar-item-active-border hover:bg-sidebar-item-hover-background hover:text-sidebar-item-hover-foreground"
                >
                  {item.icon && <item.icon className={cn( (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) && "text-sidebar-item-active-foreground" )}/>}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Language switcher in footer, always visible */}
      <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
         <LanguageSwitcher initialLocale={locale} className="p-1" />
         {/* Collapsed language switcher removed as sidebar is always expanded */}
         {/* {state === "collapsed" && (
            // <div className="flex justify-center py-2">
            //      <DropdownMenu>
            //         <DropdownMenuTrigger asChild>
            //             <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground">
            //                 <Globe className="h-5 w-5" />
            //             </Button>
            //         </DropdownMenuTrigger>
            //         <DropdownMenuContent side="right" align="center">
            //             <LanguageSwitcher initialLocale={locale} className="p-2 flex flex-col gap-2"/>
            //         </DropdownMenuContent>
            //      </DropdownMenu>
            // </div> */}
      </SidebarFooter>
    </Sidebar>
  );
}

