'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Users, UserCircle, Settings, ShieldCheck, Briefcase } from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/representation', label: 'Representation', icon: Users },
  { href: '/education', label: 'Education Points', icon: Briefcase },
  {
    label: 'Settings',
    icon: Settings,
    subMenu: [
      { href: '/profile', label: 'Profile', icon: UserCircle },
      { href: '/account', label: 'Account', icon: ShieldCheck },
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          {item.subMenu ? (
            <>
              <SidebarMenuButton
                // Implement open state logic if needed
                // data-state={item.subMenu.some(sub => pathname.startsWith(sub.href)) ? "open" : "closed"}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.subMenu.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.label}>
                    <Link href={subItem.href} legacyBehavior passHref>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname.startsWith(subItem.href)}
                      >
                        <a>
                          <subItem.icon />
                          <span>{subItem.label}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </>
          ) : (
            <Link href={item.href!} legacyBehavior passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href!)}
                tooltip={item.label}
              >
                <a>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
