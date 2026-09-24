"use client";

import React, { useState, useEffect } from "react";
import { ScrollText, Save, Edit3, Type, Languages, Sparkles } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Textarea } from "@shared/components/ui/textarea";
import { toast } from "sonner";
import { eventApi } from "@shared/lib/api-services";
import { STAGE_SCRIPTS } from "./scripts-data";

export function ScriptsTab({ eventId, teamRoles = {} }) {
  const [activeSegment, setActiveSegment] = useState(1);
  const [customScripts, setCustomScripts] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [loading, setLoading] = useState(true);

  // Helper to interpolate names into the script
  const interpolateNames = (text, segmentId) => {
    if (!text) return "";
    let parsed = text;
    
    const roleMapping = {
      2: teamRoles.tilawatEquran,
      3: teamRoles.presidentWelcome,
      5: teamRoles.guestManager,
      6: teamRoles.keynote1,
      7: teamRoles.keynote2,
      11: teamRoles.heroOfEvent,
      15: teamRoles.voteOfThanks,
    };

    const assignedName = roleMapping[segmentId] || "[Speaker Name]";
    
    // Replace [Speaker Name] and [Awardee Name] with the assigned name (if it's not empty)
    if (assignedName) {
      parsed = parsed.replace(/\[Speaker Name\]/g, assignedName);
      parsed = parsed.replace(/\[Awardee Name\]/g, assignedName);
    }
    
    return parsed;
  };

  useEffect(() => {
    if (eventId) {
      fetchScripts();
    }
  }, [eventId]);

  const fetchScripts = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await eventApi.getScripts(eventId);
      if (res.success) {
        // Map saved scripts into an object { segmentId: { customText, language } }
        const mapped = {};
        if (res.data && res.data.scripts) {
          res.data.scripts.forEach(s => {
            mapped[s.segmentId] = {
              customText: s.customText,
              language: s.language || "en"
            };
          });
        }
        setCustomScripts(mapped);
      }
    } catch (err) {
      toast.error("Failed to load scripts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When active segment changes, load its text into the editor and interpolate
    const saved = customScripts[activeSegment]?.customText;
    const baseText = saved || STAGE_SCRIPTS[activeSegment].defaultText;
    setCurrentText(interpolateNames(baseText, activeSegment));
    setIsEditing(false);
  }, [activeSegment, customScripts, teamRoles]);

  const handleSave = async () => {
    try {
      const res = await eventApi.updateScript(eventId, activeSegment, { 
        customText: currentText,
        language: "en" 
      });
      if (res.success) {
        toast.success("Script saved successfully");
        setCustomScripts(prev => ({
          ...prev,
          [activeSegment]: { customText: currentText, language: "en" }
        }));
        setIsEditing(false);
      }
    } catch (err) {
      toast.error("Failed to save script");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const activeData = STAGE_SCRIPTS[activeSegment];
  const isCustomized = !!customScripts[activeSegment]?.customText;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Left Sidebar: 16 Segments List */}
      <div className="lg:col-span-1 border border-border rounded-xl bg-card overflow-hidden flex flex-col h-[600px]">
        <div className="p-3 border-b border-border bg-muted/30 font-bold text-sm text-foreground flex items-center justify-between">
          <span>Programme Segments</span>
          <span className="text-xs font-normal text-muted-foreground">16 Steps</span>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {Object.entries(STAGE_SCRIPTS).map(([id, data]) => {
            const numId = parseInt(id);
            const isActive = activeSegment === numId;
            const hasCustom = !!customScripts[numId]?.customText;
            
            return (
              <button
                key={id}
                onClick={() => setActiveSegment(numId)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between
                  ${isActive ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'hover:bg-muted/50 text-foreground'}`}
              >
                <span className="truncate pr-2">
                  <span className={`mr-2 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {numId.toString().padStart(2, '0')}
                  </span>
                  {data.segmentTitle}
                </span>
                {hasCustom && !isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Area: Editor */}
      <div className="lg:col-span-3 flex flex-col h-[600px]">
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
          
          <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-background">Segment {activeSegment}</Badge>
                {isCustomized && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Customized</Badge>}
              </div>
              <h3 className="text-xl font-bold text-foreground">{activeData.segmentTitle}</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-1.5" disabled title="Coming soon">
                <Languages className="h-4 w-4" /> Translate
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">Soon</Badge>
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50" disabled title="Coming soon">
                <Sparkles className="h-4 w-4" /> AI Polish
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">Soon</Badge>
              </Button>
            </div>
          </div>

          <div className="flex-1 p-0 relative bg-background">
            {isEditing ? (
              <Textarea 
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="w-full h-full min-h-full resize-none border-0 rounded-none focus-visible:ring-0 p-6 text-lg leading-relaxed font-medium"
                placeholder="Write your script here..."
              />
            ) : (
              <div className="p-6 text-lg leading-relaxed font-medium whitespace-pre-wrap overflow-y-auto h-full">
                {currentText}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Type className="h-4 w-4" /> 
              {currentText.split(/\s+/).filter(w => w.length > 0).length} words
            </p>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} className="gap-1.5">
                    <Save className="h-4 w-4" /> Save Script
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="gap-1.5">
                  <Edit3 className="h-4 w-4" /> Edit Script
                </Button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
