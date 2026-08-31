"use client";
import { Package, Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/components/ui/sheet";
import { useMyBusiness, useBusinessCatalogue } from "@shared/hooks/use-rifah-api";
import { catalogueApi } from "@shared/lib/api-services";

function BizCatalogue() {
  const { data: business } = useMyBusiness();
  const { data: catalogueItems, refetch } = useBusinessCatalogue(business?._id);
  const items = catalogueItems || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    type: "Product",
    category: "Manufacturing",
    description: "",
    moq: "100 units",
    price: "₹ 500 / unit",
  });

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    setLoading(true);
    try {
      await catalogueApi.create({
        ...newItem,
        businessId: business?._id,
      });
      setOpenAdd(false);
      setNewItem({
        name: "",
        type: "Product",
        category: "Manufacturing",
        description: "",
        moq: "100 units",
        price: "₹ 500 / unit",
      });
      refetch();
    } catch (err) {
      alert(err.message || "Failed to add catalogue item.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this catalogue entry?")) return;
    try {
      await catalogueApi.delete(id);
      refetch();
    } catch (err) {
      alert(err.message || "Failed to delete item.");
    }
  };

  return (
    <AppShell
      role="business"
      title="My catalogue"
      subtitle={`${items.length} published products & services`}
      actions={
        <Sheet open={openAdd} onOpenChange={setOpenAdd}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-left">Add catalogue item</SheetTitle>
              <SheetDescription className="text-left">
                Publish a product or service to the chamber directory.
              </SheetDescription>
            </SheetHeader>
            <form className="mt-4 grid gap-4 px-4 pb-8" onSubmit={handleAddItem}>
              <div className="grid gap-1.5">
                <Label htmlFor="item-name">Item Name *</Label>
                <Input
                  id="item-name"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. CNC machined components"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-type">Type</Label>
                <Select
                  value={newItem.type}
                  onValueChange={(val) => setNewItem({ ...newItem, type: val })}
                >
                  <SelectTrigger id="item-type" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-cat">Category</Label>
                <Input
                  id="item-cat"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="Manufacturing / Precision Engineering"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-moq">Minimum Order Quantity (MOQ)</Label>
                <Input
                  id="item-moq"
                  value={newItem.moq}
                  onChange={(e) => setNewItem({ ...newItem, moq: e.target.value })}
                  placeholder="e.g. 500 units"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-price">Indicative Price</Label>
                <Input
                  id="item-price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="e.g. ₹ 450 per unit / On Request"
                  className="h-11"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-desc">Description</Label>
                <Textarea
                  id="item-desc"
                  rows={4}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="What you supply and technical specifications."
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Publish to catalogue"
                )}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No catalogue items"
          description="Add products or services so buyers can find and enquire about your offerings."
          action={
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" /> Add your first item
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Panel key={item._id || item.slug} bodyClassName="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <p className="min-w-0 truncate text-sm font-semibold">{item.name}</p>
                <Pill tone={item.type === "Product" ? "primary" : "neutral"}>{item.type}</Pill>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{item.category}</p>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs font-medium">
                <span>{item.price || "On Request"}</span>
                {item.moq && <span className="text-muted-foreground">MOQ: {item.moq}</span>}
              </div>
              <div className="mt-4 flex gap-2 border-t border-border pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive ml-auto"
                  onClick={() => handleDeleteItem(item._id)}
                >
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
