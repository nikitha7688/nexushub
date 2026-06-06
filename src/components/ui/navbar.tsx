"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  sticky?: boolean;
}

export function Navbar({ left, center, right, sticky = true, className, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        "flex h-16 w-full items-center justify-between gap-4 border-b bg-background/80 px-page backdrop-blur",
        sticky && "sticky top-0 z-sticky",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">{left}</div>
      {center && <div className="hidden flex-1 justify-center md:flex">{center}</div>}
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}