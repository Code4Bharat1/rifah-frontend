"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";
import { cn } from "@shared/lib/utils";

/**
 * A searchable dropdown component specifically for filters (Industry, Category, Subcategory, Chapter, etc.)
 * Supports "All" option, searching, keyboard navigation, and custom object/string option lists.
 */
export function SearchableFilterSelect({
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  allLabel = "All",
  allValue = "all",
  options = [],
  disabled = false,
  className,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel = useMemo(() => {
    if (!value || value === allValue) return allLabel || placeholder;
    const found = options.find((o) => {
      const v = typeof o === "string" ? o : o.value ?? o.name;
      return v === value;
    });
    if (!found) return value;
    return typeof found === "string" ? found : found.label ?? found.name ?? found.value;
  }, [value, allLabel, allValue, placeholder, options]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const label = typeof o === "string" ? o : o.label ?? o.name ?? o.value ?? "";
      return String(label).toLowerCase().includes(q);
    });
  }, [options, search]);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) return;
        setOpen(nextOpen);
        if (!nextOpen) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between font-normal text-xs border-input bg-background hover:bg-muted/50 px-3 cursor-pointer",
            value && value !== allValue ? "text-foreground font-medium" : "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0 shadow-lg border border-border z-50 bg-popover"
        align="start"
      >
        <Command shouldFilter={false} className="rounded-lg">
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
            className="text-xs h-9"
          />
          <CommandList className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
              No matching options found.
            </CommandEmpty>
            <CommandGroup>
              {allLabel && (
                <CommandItem
                  value={allValue}
                  onSelect={() => {
                    onValueChange(allValue);
                    setSearch("");
                    setOpen(false);
                  }}
                  className="text-xs cursor-pointer rounded-md py-1.5"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      !value || value === allValue ? "opacity-100 text-primary" : "opacity-0"
                    )}
                  />
                  <span className={cn(!value || value === allValue ? "font-semibold text-primary" : "")}>
                    {allLabel}
                  </span>
                </CommandItem>
              )}

              {filteredOptions.map((opt, idx) => {
                const optValue = typeof opt === "string" ? opt : opt.value ?? opt.name;
                const optLabel = typeof opt === "string" ? opt : opt.label ?? opt.name ?? opt.value;
                const isSelected = value === optValue;
                return (
                  <CommandItem
                    key={`${optValue}-${idx}`}
                    value={optValue}
                    onSelect={() => {
                      onValueChange(optValue);
                      setSearch("");
                      setOpen(false);
                    }}
                    className="text-xs cursor-pointer rounded-md py-1.5"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        isSelected ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                    <span className={cn("truncate", isSelected ? "font-semibold text-primary" : "")}>
                      {optLabel}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SearchableFilterSelect;
