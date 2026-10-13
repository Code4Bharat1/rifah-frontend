"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, Check, AlertCircle, Scan, Keyboard } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";

export function TicketScanner({ onScan, onError, options = {} }) {
  const [manualCode, setManualCode] = useState("");
  const [mode, setMode] = useState("camera"); // "camera" | "manual"
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanningIntervalRef = useRef(null);

  // Initialize camera when in camera mode
  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (mode !== "camera") return;
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }

        // Check if browser supports BarcodeDetector API natively
        if ("BarcodeDetector" in window) {
          try {
            const barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "ean_13"] });
            scanningIntervalRef.current = setInterval(async () => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                try {
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes && barcodes.length > 0) {
                    const val = barcodes[0].rawValue;
                    if (val && onScan) {
                      onScan(val);
                    }
                  }
                } catch (e) {
                  // Frame detect error
                }
              }
            }, options.delayBetweenScanAttempts || 800);
          } catch (e) {
            console.log("BarcodeDetector initialization failed, camera view active:", e);
          }
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable:", err);
        setCameraError(err.message || "Camera access unavailable");
        if (onError) onError(err);
      }
    }

    startCamera();

    return () => {
      active = false;
      if (scanningIntervalRef.current) clearInterval(scanningIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mode, onScan, onError, options.delayBetweenScanAttempts]);

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (!manualCode.trim()) return;
    if (onScan) {
      onScan(manualCode.trim());
    }
    setManualCode("");
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 bg-zinc-950 text-white relative">
      <div className="w-full flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
          <Scan className="w-4 h-4 text-primary" /> Live Ticket Scanner
        </span>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant={mode === "camera" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setMode("camera")}
          >
            <Camera className="w-3.5 h-3.5 mr-1" /> Camera
          </Button>
          <Button
            size="sm"
            variant={mode === "manual" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setMode("manual")}
          >
            <Keyboard className="w-3.5 h-3.5 mr-1" /> Manual
          </Button>
        </div>
      </div>

      {mode === "camera" ? (
        <div className="w-full flex-1 relative flex items-center justify-center rounded-lg overflow-hidden bg-black border border-zinc-800">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

          {/* Scanner Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-primary/80 rounded-xl relative shadow-[0_0_20px_rgba(37,99,235,0.3)] animate-pulse">
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-primary rounded-tl" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-primary rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-primary rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-primary rounded-br" />
            </div>
          </div>

          {cameraError && (
            <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-xs text-zinc-300 mb-3">{cameraError}</p>
              <Button size="sm" variant="outline" onClick={() => setMode("manual")}>
                Switch to Manual Code Entry
              </Button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="w-full flex-1 flex flex-col justify-center gap-3 max-w-xs">
          <div className="space-y-1.5 text-center">
            <p className="text-xs text-zinc-300">Enter attendee ticket ID or scan URL manually:</p>
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. RIFAH-EVT-2026-B4F911"
              className="bg-zinc-900 border-zinc-700 text-white text-center text-sm"
              autoFocus
            />
          </div>
          <Button type="submit" size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
            <Check className="w-4 h-4 mr-1.5" /> Validate Ticket
          </Button>
        </form>
      )}

      {/* Manual Quick Entry Bar under camera */}
      {mode === "camera" && (
        <form onSubmit={handleManualSubmit} className="w-full mt-3 flex gap-2">
          <Input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Or type Ticket ID (e.g. RIFAH-EVT-...)"
            className="h-8 text-xs bg-zinc-900 border-zinc-800 text-white flex-1"
          />
          <Button type="submit" size="sm" className="h-8 text-xs px-3">
            Check
          </Button>
        </form>
      )}
    </div>
  );
}

export const Scanner = TicketScanner;
export default TicketScanner;