import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 6.5L12 2L20 6.5V17.5L12 22L4 17.5V6.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 2V12L20 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 12L4 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M12 12V22" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">NexusHub</span>
    </Link>
  );
}