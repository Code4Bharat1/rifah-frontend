"use client";
import Link from "next/link";
import { Eye, ImagePlus } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Progress } from "@shared/components/ui/progress";
import { Textarea } from "@shared/components/ui/textarea";
import { businessGallery } from "@shared/lib/media";
import { getBusiness } from "@shared/lib/mock-data";

function BizProfile() {
  const b = getBusiness("abc-manufacturing");

  return (
    <AppShell
      role="business"
      title="Business profile"
      subtitle="How buyers see your business"
      actions={
        <Button asChild variant="outline">
          <Link href={`/business/${b.id }`}>
            <Eye className="h-4 w-4" /> Preview
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Panel title="Company details" description="Prototype form — values are not saved">
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
              {[
                ["biz-name", "Business name", b.name],
                ["biz-industry", "Industry", b.industry],
                ["biz-city", "City", b.city],
                ["biz-state", "State", b.state],
                ["biz-year", "Year established", b.founded],
                ["biz-size", "Employees", b.employees],
              ].map(([id, label, value]) => (
                <div key={id} className="grid gap-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <Input id={id} defaultValue={value} className="h-11" />
                </div>
              ))}
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="biz-about">About the business</Label>
                <Textarea id="biz-about" rows={5} defaultValue={b.about} />
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit">Save changes</Button>
                <Button type="button" variant="outline">
                  Discard
                </Button>
              </div>
            </form>
          </Panel>

          <Panel title="Gallery" description="Add facility, product and certification images">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {businessGallery(b).slice(0, 3).map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${b.name} gallery image ${i + 1}`}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="aspect-4-3 w-full rounded-xl border border-border object-cover"
                />
              ))}
              <button
                type="button"
                className="grid aspect-4-3 place-items-center rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px] font-medium">Upload</span>
              </button>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Completeness">
            <p className="text-2xl font-bold tabular-nums">82%</p>
            <Progress value={82} className="mt-2.5" />
            <p className="mt-2 text-xs text-muted-foreground">
              Add gallery images and bank details to reach 100%.
            </p>
          </Panel>

          <Panel title="Certifications">
            <div className="flex flex-wrap gap-1.5">
              {b.certifications.map((c) => (
                <Pill key={c} tone="primary">
                  {c}
                </Pill>
              ))}
            </div>
            <Button variant="outline" className="mt-3 w-full">
              Add certification
            </Button>
          </Panel>

          <Panel title="Categories">
            <div className="flex flex-wrap gap-1.5">
              {b.categories.map((t) => (
                <Pill key={t}>{t}</Pill>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Categories determine which buyer leads are routed to you.
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}


export { BizProfile };
export default BizProfile;
