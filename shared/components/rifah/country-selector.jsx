"use client";

import { useEffect, useState } from "react";
import { Check, Globe2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { Button } from "@shared/components/ui/button";
import { countryApi } from "@shared/lib/api-services";

export function CountrySelector() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("rifah_selected_country")
        : null;
    if (stored) {
      setSelectedCountry(stored);
    }

    let isSubscribed = true;
    const fetchCountries = async () => {
      try {
        const res = await countryApi.list({ status: "Active" });
        const list = Array.isArray(res) ? res : res?.countries || res?.data || [];
        if (isSubscribed) {
          setCountries(list);
        }
      } catch {
        // Fallback gracefully
      }
    };

    void fetchCountries();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleSelect = (countryName) => {
    setSelectedCountry(countryName);
    if (typeof window !== "undefined") {
      localStorage.setItem("rifah_selected_country", countryName);
      window.dispatchEvent(
        new CustomEvent("rifah:country-changed", { detail: { country: countryName } }),
      );
    }
  };

  if (!mounted || countries.length === 0) {
    return null;
  }

  const currentDisplay =
    selectedCountry === "All"
      ? "All"
      : countries.find((c) => c.name === selectedCountry)?.code || selectedCountry;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          title="Browse by Country"
        >
          <Globe2 className="h-4 w-4 text-primary" />
          <span className="uppercase">{currentDisplay}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 max-h-72 overflow-y-auto">
        <DropdownMenuItem
          onClick={() => handleSelect("All")}
          className="flex items-center justify-between text-xs font-medium cursor-pointer"
        >
          <span>All Countries</span>
          {selectedCountry === "All" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>

        {countries.map((c) => (
          <DropdownMenuItem
            key={c._id || c.id || c.code}
            onClick={() => handleSelect(c.name)}
            className="flex items-center justify-between text-xs font-medium cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                {c.code}
              </span>
              <span className="truncate">{c.name}</span>
            </div>
            {selectedCountry === c.name && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
