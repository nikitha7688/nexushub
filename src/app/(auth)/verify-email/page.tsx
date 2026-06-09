"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "your inbox";

  const [otp, setOtp] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [verified, setVerified] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 700);
  }

  if (verified) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Email verified</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Let&apos;s finish setting up your workspace.
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={() => router.push("/onboarding")}>
          Continue to onboarding
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Mail className="h-7 w-7" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>. It expires in 10 minutes.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <OTPInput value={otp} onChange={setOtp} autoFocus />
        <Button type="submit" size="lg" className="w-full" disabled={loading || otp.length !== 6}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify email
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <p>
          Didn&apos;t get the email?{" "}
          <button
            type="button"
            className="text-foreground underline-offset-4 hover:underline"
            onClick={() => toast.success("Code resent")}
          >
            Resend code
          </button>
        </p>
        <p>
          Wrong address?{" "}
          <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
            Use a different email
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailInner />
    </React.Suspense>
  );
}