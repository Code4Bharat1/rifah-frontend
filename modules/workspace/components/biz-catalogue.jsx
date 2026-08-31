"use client";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/components/ui/sheet";
import { catalogue } from "@shared/lib/mock-data";

function BizCatalogue() {
  const items = catalogue.filter((c) => c.businessId === "abc-manufacturing");

  return (
    <AppShell
      role="business"
      title="My catalogue"
      subtitle={`${items.length} published · 4 drafts`}
      actions={
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-left">Add catalogue item</SheetTitle>
              <SheetDescription className="text-left">
                Prototype form — nothing is submitted.
              </SheetDescription>
            </SheetHeader>
            <form className="mt-4 grid gap-4 px-4 pb-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-1.5">
                <Label htmlFor="item-name">Name</Label>
                <Input id="item-name" placeholder="e.g. CNC machined components" className="h-11" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-cat">Category</Label>
                <Input id="item-cat" placeholder="Precision Engineering" className="h-11" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-moq">Minimum order quantity</Label>
                <Input id="item-moq" placeholder="500 units" className="h-11" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-desc">Description</Label>
                <Textarea id="item-desc" rows={4} placeholder="What you supply and how it is specified." />
              </div>
              <Button type="submit">Save item</Button>
            </form>
          </SheetContent>
        </Sheet>
      }
    >
      {items.length === 0 ? (
        <EmptyState icon={Package} title="No catalogue items" description="Add products or services so buyers can find you." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Panel key={item.id} bodyClassName="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <p className="min-w-0 truncate text-sm font-semibold">{item.name}</p>
                <Pill tone={item.type === "Product" ? "primary" : "neutral"}>{item.type}</Pill>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{item.category}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              {item.moq && <p className="mt-2 text-xs font-medium">MOQ · {item.moq}</p>}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}


export { BizCatalogue };
export default BizCatalogue;
