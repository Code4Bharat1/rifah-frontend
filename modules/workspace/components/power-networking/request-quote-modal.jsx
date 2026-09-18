"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import { Building2, Send, Sparkles, CheckCircle2, Calendar } from "lucide-react";
import { useSendPowerQuoteRequest } from "@shared/hooks/use-rifah-api";
import { toast } from "sonner";

export function RequestQuoteModal({ isOpen, onClose, targetBusiness, initialRequirement = null }) {
  const quoteMutation = useSendPowerQuoteRequest();

  const [productService, setProductService] = useState(initialRequirement?.productService || "");
  const [quantity, setQuantity] = useState(initialRequirement?.quantity || "");
  const [budget, setBudget] = useState(initialRequirement?.budget || "");
  const [requiredBy, setRequiredBy] = useState(
    initialRequirement?.requiredBy ? new Date(initialRequirement.requiredBy).toISOString().split("T")[0] : ""
  );
  const [note, setNote] = useState("");

  // Update fields when initialRequirement changes
  React.useEffect(() => {
    if (initialRequirement) {
      setProductService(initialRequirement.productService || "");
      setQuantity(initialRequirement.quantity || "");
      setBudget(initialRequirement.budget || "");
      if (initialRequirement.requiredBy) {
        setRequiredBy(new Date(initialRequirement.requiredBy).toISOString().split("T")[0]);
      }
    }
  }, [initialRequirement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetBusiness?._id) return;
    if (!productService.trim()) {
      toast.error("Please enter the product or service you need a quotation for.");
      return;
    }

    try {
      await quoteMutation.mutateAsync({
        targetBusinessId: targetBusiness._id,
        productService: productService.trim(),
        quantity: quantity.trim(),
        budget: budget.trim(),
        requiredBy: requiredBy ? new Date(requiredBy).toISOString() : undefined,
        note: note.trim(),
        requirementId: initialRequirement?._id,
      });

      toast.success(`Quotation request sent to ${targetBusiness.name}!`);

      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to send quotation request.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Power Network RFQ</span>
          </div>
          <DialogTitle className="text-lg font-bold">
            Request Quote from {targetBusiness?.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Send a direct request for quotation (RFQ) to your connected partner. They will receive an instant notification and message.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/50 p-3 border border-border flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
              {targetBusiness?.logo ? (
                <img
                  src={targetBusiness.logo}
                  alt={targetBusiness.name}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                targetBusiness?.name?.charAt(0) || "B"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5">
                {targetBusiness?.name}
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3 w-3 fill-emerald-600/20" /> In Your Power Network
                </span>
              </h4>
              <p className="text-[11px] text-muted-foreground truncate">
                {targetBusiness?.industry || targetBusiness?.chapter || "RIFAH Connected Partner"}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rfq-product" className="text-xs font-medium">
              Product or Service Required <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rfq-product"
              placeholder="e.g., Ultratech Cement (53 Grade), TMT Steel 12mm..."
              value={productService}
              onChange={(e) => setProductService(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rfq-qty" className="text-xs font-medium">
                Quantity
              </Label>
              <Input
                id="rfq-qty"
                placeholder="e.g., 500 Bags, 10 Tons..."
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rfq-date" className="text-xs font-medium">
                Required By
              </Label>
              <Input
                id="rfq-date"
                type="date"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rfq-budget" className="text-xs font-medium">
              Target Budget (Optional)
            </Label>
            <Input
              id="rfq-budget"
              placeholder="e.g., ₹2,50,000 / Best Market Rate"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rfq-note" className="text-xs font-medium">
              Specification / Note
            </Label>
            <Textarea
              id="rfq-note"
              rows={3}
              placeholder="Provide delivery location, specifications, or any special terms..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
              disabled={quoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={quoteMutation.isPending}
            >
              {quoteMutation.isPending ? (
                "Sending Quote Request..."
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Quote Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
