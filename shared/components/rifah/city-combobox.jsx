"use client";
import { useMemo } from "react";
import { CreatableCombobox } from "@shared/components/rifah/creatable-combobox";
import { useChapters } from "@shared/hooks/use-rifah-api";

// BUG-054: city was free text in most forms, so the same city ended up spelled
// several different ways across records ("Mumbai", "mumbai", "Mukbai",
// "mimbai"). This sources a canonical, de-duplicated city list from the
// chapters that already exist (each chapter carries one authoritative city
// name) plus a static fallback list of major Indian cities that may not yet
// have a chapter, so the field stays a dropdown/autocomplete instead of raw
// free text while still letting a user add a genuinely new city.
const FALLBACK_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai",
  "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
  "Indore", "Thane", "Bhopal", "Visakhapatnam", "Vadodara", "Ghaziabad",
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi",
  "Srinagar", "Amritsar", "Chandigarh", "Gurugram", "Noida", "Coimbatore",
  "Kochi", "Patna", "Bhubaneswar", "Thiruvananthapuram",
];

function toTitleCase(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function useCityOptions() {
  const { data: chaptersData } = useChapters();
  const chapters = Array.isArray(chaptersData) ? chaptersData : (chaptersData?.chapters || []);

  return useMemo(() => {
    const fromChapters = chapters.map((c) => toTitleCase(c.city)).filter(Boolean);
    const merged = new Map();
    [...fromChapters, ...FALLBACK_CITIES].forEach((name) => {
      const key = name.toLowerCase();
      if (!merged.has(key)) merged.set(key, name);
    });
    return Array.from(merged.values()).sort((a, b) => a.localeCompare(b));
  }, [chapters]);
}

export function CityCombobox({ value, onValueChange, placeholder = "Select or type a city", ...props }) {
  const options = useCityOptions();
  return (
    <CreatableCombobox
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
      emptyText="No matching city. Type to add a new one."
      {...props}
    />
  );
}

export default CityCombobox;
