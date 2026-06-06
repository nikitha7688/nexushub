"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OTPInput } from "@/components/ui/otp-input";
import { SocialAuth } from "@/components/auth/social-auth";

type Step = "credentials" | "mfa";

export default function LoginPage() {
  const [step, setStep] = React.useState<Step>("credentials");
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [otp, setOtp] = React.useState("");

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("mfa");
    }, 700);
  }

  function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Signed in (mock)");
    }, 700);
  }

  if (step === "mfa") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setStep("credentials")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to finish signing in.
          </p>
        </div>

        <form onSubmit={handleMfa} className="space-y-5">
          <OTPInput value={otp} onChange={setOtp} autoFocus />
          <Button type="submit" size="lg" className="w-full" disabled={loading || otp.length !== 6}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify and sign in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Lost access?{" "}
          <Link href="#" className="text-foreground underline-offset-4 hover:underline">
            Use a recovery code
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your NexusHub workspace.
        </p>
      </div>

      <SocialAuth mode="in" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or with email</span>
        </div>
      </div>

      <form onSubmit={handleCredentials} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
          <span>Remember me on this device</span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}