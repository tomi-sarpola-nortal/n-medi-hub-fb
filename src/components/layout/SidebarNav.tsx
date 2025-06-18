"use client";

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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { navConfig, commonNavItems } from "@/config/nav";
import type { NavItem, UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeftSquare, Landmark, UserCircle } from "lucide-react"; // Added Landmark, UserCircle
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils"; // Added this import
import { Skeleton } from "@/components/ui/skeleton";


export function AppSidebar() {
  const { user, logout, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar(); 

  if (authLoading) {
    return (
       <Sidebar collapsible="icon"> {/* Outer sidebar structure for loading state */}
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

  if (!user) return null; // Don't render sidebar if no user

  const userNavItems = navConfig[user.role] || [];
  const allNavItems = [...userNavItems, ...commonNavItems.filter(item => !item.roles || item.roles.includes(user.role))];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-3">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Landmark className="h-7 w-7 flex-shrink-0 text-primary" />
          {state === "expanded" && (
            <span className="font-headline text-lg font-bold text-primary truncate">
              ÖZÄK <span className="font-medium text-foreground/80">Portal</span>
            </span>
          )}
        </Link>
        {state === "expanded" && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex ml-auto h-7 w-7 text-sidebar-foreground hover:bg-sidebar-item-hover-background">
                <ChevronLeftSquare />
            </Button>
        )}
      </SidebarHeader>

      {state === "expanded" && (
        <div className="bg-sidebar-user-info-background p-3 rounded-md mx-2 my-1 text-sidebar-user-info-foreground">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImage || `https://avatar.vercel.sh/${user.email}.png?size=40`} alt={user.name || "User"} />
              <AvatarFallback>
                <UserCircle className="h-10 w-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm overflow-hidden">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">ID: {user.id}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{user.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      )}


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

      <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={logout} 
                  aria-label="Abmelden" 
                  tooltip={{children: "Abmelden"}}
                  className="text-sidebar-foreground hover:bg-sidebar-item-hover-background hover:text-sidebar-item-hover-foreground"
                >
                    <LogOut />
                    <span>Abmelden</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
