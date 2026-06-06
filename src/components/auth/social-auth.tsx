"use client";

import { Button } from "@/components/ui/button";

export function SocialAuth({ mode = "in" }: { mode?: "in" | "up" }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" size="lg" aria-label={`Sign ${mode} with Google`}>
        <GoogleIcon className="h-4 w-4" />
        Google
      </Button>
      <Button type="button" variant="outline" size="lg" aria-label={`Sign ${mode} with Microsoft`}>
        <MicrosoftIcon className="h-4 w-4" />
        Microsoft
      </Button>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.83h5.43c-.23 1.43-1.66 4.19-5.43 4.19-3.27 0-5.94-2.7-5.94-6.03s2.67-6.03 5.94-6.03c1.86 0 3.11.79 3.82 1.47l2.6-2.5C16.74 3.6 14.6 2.66 12 2.66 6.84 2.66 2.66 6.84 2.66 12s4.18 9.34 9.34 9.34c5.39 0 8.96-3.79 8.96-9.12 0-.61-.07-1.08-.15-1.55L12 10.2Z" />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
      <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
      <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
      <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
    </svg>
  );
}