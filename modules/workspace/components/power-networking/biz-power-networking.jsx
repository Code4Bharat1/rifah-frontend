"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Zap,
  Sparkles,
  Plus,
  Search,
  Building2,
  Users,
  Handshake,
  FileStack,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Layers,
  FileText,
  UserPlus,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Badge } from "@shared/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { AppShell } from "@shared/components/rifah/app-shell";
import {
  usePowerNetworkingStats,
  usePowerRequirements,
  usePowerDiscoverBusinesses,
  useMyPowerNetwork,
  useRemoveFromPowerNetwork,
  usePowerRequests,
  useRespondPowerConnection,
  useCancelPowerConnection,
  useChapters,
  useCategories,
} from "@shared/hooks/use-rifah-api";
import { BusinessMatchCard } from "./business-match-card";
import { NetworkMemberCard } from "./network-member-card";
import { RequestItemCard } from "./request-item-card";
import { CreateRequirementModal } from "./create-requirement-modal";
import { RequirementDetailsView } from "./requirement-details-view";
import { ConnectRequestModal } from "./connect-request-modal";
import { RequestQuoteModal } from "./request-quote-modal";

export function BizPowerNetworking() {
  const [activeTab, setActiveTab] = useState("network");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequirementForView, setSelectedRequirementForView] = useState(null);
  const [connectModalTarget, setConnectModalTarget] = useState(null);
  const [quoteModalTarget, setQuoteModalTarget] = useState(null);
  const [quoteModalRequirement, setQuoteModalRequirement] = useState(null);

  // Quick Need search on hero
  const [quickNeedQuery, setQuickNeedQuery] = useState("");

  // Filters for Discover tab
  const [discoverSearch, setDiscoverSearch] = useState("");
  const [discoverCategory, setDiscoverCategory] = useState("all");
  const [discoverChapter, setDiscoverChapter] = useState("all");

  // Filters for My Power Network tab
  const [networkCategory, setNetworkCategory] = useState("all");
  const [networkSearch, setNetworkSearch] = useState("");

  // Requests subtab
  const [requestSubTab, setRequestSubTab] = useState("incoming");

  // Real database stats
  const { data: statsData, isLoading: isStatsLoading } = usePowerNetworkingStats();
  const stats = statsData || {
    myRequirements: 0,
    businessMatches: 0,
    connectionRequests: 0,
    connectedBusinesses: 0,
  };

  // Requirements
  const {
    data: reqsData,
    isLoading: isReqsLoading,
    refetch: refetchReqs,
  } = usePowerRequirements();
  const requirementsList = Array.isArray(reqsData) ? reqsData : reqsData?.requirements || [];

  // My Power Network
  const {
    data: myNetworkData,
    isLoading: isNetworkLoading,
    refetch: refetchNetwork,
  } = useMyPowerNetwork({
    search: networkSearch.trim() || undefined,
    category: networkCategory !== "all" ? networkCategory : undefined,
  });
  const networkBusinesses = Array.isArray(myNetworkData) ? myNetworkData : myNetworkData?.businesses || [];

  // Discover businesses
  const {
    data: discoverData,
    isLoading: isDiscoverLoading,
    refetch: refetchDiscover,
  } = usePowerDiscoverBusinesses({
    search: discoverSearch.trim() || undefined,
    category: discoverCategory !== "all" ? discoverCategory : undefined,
    chapter: discoverChapter !== "all" ? discoverChapter : undefined,
  });
  const discoveredBusinesses = Array.isArray(discoverData)
    ? discoverData
    : discoverData?.businesses || [];

  // Requests
  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    refetch: refetchRequests,
  } = usePowerRequests({
    type: requestSubTab,
  });
  const requestsList = Array.isArray(requestsData)
    ? requestsData
    : requestsData?.requests || [];
  const incomingCount = requestsData?.counts?.incoming ?? stats.incomingRequests ?? 0;
  const outgoingCount = requestsData?.counts?.outgoing ?? stats.outgoingRequests ?? 0;

  // Mutations
  const respondMutation = useRespondPowerConnection();
  const cancelMutation = useCancelPowerConnection();
  const removeMutation = useRemoveFromPowerNetwork();

  // Reference data
  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : chaptersData?.chapters || [];
  const { data: dynamicCategories } = useCategories();
  const categories = Array.isArray(dynamicCategories)
    ? dynamicCategories.map((c) => (typeof c === "string" ? c : c.name || c.title))
    : [];

  const handleQuickNeedSubmit = (e) => {
    e.preventDefault();
    if (!quickNeedQuery.trim()) return;
    setDiscoverSearch(quickNeedQuery.trim());
    setActiveTab("discover");
  };

  const handleRequirementCreated = (createdReq) => {
    refetchReqs();
    if (createdReq?._id) {
      setSelectedRequirementForView(createdReq);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await respondMutation.mutateAsync({ id: requestId, action: "accept" });
      refetchRequests();
      refetchNetwork();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await respondMutation.mutateAsync({ id: requestId, action: "decline" });
      refetchRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelMutation.mutateAsync(requestId);
      refetchRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveFromNetwork = async (connectionId) => {
    try {
      await removeMutation.mutateAsync(connectionId);
      refetchNetwork();
    } catch (e) {
      console.error(e);
    }
  };

  const openQuoteModal = (business, requirement = null) => {
    setQuoteModalTarget(business);
    setQuoteModalRequirement(requirement);
  };

  // Popular category pills for quick filtering
  const quickCategories = [
    "Construction",
    "Manufacturing",
    "Suppliers",
    "Services",
    "IT & Tech",
    "Logistics",
    "Electricals",
  ];

  return (
    <AppShell role="business" title="Power Networking" subtitle="Permanent B2B Network Ecosystem">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Zap className="h-3.5 w-3.5 fill-primary" />
                <span>Build Once. Collaborate Forever.</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Your Trusted RIFAH B2B Power Network
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build a permanent ecosystem of suppliers, contractors, and service providers. Add businesses once and request quotes or collaborate whenever needed without repeated connection requests.
              </p>

              {/* Quick Need Search Bar */}
              <form onSubmit={handleQuickNeedSubmit} className="pt-2 flex items-center gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="I need: e.g. Cement, Steel, Electricals, Tiles..."
                    value={quickNeedQuery}
                    onChange={(e) => setQuickNeedQuery(e.target.value)}
                    className="pl-9 h-10 text-xs bg-background/90"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0"
                >
                  Find Businesses
                </Button>
              </form>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md px-5 py-2.5 h-auto text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Requirement
              </Button>
            </div>
          </div>
        </div>

        {/* Real Database Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab("network")}
            className="cursor-pointer rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">My Power Network</span>
              <Handshake className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {isStatsLoading ? "..." : stats.connectedBusinesses}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Permanent connected partners</p>
          </div>

          <div
            onClick={() => setActiveTab("requirements")}
            className="cursor-pointer rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">My Requirements</span>
              <FileStack className="h-4 w-4 text-primary/70" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {isStatsLoading ? "..." : stats.myRequirements}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active business needs</p>
          </div>

          <div
            onClick={() => setActiveTab("requirements")}
            className="cursor-pointer rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Business Matches</span>
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {isStatsLoading ? "..." : stats.businessMatches}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Relevant matched suppliers</p>
          </div>

          <div
            onClick={() => setActiveTab("requests")}
            className="cursor-pointer rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Connection Requests</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {isStatsLoading ? "..." : stats.connectionRequests}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pending invitations</p>
          </div>
        </div>

        {/* 4 Workspace Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-muted/60 p-1">
            <TabsTrigger value="network" className="text-xs sm:text-sm font-semibold">
              My Power Network
              {stats.connectedBusinesses > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 text-[10px] font-bold">
                  {stats.connectedBusinesses}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="discover" className="text-xs sm:text-sm font-medium">
              Discover Businesses
            </TabsTrigger>
            <TabsTrigger value="requirements" className="text-xs sm:text-sm font-medium">
              My Requirements
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm font-medium relative">
              Requests
              {incomingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                  {incomingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ==================== TAB 1: MY POWER NETWORK (CORE ECOSYSTEM) ==================== */}
          <TabsContent value="network" className="space-y-5">
            {/* Category Filter Chips & Search Bar */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search in your network by name, category, city..."
                    value={networkSearch}
                    onChange={(e) => setNetworkSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  Showing <strong>{networkBusinesses.length}</strong> connected partner{networkBusinesses.length !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                <Button
                  variant={networkCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNetworkCategory("all")}
                  className="h-7 text-xs rounded-full px-3 shrink-0"
                >
                  All Categories
                </Button>
                {quickCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={networkCategory.toLowerCase() === cat.toLowerCase() ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setNetworkCategory(
                        networkCategory.toLowerCase() === cat.toLowerCase() ? "all" : cat.toLowerCase()
                      )
                    }
                    className="h-7 text-xs rounded-full px-3 shrink-0"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Network Members Grid */}
            {isNetworkLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-56 rounded-xl border border-border bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : networkBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {networkBusinesses.map((biz) => (
                  <NetworkMemberCard
                    key={biz._id || biz.connectionId}
                    business={biz}
                    onRequestQuote={(target) => openQuoteModal(target)}
                    onRemove={handleRemoveFromNetwork}
                    isRemoving={removeMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-4">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Handshake className="h-7 w-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-semibold text-base text-foreground">
                    {networkSearch || networkCategory !== "all"
                      ? "No connected businesses match your filter"
                      : "Your Power Network is Empty"}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {networkSearch || networkCategory !== "all"
                      ? "Try clearing your search query or selecting All Categories."
                      : "Discover relevant suppliers and service providers across RIFAH and add them to your permanent Power Network for repeat collaboration."}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  {networkSearch || networkCategory !== "all" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNetworkSearch("");
                        setNetworkCategory("all");
                      }}
                      className="text-xs"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("discover")}
                      className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      <Search className="h-3.5 w-3.5 mr-1.5" />
                      Discover Businesses
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 2: DISCOVER BUSINESSES ==================== */}
          <TabsContent value="discover" className="space-y-5">
            {/* Search and Filters */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by business name, product, service..."
                    value={discoverSearch}
                    onChange={(e) => setDiscoverSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <Select value={discoverCategory} onValueChange={setDiscoverCategory}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="all" className="text-xs">
                      All Categories
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={discoverChapter} onValueChange={setDiscoverChapter}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Chapters" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="all" className="text-xs">
                      All Chapters
                    </SelectItem>
                    {chapters.map((ch) => (
                      <SelectItem key={ch._id || ch.name} value={ch.name} className="text-xs">
                        {ch.name} Chapter
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Discovered Businesses Grid */}
            {isDiscoverLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-64 rounded-xl border border-border bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : discoveredBusinesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveredBusinesses.map((biz) => (
                  <BusinessMatchCard
                    key={biz._id}
                    business={biz}
                    onConnect={(target) => setConnectModalTarget(target)}
                    onRequestQuote={(target) => openQuoteModal(target)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-foreground">No Businesses Found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    We couldn't find any businesses matching your search. Try clearing your filters or searching another keyword.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDiscoverSearch("");
                    setDiscoverCategory("all");
                    setDiscoverChapter("all");
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 3: MY REQUIREMENTS ==================== */}
          <TabsContent value="requirements" className="space-y-5">
            {selectedRequirementForView ? (
              <RequirementDetailsView
                requirement={selectedRequirementForView}
                onBack={() => setSelectedRequirementForView(null)}
                onConnect={(biz, req) => {
                  setConnectModalTarget(biz);
                }}
                onRequestQuote={(biz, req) => {
                  openQuoteModal(biz, req);
                }}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">My Business Requirements</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      View your posted requirements, inspect AI matching suppliers, and connect directly.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Create Requirement
                  </Button>
                </div>

                {isReqsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-28 rounded-xl border border-border bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                ) : requirementsList.length > 0 ? (
                  <div className="space-y-3">
                    {requirementsList.map((req) => (
                      <div
                        key={req._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs hover:border-primary/40 transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground truncate">{req.title}</h4>
                            <Badge variant="outline" className="text-[10px] font-medium border-primary/30 text-primary bg-primary/5">
                              {req.category}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${
                                req.urgency === "Immediate" || req.urgency === "High"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {req.urgency} Urgency
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="font-medium text-foreground">Need: {req.productService}</span>
                            <span>·</span>
                            <span>Qty: {req.quantity}</span>
                            {req.budget && (
                              <>
                                <span>·</span>
                                <span>Budget: {req.budget}</span>
                              </>
                            )}
                            {req.requiredBy && (
                              <>
                                <span>·</span>
                                <span>By: {new Date(req.requiredBy).toLocaleDateString("en-IN")}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequirementForView(req)}
                            className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
                            View Matches ({req.matchesCount || 0})
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FileStack className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-foreground">No Requirements Posted</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Post your first business requirement to let the matching engine discover verified suppliers.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Create Requirement
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ==================== TAB 4: CONNECTION REQUESTS ==================== */}
          <TabsContent value="requests" className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Connection Requests Desk</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage incoming invitations from other businesses and inspect your outgoing requests.
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-muted p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setRequestSubTab("incoming")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    requestSubTab === "incoming"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Incoming Requests {incomingCount > 0 && `(${incomingCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setRequestSubTab("outgoing")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    requestSubTab === "outgoing"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Outgoing Requests {outgoingCount > 0 && `(${outgoingCount})`}
                </button>
              </div>
            </div>

            {/* Requests List */}
            {isRequestsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-32 rounded-xl border border-border bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : requestsList.length > 0 ? (
              <div className="space-y-3">
                {requestsList.map((req) => (
                  <RequestItemCard
                    key={req._id}
                    request={req}
                    isIncoming={requestSubTab === "incoming"}
                    onAccept={handleAcceptRequest}
                    onDecline={handleDeclineRequest}
                    onCancel={handleCancelRequest}
                    isProcessing={respondMutation.isPending || cancelMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-foreground">
                    {requestSubTab === "incoming" ? "No Incoming Requests" : "No Outgoing Requests"}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {requestSubTab === "incoming"
                      ? "You don't have any pending connection requests from other businesses right now."
                      : "You haven't sent any pending connection requests. Browse Discover to find and add businesses."}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal 1: Create Requirement */}
        <CreateRequirementModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleRequirementCreated}
          categories={categories}
        />

        {/* Modal 2: Add to Power Network */}
        <ConnectRequestModal
          isOpen={Boolean(connectModalTarget)}
          onClose={() => setConnectModalTarget(null)}
          targetBusiness={connectModalTarget}
          onSuccess={() => {
            refetchRequests();
            refetchDiscover();
          }}
        />

        {/* Modal 3: Request Quote (RFQ) */}
        <RequestQuoteModal
          isOpen={Boolean(quoteModalTarget)}
          onClose={() => {
            setQuoteModalTarget(null);
            setQuoteModalRequirement(null);
          }}
          targetBusiness={quoteModalTarget}
          initialRequirement={quoteModalRequirement}
        />
      </div>
    </AppShell>
  );
}
