import {
  BarChart3,
  Bell,
  FileText,
  Folder,
  LayoutDashboard,
  ListTodo,
  Settings,
  StickyNote,
  User,
  Users,
} from "lucide-react";
import type { SidebarNavItem } from "@/components/ui/sidebar";

type IconComponent = React.ComponentType<{ className?: string }>;

export interface DashboardNavItem extends SidebarNavItem {
  icon: React.ReactNode;
}

function withIcon(Icon: IconComponent, label: string, href: string, badge?: React.ReactNode): DashboardNavItem {
  return { href, label, icon: <Icon />, badge };
}

export const PRIMARY_NAV: DashboardNavItem[] = [
  withIcon(LayoutDashboard, "Dashboard", "/dashboard"),
  withIcon(FileText, "Documents", "/documents"),
  withIcon(StickyNote, "Notes", "/notes"),
  withIcon(ListTodo, "Tasks", "/tasks"),
  withIcon(Folder, "Files", "/files"),
  withIcon(Users, "Team", "/team"),
  withIcon(Bell, "Notifications", "/notifications"),
  withIcon(BarChart3, "Analytics", "/analytics"),
];

export const SECONDARY_NAV: DashboardNavItem[] = [
  withIcon(User, "Profile", "/profile"),
  withIcon(Settings, "Settings", "/settings"),
];