import Link from "next/link";
import { Quote } from "lucide-react";
import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r bg-muted/30 p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl"
        />
        <Brand />
        <div className="relative">
          <Quote className="h-7 w-7 text-primary" />
          <blockquote className="mt-4 text-balance text-2xl font-medium leading-snug tracking-tight">
            “We killed Notion, Linear, and three Slack integrations the week we rolled out NexusHub.
            Productivity went up. Our SaaS bill went down.”
          </blockquote>
          <div className="mt-6 text-sm">
            <p className="font-medium">Sara Akhtar</p>
            <p className="text-muted-foreground">VP Engineering · Northwind</p>
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} NexusHub Inc.{" "}
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </div>

      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-5 lg:hidden">
          <Brand />
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}