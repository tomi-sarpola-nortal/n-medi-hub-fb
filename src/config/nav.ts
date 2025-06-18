import type { NavItem, UserRole } from "@/lib/types";
import {
  LayoutDashboard,
  FileText,
  User,
  Users2, // For peer representation
  Award, // For Education Points
  LogOut,
  Users, // For User Management (admin)
  FilePlus, // For Document Management (admin)
  CheckSquare, // For Approvals (admin)
  ShieldQuestion, // For Smart Document Suggestion (if it has its own page)
} from "lucide-react";

export const navConfig: Record<UserRole, NavItem[]> = {
  dentist: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "My Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Representation",
      href: "/representation",
      icon: Users2,
    },
    {
      title: "Education Points",
      href: "/education-points",
      icon: Award,
    },
    {
      title: "Smart Suggestions",
      href: "/smart-suggestions",
      icon: ShieldQuestion,
    }
  ],
  lk_member: [
    {
      title: "LK Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "My Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Dentist Management",
      href: "/lk/user-management",
      icon: Users,
    },
    {
      title: "Document Management",
      href: "/lk/document-management",
      icon: FilePlus,
    },
    {
      title: "Approval Requests",
      href: "/lk/approvals",
      icon: CheckSquare,
    },
    {
      title: "Smart Suggestions",
      href: "/smart-suggestions",
      icon: ShieldQuestion,
    }
  ],
  ozak_employee: [
    {
      title: "ÖZÄK Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "My Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Nationwide Docs",
      href: "/ozak/document-management", // ÖZÄK specific doc management
      icon: FilePlus,
    },
    // ÖZÄK might share some LK views or have their own
    {
      title: "System Administration", // Example
      href: "/ozak/admin",
      icon: Users, // Placeholder
    },
    {
      title: "Smart Suggestions",
      href: "/smart-suggestions",
      icon: ShieldQuestion,
    }
  ],
};

export const commonNavItems: NavItem[] = [
  // Example:
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: SettingsIcon, // Replace with actual icon
  // },
];
