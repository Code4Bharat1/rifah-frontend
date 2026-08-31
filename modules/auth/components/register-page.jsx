"use client";
import Link from "next/link";
import { Building2, CheckCircle2 } from "lucide-react";
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

function RegisterPage() {
  const [done, setDone] = useState(false);

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
              <h1 className="mt-3 text-xl font-bold tracking-tight">Account created</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                A verification code was sent to your email in the real product. Continue to your buyer dashboard.
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

              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setDone(true);
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="rname">Full name</Label>
                  <Input id="rname" required placeholder="Your name" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remail">Email</Label>
                  <Input id="remail" type="email" required placeholder="you@example.com" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rphone">Mobile number</Label>
                  <Input id="rphone" type="tel" placeholder="Used for enquiry updates" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rorg">Organisation (optional)</Label>
                  <Input id="rorg" placeholder="Company name" className="h-11" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="rcity">City</Label>
                    <Select>
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
                  <div className="space-y-1.5">
                    <Label htmlFor="rint">Sourcing interest</Label>
                    <Select>
                      <SelectTrigger id="rint" className="h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rpass">Password</Label>
                  <Input id="rpass" type="password" required placeholder="At least 8 characters" className="h-11" />
                </div>
                <label className="flex items-start gap-2.5 text-sm">
                  <Checkbox required className="mt-0.5" />
                  <span>I agree to the RIFAH Connect terms of use and privacy notice.</span>
                </label>
                <Button type="submit" size="lg" className="w-full">
                  Create account
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-border bg-accent p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="h-4 w-4 text-primary" /> Are you a business?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Business listings go through RIFAH verification and unlock lead routing.
                </p>
                <Button asChild variant="outline" className="mt-3 w-full">
                  <Link href="/register-business">List my business instead</Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Already registered?{" "}
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
