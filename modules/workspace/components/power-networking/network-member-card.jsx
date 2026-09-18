"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  FileText,
  Package,
  MoreVertical,
  UserMinus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";

export function NetworkMemberCard({
  business,
  onRequestQuote,
  onRemove,
  isRemoving = false,
}) {
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  if (!business) return null;

  const isVerified =
    business.isVerified ||
    business.verification === "verified" ||
    business.verification === "Verified";

  const catalogue = business.catalogue || [];

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
        <div className="space-y-3">
          {/* Header & Logo */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-base shrink-0 overflow-hidden border border-primary/20">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  business.name?.charAt(0) || "B"
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-sm text-foreground truncate max-w-[180px] sm:max-w-[200px]">
                    {business.name}
                  </h4>
                  {isVerified && (
                    <span
                      title="Verified RIFAH Business"
                      className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground truncate">
                  {business.industry || business.categories?.[0] || "Business"}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                  {business.chapter && <span>{business.chapter}</span>}
                  {business.city && (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {business.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Overflow menu for removal */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/business/${business.slug || business._id}`}>
                    <ExternalLink className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>View Public Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsRemoveConfirmOpen(true)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <UserMinus className="h-3.5 w-3.5 mr-2" />
                  <span>Remove from Network</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Connected Badge Banner */}
          <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 w-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">In Your Power Network</span>
          </div>

          {/* Catalogue Items Preview */}
          {catalogue.length > 0 && (
            <div className="rounded-lg bg-muted/40 p-2.5 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Catalogue Products ({catalogue.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {catalogue.slice(0, 3).map((item) => (
                  <span
                    key={item._id}
                    className="inline-flex items-center rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-foreground border border-border/80 shadow-2xs truncate max-w-[180px]"
                  >
                    {item.name}
                  </span>
                ))}
                {catalogue.length > 3 && (
                  <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    +{catalogue.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 text-xs border-border"
          >
            <Link href={`/business/${business.slug || business._id}`}>
              <ExternalLink className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              Profile
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => onRequestQuote && onRequestQuote(business)}
            className="flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            Request Quote
          </Button>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className="px-2.5 text-xs text-foreground shrink-0"
            title="Open Chat"
          >
            <Link href={`/biz/messages`}>
              <MessageSquare className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog for Removal */}
      <AlertDialog open={isRemoveConfirmOpen} onOpenChange={setIsRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Power Network?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{business.name}</strong> from your Power Network?
              You will no longer see them in your permanent network, but you can reconnect with them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onRemove && business.connectionId) {
                  onRemove(business.connectionId);
                }
                setIsRemoveConfirmOpen(false);
              }}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isRemoving ? "Removing..." : "Remove Business"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
