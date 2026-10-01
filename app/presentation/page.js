"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getSocket } from "@shared/lib/socket";
import { Radio, Users, Sparkles, Award, Clock } from "lucide-react";

export default function PresentationPage() {
  const searchParams = useSearchParams();
  const rawChapter = searchParams.get("c") || "central-mumbai";
  const chapterSlug = rawChapter.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const chapterDisplay = rawChapter.replace(/-/g, " ").toUpperCase();

  const [slideIndex, setSlideIndex] = useState(0);
  const [slideTitle, setSlideTitle] = useState("Welcome / Entrance & Networking");
  const [eventTitle, setEventTitle] = useState("RIFAH Chapter Operations Meet");
  const [eventStatus, setEventStatus] = useState("LIVE");
  const [connected, setConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  // BUG-059: "Appearance for this chapter" (Slogan, Theme & Appearance card in Operations
  // Centre) picked a Navy/Ivory palette that saved to the event document but was never
  // read anywhere — this page was hardcoded to one dark navy/cyan look regardless. Default
  // here matches that old hardcoded look 1:1, so a chapter that never touches the setting
  // sees no change; the admin's live broadcast (or a reconnect replay of it) is what drives
  // an actual re-theme.
  const [appearance, setAppearance] = useState({ primaryColor: "#1e3a5f", darkBg: true });
  const accent = appearance.primaryColor || "#1e3a5f";
  const darkBg = appearance.darkBg !== false;

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket Connection for Real-time projector updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onConnect() {
      setConnected(true);
      socket.emit("projector:join", chapterSlug);
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onUpdate(data) {
      if (data) {
        if (data.slideIndex !== undefined) setSlideIndex(data.slideIndex);
        if (data.slideTitle) setSlideTitle(data.slideTitle);
        if (data.status) setEventStatus(data.status);
        if (data.eventTitle) setEventTitle(data.eventTitle);
        if (data.appearance) setAppearance(data.appearance);
      }
    }

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("projector:update", onUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("projector:update", onUpdate);
    };
  }, [chapterSlug]);

  const borderClass = darkBg ? "border-slate-800/80" : "border-slate-300";
  const mutedTextClass = darkBg ? "text-slate-400" : "text-slate-500";
  const chipTextClass = darkBg ? "text-slate-300" : "text-slate-600";
  const chipBgClass = darkBg ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const headingTextClass = darkBg ? "text-white" : "text-slate-900";

  return (
    <div
      className={`min-h-screen ${headingTextClass} flex flex-col justify-between p-8 sm:p-14 select-none overflow-hidden font-sans`}
      style={{ backgroundColor: darkBg ? "#060b14" : "#faf6ef" }}
    >
      {/* Top Bar: Chapter Brand & Stage Status */}
      <div className={`flex items-center justify-between border-b ${borderClass} pb-6`}>
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-2xl text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: accent, boxShadow: `0 10px 25px -5px ${accent}33` }}
          >
            R
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${headingTextClass}`}>RIFAH CHAMBER OF COMMERCE</h1>
            <p className="text-sm font-bold tracking-widest uppercase" style={{ color: accent }}>
              {chapterDisplay} CHAPTER · OPERATIONS CENTER
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${chipBgClass} ${chipTextClass}`}>
            <Clock className="h-3.5 w-3.5" style={{ color: accent }} />
            <span>{currentTime || "10:00:00 AM"}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{eventStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-6 max-w-5xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-widest"
          style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}4d`, color: accent }}
        >
          <Sparkles className="h-4 w-4" /> SLIDE {slideIndex + 1}
        </div>

        <h2 className={`text-5xl sm:text-7xl font-black ${headingTextClass} tracking-tight leading-tight drop-shadow-md`}>
          {slideTitle}
        </h2>

        <p className={`text-xl sm:text-2xl ${mutedTextClass} font-medium max-w-3xl`}>
          {eventTitle}
        </p>

        {/* Dynamic Visual Indicator */}
        <div className="flex items-center gap-3 pt-6">
          <div className="h-1.5 w-24 rounded-full" style={{ backgroundColor: accent }}></div>
          <div className={`h-1.5 w-8 rounded-full ${darkBg ? "bg-slate-800" : "bg-slate-300"}`}></div>
          <div className={`h-1.5 w-4 rounded-full ${darkBg ? "bg-slate-800" : "bg-slate-300"}`}></div>
        </div>
      </div>

      {/* Bottom Footer: Stage Slogan & Sponsor Strip */}
      <div className={`border-t ${borderClass} pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${mutedTextClass}`}>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          <span className={`font-semibold ${chipTextClass}`}>RIFAH Operations Center · Chapter Event Lifecycle System</span>
        </div>

        <div className={`flex items-center gap-6 text-[11px] font-mono ${mutedTextClass}`}>
          <span>Live Projector: {connected ? "🟢 Online" : "🟡 Reconnecting"}</span>
          <span>Chapter: {chapterDisplay}</span>
        </div>
      </div>
    </div>
  );
}
