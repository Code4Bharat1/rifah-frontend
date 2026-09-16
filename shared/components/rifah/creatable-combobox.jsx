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
    new Set(options.map((o) => (typeof o === "string" ? o : o?.name)).filter(Boolean))
  );

  const searchTrimmed = search.trim();
  const exactMatch = normalizedOptions.some(
    (o) => o.toLowerCase() === searchTrimmed.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or type new..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="px-3 py-2 text-left text-sm">
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
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
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
                >
                  <Plus className="mr-2 h-4 w-4" />
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
