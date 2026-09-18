"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  MapPin,
  Sparkles,
  ExternalLink,
  Send,
  MessageSquare,
  Clock,
  Package,
  FileText,
  UserPlus,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { VerificationBadge } from "@shared/components/rifah/badges";
import { resolveMediaUrl } from "@shared/lib/media";

export function BusinessMatchCard({
  business,
  onConnect,
  onRequestQuote,
  requirementTitle,
  isConnecting = false,
}) {
  const logoUrl = business?.logo ? resolveMediaUrl(business.logo) : "";
  const matchScore = business?.matchScore || 0;
  const relevanceTier = business?.relevanceTier || "Relevant";
  const reasons = business?.matchReasons || [];
  const catalogueItems = business?.matchedCatalogue || business?.catalogue || [];
  const networkStatus = business?.networkStatus || (business?.connectionStatus === "Accepted" ? "CONNECTED" : business?.connectionStatus === "Pending" ? "PENDING" : "NOT_CONNECTED");
  const isConnected = networkStatus === "CONNECTED";
  const isPending = networkStatus === "PENDING";

  // Tier styling
  const tierConfig = {
    "Best Match": {
      badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      indicator: "bg-emerald-500",
    },
    "Highly Relevant": {
      badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      indicator: "bg-blue-500",
    },
    Relevant: {
      badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      indicator: "bg-purple-500",
    },
  }[relevanceTier] || {
    badgeBg: "bg-primary/10 text-primary border-primary/20",
    indicator: "bg-primary",
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-primary/40">
      <div>
        {/* Top Header: Business Info + Relevance Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={business.name}
                className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border bg-muted"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-lg border border-primary/20">
                {business.name?.charAt(0)?.toUpperCase() || "B"}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base text-card-foreground truncate group-hover:text-primary transition-colors">
                  {business.name}
                </h3>
                {business.isVerified || business.verification === "verified" || business.verification === "Verified" ? (
                  <VerificationBadge status="verified" size="sm" />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {business.industry || business.categories?.[0] || "RIFAH Business"}
              </p>
            </div>
          </div>

          {matchScore > 0 && (
            <Badge variant="outline" className={`shrink-0 font-medium text-xs px-2.5 py-1 ${tierConfig.badgeBg}`}>
              <Sparkles className="h-3 w-3 mr-1" />
              {relevanceTier}
            </Badge>
          )}
        </div>

        {/* Permanent Network Badge */}
        {isConnected && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 w-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">In Your Power Network</span>
          </div>
        )}

        {/* Location & Chapter */}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {(business.city || business.state) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{[business.city, business.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {business.chapter && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>
                {business.chapter.toLowerCase().includes("chapter")
                  ? business.chapter
                  : `${business.chapter} Chapter`}
              </span>
            </div>
          )}
        </div>

        {/* Tagline / About */}
        {(business.tagline || business.about) && (
          <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {business.tagline || business.about}
          </p>
        )}

        {/* Why this business matches */}
        {reasons.length > 0 && (
          <div className="mt-3.5 rounded-lg bg-muted/40 p-2.5 border border-border/60">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Why this business matches:
            </p>
            <div className="flex flex-col gap-1">
              {reasons.map((r, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-foreground/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="truncate">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matched Catalogue Highlights */}
        {catalogueItems.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              Catalogue Products & Services:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {catalogueItems.slice(0, 3).map((item, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[11px] font-normal px-2 py-0.5 bg-secondary/80 text-secondary-foreground"
                >
                  {item.name || item}
                </Badge>
              ))}
              {catalogueItems.length > 3 && (
                <span className="text-[11px] text-muted-foreground self-center">
                  +{catalogueItems.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-border">
        <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
          <Link href={`/business/${business.slug || business._id}`}>
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Profile
          </Link>
        </Button>

        {isConnected ? (
          <>
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
              className="px-2.5 text-xs shrink-0"
              title="Open Chat"
            >
              <Link href={`/biz/messages`}>
                <MessageSquare className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </>
        ) : isPending ? (
          <Button size="sm" variant="secondary" disabled className="flex-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Request Pending
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onConnect && onConnect(business)}
            disabled={isConnecting}
            className="flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Add to Network
          </Button>
        )}
      </div>
    </div>
  );
}
