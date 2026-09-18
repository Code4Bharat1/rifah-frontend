"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { VerificationBadge } from "@shared/components/rifah/badges";
import { resolveMediaUrl } from "@shared/lib/media";

export function ConnectionCard({ connection }) {
  const biz = connection.connectedBusiness || {};
  const user = connection.connectedUser || {};
  const req = connection.requirement;
  const logoUrl = biz.logo ? resolveMediaUrl(biz.logo) : "";
  const connectedDate = connection.connectedAt
    ? new Date(connection.connectedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Connected";

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-primary/40">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={biz.name}
                className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border bg-muted"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-lg border border-primary/20">
                {biz.name?.charAt(0)?.toUpperCase() || "B"}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base text-card-foreground truncate">
                  {biz.name}
                </h3>
                <VerificationBadge status="verified" size="sm" />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {biz.industry || biz.categories?.[0] || "RIFAH Network Member"}
              </p>
            </div>
          </div>

          <Badge variant="outline" className="shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs px-2 py-0.5 font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {(biz.city || biz.state) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{[biz.city, biz.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {biz.chapter && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>
                {biz.chapter.toLowerCase().includes("chapter")
                  ? biz.chapter
                  : `${biz.chapter} Chapter`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>Since {connectedDate}</span>
          </div>
        </div>

        {req && (
          <div className="mt-3 rounded-lg bg-muted/40 p-2.5 border border-border/60">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Connected Regarding:
            </p>
            <p className="text-xs font-medium text-foreground truncate">
              {req.title || req.productService}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-border">
        <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
          <Link href={`/business/${biz.slug || biz._id}`}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            View Profile
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/biz/messages`}>
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Message
          </Link>
        </Button>
      </div>
    </div>
  );
}
