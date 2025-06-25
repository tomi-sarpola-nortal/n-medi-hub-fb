
import type { NavItem, UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  FileText,
  Settings,
  GraduationCap,
  ArrowLeftRight,
  Users,
  Database,
  History,
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
      icon: ArrowLeftRight,
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
    {
      title: "sidebar_developer_module",
      href: "/developer",
      icon: Database,
    },
  ],
  lk_member: [
    {
      title: "sidebar_dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "sidebar_member_overview",
      href: "/member-overview",
      icon: Users,
    },
    {
      title: "sidebar_document_templates",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "sidebar_audit_tools",
      href: "/audit-tools",
      icon: History,
    },
    {
      title: "sidebar_settings",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "sidebar_developer_module",
      href: "/developer",
      icon: Database,
    },
  ],
  ozak_employee: [
    // Add ÖZÄK-specific navigation here
  ],
};

// Common nav items are no longer needed if each role has a full set
export const commonNavItems: NavItem[] = [];
