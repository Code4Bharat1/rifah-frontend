"use client";
import Link from "next/link";
import { Building2, ShieldCheck, UserRound } from "lucide-react";

import { RifahLogo } from "@shared/components/rifah/brand";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";

const demoRoles = [
  { to: "/me" , label: "Customer / buyer", note: "Enquiries, saved businesses, events", icon: UserRound },
  { to: "/biz" , label: "Business owner", note: "Leads, catalogue, membership", icon: Building2 },
  { to: "/admin" , label: "Chamber admin", note: "Verification, members, reports", icon: ShieldCheck },
];

function LoginPage() {
  return (
    <PublicLayout bare>
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-navy p-10 lg:flex">
          <RifahLogo className="h-10" onDark />
          <div>
            <h2 className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-primary-foreground">
              One chamber network for discovery, enquiries and verified trade.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-primary-foreground/70">
              Members receive matched buyer enquiries, manage their catalogue and participate in chapter events from a
              single workspace.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/50">Prototype — no real authentication is performed.</p>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="lg:hidden">
              <RifahLogo className="h-9" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight lg:mt-0">Sign in</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Use the demo entry points below, or continue with the form.
            </p>

            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email or phone</Label>
                <Input id="email" placeholder="you@example.com" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <Input id="password" type="password" placeholder="••••••••" className="h-11" />
              </div>
              <label className="flex items-center gap-2.5 text-sm">
                <Checkbox defaultChecked /> <span>Keep me signed in</span>
              </label>
              <Button asChild size="lg" className="w-full">
                <Link href="/me">Sign in</Link>
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Demo roles</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <ul className="space-y-2">
              {demoRoles.map((r) => (
                <li key={r.to}>
                  <Link
                    href={r.to}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-muted/60"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                      <r.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{r.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.note}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm text-muted-foreground">
              New to RIFAH Connect?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Create a buyer account
              </Link>{" "}
              or{" "}
              <Link href="/register-business" className="font-semibold text-primary hover:underline">
                list your business
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}


export { LoginPage };
export default LoginPage;
