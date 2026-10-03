"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { MapPin, Loader2, Check, Search } from "lucide-react";
import { toast } from "sonner";

// Fix for default Leaflet marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

function MapEvents({ position, setPosition, setAddress }) {
  const [loading, setLoading] = useState(false);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Reverse Geocoding
      setLoading(true);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            setAddress(data.display_name);
          }
        })
        .catch((err) => {
          console.error("Geocoding error:", err);
          toast.error("Failed to fetch address for this location");
        })
        .finally(() => {
          setLoading(false);
        });
    },
  });

  return position === null ? null : (
    <Marker position={position}>
    </Marker>
  );
}

export function LocationPicker({ initialAddress, onLocationSelect }) {
  // Default to Mumbai
  const [position, setPosition] = useState([19.0760, 72.8777]);
  const [address, setAddress] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsMapReady(true);
  }, []);

  const handleConfirm = () => {
    if (address) {
      onLocationSelect(address);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);
        setAddress(display_name);
      } else {
        toast.error("Location not found. Try a different search term.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  if (!isMapReady) return <div className="h-[300px] bg-muted animate-pulse rounded-xl flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex flex-col space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input 
          placeholder="Search for a place (e.g. Bandra Kurla Complex)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-muted/30"
        />
        <Button type="submit" variant="secondary" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </form>
      
      <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border shadow-sm z-10 relative">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: "100%", width: "100%", zIndex: 10 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={position} />
          <MapEvents position={position} setPosition={setPosition} setAddress={setAddress} />
        </MapContainer>
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-xs font-semibold shadow-md z-[1000] pointer-events-none">
          Click anywhere to drop a pin
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Selected Address</label>
          <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-muted/30 text-sm">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">{address || "No location selected yet..."}</span>
          </div>
        </div>
        <Button 
          type="button" 
          disabled={!address} 
          onClick={handleConfirm}
          className="w-full sm:w-auto gap-2 rounded-xl"
        >
          <Check className="h-4 w-4" />
          Use this Location
        </Button>
      </div>
    </div>
  );
}
