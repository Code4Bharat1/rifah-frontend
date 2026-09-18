"use client";

import React, { useState } from "react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Building2,
  Calendar,
  MapPin,
  Package,
  Search,
  Sparkles,
  Zap,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { usePowerRequirementMatches, useChapters } from "@shared/hooks/use-rifah-api";
import { BusinessMatchCard } from "./business-match-card";
import { ConnectRequestModal } from "./connect-request-modal";
import { RequestQuoteModal } from "./request-quote-modal";

export function RequirementDetailsView({
  requirement,
  onBack,
  onConnect,
  onRequestQuote,
}) {
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [connectModalTarget, setConnectModalTarget] = useState(null);
  const [quoteModalTarget, setQuoteModalTarget] = useState(null);

  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : chaptersData?.chapters || [];

  const {
    data: matchesData,
    isLoading: isMatchesLoading,
    refetch: refetchMatches,
  } = usePowerRequirementMatches(requirement?._id, {
    chapter: selectedChapter !== "all" ? selectedChapter : undefined,
  });

  const matchesList = matchesData?.businesses || [];
  const totalMatches = matchesData?.totalMatches ?? matchesList.length;

  const filteredMatches = React.useMemo(() => {
    if (!search.trim()) return matchesList;
    const q = search.toLowerCase();
    return matchesList.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.industry?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q)
    );
  }, [matchesList, search]);

  const requiredByFormatted = requirement?.requiredBy
    ? new Date(requirement.requiredBy).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Zap className="h-3.5 w-3.5 fill-primary" />
                <span>AI Matched Suppliers</span>
              </span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                {totalMatches} {totalMatches === 1 ? "Match Found" : "Matches Found"}
              </Badge>
            </div>
            <h3 className="text-base font-bold text-foreground mt-0.5">{requirement?.title}</h3>
          </div>
        </div>
      </div>

      {/* Requirement Overview Card */}
      {requirement && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Product / Service</span>
              <span className="font-semibold text-foreground">{requirement.productService}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Category</span>
              <span className="font-semibold text-foreground">{requirement.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Quantity</span>
              <span className="font-semibold text-foreground">{requirement.quantity}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Required By</span>
              <span className="font-semibold text-foreground">{requiredByFormatted}</span>
            </div>
          </div>

          {(requirement.location || requirement.budget || requirement.description) && (
            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-3 text-xs flex-wrap">
              {requirement.location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{requirement.location}</span>
                </div>
              )}
              {requirement.budget && (
                <div className="text-muted-foreground">
                  <span>Target Budget: </span>
                  <span className="font-medium text-foreground">{requirement.budget}</span>
                </div>
              )}
              {requirement.description && (
                <p className="w-full text-xs text-muted-foreground italic">
                  "{requirement.description}"
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search matching suppliers by name, product, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <Select value={selectedChapter} onValueChange={setSelectedChapter}>
          <SelectTrigger className="w-full sm:w-48 text-xs">
            <SelectValue placeholder="All Chapters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Chapters
            </SelectItem>
            {chapters.map((ch) => (
              <SelectItem key={ch._id || ch.name} value={ch.name} className="text-xs">
                {ch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Matching Results Grid */}
      <div className="space-y-4 pt-1">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Relevant Suppliers ({filteredMatches.length})
        </h4>

        {isMatchesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-muted/60 animate-pulse border border-border" />
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((biz) => (
              <BusinessMatchCard
                key={biz._id}
                business={biz}
                requirementTitle={requirement?.title}
                onConnect={(target) => {
                  if (onConnect) onConnect(target, requirement);
                  else setConnectModalTarget(target);
                }}
                onRequestQuote={(target) => {
                  if (onRequestQuote) onRequestQuote(target, requirement);
                  else setQuoteModalTarget(target);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center bg-card">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold">No Matching Businesses Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              We couldn't find businesses matching this specific requirement yet. Try broadening your location filter or explore the RIFAH directory.
            </p>
          </div>
        )}
      </div>

      {/* Connection Modal */}
      {connectModalTarget && (
        <ConnectRequestModal
          isOpen={Boolean(connectModalTarget)}
          onClose={() => setConnectModalTarget(null)}
          targetBusiness={connectModalTarget}
          requirement={requirement}
          onSuccess={() => {
            refetchMatches();
          }}
        />
      )}

      {/* Quote Modal */}
      {quoteModalTarget && (
        <RequestQuoteModal
          isOpen={Boolean(quoteModalTarget)}
          onClose={() => setQuoteModalTarget(null)}
          targetBusiness={quoteModalTarget}
          initialRequirement={requirement}
        />
      )}
    </div>
  );
}
