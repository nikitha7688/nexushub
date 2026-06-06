"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/ui/otp-input";
import { PasswordStrength, scorePassword } from "@/components/auth/password-strength";

type Step = "email" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = React.useState<Step>("email");
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Code sent to ${email}`);
      setStep("otp");
    }, 700);
  }

  function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("reset");
    }, 700);
  }

  function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (scorePassword(password) < 2) {
      toast.error("Pick a stronger password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("done");
    }, 700);
  }

  if (step === "email") {
    return (
      <div className="space-y-6">
        <BackToLogin />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the email tied to your account — we&apos;ll send a 6-digit code.
          </p>
        </div>
        <form onSubmit={submitEmail} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoFocus
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send code
          </Button>
        </form>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setStep("email")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enter your code</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>. It expires in 10 minutes.
          </p>
        </div>
        <form onSubmit={submitOtp} className="space-y-5">
          <OTPInput value={otp} onChange={setOtp} autoFocus />
          <Button type="submit" size="lg" className="w-full" disabled={loading || otp.length !== 6}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify code
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            className="text-foreground underline-offset-4 hover:underline"
            onClick={() => toast.success("Code resent")}
          >
            Resend code
          </button>
        </p>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose something you haven&apos;t used elsewhere.
          </p>
        </div>
        <form onSubmit={submitReset} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrength value={password} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      </div>
    );
  }

  // done
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You can now sign in with your new password.
        </p>
      </div>
      <Button size="lg" className="w-full" asChild>
        <Link href="/login">Continue to sign in</Link>
      </Button>
    </div>
  );
}

function BackToLogin() {
  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to sign in
    </Link>
  );
}