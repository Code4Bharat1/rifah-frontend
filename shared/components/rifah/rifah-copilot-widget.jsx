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
  GripHorizontal,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import { copilotApi } from "@shared/lib/api-services";
import { AiBotAvatar, YellowSparkleIcon } from "./ai-bot-avatar";

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
  // BUG-036: the widget only ever rendered as a small fixed-size floating
  // panel — Maximize2/Minimize2 were already imported but never wired up to
  // anything. This adds an actual full-screen toggle.
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  // Refs (read/written synchronously) instead of `isLoading` state, which is stale in the
  // render closure when two sends fire back-to-back before a re-render commits — this let a
  // rapid Enter-press race the "open-rifah-copilot" auto-send and reply to the wrong message.
  const sendingRef = useRef(false);
  const requestIdRef = useRef(0);

  // Draggable bot mascot position state & refs
  const BOT_SIZE = 66;
  const MARGIN = 12;
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    isPointerDown: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
  });

  const clampBotPosition = (x, y) => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const maxX = Math.max(MARGIN, window.innerWidth - BOT_SIZE - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - BOT_SIZE - MARGIN);
    return {
      x: Math.min(Math.max(MARGIN, x), maxX),
      y: Math.min(Math.max(MARGIN, y), maxY),
    };
  };

  const getDefaultBotPosition = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const rightOffset = window.innerWidth < 640 ? 16 : 80;
    const bottomOffset = window.innerWidth < 1024 ? 88 : 88;
    return {
      x: Math.max(MARGIN, window.innerWidth - BOT_SIZE - rightOffset),
      y: Math.max(MARGIN, window.innerHeight - BOT_SIZE - bottomOffset),
    };
  };

  // Initialize bot position from localStorage or default on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rifah_copilot_bot_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          setPosition(clampBotPosition(parsed.x, parsed.y));
          return;
        }
      }
    } catch (e) {}
    setPosition(getDefaultBotPosition());
  }, []);

  // Window resize bounds recalculation
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => (prev ? clampBotPosition(prev.x, prev.y) : getDefaultBotPosition()));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pointer drag event handler for mouse and touch
  const handlePointerDown = (e) => {
    if (e.button !== 0) return; // Only primary mouse button / touch
    e.preventDefault();

    const currentPos = position || getDefaultBotPosition();
    dragRef.current = {
      isPointerDown: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y,
      hasMoved: false,
    };

    const onPointerMove = (moveEvt) => {
      if (!dragRef.current.isPointerDown) return;
      const dx = moveEvt.clientX - dragRef.current.startX;
      const dy = moveEvt.clientY - dragRef.current.startY;

      if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
        dragRef.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragRef.current.hasMoved) {
        const newPos = clampBotPosition(
          dragRef.current.initialX + dx,
          dragRef.current.initialY + dy
        );
        setPosition(newPos);
      }
    };

    const onPointerUp = () => {
      if (dragRef.current.isPointerDown) {
        dragRef.current.isPointerDown = false;
        if (dragRef.current.hasMoved) {
          setIsDragging(false);
          setPosition((finalPos) => {
            if (finalPos) {
              try {
                localStorage.setItem("rifah_copilot_bot_pos", JSON.stringify(finalPos));
              } catch (err) {}
            }
            return finalPos;
          });
        } else {
          // Clean click without dragging
          setIsDragging(false);
          setIsOpen(true);
        }
      }
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  // Modal dragging state & refs
  const [modalPos, setModalPos] = useState(null);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const modalDragRef = useRef({
    isPointerDown: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const clampModalPosition = (x, y) => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const modalWidth = Math.min(420, window.innerWidth - 24);
    const modalHeight = Math.min(580, window.innerHeight - 32);
    const maxX = Math.max(MARGIN, window.innerWidth - modalWidth - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - modalHeight - MARGIN);
    return {
      x: Math.min(Math.max(MARGIN, x), maxX),
      y: Math.min(Math.max(MARGIN, y), maxY),
    };
  };

  const getComputedDefaultModalPos = () => {
    if (modalPos) return modalPos;
    if (!position || typeof window === "undefined") return { x: 20, y: 80 };
    const modalWidth = Math.min(420, window.innerWidth - 24);
    const modalHeight = Math.min(580, window.innerHeight - 32);

    let left = position.x + BOT_SIZE / 2 - modalWidth / 2;
    if (left < MARGIN) left = MARGIN;
    if (left + modalWidth > window.innerWidth - MARGIN) {
      left = window.innerWidth - modalWidth - MARGIN;
    }

    let top = position.y - modalHeight - 12;
    if (top < MARGIN) {
      top = position.y + BOT_SIZE + 12;
    }
    if (top + modalHeight > window.innerHeight - MARGIN) {
      top = window.innerHeight - modalHeight - MARGIN;
    }
    if (top < MARGIN) top = MARGIN;

    return { x: left, y: top };
  };

  const handleModalHeaderPointerDown = (e) => {
    if (isFullscreen || e.button !== 0) return;
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest("input")) return;
    e.preventDefault();

    const currentPos = getComputedDefaultModalPos();
    modalDragRef.current = {
      isPointerDown: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y,
    };
    setIsDraggingModal(true);

    const onModalMove = (moveEvt) => {
      if (!modalDragRef.current.isPointerDown) return;
      const dx = moveEvt.clientX - modalDragRef.current.startX;
      const dy = moveEvt.clientY - modalDragRef.current.startY;
      const newPos = clampModalPosition(
        modalDragRef.current.initialX + dx,
        modalDragRef.current.initialY + dy
      );
      setModalPos(newPos);
    };

    const onModalUp = () => {
      modalDragRef.current.isPointerDown = false;
      setIsDraggingModal(false);
      window.removeEventListener("pointermove", onModalMove);
      window.removeEventListener("pointerup", onModalUp);
      window.removeEventListener("pointercancel", onModalUp);
    };

    window.addEventListener("pointermove", onModalMove);
    window.addEventListener("pointerup", onModalUp);
    window.addEventListener("pointercancel", onModalUp);
  };

  // Compute smart modal placement relative to bot location or custom dragged pos
  const getModalStyle = () => {
    if (isFullscreen || typeof window === "undefined") {
      return {};
    }
    const modalWidth = Math.min(420, window.innerWidth - 24);
    const modalHeight = Math.min(580, window.innerHeight - 32);

    if (modalPos) {
      return {
        left: `${modalPos.x}px`,
        top: `${modalPos.y}px`,
        width: `${modalWidth}px`,
        height: `${modalHeight}px`,
      };
    }

    if (!position) return {};

    let left = position.x + BOT_SIZE / 2 - modalWidth / 2;
    if (left < MARGIN) left = MARGIN;
    if (left + modalWidth > window.innerWidth - MARGIN) {
      left = window.innerWidth - modalWidth - MARGIN;
    }

    let top = position.y - modalHeight - 12;
    if (top < MARGIN) {
      // If not enough room on top, open below
      top = position.y + BOT_SIZE + 12;
    }
    if (top + modalHeight > window.innerHeight - MARGIN) {
      top = window.innerHeight - modalHeight - MARGIN;
    }
    if (top < MARGIN) top = MARGIN;

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${modalWidth}px`,
      height: `${modalHeight}px`,
    };
  };

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
    if (!query || sendingRef.current) return;
    sendingRef.current = true;
    const myRequestId = ++requestIdRef.current;

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
      if (myRequestId !== requestIdRef.current) return; // a newer send superseded this one

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
      if (myRequestId !== requestIdRef.current) return;
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
      if (myRequestId === requestIdRef.current) {
        sendingRef.current = false;
        setIsLoading(false);
      }
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
      {/* Floating Draggable Mascot Trigger Button */}
      {!isOpen && (
        <div
          style={
            position
              ? {
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  touchAction: "none",
                }
              : undefined
          }
          className={cn(
            "fixed z-50 print:hidden select-none",
            !position && "bottom-6 lg:bottom-20 right-4 sm:right-20",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
        >
          <div
            onPointerDown={handlePointerDown}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
            tabIndex={0}
            role="button"
            className={cn(
              "group relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-transparent select-none transition-shadow duration-200 outline-none",
              isDragging
                ? "cursor-grabbing scale-105 drop-shadow-[0_14px_32px_rgba(0,140,255,0.85)]"
                : "cursor-grab drop-shadow-[0_8px_20px_rgba(0,100,255,0.45)] hover:drop-shadow-[0_12px_28px_rgba(0,140,255,0.7)]"
            )}
            aria-label="RIFAH AI Copilot (Drag anywhere or click to open)"
            title="Drag to move anywhere • Click to chat"
          >
            {/* Bot Mascot Image */}
            <AiBotAvatar className="h-full w-full object-contain pointer-events-none" glow={true} />

            {/* Vibrant Green Status Indicator dot on top-right */}
            <div className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center pointer-events-none">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E676] opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00E676] border-2 border-white shadow-[0_0_8px_#00E676]" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Copilot Modal Window */}
      {isOpen && (
        <div
          style={getModalStyle()}
          className={cn(
            "fixed z-50 flex flex-col bg-card border border-border/80 shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-200",
            isFullscreen
              ? "inset-2 sm:inset-6 rounded-2xl !w-auto !h-auto !left-2 sm:!left-6 !top-2 sm:!top-6"
              : !position && "bottom-20 lg:bottom-6 right-4 sm:right-6 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-7rem)] rounded-2xl"
          )}
          role="dialog"
          aria-label="RIFAH AI Copilot Assistant"
        >
          {/* Header */}
          <div
            onPointerDown={handleModalHeaderPointerDown}
            className={cn(
              "flex items-center justify-between px-3.5 py-3 border-b border-border bg-muted/40 shrink-0 select-none",
              !isFullscreen && (isDraggingModal ? "cursor-grabbing" : "cursor-grab")
            )}
            title={!isFullscreen ? "Drag header to move chat window" : undefined}
          >
            <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
              <AiBotAvatar className="h-9 w-9 shrink-0" withBadge={true} glow={true} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm truncate">RIFAH Copilot</span>
                  <span className="text-[10px] text-[#00E676] font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    Online
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border truncate max-w-[170px]",
                    preset.badgeColor
                  )}
                >
                  {preset.badge}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!isFullscreen && (
                <div className="hidden sm:flex items-center text-muted-foreground/45 mr-1 pointer-events-none" title="Drag to move">
                  <GripHorizontal className="h-4 w-4" />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                onClick={() => setIsFullscreen((v) => !v)}
                aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
                title={isFullscreen ? "Exit full screen" : "Full screen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  setModalPos(null);
                }}
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
                  {isUser ? (
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold bg-primary text-primary-foreground">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
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
                <AiBotAvatar className="h-7 w-7 shrink-0" withBadge={true} />
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
