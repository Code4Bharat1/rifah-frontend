import React, { useState } from "react";
import { FaHome, FaBookOpen, FaMicrophone, FaUsers, FaTrophy, FaStar, FaExchangeAlt, FaCalendarAlt, FaStarHalfAlt, FaPrayingHands, FaRegHandshake } from "react-icons/fa";
import { MdOutlineMoreVert, MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Save, Plus, RotateCcw, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { eventApi } from "@shared/lib/api-services";
import { STAGE_SCRIPTS } from "./scripts-data"; // We can use this to get default names if needed

export function AgendaCrud({ eventId, agenda, setAgenda }) {
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState("Hinglish");

  // Icon mapping based on some keywords or just a fallback
  const getIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("welcome") || lower.includes("entrance")) return <FaHome className="text-orange-500" />;
    if (lower.includes("quran") || lower.includes("tilawat")) return <FaBookOpen className="text-blue-500" />;
    if (lower.includes("keynote") || lower.includes("pitch")) return <FaMicrophone className="text-slate-500" />;
    if (lower.includes("team") || lower.includes("participant")) return <FaUsers className="text-purple-500" />;
    if (lower.includes("ask") || lower.includes("give")) return <FaExchangeAlt className="text-sky-500" />;
    if (lower.includes("sponsor")) return <FaStar className="text-yellow-400" />;
    if (lower.includes("event") || lower.includes("upcoming")) return <FaCalendarAlt className="text-indigo-500" />;
    if (lower.includes("hero") || lower.includes("award")) return <FaTrophy className="text-amber-500" />;
    if (lower.includes("connector")) return <FaStarHalfAlt className="text-yellow-500" />;
    if (lower.includes("closing") || lower.includes("thanks")) return <FaPrayingHands className="text-pink-500" />;
    return <FaRegHandshake className="text-emerald-500" />;
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newAgenda = [...agenda];
    [newAgenda[index - 1], newAgenda[index]] = [newAgenda[index], newAgenda[index - 1]];
    setAgenda(newAgenda);
  };

  const handleMoveDown = (index) => {
    if (index === agenda.length - 1) return;
    const newAgenda = [...agenda];
    [newAgenda[index + 1], newAgenda[index]] = [newAgenda[index], newAgenda[index + 1]];
    setAgenda(newAgenda);
  };

  const handleUpdate = (index, field, value) => {
    const newAgenda = [...agenda];
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    setAgenda(newAgenda);
  };

  const handleReset = (index) => {
    const original = STAGE_SCRIPTS[index + 1];
    if (original) {
      handleUpdate(index, "title", original.segmentTitle);
      // Try to parse duration if we wanted to
    }
  };

  const handleRemove = (index) => {
    const newAgenda = agenda.filter((_, i) => i !== index);
    setAgenda(newAgenda);
  };

  const handleAddPart = () => {
    const newId = agenda.length ? Math.max(...agenda.map(a => a.id || 0)) + 1 : 1;
    setAgenda([
      ...agenda,
      { id: newId, title: "New Segment", duration: "10 min", speaker: "TBD" }
    ]);
  };

  const handleSave = async () => {
    if (!eventId) {
      toast.error("No active event selected.");
      return;
    }
    try {
      setSaving(true);
      await eventApi.updateOperations(eventId, { agenda });
      toast.success("Agenda schedule saved successfully!");
    } catch (err) {
      toast.error("Failed to save agenda.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FaCalendarAlt className="text-primary h-5 w-5" />
            Agenda & Timing
          </h2>
          
          <div className="mt-4 flex items-center gap-4 bg-muted/40 p-3 rounded-xl border border-border/60">
            <div className="flex items-center gap-2">
              <FaMicrophone className="text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">Script language</span>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background border-border text-foreground font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hinglish">Hinglish</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Urdu">Urdu</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[10px] text-muted-foreground ml-2 hidden sm:inline-block">
              Changes every built-in script below. Scripts you rewrote stay in your words.
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
            Rename any part (e.g. "Vote of Thanks" &rarr; "National Anthem"), set its sequence number, and optionally how many minutes it gets. 
            Renaming and timing are both optional — the new name shows on the projector and in every visitor's schedule.
          </p>
        </div>

        {/* List Section */}
        <div className="p-6 space-y-2.5">
          {agenda.map((item, index) => (
            <div 
              key={item.id || index}
              className="flex items-center gap-2 bg-muted/30 border border-border/60 rounded-xl p-1.5 transition-all hover:bg-muted/50"
            >
              {/* Drag Handle */}
              <div className="px-1.5 cursor-grab text-muted-foreground/50 hover:text-muted-foreground">
                <MdOutlineMoreVert className="h-5 w-5" />
              </div>
              
              {/* Sequence */}
              <div className="font-bold text-xs w-6 text-center text-foreground">
                {index + 1}
              </div>

              {/* Up/Down Arrows */}
              <div className="flex flex-col gap-0.5">
                <button 
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="bg-background border border-border rounded p-0.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <MdKeyboardArrowUp className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => handleMoveDown(index)}
                  disabled={index === agenda.length - 1}
                  className="bg-background border border-border rounded p-0.5 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <MdKeyboardArrowDown className="h-3 w-3" />
                </button>
              </div>

              {/* Icon */}
              <div className="w-8 flex justify-center ml-2">
                {getIcon(item.title)}
              </div>

              {/* Title Input */}
              <Input 
                value={item.title}
                onChange={(e) => handleUpdate(index, "title", e.target.value)}
                className="flex-1 h-9 text-xs font-semibold bg-background border-border"
              />

              {/* Duration Input */}
              <div className="relative w-20 shrink-0">
                <Input 
                  value={item.duration.replace(/\D/g, '')} // Extract just the number
                  onChange={(e) => handleUpdate(index, "duration", `${e.target.value} min`)}
                  placeholder="Min"
                  className="h-9 text-xs font-mono text-center bg-background border-border pr-6"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 px-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleReset(index)}
                  title="Reset to Default"
                  className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  title="Delete Segment"
                  className="h-8 w-8 rounded-lg border-border text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddPart}
            className="w-full mt-4 h-11 border-dashed border-border/80 text-primary hover:bg-primary/5 hover:text-primary gap-2 font-semibold bg-muted/20"
          >
            <Plus className="h-4 w-4" /> Add Another Part
          </Button>

          <div className="mt-8 flex justify-end pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 font-semibold shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Agenda Configuration"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
