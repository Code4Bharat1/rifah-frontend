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
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import { Send, Building2, Package, Sparkles, AlertCircle } from "lucide-react";
import { useSendPowerConnection } from "@shared/hooks/use-rifah-api";

export function ConnectRequestModal({
  isOpen,
  onClose,
  targetBusiness,
  requirement,
  onSuccess,
}) {
  const [message, setMessage] = useState("");
  const sendMutation = useSendPowerConnection();

  const handleSend = async () => {
    if (!targetBusiness?._id) return;

    try {
      await sendMutation.mutateAsync({
        receiverBusinessId: targetBusiness._id,
        requirementId: requirement?._id || undefined,
        message: message.trim(),
      });
      setMessage("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to send connection request:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-full max-w-[95vw] p-6 rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 fill-primary" />
            <span>Power Network Invitation</span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Add {targetBusiness?.name || "Business"} to Power Network
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Send an invitation to add this business to your permanent Power Network for current and ongoing collaboration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-2">
          {/* Target Business Summary Card */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3.5 border border-border/80">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-base border border-primary/20">
              {targetBusiness?.name?.charAt(0)?.toUpperCase() || "B"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {targetBusiness?.name}
              </h4>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {[
                  targetBusiness?.industry || targetBusiness?.categories?.[0],
                  targetBusiness?.city,
                  targetBusiness?.chapter
                    ? targetBusiness.chapter.toLowerCase().includes("chapter")
                      ? targetBusiness.chapter
                      : `${targetBusiness.chapter} Chapter`
                    : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          {/* Requirement Reference Card */}
          {requirement && (
            <div className="rounded-xl bg-primary/5 p-3.5 border border-primary/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Package className="h-3.5 w-3.5" />
                <span>Regarding Requirement:</span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{requirement.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium text-foreground">{requirement.productService}</span>
                <span>·</span>
                <span>Qty: {requirement.quantity}</span>
                {requirement.location && (
                  <>
                    <span>·</span>
                    <span>{requirement.location}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Personal Note */}
          <div className="space-y-1.5">
            <Label htmlFor="connect-message" className="text-xs font-semibold text-foreground">
              Personal Note (Optional)
            </Label>
            <Textarea
              id="connect-message"
              rows={3}
              placeholder={`Hi ${targetBusiness?.name || "team"}, I would like to connect regarding our ${requirement?.productService || "business"} requirement...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-xs resize-none min-h-[85px] leading-relaxed bg-background"
            />
          </div>

          {sendMutation.isError && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{sendMutation.error?.message || "Failed to send connection request. Please try again."}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-3 border-t border-border/70 mt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={sendMutation.isPending}
            className="text-xs h-9 px-4 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={sendMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 px-5 shadow-xs shrink-0"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            {sendMutation.isPending ? "Sending Invitation..." : "Add to Power Network"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
