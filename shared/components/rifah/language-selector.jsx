"use client";

import { useTransition, useMemo, useState, useEffect } from "react";
import { Check, Globe, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { cn } from "@shared/lib/utils";
import { LANGUAGES } from "../../config/languages";
import {
  getActiveLanguage,
  changeGoogleTranslateLanguage,
  applyDocumentLanguageDirection,
} from "@shared/lib/google-translate";

export function LanguageSelector({ className }) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLocale, setActiveLocale] = useState("en");

  useEffect(() => {
    const current = getActiveLanguage();
    setActiveLocale(current);
    applyDocumentLanguageDirection(current);
  }, []);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return LANGUAGES;
    const query = searchQuery.toLowerCase();
    return LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleLanguageChange = (newLocale) => {
    startTransition(() => {
      setActiveLocale(newLocale);
      changeGoogleTranslateLanguage(newLocale);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("text-muted-foreground", className)}
          disabled={isPending}
          aria-label="Select Language"
        >
          <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Toggle Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <div className="flex items-center px-2 pb-2 pt-1 sticky top-0 bg-background z-10 border-b">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 shadow-none focus-visible:ring-0 px-0"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="justify-between cursor-pointer"
              >
                <span>
                  {lang.name}{" "}
                  <span className="notranslate text-muted-foreground text-xs ml-1" translate="no">
                    ({lang.nativeName !== lang.name ? `${lang.nativeName} (${lang.name})` : lang.name})
                  </span>
                </span>
                {(activeLocale === lang.code || (!activeLocale && lang.code === 'en')) && (
                  <Check className="h-4 w-4 text-brand" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No language found.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

