"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin, ExternalLink } from "lucide-react";

export function StaticMap({ address }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    // Fetch coordinates for the given address string via OSM Nominatim
    const query = encodeURIComponent(address);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        } else {
          // Fallback coordinates (Mumbai, India)
          setCoords({ lat: 19.076, lon: 72.8777 });
        }
      })
      .catch((err) => {
        console.error("Geocoding error:", err);
        setCoords({ lat: 19.076, lon: 72.8777 });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address]);

  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : `https://www.google.com/maps?q=${coords?.lat || 19.076},${coords?.lon || 72.8777}`;

  if (loading) {
    return (
      <div className="h-full w-full min-h-[220px] bg-muted/40 rounded-2xl flex flex-col items-center justify-center gap-2 border border-border">
        <Loader2 className="animate-spin text-primary h-6 w-6" />
        <span className="text-xs text-muted-foreground font-medium">Loading event venue map...</span>
      </div>
    );
  }

  const lat = coords?.lat || 19.076;
  const lon = coords?.lon || 72.8777;
  const bbox = `${lon - 0.008}%2C${lat - 0.006}%2C${lon + 0.008}%2C${lat + 0.006}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="relative h-full w-full min-h-[220px] rounded-2xl overflow-hidden border border-border shadow-2xs group">
      <iframe
        title="Event Location Map"
        width="100%"
        height="100%"
        className="w-full h-full min-h-[220px] border-0"
        src={embedUrl}
        loading="lazy"
      />
      <div className="absolute bottom-2.5 right-2.5 z-10">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border text-xs font-semibold text-foreground hover:text-primary shadow-sm hover:shadow transition-all"
        >
          <MapPin className="h-3.5 w-3.5 text-rose-500" />
          <span>Open in Google Maps</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      </div>
    </div>
  );
}

export default StaticMap;
