"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY, parsePhoneNumber, formatPhoneNumber } from "@shared/lib/countries";
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "@shared/components/ui/popover";
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
    align: alignProp,
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
  const [popoverAlign, setPopoverAlign] = useState(alignProp || "start");

  // Dynamically calculate alignment (start or end) to keep dropdown within dialog/screen boundaries
  useEffect(() => {
    if (alignProp) {
      setPopoverAlign(alignProp);
      return;
    }
    const checkAlignment = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dialogEl = containerRef.current.closest('[role="dialog"]');
      const boundaryRight = dialogEl
        ? dialogEl.getBoundingClientRect().right
        : window.innerWidth;
      const boundaryLeft = dialogEl
        ? dialogEl.getBoundingClientRect().left
        : 0;
      const boundaryWidth = boundaryRight - boundaryLeft;
      const containerCenter = rect.left + rect.width / 2;

      // If opening from the left with ~288px width would overflow the boundary, or if center is in the right 45%
      if (rect.left + 288 > boundaryRight - 16 || containerCenter > boundaryLeft + boundaryWidth * 0.55) {
        setPopoverAlign("end");
      } else {
        setPopoverAlign("start");
      }
    };

    if (isOpen) {
      checkAlignment();
    }
  }, [isOpen, alignProp]);

  // Synchronize when value changes externally (avoid resetting state if digits already match)
  useEffect(() => {
    const nextParsed = parsePhoneNumber(value, defaultCountry);
    if (nextParsed.country && nextParsed.country.code !== selectedCountry.code) {
      setSelectedCountry(nextParsed.country);
    }
    const currentDigits = (nationalNumber || "").replace(/\D/g, "");
    const nextDigits = (nextParsed.nationalNumber || "").replace(/\D/g, "");
    if (currentDigits !== nextDigits) {
      setNationalNumber(nextParsed.nationalNumber || "");
    }
  }, [value, defaultCountry, selectedCountry.code]);

  // Native <form onReset> clears the DOM input but not this component's own
  // state, so the visible value snaps back on the next render (BUG-010).
  useEffect(() => {
    const form = numberInputRef.current?.form;
    if (!form) return;
    const handleFormReset = () => {
      setTimeout(() => {
        const nextParsed = parsePhoneNumber(value, defaultCountry);
        setSelectedCountry(nextParsed.country || DEFAULT_COUNTRY);
        setNationalNumber(nextParsed.nationalNumber || "");
      }, 0);
    };
    form.addEventListener("reset", handleFormReset);
    return () => form.removeEventListener("reset", handleFormReset);
  }, [value, defaultCountry]);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
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

  const MAX_NATIONAL_DIGITS = 10;

  const handleInputRef = React.useCallback(
    (el) => {
      numberInputRef.current = el;
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
    },
    [forwardedRef]
  );

  const handleNumberChange = (e) => {
    let inputVal = e.target.value;
    // If user pasted a full number with country code like "+91 9876543210"
    if (inputVal.startsWith("+")) {
      const p = parsePhoneNumber(inputVal, selectedCountry?.code || defaultCountry);
      if (p.country) setSelectedCountry(p.country);
      const digits = (p.nationalNumber || "").replace(/\D/g, "").slice(0, MAX_NATIONAL_DIGITS);
      setNationalNumber(digits);
      triggerChange(p.country || selectedCountry, digits);
      return;
    }
    // Allow digits, spaces, hyphens
    let cleaned = inputVal.replace(/[^\d\s\-]/g, "");
    const rawDigits = cleaned.replace(/\D/g, "");
    // If Indian number pasted with 91 prefix without plus (e.g. 919876543210)
    if (selectedCountry?.code === "IN" && rawDigits.startsWith("91") && rawDigits.length === 12) {
      cleaned = rawDigits.slice(2);
    } else if (rawDigits.startsWith("0") && rawDigits.length > 10) {
      // Strip leading 0 if full number entered with trunk prefix (e.g. 09876543210)
      cleaned = rawDigits.replace(/^0+/, "");
    }
    const digitCount = (cleaned.match(/\d/g) || []).length;
    if (digitCount > MAX_NATIONAL_DIGITS) return;
    setNationalNumber(cleaned);
    triggerChange(selectedCountry, cleaned);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
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
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label="Select Country Code"
              aria-expanded={isOpen}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-foreground",
                "hover:bg-accent/60 transition-colors shrink-0 rounded-l-lg outline-none select-none cursor-pointer",
                disabled && "pointer-events-none"
              )}
            >
              <span className="text-base leading-none" role="img" aria-label={selectedCountry.name}>
                {selectedCountry.flag}
              </span>
              <span className="text-muted-foreground font-mono text-xs">{selectedCountry.dialCode}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
          </PopoverTrigger>

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
            ref={handleInputRef}
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
        </div>
      </PopoverAnchor>

      <PopoverContent
        align={popoverAlign}
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
        className="z-[9999] w-72 max-w-[calc(100vw-32px)] p-2.5 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 60);
        }}
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
            className="w-full rounded-xl border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
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
                    "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    isSelected && "bg-primary/10 text-primary font-semibold"
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
      </PopoverContent>
    </Popover>
  );
});

export default PhoneInput;
