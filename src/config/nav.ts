
import type { NavItem, UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  FileText,
  Settings,
  GraduationCap,
  CalendarDays,
} from "lucide-react";

export const navConfig: Record<UserRole, NavItem[]> = {
  dentist: [
    {
      title: "sidebar_dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "sidebar_my_trainings",
      href: "/education",
      icon: GraduationCap,
    },
    {
      title: "sidebar_my_representations",
      href: "/representations",
      icon: CalendarDays,
    },
    {
      title: "sidebar_document_templates",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "sidebar_settings",
      href: "/settings",
      icon: Settings,
    },
  ],
  lk_member: [
    // Add LK-specific navigation here
  ],
  ozak_employee: [
    // Add ÖZÄK-specific navigation here
  ],
};

// Common nav items are no longer needed if each role has a full set
export const commonNavItems: NavItem[] = [];
