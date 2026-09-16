"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { useChapters } from "@shared/hooks/use-rifah-api";
import { businessApi } from "@shared/lib/api-services";

/**
 * Cascading State -> Chapter -> Member picker used across Networking features
 * (One to One meetings, Thank You Notes) to select a fellow RIFAH member.
 * Calls onChange with the selected Business document, or null when cleared.
 */
export function MemberPicker({ onChange, excludeBusinessId, idPrefix = "member-picker", disabled = false }) {
  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];

  const states = useMemo(
    () => Array.from(new Set(chapters.map((c) => (c.state || "").trim()).filter(Boolean))).sort(),
    [chapters]
  );

  const [selectedState, setSelectedState] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const chaptersForState = useMemo(
    () =>
      selectedState
        ? chapters.filter((c) => (c.state || "").trim().toLowerCase() === selectedState.trim().toLowerCase())
        : [],
    [chapters, selectedState]
  );

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["networking-members", selectedChapterName],
    queryFn: async () => {
      const res = await businessApi.list({ chapter: selectedChapterName, limit: 100 });
      return res?.data || res;
    },
    enabled: Boolean(selectedChapterName),
  });

  const members = (Array.isArray(membersData) ? membersData : []).filter(
    (b) => String(b._id) !== String(excludeBusinessId)
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-state`}>State *</Label>
          <Select
            value={selectedState}
            disabled={disabled}
            onValueChange={(v) => {
              setSelectedState(v);
              setSelectedChapterName("");
              setSelectedMemberId("");
              onChange(null);
            }}
          >
            <SelectTrigger id={`${idPrefix}-state`} className="h-10">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-chapter`}>Chapter *</Label>
          <Select
            value={selectedChapterName}
            disabled={disabled || !selectedState}
            onValueChange={(v) => {
              setSelectedChapterName(v);
              setSelectedMemberId("");
              onChange(null);
            }}
          >
            <SelectTrigger id={`${idPrefix}-chapter`} className="h-10">
              <SelectValue placeholder={selectedState ? "Select chapter" : "Select a state first"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {chaptersForState.map((c) => (
                <SelectItem key={c._id || c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-member`}>Member *</Label>
        <Select
          value={selectedMemberId}
          disabled={disabled || !selectedChapterName || membersLoading}
          onValueChange={(v) => {
            setSelectedMemberId(v);
            const business = members.find((m) => String(m._id) === String(v)) || null;
            onChange(business);
          }}
        >
          <SelectTrigger id={`${idPrefix}-member`} className="h-10">
            <SelectValue
              placeholder={
                !selectedChapterName
                  ? "Select a chapter first"
                  : membersLoading
                    ? "Loading members..."
                    : "Select member"
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {selectedChapterName && !membersLoading && members.length === 0 ? (
              <SelectItem value="__none__" disabled>
                No members found in this chapter
              </SelectItem>
            ) : (
              members.map((m) => (
                <SelectItem key={m._id} value={m._id}>
                  {m.name}
                  {m.contactPerson ? ` · ${m.contactPerson}` : ""}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
