"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Award,
  PenTool,
  Upload,
  RotateCcw,
  Check,
  Eye,
  Trash2,
  Sparkles,
  ShieldCheck,
  FileText,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@shared/components/ui/tabs";
import { generateCertificateHtml } from "@shared/lib/certificate-generator";

const DEFAULT_CERTIFICATE_SETTINGS = {
  signatory1: {
    name: "S AMEENUL HASAN",
    title: "(Chairman)",
    signatureUrl: "", // If empty, uses official default
  },
  signatory2: {
    name: "MIRZA AFZAL BAIG",
    title: "(General Secretary)",
    signatureUrl: "", // If empty, uses official default
  },
  admissionText:
    "Has been duly admitted as a Member of the Rifah Chamber of Commerce and Industry. The authorized representative of the organization, as stated in the membership application, is:",
  registeredOffice:
    "Flat No. 4 C & D, 1st Floor, Plot No. 96, 77C, Hamid Building, Mominpura, Jacob Circle, Byculla West, Mumbai – 400011, Maharashtra",
  contactPhone: "+91-8097781851",
  contactEmail: "office@rifah.org",
  website: "www.rifah.org",
  tiers: {
    silver: {
      badgeName: "SILVER",
      accentColor: "#c01e1e",
      templateUrl: "/certificate-silver.jpg",
    },
    gold: {
      badgeName: "GOLD",
      accentColor: "#8b1d1d",
      templateUrl: "/certificate-gold.jpg",
    },
    platinum: {
      badgeName: "PLATINUM",
      accentColor: "#102a45",
      templateUrl: "/certificate-platinum.jpg",
    },
    diamond: {
      badgeName: "DIAMOND",
      accentColor: "#004b87",
      templateUrl: "/certificate-diamond.png",
    },
  },
};

function SignaturePadModal({ open, onOpenChange, onSave, signatoryTitle }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#0b2545");

  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = strokeColor;
      setHasDrawn(false);
    }
  }, [open, strokeColor]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = strokeColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    if (e.cancelable && e.type.startsWith("touch")) e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      toast.error("Please draw a signature first");
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    onOpenChange(false);
    toast.success("Signature applied successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" /> Draw Signature ({signatoryTitle})
          </DialogTitle>
          <DialogDescription>
            Draw signature smoothly using your mouse, trackpad, or touch screen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Select ink color:</span>
            <div className="flex gap-2">
              {[
                { name: "Navy Blue", color: "#0b2545" },
                { name: "Royal Blue", color: "#1d4ed8" },
                { name: "Deep Maroon", color: "#881337" },
                { name: "Black", color: "#111827" },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setStrokeColor(c.color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    strokeColor === c.color ? "border-primary scale-110 shadow-sm" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl bg-white relative overflow-hidden shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={180}
              className="cursor-crosshair touch-none w-full h-[180px]"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <span className="absolute pointer-events-none text-xs text-muted-foreground/60 select-none">
                Sign here with mouse or finger...
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="text-xs text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear Canvas
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleApply} disabled={!hasDrawn}>
                <Check className="h-4 w-4 mr-1" /> Apply Signature
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CertificateSettingsPanel({ initialSettings, onSave, isSaving }) {
  const [certSettings, setCertSettings] = useState(() => ({
    ...DEFAULT_CERTIFICATE_SETTINGS,
    ...(initialSettings || {}),
    signatory1: { ...DEFAULT_CERTIFICATE_SETTINGS.signatory1, ...(initialSettings?.signatory1 || {}) },
    signatory2: { ...DEFAULT_CERTIFICATE_SETTINGS.signatory2, ...(initialSettings?.signatory2 || {}) },
    tiers: {
      silver: { ...DEFAULT_CERTIFICATE_SETTINGS.tiers.silver, ...(initialSettings?.tiers?.silver || {}) },
      gold: { ...DEFAULT_CERTIFICATE_SETTINGS.tiers.gold, ...(initialSettings?.tiers?.gold || {}) },
      platinum: { ...DEFAULT_CERTIFICATE_SETTINGS.tiers.platinum, ...(initialSettings?.tiers?.platinum || {}) },
      diamond: { ...DEFAULT_CERTIFICATE_SETTINGS.tiers.diamond, ...(initialSettings?.tiers?.diamond || {}) },
    },
  }));

  const [activeSignatory, setActiveSignatory] = useState("signatory1");
  const [activeTier, setActiveTier] = useState("diamond");
  const [drawPadOpen, setDrawPadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);
  const templateInputRef = useRef(null);

  useEffect(() => {
    if (initialSettings) {
      setCertSettings((prev) => ({
        ...prev,
        ...initialSettings,
        signatory1: { ...DEFAULT_CERTIFICATE_SETTINGS.signatory1, ...(initialSettings.signatory1 || {}) },
        signatory2: { ...DEFAULT_CERTIFICATE_SETTINGS.signatory2, ...(initialSettings.signatory2 || {}) },
        tiers: {
          silver: { ...DEFAULT_CERTIFICATE_SETTINGS.tiers.silver, ...(initialSettings?.tiers?.silver || {}) },
          gold: { ...DEFAULT_CERTIFICATE_SETTINGS.tiers.gold, ...(initialSettings?.tiers?.gold || {}) },
          platinum: { ...DEFAULT_CERTIFICATE_SETTINGS.tiers.platinum, ...(initialSettings?.tiers?.platinum || {}) },
          diamond: { ...DEFAULT_CERTIFICATE_SETTINGS.tiers.diamond, ...(initialSettings?.tiers?.diamond || {}) },
        },
      }));
    }
  }, [initialSettings]);

  const handleFileUpload = (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (typeof dataUrl === "string") {
        if (targetField === "signatory1") {
          setCertSettings((prev) => ({
            ...prev,
            signatory1: { ...prev.signatory1, signatureUrl: dataUrl },
          }));
          toast.success("Primary signatory signature uploaded!");
        } else if (targetField === "signatory2") {
          setCertSettings((prev) => ({
            ...prev,
            signatory2: { ...prev.signatory2, signatureUrl: dataUrl },
          }));
          toast.success("Secondary signatory signature uploaded!");
        } else if (targetField.startsWith("tier_")) {
          const tierKey = targetField.replace("tier_", "");
          setCertSettings((prev) => ({
            ...prev,
            tiers: {
              ...prev.tiers,
              [tierKey]: { ...prev.tiers[tierKey], templateUrl: dataUrl },
            },
          }));
          toast.success(`${tierKey.toUpperCase()} template image updated!`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenPreview = () => {
    const mockBusiness = {
      name: "TATA Power Enterprise",
      chapter: "MUM",
      membershipId: "RCCI/MH/0001",
      fullAddress: "30 Number Ground Floor, Millennium Commercial Tower, Ring Road, Surat, Gujarat",
      contactPerson: "Raj Sharma",
      membership: activeTier,
      createdAt: new Date("2025-07-03"),
    };
    const mockMembership = {
      planName: activeTier.toUpperCase(),
      startDate: new Date("2025-07-03"),
      endDate: new Date("2026-09-16"),
    };

    const html = generateCertificateHtml(mockBusiness, mockMembership, {
      isPreview: true,
      tier: activeTier,
      customSettings: certSettings,
    });
    setPreviewHtml(html);
    setPreviewOpen(true);
  };

  const handleResetDefaults = () => {
    setCertSettings(DEFAULT_CERTIFICATE_SETTINGS);
    toast.info("Certificate settings reset to system defaults. Click Save Changes to commit.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Certificate Customization & Governance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure official membership certificate badges, templates, authorization text, and digital signatures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => onSave(certSettings)}
            disabled={isSaving}
            className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Check className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Certificate Settings"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleOpenPreview} className="gap-1.5 text-xs">
            <Eye className="h-4 w-4" /> Preview ({activeTier.toUpperCase()})
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleResetDefaults} className="text-xs text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Defaults
          </Button>
        </div>
      </div>

      {/* SECTION 1: AUTHORIZED SECRETARIAT SIGNATORIES */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Authorized Signatories</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
              Dual Signatures
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => onSave(certSettings)}
              disabled={isSaving}
              className="gap-1.5 text-xs font-semibold h-7 px-3 bg-primary text-primary-foreground shadow-xs"
            >
              <Check className="h-3 w-3" /> {isSaving ? "Saving..." : "Save Signatures"}
            </Button>
          </div>
        </div>

        <Tabs value={activeSignatory} onValueChange={setActiveSignatory} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-sm mb-4">
            <TabsTrigger value="signatory1" className="text-xs font-semibold">
              Primary Signatory (Chairman)
            </TabsTrigger>
            <TabsTrigger value="signatory2" className="text-xs font-semibold">
              Secondary Signatory (General Sec.)
            </TabsTrigger>
          </TabsList>

          {/* SIGNATORY 1 */}
          <TabsContent value="signatory1" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Signatory Name</Label>
                <Input
                  value={certSettings.signatory1.name}
                  onChange={(e) =>
                    setCertSettings({
                      ...certSettings,
                      signatory1: { ...certSettings.signatory1, name: e.target.value },
                    })
                  }
                  className="h-10 text-sm"
                  placeholder="S AMEENUL HASAN"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Designation / Role Title</Label>
                <Input
                  value={certSettings.signatory1.title}
                  onChange={(e) =>
                    setCertSettings({
                      ...certSettings,
                      signatory1: { ...certSettings.signatory1, title: e.target.value },
                    })
                  }
                  className="h-10 text-sm"
                  placeholder="(Chairman)"
                />
              </div>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-lg border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-32 h-14 bg-white rounded border border-border/80 flex items-center justify-center overflow-hidden shadow-inner p-1">
                  {certSettings.signatory1.signatureUrl ? (
                    <img
                      src={certSettings.signatory1.signatureUrl}
                      alt="Signature 1"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-serif italic">Official Default</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Signature Image</p>
                  <p className="text-[11px] text-muted-foreground">
                    {certSettings.signatory1.signatureUrl ? "Custom signature applied" : "Using authentic official template signature"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawPadOpen(true)}
                  className="text-xs gap-1.5"
                >
                  <PenTool className="h-3.5 w-3.5 text-primary" /> Draw Signature
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef1.current?.click()}
                  className="text-xs gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" /> Upload PNG
                </Button>
                <input
                  type="file"
                  ref={fileInputRef1}
                  className="hidden"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleFileUpload(e, "signatory1")}
                />
                {certSettings.signatory1.signatureUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCertSettings((prev) => ({
                        ...prev,
                        signatory1: { ...prev.signatory1, signatureUrl: "" },
                      }))
                    }
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* SIGNATORY 2 */}
          <TabsContent value="signatory2" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Signatory Name</Label>
                <Input
                  value={certSettings.signatory2.name}
                  onChange={(e) =>
                    setCertSettings({
                      ...certSettings,
                      signatory2: { ...certSettings.signatory2, name: e.target.value },
                    })
                  }
                  className="h-10 text-sm"
                  placeholder="MIRZA AFZAL BAIG"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Designation / Role Title</Label>
                <Input
                  value={certSettings.signatory2.title}
                  onChange={(e) =>
                    setCertSettings({
                      ...certSettings,
                      signatory2: { ...certSettings.signatory2, title: e.target.value },
                    })
                  }
                  className="h-10 text-sm"
                  placeholder="(General Secretary)"
                />
              </div>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-lg border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-32 h-14 bg-white rounded border border-border/80 flex items-center justify-center overflow-hidden shadow-inner p-1">
                  {certSettings.signatory2.signatureUrl ? (
                    <img
                      src={certSettings.signatory2.signatureUrl}
                      alt="Signature 2"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-serif italic">Official Default</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Signature Image</p>
                  <p className="text-[11px] text-muted-foreground">
                    {certSettings.signatory2.signatureUrl ? "Custom signature applied" : "Using authentic official template signature"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawPadOpen(true)}
                  className="text-xs gap-1.5"
                >
                  <PenTool className="h-3.5 w-3.5 text-primary" /> Draw Signature
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef2.current?.click()}
                  className="text-xs gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" /> Upload PNG
                </Button>
                <input
                  type="file"
                  ref={fileInputRef2}
                  className="hidden"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleFileUpload(e, "signatory2")}
                />
                {certSettings.signatory2.signatureUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCertSettings((prev) => ({
                        ...prev,
                        signatory2: { ...prev.signatory2, signatureUrl: "" },
                      }))
                    }
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* SECTION 2: MEMBERSHIP BADGES & TIER APPEARANCE */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Membership Tiers & Badges</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Customize colors & templates per plan</span>
        </div>

        <Tabs value={activeTier} onValueChange={setActiveTier} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="silver" className="text-xs font-semibold">
              Silver
            </TabsTrigger>
            <TabsTrigger value="gold" className="text-xs font-semibold">
              Gold
            </TabsTrigger>
            <TabsTrigger value="platinum" className="text-xs font-semibold">
              Platinum
            </TabsTrigger>
            <TabsTrigger value="diamond" className="text-xs font-semibold">
              Diamond
            </TabsTrigger>
          </TabsList>

          {["silver", "gold", "platinum", "diamond"].map((tierKey) => {
            const tierData = certSettings.tiers[tierKey] || DEFAULT_CERTIFICATE_SETTINGS.tiers[tierKey];
            return (
              <TabsContent key={tierKey} value={tierKey} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Badge Title</Label>
                    <Input
                      value={tierData.badgeName}
                      onChange={(e) =>
                        setCertSettings({
                          ...certSettings,
                          tiers: {
                            ...certSettings.tiers,
                            [tierKey]: { ...tierData, badgeName: e.target.value },
                          },
                        })
                      }
                      className="h-10 text-sm"
                      placeholder={tierKey.toUpperCase()}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Text & Accent Color</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={tierData.accentColor}
                        onChange={(e) =>
                          setCertSettings({
                            ...certSettings,
                            tiers: {
                              ...certSettings.tiers,
                              [tierKey]: { ...tierData, accentColor: e.target.value },
                            },
                          })
                        }
                        className="w-10 h-10 rounded border border-border cursor-pointer p-0.5 bg-white"
                      />
                      <Input
                        value={tierData.accentColor}
                        onChange={(e) =>
                          setCertSettings({
                            ...certSettings,
                            tiers: {
                              ...certSettings.tiers,
                              [tierKey]: { ...tierData, accentColor: e.target.value },
                            },
                          })
                        }
                        className="h-10 text-sm font-mono flex-1"
                        placeholder="#004b87"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Custom Template Image</Label>
                    <div className="flex gap-2 items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => templateInputRef.current?.click()}
                        className="h-10 text-xs w-full gap-1.5"
                      >
                        <ImageIcon className="h-4 w-4" /> Upload Template
                      </Button>
                      <input
                        type="file"
                        ref={templateInputRef}
                        className="hidden"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleFileUpload(e, `tier_${tierKey}`)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground p-2.5 bg-muted/30 rounded border border-border/50">
                  <span>Current template: <code className="text-foreground">{tierData.templateUrl}</code></span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px]"
                    onClick={() =>
                      setCertSettings((prev) => ({
                        ...prev,
                        tiers: {
                          ...prev.tiers,
                          [tierKey]: {
                            ...prev.tiers[tierKey],
                            templateUrl: DEFAULT_CERTIFICATE_SETTINGS.tiers[tierKey].templateUrl,
                          },
                        },
                      }))
                    }
                  >
                    Reset to Default Template
                  </Button>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* SECTION 3: LEGAL STATEMENTS & OFFICE DETAILS */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Certificate Statements & Secretariat Office</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Admission Statement Paragraph</Label>
            <Textarea
              rows={2}
              value={certSettings.admissionText}
              onChange={(e) => setCertSettings({ ...certSettings, admissionText: e.target.value })}
              className="text-xs font-serif leading-relaxed"
              placeholder="Has been duly admitted as a Member of the Rifah Chamber of Commerce and Industry..."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-3">
              <Label className="text-xs">Registered Secretariat Office Address</Label>
              <Input
                value={certSettings.registeredOffice}
                onChange={(e) => setCertSettings({ ...certSettings, registeredOffice: e.target.value })}
                className="h-10 text-xs"
                placeholder="Flat No. 4 C & D, 1st Floor, Plot No. 96..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Office Contact Phone</Label>
              <Input
                value={certSettings.contactPhone}
                onChange={(e) => setCertSettings({ ...certSettings, contactPhone: e.target.value })}
                className="h-10 text-xs font-mono"
                placeholder="+91-8097781851"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Office Contact Email</Label>
              <Input
                value={certSettings.contactEmail}
                onChange={(e) => setCertSettings({ ...certSettings, contactEmail: e.target.value })}
                className="h-10 text-xs"
                placeholder="office@rifah.org"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Official Chamber Website</Label>
              <Input
                value={certSettings.website}
                onChange={(e) => setCertSettings({ ...certSettings, website: e.target.value })}
                className="h-10 text-xs"
                placeholder="www.rifah.org"
              />
            </div>
          </div>
        </div>
      </div>

      {/* COMMIT SAVE ACTION */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          Updates take effect immediately on all freshly generated and downloaded certificates.
        </p>
        <Button onClick={() => onSave(certSettings)} disabled={isSaving} className="gap-2 px-6">
          <Check className="h-4 w-4" /> {isSaving ? "Saving Settings..." : "Save Certificate Settings"}
        </Button>
      </div>

      {/* Signature Draw Modal */}
      <SignaturePadModal
        open={drawPadOpen}
        onOpenChange={setDrawPadOpen}
        signatoryTitle={activeSignatory === "signatory1" ? certSettings.signatory1.title : certSettings.signatory2.title}
        onSave={(dataUrl) => {
          setCertSettings((prev) => ({
            ...prev,
            [activeSignatory]: { ...prev[activeSignatory], signatureUrl: dataUrl },
          }));
        }}
      />

      {/* Interactive Live Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl p-2 bg-slate-950 border-slate-800">
          <DialogHeader className="px-4 pt-3 pb-1">
            <DialogTitle className="text-sm text-slate-200 flex items-center justify-between">
              <span>Live Certificate Preview ({activeTier.toUpperCase()} Tier)</span>
              <span className="text-xs text-slate-400 font-normal">Accredited Member Layout</span>
            </DialogTitle>
          </DialogHeader>
          <div className="w-full aspect-[1.414/1] max-h-[75vh] overflow-hidden rounded bg-white">
            <iframe
              srcDoc={previewHtml}
              title="Certificate Live Preview"
              className="w-full h-full border-0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
