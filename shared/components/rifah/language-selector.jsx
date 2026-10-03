"use client";

import { useTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Check, Globe, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { LANGUAGES } from "../../config/languages";

export function LanguageSelector() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

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
      // Set NEXT_LOCALE for any remaining next-intl functionality
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      
      // Set Google Translate cookie. Google's widget sets googtrans with a
      // leading-dot domain, so clearing it must match that exact domain
      // attribute (a cookie can only be deleted by a write with the same
      // domain it was set with) — clear every plausible variant.
      if (newLocale === 'en') {
        const hostname = window.location.hostname;
        document.cookie = `googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
        document.cookie = `googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      } else {
        document.cookie = `googtrans=/en/${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      }
      
      // Reload the page to apply Google Translate
      window.location.reload();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground" disabled={isPending}>
          <Globe className="h-5 w-5" />
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
                  {lang.name} <span className="text-muted-foreground text-xs ml-1">({lang.nativeName})</span>
                </span>
                {locale === lang.code && <Check className="h-4 w-4" />}
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

