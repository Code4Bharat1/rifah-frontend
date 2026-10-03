"use client";

import React, { useState, useEffect, useRef, useCallback, useReducer } from "react";
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Eye, Save, Download, Plus, Trash2, Lock,
  Unlock, EyeOff, ChevronUp, ChevronDown, Copy, AlignCenter, AlignLeft,
  AlignRight, Move, Type, Image as ImageIcon, Layers, Settings, FileText,
  CheckCircle2, Loader2, RotateCcw, Grid, Maximize2, X, Palette, Pen,
  Sparkles, LayoutTemplate, QrCode, Minus, GripVertical, Bold, Italic,
  Underline as UnderlineIcon
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { toast } from "sonner";
import { eventApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { cn } from "@shared/lib/utils";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CANVAS_W = 842;
const CANVAS_H = 595;

const CERTIFICATE_STYLES = [
  { id: "rifah-signature", name: "RIFAH Signature", accent: "#0088d1" },
  { id: "royal-heritage", name: "Royal Heritage", accent: "#7c3aed" },
  { id: "executive-gold", name: "Executive Gold", accent: "#d97706" },
  { id: "professional-frame", name: "Professional Frame", accent: "#0f172a" },
  { id: "premium-achievement", name: "Premium Achievement", accent: "#dc2626" },
  { id: "clean-prestige", name: "Clean Prestige", accent: "#10b981" },
];

const FONTS = [
  { value: "Inter, sans-serif", label: "Inter (Modern)" },
  { value: "Georgia, serif", label: "Georgia (Classic)" },
  { value: "'Times New Roman', serif", label: "Times New Roman (Elegant)" },
  { value: "'Playfair Display', serif", label: "Playfair Display (Luxury)" },
  { value: "'Montserrat', sans-serif", label: "Montserrat (Bold)" },
  { value: "Courier, monospace", label: "Courier (Typewriter)" },
];

const DYNAMIC_VARS = [
  { var: "{{participantName}}", label: "Participant Name" },
  { var: "{{eventName}}", label: "Event Name" },
  { var: "{{eventDate}}", label: "Event Date" },
  { var: "{{chapterName}}", label: "Chapter Name" },
  { var: "{{venue}}", label: "Venue" },
  { var: "{{certificateNumber}}", label: "Certificate Number" },
  { var: "{{designation}}", label: "Designation" },
];

// ─── ELEMENT FACTORY ──────────────────────────────────────────────────────────

const makeId = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const defaultElements = (accentColor = "#0088d1") => [
  {
    id: makeId(), type: "logo", label: "RIFAH Logo",
    x: CANVAS_W / 2 - 60, y: 30, width: 120, height: 60, rotation: 0, opacity: 1,
    locked: false, hidden: false, src: "/rifah-logo.png",
  },
  {
    id: makeId(), type: "text", label: "Organization Name",
    x: 0, y: 105, width: CANVAS_W, height: 40, rotation: 0, opacity: 1,
    locked: false, hidden: false,
    content: "RIFAH CHAMBER OF COMMERCE", fontFamily: "Georgia, serif",
    fontSize: 22, fontWeight: "bold", fontStyle: "normal", textDecoration: "none",
    color: "#0b1f33", align: "center", letterSpacing: 3, lineHeight: 1.2,
  },
  {
    id: makeId(), type: "divider", label: "Divider",
    x: CANVAS_W / 2 - 200, y: 152, width: 400, height: 2, rotation: 0, opacity: 1,
    locked: false, hidden: false, color: accentColor,
  },
  {
    id: makeId(), type: "text", label: "Certificate Title",
    x: 0, y: 165, width: CANVAS_W, height: 60, rotation: 0, opacity: 1,
    locked: false, hidden: false,
    content: "CERTIFICATE OF PARTICIPATION", fontFamily: "'Montserrat', sans-serif",
    fontSize: 32, fontWeight: "bold", fontStyle: "normal", textDecoration: "none",
    color: accentColor, align: "center", letterSpacing: 4, lineHeight: 1.2,
  },
  {
    id: makeId(), type: "text", label: "Presented To Label",
    x: 0, y: 240, width: CANVAS_W, height: 25, rotation: 0, opacity: 1,
    locked: false, hidden: false,
    content: "This certificate is proudly presented to", fontFamily: "Georgia, serif",
    fontSize: 14, fontWeight: "normal", fontStyle: "italic", textDecoration: "none",
    color: "#64748b", align: "center", letterSpacing: 1, lineHeight: 1.4,
  },
  {
    id: makeId(), type: "participantName", label: "Participant Name",
    x: 0, y: 272, width: CANVAS_W, height: 56, rotation: 0, opacity: 1,
    locked: false, hidden: false,
    content: "{{participantName}}", fontFamily: "Georgia, serif",
    fontSize: 40, fontWeight: "bold", fontStyle: "normal", textDecoration: "none",
    color: "#0b1f33", align: "center", letterSpacing: 1, lineHeight: 1.2,
  },
  {
    id: makeId(), type: "divider", label: "Name Underline",
    x: CANVAS_W / 2 - 160, y: 338, width: 320, height: 2, rotation: 0, opacity: 1,
    locked: false, hidden: false, color: accentColor,
  },
  {
    id: makeId(), type: "text", label: "Event Details",
    x: 0, y: 352, width: CANVAS_W, height: 60, rotation: 0, opacity: 1,
    locked: false, hidden: false,
    content: "For participating in {{eventName}}\nheld on {{eventDate}} at {{venue}}", fontFamily: "Georgia, serif",
    fontSize: 13, fontWeight: "normal", fontStyle: "normal", textDecoration: "none",
    color: "#444444", align: "center", letterSpacing: 0.5, lineHeight: 1.5,
  },
  {
    id: makeId(), type: "signatory", label: "Primary Signatory",
    x: 130, y: 460, width: 180, height: 110, rotation: 0, opacity: 1,
    locked: false, hidden: false,
    name: "", role: "Chapter President", signatureImg: "",
  },
  {
    id: makeId(), type: "signatory", label: "Secondary Signatory",
    x: 530, y: 460, width: 180, height: 110, rotation: 0, opacity: 1,
    locked: false, hidden: false,
    name: "", role: "Chapter Secretary", signatureImg: "",
  },
];

// ─── UNDO/REDO REDUCER ────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

function historyReducer(state, action) {
  switch (action.type) {
    case "PUSH": {
      const past = [...state.past.slice(-MAX_HISTORY + 1), state.present];
      return { past, present: action.payload, future: [] };
    }
    case "UNDO": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] };
    }
    case "REDO": {
      if (!state.future.length) return state;
      const next = state.future[0];
      return { past: [...state.past, state.present], present: next, future: state.future.slice(1) };
    }
    default:
      return state;
  }
}

// ─── CANVAS ELEMENT RENDERER ──────────────────────────────────────────────────

function CanvasElement({ el, isSelected, scale, onSelect, onDragStart, sampleData }) {
  const style = {
    position: "absolute",
    left: `${el.x * scale}px`,
    top: `${el.y * scale}px`,
    width: `${el.width * scale}px`,
    height: `${el.height * scale}px`,
    transform: `rotate(${el.rotation || 0}deg)`,
    opacity: el.opacity ?? 1,
    cursor: el.locked ? "not-allowed" : "move",
    display: el.hidden ? "none" : undefined,
    boxSizing: "border-box",
    outline: isSelected ? `2px solid #3b82f6` : "none",
    outlineOffset: "1px",
    userSelect: "none",
  };

  const interpolate = (text) => {
    if (!text) return "";
    return text
      .replace(/\{\{participantName\}\}/g, sampleData?.participantName || "Jane Smith")
      .replace(/\{\{eventName\}\}/g, sampleData?.eventName || "RIFAH Summit 2026")
      .replace(/\{\{eventDate\}\}/g, sampleData?.eventDate || "October 3, 2026")
      .replace(/\{\{chapterName\}\}/g, sampleData?.chapterName || "Mumbai Chapter")
      .replace(/\{\{venue\}\}/g, sampleData?.venue || "Grand Hall, Mumbai")
      .replace(/\{\{certificateNumber\}\}/g, sampleData?.certificateNumber || "RIFAH-2026-001")
      .replace(/\{\{designation\}\}/g, sampleData?.designation || "Member");
  };

  const handleMouseDown = (e) => {
    if (el.locked) return;
    e.stopPropagation();
    onSelect(el.id);
    onDragStart(e, el.id);
  };

  if (el.type === "text" || el.type === "participantName") {
    return (
      <div style={style} onMouseDown={handleMouseDown}>
        <div style={{
          width: "100%", height: "100%", overflow: "hidden",
          fontFamily: el.fontFamily, fontSize: `${el.fontSize * scale}px`,
          fontWeight: el.fontWeight, fontStyle: el.fontStyle,
          textDecoration: el.textDecoration,
          color: el.color, textAlign: el.align,
          letterSpacing: `${(el.letterSpacing || 0) * scale}px`,
          lineHeight: el.lineHeight,
          whiteSpace: "pre-line",
          display: "flex", alignItems: "center", justifyContent:
            el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
        }}>
          <span>{interpolate(el.content)}</span>
        </div>
      </div>
    );
  }

  if (el.type === "logo" || el.type === "image") {
    return (
      <div style={style} onMouseDown={handleMouseDown}>
        <img
          src={el.src || "/rifah-logo.png"}
          alt={el.label}
          style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
          draggable={false}
          onError={(e) => { e.target.style.opacity = 0.3; }}
        />
      </div>
    );
  }

  if (el.type === "divider") {
    return (
      <div style={{ ...style, height: `${Math.max(1, el.height) * scale}px` }} onMouseDown={handleMouseDown}>
        <div style={{ width: "100%", height: "100%", backgroundColor: el.color || "#cccccc" }} />
      </div>
    );
  }

  if (el.type === "signatory") {
    return (
      <div style={{ ...style, display: el.hidden ? "none" : "flex", flexDirection: "column", alignItems: "center" }}
        onMouseDown={handleMouseDown}>
        {el.signatureImg ? (
          <img src={resolveMediaUrl(el.signatureImg)} alt="Signature"
            style={{ height: `${40 * scale}px`, objectFit: "contain", marginBottom: "4px" }} draggable={false} />
        ) : (
          <div style={{ height: `${40 * scale}px` }} />
        )}
        <div style={{ width: "100%", height: "1px", backgroundColor: "#0b1f33" }} />
        <p style={{ fontSize: `${11 * scale}px`, color: "#0b1f33", fontWeight: "bold", marginTop: "4px", textAlign: "center" }}>
          {el.name || "Signatory Name"}
        </p>
        <p style={{ fontSize: `${10 * scale}px`, color: "#64748b", textAlign: "center" }}>{el.role}</p>
      </div>
    );
  }

  if (el.type === "qr") {
    return (
      <div style={{ ...style, border: "2px dashed #cbd5e1", display: el.hidden ? "none" : "flex", alignItems: "center", justifyContent: "center" }}
        onMouseDown={handleMouseDown}>
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: `${10 * scale}px` }}>
          <QrCode style={{ width: `${30 * scale}px`, height: `${30 * scale}px`, margin: "0 auto 4px" }} />
          QR Code
        </div>
      </div>
    );
  }

  return null;
}

// ─── RESIZE HANDLES ───────────────────────────────────────────────────────────

function ResizeHandles({ el, scale, onResizeStart }) {
  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  const cursors = { nw: "nw-resize", n: "n-resize", ne: "ne-resize", e: "e-resize", se: "se-resize", s: "s-resize", sw: "sw-resize", w: "w-resize" };

  const getPos = (handle) => {
    const cx = el.x * scale;
    const cy = el.y * scale;
    const w = el.width * scale;
    const h = el.height * scale;
    const map = {
      nw: [cx, cy], n: [cx + w / 2, cy], ne: [cx + w, cy],
      e: [cx + w, cy + h / 2], se: [cx + w, cy + h],
      s: [cx + w / 2, cy + h], sw: [cx, cy + h], w: [cx, cy + h / 2],
    };
    return map[handle];
  };

  return (
    <>
      {handles.map(h => {
        const [lx, ly] = getPos(h);
        return (
          <div key={h}
            onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, h); }}
            style={{
              position: "absolute", left: `${lx - 5}px`, top: `${ly - 5}px`,
              width: 10, height: 10, backgroundColor: "white", border: "2px solid #3b82f6",
              borderRadius: 2, cursor: cursors[h], zIndex: 9999,
            }}
          />
        );
      })}
    </>
  );
}

// ─── PROPERTY PANEL ───────────────────────────────────────────────────────────

function PropertyPanel({ element, onChange, eventId, onUploadSig, sigUploading }) {
  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-6">
        <Settings className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">No element selected</p>
        <p className="text-xs mt-1 opacity-70">Click an element on the canvas to edit its properties</p>
      </div>
    );
  }

  const set = (key, val) => onChange({ ...element, [key]: val });

  const SectionLabel = ({ children }) => (
    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 mb-2 mt-4">{children}</p>
  );

  const FieldRow = ({ label, children }) => (
    <div className="flex items-center gap-2 mb-2">
      <label className="text-[10px] text-slate-500 w-20 shrink-0 font-medium">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );

  const NumInput = ({ val, k, min, max, step = 1 }) => (
    <Input type="number" min={min} max={max} step={step} value={val ?? 0} onChange={e => set(k, Number(e.target.value))}
      className="h-7 text-xs px-2 border-slate-200" />
  );

  const ColPicker = ({ val, k }) => (
    <div className="flex gap-1">
      <input type="color" value={val || "#000000"} onChange={e => set(k, e.target.value)} className="h-7 w-8 rounded border p-0.5 cursor-pointer" />
      <Input type="text" value={val || "#000000"} onChange={e => set(k, e.target.value)} className="h-7 text-xs px-2 font-mono border-slate-200 flex-1" />
    </div>
  );

  return (
    <div className="p-4 overflow-y-auto custom-scrollbar h-full">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
        <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
          {element.type === "text" || element.type === "participantName" ? <Type className="h-3.5 w-3.5 text-blue-500" /> :
           element.type === "logo" || element.type === "image" ? <ImageIcon className="h-3.5 w-3.5 text-blue-500" /> :
           element.type === "divider" ? <Minus className="h-3.5 w-3.5 text-blue-500" /> :
           element.type === "signatory" ? <Pen className="h-3.5 w-3.5 text-blue-500" /> :
           <Settings className="h-3.5 w-3.5 text-blue-500" />}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700">{element.label || element.type}</p>
          <p className="text-[9px] text-slate-400 capitalize">{element.type}</p>
        </div>
      </div>

      {/* Position & Size */}
      <SectionLabel>Position & Size</SectionLabel>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div><label className="text-[9px] text-slate-400 font-medium">X</label><NumInput val={Math.round(element.x)} k="x" /></div>
        <div><label className="text-[9px] text-slate-400 font-medium">Y</label><NumInput val={Math.round(element.y)} k="y" /></div>
        <div><label className="text-[9px] text-slate-400 font-medium">Width</label><NumInput val={Math.round(element.width)} k="width" min={10} /></div>
        <div><label className="text-[9px] text-slate-400 font-medium">Height</label><NumInput val={Math.round(element.height)} k="height" min={4} /></div>
      </div>
      <FieldRow label="Rotation"><NumInput val={element.rotation ?? 0} k="rotation" min={-360} max={360} /></FieldRow>
      <FieldRow label="Opacity"><NumInput val={element.opacity ?? 1} k="opacity" min={0} max={1} step={0.05} /></FieldRow>

      {/* Text properties */}
      {(element.type === "text" || element.type === "participantName") && (
        <>
          <SectionLabel>Text Content</SectionLabel>
          <div className="mb-2">
            <textarea value={element.content} onChange={e => set("content", e.target.value)}
              rows={3} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none" />
          </div>

          <SectionLabel>Typography</SectionLabel>
          <div className="mb-2">
            <Select value={element.fontFamily} onValueChange={v => set("fontFamily", v)}>
              <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONTS.map(f => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div><label className="text-[9px] text-slate-400">Size (px)</label><NumInput val={element.fontSize} k="fontSize" min={6} max={200} /></div>
            <div><label className="text-[9px] text-slate-400">Spacing</label><NumInput val={element.letterSpacing} k="letterSpacing" min={-5} max={30} step={0.5} /></div>
          </div>
          <div className="flex gap-1 mb-2">
            {[
              { icon: <Bold className="w-3 h-3"/>, key: "fontWeight", on: "bold", off: "normal", active: element.fontWeight === "bold" },
              { icon: <Italic className="w-3 h-3"/>, key: "fontStyle", on: "italic", off: "normal", active: element.fontStyle === "italic" },
              { icon: <UnderlineIcon className="w-3 h-3"/>, key: "textDecoration", on: "underline", off: "none", active: element.textDecoration === "underline" },
            ].map(btn => (
              <button key={btn.key} onClick={() => set(btn.key, btn.active ? btn.off : btn.on)}
                className={cn("h-7 w-7 flex items-center justify-center rounded border text-xs font-semibold",
                  btn.active ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
                {btn.icon}
              </button>
            ))}
            <div className="flex gap-1 ml-auto">
              {["left", "center", "right"].map(a => (
                <button key={a} onClick={() => set("align", a)}
                  className={cn("h-7 w-7 flex items-center justify-center rounded border text-xs",
                    element.align === a ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
                  {a === "left" ? <AlignLeft className="w-3 h-3"/> : a === "center" ? <AlignCenter className="w-3 h-3"/> : <AlignRight className="w-3 h-3"/>}
                </button>
              ))}
            </div>
          </div>
          <FieldRow label="Color"><ColPicker val={element.color} k="color" /></FieldRow>

          <SectionLabel>Dynamic Variables</SectionLabel>
          <div className="flex flex-wrap gap-1">
            {DYNAMIC_VARS.map(v => (
              <button key={v.var} onClick={() => set("content", (element.content || "") + v.var)}
                className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 font-mono">{v.var}</button>
            ))}
          </div>
        </>
      )}

      {/* Logo / Image properties */}
      {(element.type === "logo" || element.type === "image") && (
        <>
          <SectionLabel>Image</SectionLabel>
          <div className="mb-2">
            {element.src ? (
              <div className="relative group mb-2">
                <img src={element.src} className="w-full h-16 object-contain border rounded bg-slate-50" />
              </div>
            ) : null}
            <div className="relative h-9 border border-dashed border-slate-200 rounded flex items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs text-slate-500 overflow-hidden">
              Replace Image
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    set("src", url);
                    set("_file", file);
                  }
                  e.target.value = "";
                }} />
            </div>
          </div>
        </>
      )}

      {/* Divider properties */}
      {element.type === "divider" && (
        <>
          <SectionLabel>Divider</SectionLabel>
          <FieldRow label="Color"><ColPicker val={element.color} k="color" /></FieldRow>
        </>
      )}

      {/* Signatory properties */}
      {element.type === "signatory" && (
        <>
          <SectionLabel>Signatory Info</SectionLabel>
          <FieldRow label="Name">
            <Input value={element.name || ""} onChange={e => set("name", e.target.value)} className="h-7 text-xs border-slate-200" placeholder="Full Name" />
          </FieldRow>
          <FieldRow label="Role">
            <Input value={element.role || ""} onChange={e => set("role", e.target.value)} className="h-7 text-xs border-slate-200" placeholder="Designation" />
          </FieldRow>

          <SectionLabel>Signature Image</SectionLabel>
          <div className="mb-2">
            {element.signatureImg ? (
              <div className="relative group mb-2">
                <img src={resolveMediaUrl(element.signatureImg)} className="w-full h-12 object-contain border rounded bg-white p-1" />
                <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 text-[9px] text-white font-semibold transition-opacity rounded flex items-center justify-center"
                  onClick={() => set("signatureImg", "")}>Remove</button>
              </div>
            ) : null}
            <div className="relative h-9 border border-dashed border-slate-200 rounded flex items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs text-slate-500 overflow-hidden">
              {sigUploading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Uploading...</> : "Upload Signature"}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={sigUploading}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && onUploadSig) onUploadSig(element.id, file);
                  e.target.value = "";
                }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── LEFT PANEL ───────────────────────────────────────────────────────────────

function LeftPanel({ activeSection, onSetSection, onAddElement, currentStyle, onSelectStyle, accentColor, onAccentChange, elements, selectedId, onSelectElement, onToggleHidden, onToggleLocked, onMoveLayer, onDeleteElement, logoPreview, logoImage, logoUploading, onLogoUpload, onLogoRemove }) {
  const sidebarItems = [
    { id: "templates", icon: <LayoutTemplate className="w-4 h-4" />, label: "Templates" },
    { id: "elements", icon: <Plus className="w-4 h-4" />, label: "Elements" },
    { id: "layers", icon: <Layers className="w-4 h-4" />, label: "Layers" },
    { id: "brand", icon: <Sparkles className="w-4 h-4" />, label: "Brand Kit" },
  ];

  return (
    <div className="flex h-full border-r border-slate-200">
      {/* Icon sidebar */}
      <div className="w-14 bg-slate-900 flex flex-col items-center py-4 gap-1 shrink-0">
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => onSetSection(item.id)}
            title={item.label}
            className={cn("w-10 h-10 flex flex-col items-center justify-center rounded-xl gap-0.5 transition-all",
              activeSection === item.id ? "bg-white/20 text-white" : "text-slate-400 hover:text-white hover:bg-white/10")}>
            {item.icon}
            <span className="text-[7px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="w-52 bg-white overflow-y-auto custom-scrollbar">
        {activeSection === "templates" && (
          <div className="p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3">Design Presets</p>
            <div className="space-y-2">
              {CERTIFICATE_STYLES.map(style => (
                <button key={style.id} onClick={() => onSelectStyle(style)}
                  className={cn("w-full text-left p-2.5 rounded-lg border transition-all",
                    currentStyle === style.id ? "border-blue-400 bg-blue-50 ring-1 ring-blue-400" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: style.accent }} />
                    <span className="text-xs font-semibold text-slate-700">{style.name}</span>
                    {currentStyle === style.id && <CheckCircle2 className="w-3 h-3 text-blue-500 ml-auto" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === "elements" && (
          <div className="p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3">Add Elements</p>
            <div className="space-y-1">
              {[
                { type: "text", label: "Text Block", icon: "T", content: "Click to edit text" },
                { type: "participantName", label: "Participant Name", icon: "👤", content: "{{participantName}}" },
                { type: "text", label: "Event Name", icon: "🎪", content: "{{eventName}}" },
                { type: "text", label: "Event Date", icon: "📅", content: "{{eventDate}}" },
                { type: "text", label: "Chapter Name", icon: "🏢", content: "{{chapterName}}" },
                { type: "text", label: "Certificate #", icon: "#", content: "{{certificateNumber}}" },
                { type: "divider", label: "Divider Line", icon: "—", color: accentColor },
                { type: "signatory", label: "Signatory Block", icon: "✍️" },
                { type: "image", label: "Image", icon: "🖼️", src: "" },
                { type: "qr", label: "QR Code", icon: "▣" },
              ].map((item, i) => (
                <button key={i} onClick={() => onAddElement(item)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 text-left transition-all group">
                  <span className="w-7 h-7 bg-slate-100 group-hover:bg-blue-100 rounded-md flex items-center justify-center text-sm shrink-0">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === "layers" && (
          <div className="p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3">Layers</p>
            <div className="space-y-1">
              {[...elements].reverse().map((el, i) => {
                const realIdx = elements.length - 1 - i;
                return (
                  <div key={el.id} onClick={() => onSelectElement(el.id)}
                    className={cn("flex items-center gap-2 p-1.5 rounded-lg cursor-pointer border transition-all",
                      selectedId === el.id ? "bg-blue-50 border-blue-200" : "border-transparent hover:bg-slate-50")}>
                    <GripVertical className="w-3 h-3 text-slate-300 shrink-0" />
                    <span className="text-[10px] font-medium text-slate-600 flex-1 truncate">{el.label || el.type}</span>
                    <div className="flex gap-0.5">
                      <button onClick={e => { e.stopPropagation(); onToggleHidden(el.id); }}
                        className="p-0.5 rounded hover:bg-slate-200">
                        {el.hidden ? <EyeOff className="w-2.5 h-2.5 text-slate-400" /> : <Eye className="w-2.5 h-2.5 text-slate-400" />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); onToggleLocked(el.id); }}
                        className="p-0.5 rounded hover:bg-slate-200">
                        {el.locked ? <Lock className="w-2.5 h-2.5 text-slate-400" /> : <Unlock className="w-2.5 h-2.5 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === "brand" && (
          <div className="p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3">RIFAH Brand Kit</p>

            <div className="mb-4">
              <p className="text-[10px] font-semibold text-slate-600 mb-2">Official Logo</p>
              {logoPreview || logoImage ? (
                <div className="relative group mb-2">
                  <img src={logoPreview || resolveMediaUrl(logoImage)} className="w-full h-16 object-contain border rounded-lg bg-slate-50 p-2" alt="RIFAH Logo" />
                  <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 text-[9px] text-white font-semibold rounded-lg flex items-center justify-center transition-opacity"
                    onClick={onLogoRemove}>Remove Custom</button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 mb-2 flex flex-col items-center justify-center bg-slate-50">
                  <img src="/rifah-logo.png" className="h-10 object-contain" alt="RIFAH Logo" onError={e => { e.target.style.display = 'none'; }} />
                  <p className="text-[9px] text-slate-400 mt-1">Default RIFAH Logo</p>
                </div>
              )}
              <div className="relative h-8 border border-dashed border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer text-[10px] text-slate-500 overflow-hidden">
                {logoUploading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin"/>Uploading...</> : "Upload Custom Logo"}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" disabled={logoUploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) onLogoUpload(f); e.target.value = ""; }} />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] font-semibold text-slate-600 mb-2">Accent Color</p>
              <div className="flex gap-2">
                <input type="color" value={accentColor} onChange={e => onAccentChange(e.target.value)} className="h-8 w-10 rounded border p-0.5 cursor-pointer" />
                <Input type="text" value={accentColor} onChange={e => onAccentChange(e.target.value)} className="h-8 text-xs font-mono border-slate-200" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN STUDIO COMPONENT ────────────────────────────────────────────────────

export function CertificateStudio({ eventId, activeEvent, onSaved }) {
  const canvasRef = useRef(null);
  const isMountedRef = useRef(false); // prevents autosave on initial render
  const [zoom, setZoom] = useState(0.8);
  const [selectedId, setSelectedId] = useState(null);
  const [leftSection, setLeftSection] = useState("templates");
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [sigUploading, setSigUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoImage, setLogoImage] = useState("");
  const [currentStyle, setCurrentStyle] = useState("rifah-signature");
  const [accentColor, setAccentColor] = useState("#0088d1");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saving" | "saved" | "unsaved"
  const [showGrid, setShowGrid] = useState(false);

  const initElements = defaultElements("#0088d1");
  const [history, dispatch] = useReducer(historyReducer, {
    past: [], present: initElements, future: []
  });
  const elements = history.present;

  const sampleData = {
    participantName: activeEvent?.sampleParticipant || "Jane Smith",
    eventName: activeEvent?.title || "RIFAH Networking Summit 2026",
    eventDate: activeEvent?.date || "October 3, 2026",
    chapterName: activeEvent?.chapter || "Mumbai Chapter",
    venue: activeEvent?.venue || "Grand Hall, Mumbai",
    certificateNumber: "RIFAH-2026-001",
    designation: "Member",
  };

  // Load saved design on mount
  useEffect(() => {
    if (!activeEvent) return;
    const saved = activeEvent.certificateDesignV2;
    if (saved?.elements?.length) {
      dispatch({ type: "PUSH", payload: saved.elements });
      setCurrentStyle(saved.style || "rifah-signature");
      setAccentColor(saved.accentColor || "#0088d1");
    }
    if (activeEvent.logoImage) setLogoImage(activeEvent.logoImage);
  }, [activeEvent]);

  // Autosave on element changes — skip initial mount and skip if no eventId
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (!eventId) return;
    setSaveStatus("unsaved");
    const timer = setTimeout(async () => {
      await doSave(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [elements, accentColor, currentStyle]);

  const pushHistory = (newElements) => {
    dispatch({ type: "PUSH", payload: newElements });
  };

  const updateElement = useCallback((id, changes) => {
    const newEls = elements.map(el => el.id === id ? { ...el, ...changes } : el);
    pushHistory(newEls);
  }, [elements]);

  const addElement = useCallback((template) => {
    const newEl = {
      id: makeId(),
      label: template.label || template.type,
      x: CANVAS_W / 2 - 100,
      y: CANVAS_H / 2 - 30,
      width: template.type === "divider" ? 400 : template.type === "qr" ? 80 : template.type === "signatory" ? 180 : 400,
      height: template.type === "divider" ? 2 : template.type === "qr" ? 80 : template.type === "signatory" ? 110 : template.type === "image" ? 80 : 40,
      rotation: 0, opacity: 1, locked: false, hidden: false,
      fontFamily: "Georgia, serif", fontSize: 16, fontWeight: "normal",
      fontStyle: "normal", textDecoration: "none",
      color: "#333333", align: "center", letterSpacing: 0, lineHeight: 1.4,
      ...template,
    };
    const newEls = [...elements, newEl];
    pushHistory(newEls);
    setSelectedId(newEl.id);
    toast.success(`${template.label || template.type} added`);
  }, [elements]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (el?.locked) return toast.error("Element is locked");
    pushHistory(elements.filter(e => e.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, elements]);

  const duplicateSelected = useCallback(() => {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    const newEl = { ...el, id: makeId(), x: el.x + 20, y: el.y + 20, label: el.label + " (Copy)" };
    pushHistory([...elements, newEl]);
    setSelectedId(newEl.id);
  }, [selectedId, elements]);

  const toggleHidden = (id) => {
    const newEls = elements.map(el => el.id === id ? { ...el, hidden: !el.hidden } : el);
    pushHistory(newEls);
  };

  const toggleLocked = (id) => {
    const newEls = elements.map(el => el.id === id ? { ...el, locked: !el.locked } : el);
    pushHistory(newEls);
  };

  const moveLayer = (id, dir) => {
    const idx = elements.findIndex(e => e.id === id);
    const newEls = [...elements];
    if (dir === "up" && idx < newEls.length - 1) {
      [newEls[idx], newEls[idx + 1]] = [newEls[idx + 1], newEls[idx]];
    } else if (dir === "down" && idx > 0) {
      [newEls[idx], newEls[idx - 1]] = [newEls[idx - 1], newEls[idx]];
    }
    pushHistory(newEls);
  };

  const handleSelectStyle = (style) => {
    setCurrentStyle(style.id);
    setAccentColor(style.accent);
    const newEls = defaultElements(style.accent);
    pushHistory(newEls);
    setSelectedId(null);
    toast.success(`Preset "${style.name}" applied`);
  };

  // ─── DRAG ────────────────────────────────────────────────────────────────────

  const handleDragStart = (e, id) => {
    if (!canvasRef.current) return;
    const el = elements.find(el => el.id === id);
    if (!el || el.locked) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;

    const onMove = (me) => {
      const dx = (me.clientX - startX) / zoom;
      const dy = (me.clientY - startY) / zoom;
      const newEls = elements.map(e2 =>
        e2.id === id ? { ...e2, x: Math.max(0, origX + dx), y: Math.max(0, origY + dy) } : e2
      );
      dispatch({ type: "PUSH", payload: newEls });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ─── RESIZE ───────────────────────────────────────────────────────────────────

  const handleResizeStart = (e, elId, handle) => {
    e.stopPropagation();
    const el = elements.find(el => el.id === elId);
    if (!el) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origEl = { ...el };

    const onMove = (me) => {
      const dx = (me.clientX - startX) / zoom;
      const dy = (me.clientY - startY) / zoom;
      let { x, y, width, height } = origEl;

      if (handle.includes("e")) width = Math.max(10, origEl.width + dx);
      if (handle.includes("s")) height = Math.max(4, origEl.height + dy);
      if (handle.includes("w")) { x = origEl.x + dx; width = Math.max(10, origEl.width - dx); }
      if (handle.includes("n")) { y = origEl.y + dy; height = Math.max(4, origEl.height - dy); }

      const newEls = elements.map(e2 =>
        e2.id === elId ? { ...e2, x, y, width, height } : e2
      );
      dispatch({ type: "PUSH", payload: newEls });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ─── LOGO UPLOAD ──────────────────────────────────────────────────────────────

  const handleLogoUpload = async (file) => {
    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);
    setLogoUploading(true);
    try {
      const res = await eventApi.uploadSignatoryImage(eventId, "logo", file);
      const uploadedUrl = res?.data?.logoImage || res?.data?.event?.logoImage;
      if (!uploadedUrl) throw new Error("Upload failed");
      setLogoImage(uploadedUrl);
      // Update logo element src
      const logoEl = elements.find(e => e.type === "logo");
      if (logoEl) updateElement(logoEl.id, { src: resolveMediaUrl(uploadedUrl) });
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error("Logo upload failed");
    } finally {
      setLogoUploading(false);
      URL.revokeObjectURL(localPreview);
      setLogoPreview("");
    }
  };

  // ─── SIGNATORY IMAGE UPLOAD ───────────────────────────────────────────────────

  const handleSigUpload = async (elementId, file) => {
    setSigUploading(true);
    try {
      const res = await eventApi.uploadSignatoryImage(eventId, "1", file);
      const url = res?.data?.signatory1Image || res?.data?.event?.signatory1Image;
      if (!url) throw new Error("Upload failed");
      updateElement(elementId, { signatureImg: url });
      toast.success("Signature uploaded");
    } catch (err) {
      toast.error("Signature upload failed");
    } finally {
      setSigUploading(false);
    }
  };

  // ─── SAVE ─────────────────────────────────────────────────────────────────────

  const doSave = async (showToast = true) => {
    if (!eventId) return;
    setSaveStatus("saving");
    try {
      const payload = {
        certificateStyle: currentStyle,
        certificateAccentColor: accentColor,
        logoImage: logoImage,
        certificateDesignV2: {
          style: currentStyle,
          accentColor,
          elements,
        },
        // Keep backward compat fields for the PDF generator
        certificateDesign: {
          preset: currentStyle,
          logo: { enabled: true, width: 120 },
          title: {
            text: elements.find(e => e.label === "Certificate Title")?.content || "CERTIFICATE OF PARTICIPATION",
            fontFamily: "Helvetica-Bold", fontSize: 32, color: accentColor,
          },
          participantName: { fontFamily: "Helvetica-Bold", fontSize: 38, color: "#0b1f33" },
          body: {
            text: elements.find(e => e.label === "Event Details")?.content || "For participating in {{eventName}}\nheld on {{eventDate}} at {{venue}}",
            fontFamily: "Helvetica", fontSize: 14, color: "#444444",
          },
          border: { enabled: true, width: 4, color: accentColor },
          background: { color: "#ffffff" },
        },
        signatory1Name: elements.find(e => e.label === "Primary Signatory")?.name || "",
        signatory1Role: elements.find(e => e.label === "Primary Signatory")?.role || "",
        signatory1Image: elements.find(e => e.label === "Primary Signatory")?.signatureImg || "",
        signatory2Name: elements.find(e => e.label === "Secondary Signatory")?.name || "",
        signatory2Role: elements.find(e => e.label === "Secondary Signatory")?.role || "",
        signatory2Image: elements.find(e => e.label === "Secondary Signatory")?.signatureImg || "",
      };
      await eventApi.updateOperations(eventId, payload);
      setSaveStatus("saved");
      if (showToast) toast.success("✅ Design saved!");
      if (onSaved) onSaved(payload);
    } catch (err) {
      setSaveStatus("unsaved");
      if (showToast) toast.error("Save failed");
    }
  };

  const handlePreviewPDF = () => {
    window.open(eventApi.getCertificateUrl(eventId, "preview", currentStyle, accentColor), "_blank");
  };

  const selectedEl = elements.find(e => e.id === selectedId);

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); dispatch({ type: "UNDO" }); }
    if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); dispatch({ type: "REDO" }); }
    if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
    if ((e.ctrlKey || e.metaKey) && e.key === "d") { e.preventDefault(); duplicateSelected(); }
  }, [deleteSelected, duplicateSelected]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col bg-[#1e2130] text-white" style={{ height: "calc(100vh - 160px)", minHeight: "700px" }}>

      {/* ── TOP TOOLBAR ── */}
      <div className="h-12 bg-[#252840] border-b border-white/10 flex items-center px-4 gap-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-1.5 mr-3">
          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-[9px] font-black">R</div>
          <div>
            <p className="text-[11px] font-bold text-white/90 leading-none">{activeEvent?.title || "Event Certificate"}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {saveStatus === "saving" && <><Loader2 className="w-2.5 h-2.5 animate-spin text-yellow-400"/><span className="text-[8px] text-yellow-400">Saving...</span></>}
              {saveStatus === "saved" && <><CheckCircle2 className="w-2.5 h-2.5 text-green-400"/><span className="text-[8px] text-green-400">Saved</span></>}
              {saveStatus === "unsaved" && <span className="text-[8px] text-orange-400">● Unsaved changes</span>}
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-0.5">
          <button onClick={() => dispatch({ type: "UNDO" })} disabled={!history.past.length}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/70 hover:text-white" title="Undo (Ctrl+Z)">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => dispatch({ type: "REDO" })} disabled={!history.future.length}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/70 hover:text-white" title="Redo (Ctrl+Y)">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-0.5 bg-white/10 rounded-lg px-1">
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-bold text-white/70 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button onClick={() => setShowGrid(g => !g)}
          className={cn("p-1.5 rounded text-white/70 hover:text-white", showGrid ? "bg-white/20" : "hover:bg-white/10")} title="Toggle Grid">
          <Grid className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={handlePreviewPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white/80 hover:text-white transition-all">
            <Eye className="w-3.5 h-3.5" /> Preview PDF
          </button>
          <button onClick={() => doSave(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white shadow-md transition-all">
            <Save className="w-3.5 h-3.5" /> Save Design
          </button>
        </div>
      </div>

      {/* ── MAIN EDITOR BODY ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL */}
        <div className="shrink-0 h-full overflow-hidden bg-white border-r border-slate-200 shadow-lg" style={{ width: "266px" }}>
          <LeftPanel
            activeSection={leftSection}
            onSetSection={setLeftSection}
            onAddElement={addElement}
            currentStyle={currentStyle}
            onSelectStyle={handleSelectStyle}
            accentColor={accentColor}
            onAccentChange={setAccentColor}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onToggleHidden={toggleHidden}
            onToggleLocked={toggleLocked}
            onMoveLayer={moveLayer}
            onDeleteElement={id => { pushHistory(elements.filter(e => e.id !== id)); if (selectedId === id) setSelectedId(null); }}
            logoPreview={logoPreview}
            logoImage={logoImage}
            logoUploading={logoUploading}
            onLogoUpload={handleLogoUpload}
            onLogoRemove={() => { setLogoImage(""); setLogoPreview(""); }}
          />
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-[#1e2130] relative"
          onClick={() => setSelectedId(null)}>

          {/* Grid overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />
          )}

          <div style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.2s" }}>
            <div ref={canvasRef} className="relative bg-white shadow-2xl"
              style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px` }}
              onClick={e => { if (e.target === e.currentTarget) setSelectedId(null); }}>

              {elements.map(el => (
                <React.Fragment key={el.id}>
                  <CanvasElement
                    el={el}
                    isSelected={selectedId === el.id}
                    scale={1}
                    onSelect={setSelectedId}
                    onDragStart={handleDragStart}
                    sampleData={sampleData}
                  />
                  {selectedId === el.id && !el.locked && (
                    <ResizeHandles el={el} scale={1} onResizeStart={(e, handle) => handleResizeStart(e, el.id, handle)} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PROPERTIES PANEL */}
        <div className="w-72 shrink-0 bg-white border-l border-slate-200 flex flex-col shadow-lg overflow-hidden">
          {selectedEl ? (
            <>
              {/* Selection actions bar */}
              <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-1 shrink-0">
                <button onClick={duplicateSelected} title="Duplicate (Ctrl+D)"
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"><Copy className="w-3.5 h-3.5"/></button>
                <button onClick={() => moveLayer(selectedId, "up")} title="Bring forward"
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"><ChevronUp className="w-3.5 h-3.5"/></button>
                <button onClick={() => moveLayer(selectedId, "down")} title="Send backward"
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"><ChevronDown className="w-3.5 h-3.5"/></button>
                <button onClick={() => toggleHidden(selectedId)} title="Hide/Show"
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700">
                  {selectedEl.hidden ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                </button>
                <button onClick={() => toggleLocked(selectedId)} title="Lock/Unlock"
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700">
                  {selectedEl.locked ? <Lock className="w-3.5 h-3.5"/> : <Unlock className="w-3.5 h-3.5"/>}
                </button>
                <button onClick={deleteSelected} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 ml-auto">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>

              {/* Alignment tools */}
              <div className="h-9 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-0.5 shrink-0">
                <span className="text-[9px] text-slate-400 mr-1 font-medium">ALIGN</span>
                {[
                  { icon: <AlignLeft className="w-3 h-3"/>, action: () => updateElement(selectedId, { x: 0 }), title: "Align Left" },
                  { icon: <AlignCenter className="w-3 h-3"/>, action: () => updateElement(selectedId, { x: CANVAS_W / 2 - selectedEl.width / 2 }), title: "Center H" },
                  { icon: <AlignRight className="w-3 h-3"/>, action: () => updateElement(selectedId, { x: CANVAS_W - selectedEl.width }), title: "Align Right" },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} title={btn.title}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700">{btn.icon}</button>
                ))}
                <div className="h-4 w-px bg-slate-200 mx-1"/>
                {[
                  { icon: <span className="text-[8px] font-bold">⬆</span>, action: () => updateElement(selectedId, { y: 0 }), title: "Align Top" },
                  { icon: <span className="text-[8px] font-bold">⊕</span>, action: () => updateElement(selectedId, { y: CANVAS_H / 2 - selectedEl.height / 2 }), title: "Center V" },
                  { icon: <span className="text-[8px] font-bold">⬇</span>, action: () => updateElement(selectedId, { y: CANVAS_H - selectedEl.height }), title: "Align Bottom" },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} title={btn.title}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700">{btn.icon}</button>
                ))}
              </div>

              {/* Properties */}
              <div className="flex-1 overflow-hidden">
                <PropertyPanel
                  element={selectedEl}
                  onChange={(updated) => updateElement(selectedId, updated)}
                  eventId={eventId}
                  onUploadSig={handleSigUpload}
                  sigUploading={sigUploading}
                />
              </div>
            </>
          ) : (
            <PropertyPanel element={null} />
          )}
        </div>
      </div>
    </div>
  );
}
