"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { RifahLogo } from "@shared/components/rifah/brand";
import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { cities, industries } from "@shared/lib/mock-data";
import { useAuth } from "@shared/providers/auth-provider";

function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    organization: "",
    city: "Mumbai",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        organization: formData.organization,
        city: formData.city,
      });
      setDone(true);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="rifah-container py-8 sm:py-12">
        <div className="mx-auto max-w-md">
          <RifahLogo className="h-9" showLabel={false} />
          {done ? (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-center">
              <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-success-soft text-success">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h1 className="mt-3 text-xl font-bold tracking-tight">Account created successfully</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your buyer profile is active. You can now post RFQs, bookmark suppliers, and message members.
              </p>
              <Button asChild className="mt-5 w-full">
                <Link href="/me">Go to my dashboard</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold tracking-tight">Create a buyer account</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Free for buyers. Post enquiries and get responses from verified RIFAH member businesses.
              </p>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="rname">Full name *</Label>
                  <Input
                    id="rname"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remail">Email *</Label>
                  <Input
                    id="remail"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rpass">Password *</Label>
                  <Input
                    id="rpass"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rphone">Mobile number</Label>
                  <Input
                    id="rphone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rorg">Organisation (optional)</Label>
                  <Input
                    id="rorg"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Company name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rcity">City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(val) => setFormData({ ...formData, city: val })}
                  >
                    <SelectTrigger id="rcity" className="h-11">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Checkbox required defaultChecked className="mt-0.5" />
                  <span>I agree to RIFAH Chamber's Code of Conduct and Terms of Service.</span>
                </label>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-border bg-surface p-4 text-center">
                <p className="text-xs text-muted-foreground">Looking to list your company and receive buyer leads?</p>
                <Button asChild variant="outline" className="mt-2.5 w-full">
                  <Link href="/register-business">
                    <Building2 className="h-4 w-4" /> Register as a business member
                  </Link>
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

export { RegisterPage };
export default RegisterPage;
