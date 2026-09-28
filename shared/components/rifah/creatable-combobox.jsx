"use client";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { Button } from "@shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import { cn } from "@shared/lib/utils";

/**
 * A dropdown that lets the user pick from an existing list of string options,
 * or type a brand-new value that isn't in the list yet (e.g. a new business
 * category). The caller is responsible for persisting new values.
 */
export function CreatableCombobox({
  value,
  onValueChange,
  options = [],
  placeholder = "Select or type to add",
  emptyText = "No matches.",
  disabled = false,
  className,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const normalizedOptions = Array.from(
    new Set(
      options
        .map((o) => (typeof o === "string" ? o : o?.name || o?.label || o?.title || o?.value))
        .filter(Boolean)
    )
  );

  const searchTrimmed = search.trim();
  const exactMatch = normalizedOptions.some(
    (o) => o.toLowerCase() === searchTrimmed.toLowerCase()
  );

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
            "h-11 w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0 shadow-lg border border-border z-50 bg-popover"
        align="start"
      >
        <Command shouldFilter={false} className="rounded-lg">
          <CommandInput
            placeholder="Search or type to add..."
            value={search}
            onValueChange={setSearch}
            className="text-xs h-9"
          />
          <CommandList className="max-h-60 overflow-y-auto p-1">
            <CommandEmpty className="px-3 py-2 text-left text-xs text-muted-foreground">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {normalizedOptions
                .filter((o) => o.toLowerCase().includes(searchTrimmed.toLowerCase()))
                .map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onValueChange(option);
                      setSearch("");
                      setOpen(false);
                    }}
                    className="cursor-pointer text-xs rounded-md py-1.5"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        value === option ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                    <span className={cn("truncate", value === option ? "font-semibold text-primary" : "")}>
                      {option}
                    </span>
                  </CommandItem>
                ))}
              {searchTrimmed && !exactMatch && (
                <CommandItem
                  value={`__create__${searchTrimmed}`}
                  onSelect={() => {
                    onValueChange(searchTrimmed);
                    setSearch("");
                    setOpen(false);
                  }}
                  className="cursor-pointer text-xs rounded-md py-1.5 text-primary font-medium"
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add "{searchTrimmed}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
