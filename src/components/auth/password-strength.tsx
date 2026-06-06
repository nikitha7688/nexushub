"use client";

import { cn } from "@/lib/utils";

const labels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
const colors = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-primary",
  "bg-success",
];

export function scorePassword(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              value && i < score ? colors[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value ? labels[score] : "Use 8+ characters with a mix of letters, numbers & symbols."}
      </p>
    </div>
  );
}