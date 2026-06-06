"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  items: SidebarNavItem[];
  footer?: React.ReactNode;
}

export function Sidebar({ brand, items, footer, className, ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground",
        className,
      )}
      {...props}
    >
      {brand && <div className="flex h-16 items-center border-b border-sidebar-border px-5">{brand}</div>}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              {item.icon && <span className="[&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>}
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge}
            </Link>
          );
        })}
      </nav>

      {footer && <div className="border-t border-sidebar-border p-3">{footer}</div>}
    </aside>
  );
}