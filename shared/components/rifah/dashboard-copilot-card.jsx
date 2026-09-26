"use client";
import React, { useState } from "react";
import { Bot, Sparkles, Send, ArrowRight, Shield, MapPin, Building2, Search } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import { AiBotAvatar, YellowSparkleIcon } from "./ai-bot-avatar";

const DASHBOARD_SUGGESTIONS = {
  central_admin: [
    { label: "👑 Central Admins", query: "Show all active Central Admins" },
    { label: "🏢 Businesses in Mumbai", query: "List all business in mumbai chapter" },
    { label: "🏛️ Active Chapter Admins", query: "Show active Chapter Admins" },
    { label: "🛡️ Verification Queue", query: "Where is the verification queue?" },
  ],
  state_admin: [
    { label: "🏛️ Chapter Admins", query: "Show active Chapter Admins" },
    { label: "🏢 Businesses in Maharashtra", query: "List all businesses in Maharashtra" },
    { label: "👑 Central Leadership", query: "Who is the Central Admin?" },
    { label: "📍 Regional Chapters", query: "Show active chapters" },
  ],
  chapter_admin: [
    { label: "🏢 Chapter Businesses", query: "List all business in mumbai chapter" },
    { label: "🏛️ Chapter Leadership", query: "Show active Chapter Admins" },
    { label: "👑 Central Admin Contact", query: "Who is the Central Admin?" },
    { label: "🛡️ Member Verification", query: "Where is chapter verification?" },
  ],
  business_owner: [
    { label: "🔍 Discover Businesses", query: "Discover verified businesses in Mumbai" },
    { label: "📬 Buyer Enquiries", query: "Where are my buyer leads and enquiries?" },
    { label: "🛡️ Verification Steps", query: "How to complete business verification?" },
    { label: "🤝 Networking Circles", query: "How does power networking work?" },
  ],
};

export function DashboardCopilotCard({ role, user, className = "" }) {
  const [prompt, setPrompt] = useState("");

  const effectiveRole =
    role === "central_admin" || user?.role === "central_admin"
      ? "central_admin"
      : role === "state_admin" || user?.role === "state_admin"
      ? "state_admin"
      : role === "chapter_admin" || user?.role === "chapter_admin"
      ? "chapter_admin"
      : "business_owner";

  const suggestions = DASHBOARD_SUGGESTIONS[effectiveRole] || DASHBOARD_SUGGESTIONS.business_owner;

  const handleAsk = (queryToAsk) => {
    const q = (queryToAsk || prompt).trim();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-rifah-copilot", {
          detail: { query: q },
        })
      );
    }
    setPrompt("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const roleLabel =
    effectiveRole === "central_admin"
      ? "Central Admin Copilot"
      : effectiveRole === "state_admin"
      ? "State Admin Copilot"
      : effectiveRole === "chapter_admin"
      ? "Chapter Admin Copilot"
      : "Business Copilot";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 sm:p-5 shadow-lg shadow-cyan-950/20",
        className
      )}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <AiBotAvatar className="h-11 w-11 shrink-0" withBadge={true} glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  RIFAH AI Copilot Assistant
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-300/85 line-clamp-1 mt-0.5">
                Chamber Intelligence · Search active businesses, chapters, verification steps, and trade enquiries
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => handleAsk("")}
            className="self-start sm:self-auto h-8 px-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs transition-all shrink-0"
          >
            <span>Open Chatbot</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Interactive Query Input */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/30 transition-all shadow-inner">
          <Search className="h-4 w-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask Copilot anything (e.g. "List all businesses in Mumbai Chapter", "Who is the Central Admin?")...`}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAsk()}
            className="h-7 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs gap-1 cursor-pointer shrink-0 shadow-xs"
          >
            <span>Ask</span>
            <Send className="h-3 w-3" />
          </Button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Quick Ask:
          </span>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(item.query)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-400/50 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
