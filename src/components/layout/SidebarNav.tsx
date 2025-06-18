'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter for locale
import Link from 'next/link';
import { LayoutDashboard, FileText, Users, UserCircle, Settings, ShieldCheck, Briefcase, LogOut } from 'lucide-react'; // Added LogOut for consistency

// A simple way to get translations on the client
// In a larger app, you might use a context or a dedicated i18n client library
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    // Fallback to English if locale is not German or files are missing
    return require('../../../locales/en.json');
  } catch (e) {
    // Fallback if JSON loading fails
    console.error("Failed to load translation files for SidebarNav", e);
    return { // Minimal fallback translations
      sidebar_dashboard: "Dashboard",
      sidebar_documents: "Documents",
      sidebar_representation: "Representation",
      sidebar_education_points: "Education Points",
      sidebar_settings: "Settings",
      sidebar_profile: "Profile",
      sidebar_account: "Account",
      sidebar_logout: "Logout",
    };
  }
};


export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = router.locale || 'en'; // Default to 'en' if locale is not available
  const t = getClientTranslations(locale);


  const menuItems = [
    { href: '/dashboard', label: t.sidebar_dashboard, icon: LayoutDashboard },
    { href: '/documents', label: t.sidebar_documents, icon: FileText },
    { href: '/representation', label: t.sidebar_representation, icon: Users },
    { href: '/education', label: t.sidebar_education_points, icon: Briefcase },
    {
      label: t.sidebar_settings,
      icon: Settings,
      subMenu: [
        { href: '/profile', label: t.sidebar_profile, icon: UserCircle },
        { href: '/account', label: t.sidebar_account, icon: ShieldCheck },
      ],
    },
  ];

  // The logout button is in AppLayout's footer, but if it were here, it would be:
  // { href: '/logout', label: t.sidebar_logout, icon: LogOut, isFooterAction: true }
  // For now, the AppLayout's static "Logout" will be visually present but not dynamically translated by this component.
  // The Header's dropdown logout is translated.

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          {item.subMenu ? (
            <>
              <SidebarMenuButton
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
                        isActive={pathname.startsWith(`/${locale}${subItem.href}`)}
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
                isActive={pathname.startsWith(`/${locale}${item.href!}`)}
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
