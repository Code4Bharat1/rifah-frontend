"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  Maximize2,
  Minimize2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import { copilotApi } from "@shared/lib/api-services";

const ROLE_PRESETS = {
  central_admin: {
    badge: "CENTRAL ADMIN COPILOT",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    suggestions: [
      "Show all active Central Admins",
      "Show active Chapter Admins",
      "List all registered businesses",
      "Where is the verification queue?",
    ],
  },
  state_admin: {
    badge: "STATE ADMIN COPILOT",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    suggestions: [
      "Show active Chapter Admins",
      "Show registered businesses",
      "Who is the Central Admin?",
      "Where are state level conclaves?",
    ],
  },
  chapter_admin: {
    badge: "CHAPTER ADMIN COPILOT",
    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    suggestions: [
      "Show registered businesses",
      "Show active Chapter Admins",
      "Who is the Central Admin?",
      "Where is the chapter verification desk?",
    ],
  },
  business_owner: {
    badge: "BUSINESS COPILOT",
    badgeColor: "bg-primary/15 text-primary border-primary/30",
    suggestions: [
      "Show registered businesses",
      "Show Chapter Admins",
      "Who is the Central Admin?",
      "Where are my buyer leads and enquiries?",
    ],
  },
};

/**
 * Basic lightweight Markdown renderer for Chat messages
 * Converts `[Label](url)` to clickable Next.js links and handles bold / bullet points.
 */
function MarkdownMessage({ content, onLinkClick }) {
  if (!content) return null;

  // Split lines
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed break-words">
      {lines.map((line, idx) => {
        // Headers (### )
        if (line.startsWith("### ")) {
          const headerText = line.replace("### ", "");
          return (
            <h4 key={idx} className="font-bold text-foreground text-sm pt-1 pb-0.5">
              {renderInline(headerText, onLinkClick)}
            </h4>
          );
        }

        // Bullet points (- or *)
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const bulletText = line.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5">
              <span className="text-primary text-sm leading-none">•</span>
              <span className="flex-1">{renderInline(bulletText, onLinkClick)}</span>
            </div>
          );
        }

        // Standard line
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }

        return <p key={idx}>{renderInline(line, onLinkClick)}</p>;
      })}
    </div>
  );
}

function renderInline(text, onLinkClick) {
  if (!text) return null;
  // Clean up any double asterisks wrapping around markdown links: **[Label](url)** -> [Label](url)
  const sanitizedText = text.replace(/\*\*(\[[^\]]+\]\([^)]+\))\*\*/g, "$1");

  // Matches [Label](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(sanitizedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: sanitizedText.substring(lastIndex, match.index),
        key: `text-${lastIndex}`,
      });
    }
    const label = match[1];
    const url = match[2];
    parts.push({
      type: "link",
      label,
      url,
      key: `link-${match.index}`,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < sanitizedText.length) {
    parts.push({
      type: "text",
      content: sanitizedText.substring(lastIndex),
      key: `text-${lastIndex}`,
    });
  }

  return parts.map((part) => {
    if (part.type === "link") {
      return (
        <Link
          key={part.key}
          href={part.url}
          onClick={() => onLinkClick && onLinkClick(part.url)}
          className="inline-flex items-center gap-0.5 font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors mx-0.5"
        >
          <span>{part.label}</span>
          <ExternalLink className="h-3 w-3 inline shrink-0" />
        </Link>
      );
    }

    if (part.content.includes("**")) {
      const boldParts = part.content.split(/\*\*([^*]+)\*\*/g);
      return (
        <span key={part.key}>
          {boldParts.map((bp, bpIdx) =>
            bpIdx % 2 === 1 ? (
              <strong key={`b-${bpIdx}`} className="font-bold text-foreground">
                {bp}
              </strong>
            ) : (
              <React.Fragment key={`t-${bpIdx}`}>{bp}</React.Fragment>
            )
          )}
        </span>
      );
    }

    return <span key={part.key}>{part.content}</span>;
  });
}

export function RifahCopilotWidget({ role, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const effectiveRole =
    role === "central_admin" || user?.role === "central_admin"
      ? "central_admin"
      : role === "state_admin" || user?.role === "state_admin"
        ? "state_admin"
        : role === "chapter_admin" || user?.role === "chapter_admin"
          ? "chapter_admin"
          : "business_owner";

  const preset = ROLE_PRESETS[effectiveRole] || ROLE_PRESETS.business_owner;

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Welcome to RIFAH **${user?.name || "Member"}**! I am your **RIFAH AI Copilot**.\n\nI can help you navigate tools, locate business features, understand verification steps, or discover directory listings tailored to your **${effectiveRole.replace("_", " ")}** permissions.\n\nHow can I help you today?`,
        },
      ]);
    }
  }, [user, effectiveRole, messages.length]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Global event listener to open Copilot from anywhere (dashboard card, header button, etc.)
  useEffect(() => {
    const handleOpenEvent = (e) => {
      setIsOpen(true);
      if (e?.detail?.query) {
        setTimeout(() => {
          handleSend(e.detail.query);
        }, 120);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("open-rifah-copilot", handleOpenEvent);
      return () => window.removeEventListener("open-rifah-copilot", handleOpenEvent);
    }
  }, [effectiveRole]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history format for backend
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          text: m.content,
        }));

      const res = await copilotApi.chat(query, history, effectiveRole);

      if (res && res.data && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: res.data.reply,
            isFallback: res.data.isFallback,
          },
        ]);
      } else {
        throw new Error(res?.message || "Could not retrieve answer.");
      }
    } catch (err) {
      console.error("[COPILOT WIDGET ERROR]", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Sorry, I encountered an issue connecting to the AI service. Please try asking again shortly, or click one of the suggested topics below.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button - positioned safely above mobile BottomNav */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 print:hidden">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-12 px-4 gap-2.5 rounded-full bg-gradient-to-r from-primary via-cyan-600 to-blue-600 text-white font-bold shadow-xl shadow-cyan-900/30 hover:shadow-cyan-500/35 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/25 group cursor-pointer ring-2 ring-cyan-400/20"
            aria-label="Open RIFAH AI Copilot"
          >
            <div className="relative">
              <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
            </div>
            <span className="text-xs sm:text-sm tracking-wide font-extrabold">AI Copilot</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            <span className="h-2 w-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
          </Button>
        )}
      </div>

      {/* Floating Copilot Modal Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-7rem)] flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-label="RIFAH AI Copilot Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm truncate">RIFAH Copilot</span>
                  <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border truncate max-w-[200px]",
                    preset.badgeColor
                  )}
                >
                  {preset.badge}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                onClick={() => setIsOpen(false)}
                aria-label="Close Copilot"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={cn("flex gap-2.5 max-w-[90%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}
                >
                  <div
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    )}
                  >
                    {isUser ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 shadow-xs",
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-xs"
                        : "bg-muted/70 text-foreground border border-border/70 rounded-tl-xs"
                    )}
                  >
                    <MarkdownMessage
                      content={m.content}
                      onLinkClick={() => {
                        // Close widget on mobile screen so user immediately sees navigated page
                        if (typeof window !== "undefined" && window.innerWidth < 768) {
                          setIsOpen(false);
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 mr-auto">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-muted/70 border border-border/70 text-xs text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                  <span>Searching authorized features...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="px-3 pt-2 pb-1.5 border-t border-border/60 bg-muted/20 shrink-0">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Suggested for you:
              </p>
              <span className="text-[10px] text-muted-foreground/60">Click to ask</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[105px] overflow-y-auto no-scrollbar">
              {(preset.suggestions || []).map((s, idx) => {
                const text = typeof s === "string" ? s : (s?.label || s?.prompt || "");
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(text)}
                    disabled={isLoading}
                    title={text}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/80 hover:bg-muted text-foreground/85 hover:text-foreground border border-border/80 hover:border-primary/40 transition-all cursor-pointer disabled:opacity-50 active:scale-95 inline-flex items-center shadow-2xs"
                  >
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-card shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about RIFAH features..."
                className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="h-7 w-7 rounded-lg shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              Permissions enforced by RIFAH RBAC · Responses grounded in Chamber KB
            </p>
          </div>
        </div>
      )}
    </>
  );
}
