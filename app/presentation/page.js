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

  return (
    <div className="min-h-screen bg-[#060b14] text-white flex flex-col justify-between p-8 sm:p-14 select-none overflow-hidden font-sans">
      {/* Top Bar: Chapter Brand & Stage Status */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            R
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">RIFAH CHAMBER OF COMMERCE</h1>
            <p className="text-sm font-bold text-cyan-400 tracking-widest uppercase">
              {chapterDisplay} CHAPTER · OPERATIONS CENTER
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-bold uppercase tracking-widest">
          <Sparkles className="h-4 w-4" /> SLIDE {slideIndex + 1}
        </div>

        <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-md">
          {slideTitle}
        </h2>

        <p className="text-xl sm:text-2xl text-slate-400 font-medium max-w-3xl">
          {eventTitle}
        </p>

        {/* Dynamic Visual Indicator */}
        <div className="flex items-center gap-3 pt-6">
          <div className="h-1.5 w-24 rounded-full bg-cyan-500"></div>
          <div className="h-1.5 w-8 rounded-full bg-slate-800"></div>
          <div className="h-1.5 w-4 rounded-full bg-slate-800"></div>
        </div>
      </div>

      {/* Bottom Footer: Stage Slogan & Sponsor Strip */}
      <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-slate-300">RIFAH Operations Center · Chapter Event Lifecycle System</span>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400">
          <span>Live Projector: {connected ? "🟢 Online" : "🟡 Reconnecting"}</span>
          <span>Chapter: {chapterDisplay}</span>
        </div>
      </div>
    </div>
  );
}
