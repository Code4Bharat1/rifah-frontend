"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY, parsePhoneNumber, formatPhoneNumber } from "@shared/lib/countries";
import { cn } from "@shared/lib/utils";

export const PhoneInput = React.forwardRef(function PhoneInput(
  {
    value = "",
    onChange,
    onValueChange,
    name,
    id,
    placeholder = "98765 43210",
    required = false,
    disabled = false,
    className = "",
    inputClassName = "",
    defaultCountry = "IN",
    autoFocus = false,
    ...props
  },
  forwardedRef
) {
  // Parse initial or incoming value
  const parsed = useMemo(() => parsePhoneNumber(value, defaultCountry), [value, defaultCountry]);
  const [selectedCountry, setSelectedCountry] = useState(parsed.country || DEFAULT_COUNTRY);
  const [nationalNumber, setNationalNumber] = useState(parsed.nationalNumber || "");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const numberInputRef = useRef(null);

  // Synchronize when value changes externally
  useEffect(() => {
    const nextParsed = parsePhoneNumber(value, defaultCountry);
    setSelectedCountry(nextParsed.country || DEFAULT_COUNTRY);
    setNationalNumber(nextParsed.nationalNumber || "");
  }, [value, defaultCountry]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const cleanQ = q.replace("+", "");
    return COUNTRIES.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const codeMatch = c.code.toLowerCase().includes(q);
      const dialMatch = c.dialCode.toLowerCase().includes(q) || c.dialCode.replace("+", "").includes(cleanQ);
      return nameMatch || codeMatch || dialMatch;
    });
  }, [searchQuery]);

  // Trigger change event to parent
  const triggerChange = (country, rawNumber) => {
    const formatted = formatPhoneNumber(country, rawNumber);

    if (onValueChange) {
      onValueChange(formatted);
    }

    if (onChange) {
      // Create synthetic event for compatibility with standard e.target.value handlers
      const syntheticEvent = {
        target: {
          name: name || id || "phone",
          value: formatted,
        },
        currentTarget: {
          name: name || id || "phone",
          value: formatted,
        },
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    triggerChange(country, nationalNumber);
    setTimeout(() => {
      numberInputRef.current?.focus();
    }, 50);
  };

  const handleNumberChange = (e) => {
    const inputVal = e.target.value;
    // Allow digits, spaces, hyphens
    const cleaned = inputVal.replace(/[^\d\s\-]/g, "");
    setNationalNumber(cleaned);
    triggerChange(selectedCountry, cleaned);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center rounded-lg border border-input bg-background shadow-xs transition-colors",
        "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        disabled && "opacity-50 cursor-not-allowed bg-muted",
        className
      )}
    >
      {/* Country Code Selector Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Select Country Code"
        aria-expanded={isOpen}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-foreground",
          "hover:bg-accent/60 transition-colors shrink-0 rounded-l-lg outline-none select-none",
          disabled && "pointer-events-none"
        )}
      >
        <span className="text-base leading-none" role="img" aria-label={selectedCountry.name}>
          {selectedCountry.flag}
        </span>
        <span className="text-muted-foreground font-mono text-xs">{selectedCountry.dialCode}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Subtle divider */}
      <div className="h-5 w-px bg-border shrink-0" />

      {/* Hidden input for native FormData compatibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={formatPhoneNumber(selectedCountry, nationalNumber)}
        />
      )}

      {/* National Number Input */}
      <input
        ref={(el) => {
          numberInputRef.current = el;
          if (typeof forwardedRef === "function") forwardedRef(el);
          else if (forwardedRef) forwardedRef.current = el;
        }}
        id={id}
        name={name ? `${name}_national` : undefined}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={nationalNumber}
        onChange={handleNumberChange}
        className={cn(
          "w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground",
          "outline-none focus:outline-none border-0 ring-0 focus:ring-0 rounded-r-lg disabled:cursor-not-allowed",
          inputClassName
        )}
        {...props}
      />

      {/* Country Dropdown / Popover with Search */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95"
          )}
        >
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 overscroll-contain pr-1 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No matching countries found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base shrink-0" role="img" aria-label={c.name}>
                        {c.flag}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[11px] text-muted-foreground">{c.dialCode}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default PhoneInput;
