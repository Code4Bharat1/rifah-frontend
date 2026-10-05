"use client";

import { useState, useEffect } from "react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { MapPin, Loader2, Check, Search, Navigation } from "lucide-react";
import { toast } from "sonner";

export function LocationPicker({ initialAddress = "", onLocationSelect }) {
  const [position, setPosition] = useState([19.076, 72.8777]); // Default Mumbai
  const [address, setAddress] = useState(initialAddress || "");
  const [searchQuery, setSearchQuery] = useState(initialAddress || "");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
      setSearchQuery(initialAddress);
    }
  }, [initialAddress]);

  const handleConfirm = () => {
    if (address && onLocationSelect) {
      onLocationSelect(address);
      toast.success("Location selected successfully!");
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=5`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        setSuggestions(data);
        const { lat, lon, display_name } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setAddress(display_name);
      } else {
        toast.error("Location not found. Try a different landmark, city or pincode.");
      }
    } catch (err) {
      console.error("Geocoding search error:", err);
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  const selectSuggestion = (item) => {
    setPosition([parseFloat(item.lat), parseFloat(item.lon)]);
    setAddress(item.display_name);
    setSearchQuery(item.display_name);
    setSuggestions([]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPosition([lat, lon]);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
            setSearchQuery(data.display_name);
            toast.success("Current location detected");
          }
        } catch (err) {
          toast.error("Could not fetch address details for current GPS coordinates");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error("Unable to access current location. Please allow location permissions.");
      },
      { timeout: 10000 }
    );
  };

  const lat = position[0];
  const lon = position[1];
  const bbox = `${lon - 0.008}%2C${lat - 0.006}%2C${lon + 0.008}%2C${lat + 0.006}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="flex flex-col space-y-3">
      {/* Search Input and Action Buttons */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search venue, landmark, street, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/30 pr-8 rounded-xl"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            type="submit"
            variant="secondary"
            disabled={isSearching || !searchQuery.trim()}
            className="gap-1.5 rounded-xl text-xs font-semibold cursor-pointer"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            <span>Search</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            title="Use current GPS location"
            className="gap-1.5 rounded-xl text-xs font-semibold cursor-pointer"
          >
            {isLocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5 text-primary" />}
            <span className="hidden sm:inline">GPS</span>
          </Button>
        </div>
      </form>

      {/* Suggestion Dropdown */}
      {suggestions.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-1.5 shadow-md space-y-1 max-h-48 overflow-y-auto no-scrollbar z-20">
          <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5">Matching Locations</p>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectSuggestion(item)}
              className="w-full text-left p-2 rounded-lg hover:bg-muted/70 text-xs flex items-start gap-2 cursor-pointer transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span className="text-foreground line-clamp-2 leading-tight">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Map Embed Container */}
      <div className="h-[260px] sm:h-[300px] w-full rounded-2xl overflow-hidden border border-border shadow-xs relative bg-muted/30">
        <iframe
          title="Location Map"
          width="100%"
          height="100%"
          className="w-full h-full border-0"
          src={embedUrl}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[11px] font-bold text-foreground border border-border shadow-sm pointer-events-none flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-rose-500" />
          <span>Selected Map Pin</span>
        </div>
      </div>

      {/* Selected Address Display & Confirmation Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
        <div className="flex-1 min-w-0 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Selected Venue Address</label>
          <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-muted/30 text-xs text-foreground font-medium">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">{address || "Search or select a location on map..."}</span>
          </div>
        </div>

        <Button
          type="button"
          disabled={!address}
          onClick={handleConfirm}
          className="sm:self-end h-10 px-5 gap-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm hover:shadow cursor-pointer"
        >
          <Check className="h-4 w-4" />
          <span>Confirm & Use Location</span>
        </Button>
      </div>
    </div>
  );
}

export default LocationPicker;
