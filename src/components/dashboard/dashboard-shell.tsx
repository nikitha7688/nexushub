"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Brand } from "@/components/brand";
import { Sidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Topbar } from "@/components/dashboard/topbar";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

const user = { name: "Ada Lovelace", email: "ada@nexushub.io" };

function SidebarBody() {
  return (
    <Sidebar
      brand={<Brand />}
      items={[...PRIMARY_NAV, ...SECONDARY_NAV]}
      className="border-r-0"
      footer={
        <div className="flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">AL</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      }
    />
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden h-screen sticky top-0 lg:block">
        <SidebarBody />
      </aside>

      <Separator orientation="vertical" className="hidden lg:block" />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-modal lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            className={cn(
              "relative h-full w-64 bg-background shadow-elevated",
              "animate-in slide-in-from-left duration-200",
            )}
          >
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarBody />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} user={user} notificationCount={3} />
        <main className="flex-1 px-page py-8">{children}</main>
      </div>
    </div>
  );
}