"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Clock,
  Check,
  X,
  ExternalLink,
  MessageSquareText,
  Calendar,
  Package,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { resolveMediaUrl } from "@shared/lib/media";

export function RequestItemCard({
  request,
  type = "incoming", // "incoming" | "outgoing"
  onAccept,
  onDecline,
  onCancel,
  isProcessing = false,
}) {
  const isIncoming = type === "incoming";
  const displayBiz = isIncoming ? request.requesterBusiness : request.receiverBusiness;
  const displayUser = isIncoming ? request.requesterUser : request.receiverUser;
  const req = request.requirement;
  const logoUrl = displayBiz?.logo ? resolveMediaUrl(displayBiz.logo) : "";
  const createdAtFormatted = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Business and requester details */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={displayBiz?.name || "Business"}
              className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border bg-muted"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-lg border border-primary/20">
              {displayBiz?.name?.charAt(0)?.toUpperCase() || "B"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base text-card-foreground">
                {displayBiz?.name || "RIFAH Business"}
              </h3>
              <Badge variant="outline" className="text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                <Clock className="h-3 w-3 mr-1" />
                {request.status}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">
              {displayBiz?.industry || "Business Member"}
              {displayBiz?.chapter
                ? ` · ${
                    displayBiz.chapter.toLowerCase().includes("chapter")
                      ? displayBiz.chapter
                      : `${displayBiz.chapter} Chapter`
                  }`
                : ""}
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {displayBiz?.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{displayBiz.city}</span>
                </div>
              )}
              {createdAtFormatted && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Requested on {createdAtFormatted}</span>
                </div>
              )}
            </div>

            {/* Requirement Reference */}
            {req && (
              <div className="mt-3 rounded-lg bg-muted/40 p-3 border border-border/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  <span>Requirement: {req.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {req.category && <span>Category: {req.category}</span>}
                  {req.quantity && <span>Qty: {req.quantity}</span>}
                </div>
              </div>
            )}

            {/* Personalized Message Note */}
            {request.message && (
              <div className="mt-2.5 flex items-start gap-2 text-xs text-foreground/90 bg-primary/5 rounded-lg p-2.5 border border-primary/15">
                <MessageSquareText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="italic leading-relaxed">"{request.message}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex sm:flex-col items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto">
          {(displayBiz?.slug || displayBiz?._id) && (
            <Button asChild variant="ghost" size="sm" className="w-full text-xs">
              <Link href={`/business/${displayBiz.slug || displayBiz._id}`}>
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Profile
              </Link>
            </Button>
          )}

          {isIncoming ? (
            <div className="flex items-center gap-2 w-full">
              <Button
                size="sm"
                onClick={() => onAccept && onAccept(request._id)}
                disabled={isProcessing}
                className="flex-1 sm:w-28 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline && onDecline(request._id)}
                disabled={isProcessing}
                className="flex-1 sm:w-28 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Decline
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel && onCancel(request._id)}
              disabled={isProcessing}
              className="w-full sm:w-32 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel Request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
