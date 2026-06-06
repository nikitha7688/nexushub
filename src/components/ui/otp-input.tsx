"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  autoFocus,
  className,
  disabled,
}: OTPInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setAt(i: number, v: string) {
    const next = digits.slice();
    next[i] = v;
    onChange(next.join(""));
  }

  function handleChange(i: number, raw: string) {
    const v = raw.replace(/\D/g, "");
    if (!v) {
      setAt(i, "");
      return;
    }
    if (v.length === 1) {
      setAt(i, v);
      refs.current[i + 1]?.focus();
    } else {
      // paste-like multi-char into a single box
      const chars = v.slice(0, length - i).split("");
      const next = digits.slice();
      chars.forEach((c, k) => (next[i + k] = c));
      onChange(next.join(""));
      const focusAt = Math.min(i + chars.length, length - 1);
      refs.current[focusAt]?.focus();
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(0).slice(0, length));
    const focusAt = Math.min(pasted.length, length - 1);
    refs.current[focusAt]?.focus();
  }

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-12 rounded-md border border-input bg-background text-center text-lg font-semibold shadow-xs",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}