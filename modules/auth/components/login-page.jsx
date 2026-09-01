"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, UserRound, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { RifahLogo } from "@shared/components/rifah/brand";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { useAuth } from "@shared/providers/auth-provider";

const quickDemoLogins = [
  {
    role: "Chamber Admin",
    email: "secretariat@rifah.org",
    pass: "Admin@123456",
    target: "/admin",
    icon: ShieldCheck,
    note: "Secretariat review & KPI controls",
  },
  {
    role: "Business Owner",
    email: "aslam@bakkabags.example",
    pass: "Password@123",
    target: "/biz",
    icon: Building2,
    note: "Leads, catalogue & verification",
  },
  {
    role: "Customer / Buyer",
    email: "buyer@example.com",
    pass: "Password@123",
    target: "/me",
    icon: UserRound,
    note: "Enquiries, saved & messages",
  },
];

function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === "super_admin" || user.role === "secretariat") {
        router.push("/admin");
      } else if (user.role === "business_owner") {
        router.push("/biz");
      } else {
        router.push("/me");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError("");
    setLoading(true);
    try {
      const user = await login({ email: acc.email, password: acc.pass });
      router.push(acc.target);
    } catch (err) {
      setError(err.message || "Failed to log in with demo account. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-xs text-primary-foreground/50">RIFAH Connect · Production Authenticated Session</p>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="lg:hidden">
              <RifahLogo className="h-9" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight lg:mt-0">Sign in</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Access your RIFAH account or select a quick-login role below.
            </p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>
              <label className="flex items-center gap-2.5 text-sm">
                <Checkbox defaultChecked /> <span>Keep me signed in</span>
              </label>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick login</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <ul className="space-y-2">
              {quickDemoLogins.map((r) => (
                <li key={r.role}>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(r)}
                    disabled={loading}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/60"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                      <r.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{r.role}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.note}</span>
                    </span>
                  </button>
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
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export { LoginPage };
export default LoginPage;
