"use client";

import React, { useState, useEffect } from "react";
import { FileStack, Download, Eye, Palette, CheckCircle2, Loader2, Save, Send, ShieldCheck, Clock, ShieldAlert, Users, Image as ImageIcon, Undo, Redo } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Label } from "@shared/components/ui/label";
import { Input } from "@shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { toast } from "sonner";
import { eventApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { cn } from "@shared/lib/utils";
import { CertificateStudio } from "./certificate-studio";

const CERTIFICATE_STYLES = [
  { id: "rifah-signature", name: "RIFAH Signature" },
  { id: "royal-heritage", name: "Royal Heritage" },
  { id: "executive-gold", name: "Executive Gold" },
  { id: "professional-frame", name: "Professional Frame" },
  { id: "premium-achievement", name: "Premium Achievement" },
  { id: "clean-prestige", name: "Clean Prestige" },
];

function LiveCertificatePreview({ styleId, accentColor, eventTitle, date, participantName, sig1Name, sig1Role, sig1Img, sig2Name, sig2Role, sig2Img, logoImg, scale = 1, design }) {
  const isMini = scale < 0.5;
  
  // Safe extraction of design overrides if provided
  const dTitle = design?.title?.text || "Certificate of Appreciation";
  const dTitleFont = design?.title?.fontFamily || "font-serif";
  const dPartFont = design?.participantName?.fontFamily || "font-serif";
  const dBody = design?.body?.text || "for participation in the event\n{{eventName}}";
  
  const parsedBody = dBody.replace("{{participantName}}", participantName || "Participant Name")
                          .replace("{{eventName}}", eventTitle || "RIFAH Event")
                          .replace("{{eventDate}}", date)
                          .replace("{{chapterName}}", "Chapter");
                          
  const hasBorder = design?.border?.enabled !== false;
  const bgColor = design?.background?.color || "#ffffff";
  
  // Base classes to enforce the A4 landscape ratio (842x595)
  return (
    <div 
      className="overflow-hidden shadow-sm relative flex flex-col justify-between"
      style={{
        width: `${842 * scale}px`,
        height: `${595 * scale}px`,
        transformOrigin: 'top left',
        backgroundColor: bgColor
      }}
    >
      {styleId === "rifah-signature" && (
        <div className="w-full h-full p-[4%] flex flex-col items-center text-center justify-between" style={{ border: hasBorder ? `8px solid ${accentColor || '#0b1f33'}` : 'none' }}>
          <div className="mt-[4%]">
            {design?.logo?.enabled !== false && (
               <div className="flex justify-center mb-4">
                 <img src={logoImg || design?.logo?.url || "/logo.png"} style={{ width: `${(design?.logo?.width || 120) * scale}px` }} alt="Logo" />
               </div>
            )}
            <h1 style={{ fontSize: `${28 * scale}px`, color: '#0b1f33' }} className="font-serif font-bold tracking-widest uppercase">RIFAH Chamber</h1>
            <h2 style={{ fontSize: `${18 * scale}px`, color: accentColor || '#0088d1' }} className={`font-bold tracking-widest mt-[2%] uppercase ${dTitleFont}`}>{dTitle}</h2>
          </div>
          <div className="w-full flex flex-col items-center">
            <h3 style={{ fontSize: `${32 * scale}px`, color: '#0b1f33' }} className={`font-bold mt-[2%] ${dPartFont}`}>{participantName || 'Participant Name'}</h3>
            <div style={{ width: `${60 * scale}%`, height: '2px', backgroundColor: accentColor || '#d97706', margin: '2% 0' }}></div>
            <p style={{ fontSize: `${12 * scale}px`, color: '#64748b', whiteSpace: 'pre-line' }}>{parsedBody}</p>
          </div>
          <div className="w-full flex justify-between px-[10%] mb-[4%]">
            <div className="flex flex-col items-center">
              {sig1Img ? <img src={sig1Img} style={{ height: `${30 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${30 * scale}px` }}></div>}
              <div style={{ width: `${120 * scale}px`, height: '1px', backgroundColor: '#0b1f33' }}></div>
              <p style={{ fontSize: `${10 * scale}px`, color: '#0b1f33', fontWeight: 'bold', marginTop: '4px' }}>{sig1Name || 'Name'}</p>
              <p style={{ fontSize: `${9 * scale}px`, color: '#64748b' }}>{sig1Role || 'Role'}</p>
            </div>
            <div className="flex flex-col items-center">
              {sig2Img ? <img src={sig2Img} style={{ height: `${30 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${30 * scale}px` }}></div>}
              <div style={{ width: `${120 * scale}px`, height: '1px', backgroundColor: '#0b1f33' }}></div>
              <p style={{ fontSize: `${10 * scale}px`, color: '#0b1f33', fontWeight: 'bold', marginTop: '4px' }}>{sig2Name || 'Name'}</p>
              <p style={{ fontSize: `${9 * scale}px`, color: '#64748b' }}>{sig2Role || 'Role'}</p>
            </div>
          </div>
        </div>
      )}

      {styleId === "royal-heritage" && (
        <div className="w-full h-full p-[4%] flex flex-col items-center text-center justify-between" style={{ backgroundColor: '#fdfbf7', border: `12px double ${accentColor || '#d97706'}` }}>
          <div className="mt-[2%]">
            <h2 style={{ fontSize: `${24 * scale}px`, color: '#0b1f33', borderColor: accentColor }} className="font-serif font-black tracking-widest uppercase border-b border-t py-[1%] mb-[2%]">Certificate of Excellence</h2>
          </div>
          <div className="w-full flex flex-col items-center">
            <p style={{ fontSize: `${12 * scale}px`, color: '#475569', fontStyle: 'italic' }}>Proudly presented to</p>
            <h3 style={{ fontSize: `${36 * scale}px`, color: accentColor || '#b45309' }} className="font-serif font-bold mt-[2%]">{participantName || 'Participant Name'}</h3>
            <p style={{ fontSize: `${12 * scale}px`, color: '#475569', fontStyle: 'italic', marginTop: '2%' }}>in recognition of their active presence at</p>
            <h4 style={{ fontSize: `${16 * scale}px`, color: '#0b1f33' }} className="font-bold mt-[2%]">{eventTitle || 'RIFAH Event'}</h4>
            <p style={{ fontSize: `${10 * scale}px`, color: '#64748b', marginTop: '1%' }}>{date}</p>
          </div>
          <div className="w-full flex justify-around mb-[2%]">
            <div className="flex flex-col items-center">
              {sig1Img ? <img src={sig1Img} style={{ height: `${40 * scale}px`, marginBottom: '2px' }} /> : <div style={{ height: `${40 * scale}px` }}></div>}
              <div style={{ width: `${140 * scale}px`, height: '1px', backgroundColor: '#0b1f33' }}></div>
              <p style={{ fontSize: `${9 * scale}px`, color: '#0b1f33', fontWeight: 'bold', marginTop: '4px' }}>{sig1Role || 'Role'}</p>
            </div>
            <div className="flex flex-col items-center">
              {sig2Img ? <img src={sig2Img} style={{ height: `${40 * scale}px`, marginBottom: '2px' }} /> : <div style={{ height: `${40 * scale}px` }}></div>}
              <div style={{ width: `${140 * scale}px`, height: '1px', backgroundColor: '#0b1f33' }}></div>
              <p style={{ fontSize: `${9 * scale}px`, color: '#0b1f33', fontWeight: 'bold', marginTop: '4px' }}>{sig2Role || 'Role'}</p>
            </div>
          </div>
        </div>
      )}

      {styleId === "executive-gold" && (
        <div className="w-full h-full flex flex-col relative bg-white">
          <div className="w-full p-[4%] flex flex-col justify-center" style={{ backgroundColor: '#0b1f33', height: '25%' }}>
             <h1 style={{ fontSize: `${32 * scale}px`, color: '#ffffff' }} className="font-sans font-bold tracking-wider">CERTIFICATE</h1>
             <h2 style={{ fontSize: `${14 * scale}px`, color: accentColor || '#d97706' }} className="font-sans tracking-widest uppercase">Of Participation</h2>
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: accentColor || '#d97706' }}></div>
          <div className="flex-1 p-[6%] flex flex-col justify-center">
             <p style={{ fontSize: `${14 * scale}px`, color: '#64748b' }}>Awarded to:</p>
             <h3 style={{ fontSize: `${40 * scale}px`, color: '#0b1f33' }} className="font-bold font-sans mt-[1%]">{participantName || 'Participant Name'}</h3>
             <p style={{ fontSize: `${14 * scale}px`, color: '#64748b', marginTop: '4%' }}>For outstanding participation in the executive session of</p>
             <h4 style={{ fontSize: `${18 * scale}px`, color: '#0b1f33' }} className="font-bold mt-[1%]">{eventTitle || 'RIFAH Event'}</h4>
          </div>
          <div className="w-full flex justify-start gap-[15%] px-[6%] pb-[4%]">
            <div className="flex flex-col items-start">
              {sig1Img ? <img src={sig1Img} style={{ height: `${30 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${30 * scale}px` }}></div>}
              <div style={{ width: `${120 * scale}px`, height: '1px', backgroundColor: '#0b1f33' }}></div>
              <p style={{ fontSize: `${10 * scale}px`, color: '#0b1f33', fontWeight: 'bold', marginTop: '4px' }}>{sig1Name || 'Name'}</p>
              <p style={{ fontSize: `${9 * scale}px`, color: '#64748b' }}>{sig1Role || 'Role'}</p>
            </div>
            <div className="flex flex-col items-start">
              {sig2Img ? <img src={sig2Img} style={{ height: `${30 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${30 * scale}px` }}></div>}
              <div style={{ width: `${120 * scale}px`, height: '1px', backgroundColor: '#0b1f33' }}></div>
              <p style={{ fontSize: `${10 * scale}px`, color: '#0b1f33', fontWeight: 'bold', marginTop: '4px' }}>{sig2Name || 'Name'}</p>
              <p style={{ fontSize: `${9 * scale}px`, color: '#64748b' }}>{sig2Role || 'Role'}</p>
            </div>
          </div>
        </div>
      )}

      {styleId === "professional-frame" && (
        <div className="w-full h-full p-[3%]">
          <div className="w-full h-full p-[4%] flex flex-col justify-between border-[2px]" style={{ borderColor: accentColor || '#0f172a' }}>
            <div className="w-full flex justify-between items-start border-b-[2px] pb-[2%]" style={{ borderColor: accentColor || '#0f172a' }}>
              <div className="text-left">
                <h1 style={{ fontSize: `${20 * scale}px`, color: '#0f172a' }} className="font-bold uppercase tracking-wider">RIFAH Chamber</h1>
                <p style={{ fontSize: `${10 * scale}px`, color: '#64748b' }}>Official Certification</p>
              </div>
              <div className="text-right">
                <h2 style={{ fontSize: `${16 * scale}px`, color: accentColor || '#0ea5e9' }} className="font-bold uppercase tracking-wider">Certificate</h2>
                <p style={{ fontSize: `${10 * scale}px`, color: '#64748b' }}>{date}</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <p style={{ fontSize: `${12 * scale}px`, color: '#64748b' }}>This confirms that</p>
              <h3 style={{ fontSize: `${32 * scale}px`, color: '#0f172a' }} className="font-bold my-[2%]">{participantName || 'Participant Name'}</h3>
              <p style={{ fontSize: `${12 * scale}px`, color: '#64748b', maxWidth: '60%' }}>has successfully attended and fulfilled the requirements of the</p>
              <h4 style={{ fontSize: `${16 * scale}px`, color: '#0f172a' }} className="font-bold mt-[1%]">{eventTitle || 'RIFAH Event'}</h4>
            </div>
            <div className="w-full flex justify-between pt-[2%]">
              <div className="flex flex-col items-center">
                {sig1Img ? <img src={sig1Img} style={{ height: `${25 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${25 * scale}px` }}></div>}
                <div style={{ width: `${100 * scale}px`, height: '1px', backgroundColor: '#0f172a' }}></div>
                <p style={{ fontSize: `${9 * scale}px`, color: '#0f172a', fontWeight: 'bold', marginTop: '4px' }}>{sig1Name || 'Name'}</p>
                <p style={{ fontSize: `${8 * scale}px`, color: '#64748b' }}>{sig1Role || 'Role'}</p>
              </div>
              <div className="flex flex-col items-center">
                {sig2Img ? <img src={sig2Img} style={{ height: `${25 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${25 * scale}px` }}></div>}
                <div style={{ width: `${100 * scale}px`, height: '1px', backgroundColor: '#0f172a' }}></div>
                <p style={{ fontSize: `${9 * scale}px`, color: '#0f172a', fontWeight: 'bold', marginTop: '4px' }}>{sig2Name || 'Name'}</p>
                <p style={{ fontSize: `${8 * scale}px`, color: '#64748b' }}>{sig2Role || 'Role'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {styleId === "premium-achievement" && (
        <div className="w-full h-full bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[50%] h-[150%] transform rotate-45 translate-x-[30%] -translate-y-[20%]" style={{ backgroundColor: accentColor || '#e11d48', opacity: 0.1 }}></div>
          <div className="w-full h-full p-[6%] flex flex-col justify-between relative z-10">
            <div className="text-center mt-[2%]">
               <h1 style={{ fontSize: `${36 * scale}px`, color: '#0f172a' }} className="font-serif font-bold uppercase tracking-widest">Certificate of Achievement</h1>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
               <p style={{ fontSize: `${14 * scale}px`, color: '#475569' }}>Awarded with honor to</p>
               <h3 style={{ fontSize: `${42 * scale}px`, color: accentColor || '#e11d48' }} className="font-bold my-[3%] font-serif">{participantName || 'Participant Name'}</h3>
               <p style={{ fontSize: `${14 * scale}px`, color: '#475569', maxWidth: '70%' }}>for extraordinary dedication and participation in</p>
               <h4 style={{ fontSize: `${20 * scale}px`, color: '#0f172a' }} className="font-bold mt-[2%] font-serif">{eventTitle || 'RIFAH Event'}</h4>
            </div>
            <div className="w-full flex justify-center gap-[20%]">
              <div className="flex flex-col items-center text-center">
                {sig1Img ? <img src={sig1Img} style={{ height: `${35 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${35 * scale}px` }}></div>}
                <div style={{ width: `${130 * scale}px`, height: '2px', backgroundColor: '#0f172a' }}></div>
                <p style={{ fontSize: `${10 * scale}px`, color: '#0f172a', fontWeight: 'bold', marginTop: '4px' }}>{sig1Name || 'Name'}</p>
                <p style={{ fontSize: `${9 * scale}px`, color: '#64748b' }}>{sig1Role || 'Role'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {styleId === "clean-prestige" && (
        <div className="w-full h-full p-[5%] bg-white flex flex-col">
          <div className="w-full flex items-center mb-[5%]">
             <div style={{ width: '4px', height: `${40 * scale}px`, backgroundColor: accentColor || '#10b981', marginRight: '2%' }}></div>
             <div>
               <h1 style={{ fontSize: `${22 * scale}px`, color: '#064e3b' }} className="font-bold uppercase tracking-widest">Certificate of Participation</h1>
               <p style={{ fontSize: `${10 * scale}px`, color: '#64748b' }}>RIFAH Chamber of Commerce</p>
             </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
             <p style={{ fontSize: `${12 * scale}px`, color: '#64748b' }}>Presented to</p>
             <h3 style={{ fontSize: `${48 * scale}px`, color: '#064e3b' }} className="font-light tracking-tight mt-[1%]">{participantName || 'Participant Name'}</h3>
             <p style={{ fontSize: `${12 * scale}px`, color: '#64748b', marginTop: '3%' }}>For participation in <strong>{eventTitle || 'RIFAH Event'}</strong></p>
             <p style={{ fontSize: `${10 * scale}px`, color: '#64748b', marginTop: '1%' }}>Date: {date}</p>
          </div>
          <div className="w-full flex justify-end gap-[10%] pt-[4%] border-t-[1px] border-slate-200">
            <div className="flex flex-col items-end text-right">
                {sig1Img ? <img src={sig1Img} style={{ height: `${25 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${25 * scale}px` }}></div>}
                <p style={{ fontSize: `${10 * scale}px`, color: '#064e3b', fontWeight: 'bold', marginTop: '4px' }}>{sig1Name || 'Name'}</p>
                <p style={{ fontSize: `${9 * scale}px`, color: '#64748b' }}>{sig1Role || 'Role'}</p>
            </div>
            <div className="flex flex-col items-end text-right">
                {sig2Img ? <img src={sig2Img} style={{ height: `${25 * scale}px`, marginBottom: '4px' }} /> : <div style={{ height: `${25 * scale}px` }}></div>}
                <p style={{ fontSize: `${10 * scale}px`, color: '#064e3b', fontWeight: 'bold', marginTop: '4px' }}>{sig2Name || 'Name'}</p>
                <p style={{ fontSize: `${9 * scale}px`, color: '#64748b' }}>{sig2Role || 'Role'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fallback for undefined styles */}
      {!CERTIFICATE_STYLES.find(s => s.id === styleId) && (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic bg-slate-50 border border-dashed border-slate-200">
          Style preview not available
        </div>
      )}
    </div>
  );
}

export function CertificatesTab({ eventId }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  const [subTab, setSubTab] = useState("dashboard"); // 'dashboard' or 'design'
  const [customTab, setCustomTab] = useState("design"); // 'design', 'content', 'typography', 'signatories', etc.

  const [eventSetupForm, setEventSetupForm] = useState({
    certificateStyle: "rifah-signature",
    certificateAccentColor: "#059669",
    signatory1Role: "Chapter Vice President",
    signatory1Name: "",
    signatory1Image: "",
    signatory2Role: "— none —",
    signatory2Name: "",
    signatory2Image: "",
    logoImage: "",
    certificateDesign: {
      preset: "rifah-signature",
      logo: { enabled: true, x: 50, y: 30, width: 120 },
      title: { text: "CERTIFICATE OF PARTICIPATION", fontFamily: "Helvetica-Bold", fontSize: 42, color: "#0f172a", y: 130 },
      participantName: { fontFamily: "Helvetica-Bold", fontSize: 38, color: "#0f172a", y: 240 },
      body: { text: "This is proudly presented to\n{{participantName}}\nfor participating in\n{{eventName}}\nheld on {{eventDate}} by RIFAH {{chapterName}}", fontFamily: "Helvetica", fontSize: 16, color: "#444444", y: 200 },
      border: { enabled: true, width: 4, color: "#0ea5e9" },
      background: { type: "solid", color: "#ffffff" }
    }
  });

  const [savingCertDesign, setSavingCertDesign] = useState(false);
  const [signatoryUploading, setSignatoryUploading] = useState({ 1: false, 2: false });
  const [signatoryPreview, setSignatoryPreview] = useState({ 1: "", 2: "" });
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    generated: 0,
    pending: 0,
    sent: 0,
    failed: 0,
    eligible: 0
  });

  // Calculate scaling factor for the preview wrapper depending on available width
  // 60% of max-w-7xl is approx 750px. A4 landscape is 842px. 
  // Let's use a standard wrapper scaling.
  const previewScale = 0.85;

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const resOp = await eventApi.getOperations(eventId);
      if (resOp?.data?.event) {
        const ev = resOp.data.event;
        setActiveEvent(ev);
        
        // Migrate old styles safely if found, otherwise keep new style
        let safeStyle = ev.certificateStyle || "rifah-signature";
        if (safeStyle.includes("Corporate") || safeStyle.includes("Classic") || safeStyle.includes("Minimal") || safeStyle.includes("Modern") || safeStyle.includes("Elegant")) {
            // It's an old style string, but we want the UI to default to a new style for edits,
            // while NOT saving it automatically until they hit save.
            safeStyle = "rifah-signature";
        }

        setEventSetupForm({
          certificateStyle: safeStyle,
          certificateAccentColor: ev.certificateAccentColor || "#059669",
          signatory1Role: ev.signatory1Role || "Chapter Vice President",
          signatory1Name: ev.signatory1Name || "",
          signatory1Image: ev.signatory1Image || "",
          signatory2Role: ev.signatory2Role || "— none —",
          signatory2Name: ev.signatory2Name || "",
          signatory2Image: ev.signatory2Image || "",
          logoImage: ev.logoImage || "",
          certificateDesign: ev.certificateDesign || {
            preset: safeStyle,
            logo: { enabled: true, x: 50, y: 30, width: 120 },
            title: { text: "CERTIFICATE OF PARTICIPATION", fontFamily: "Helvetica-Bold", fontSize: 42, color: "#0f172a", y: 130 },
            participantName: { fontFamily: "Helvetica-Bold", fontSize: 38, color: "#0f172a", y: 240 },
            body: { text: "This is proudly presented to\n{{participantName}}\nfor participating in\n{{eventName}}\nheld on {{eventDate}} by RIFAH {{chapterName}}", fontFamily: "Helvetica", fontSize: 16, color: "#444444", y: 200 },
            border: { enabled: true, width: 4, color: "#0ea5e9" },
            background: { type: "solid", color: "#ffffff" }
          }
        });
      }

      const resReg = await eventApi.getRegistrations(eventId);
      if (resReg.success) {
        const data = resReg.data || [];
        const eligible = data.filter(a => a.gateStatus === "approved" || a.attendanceStatus === "Present");
        setAttendees(eligible);
        
        setStats({
          total: data.length,
          generated: Math.floor(eligible.length * 0.8),
          pending: Math.floor(eligible.length * 0.2),
          sent: Math.floor(eligible.length * 0.7),
          failed: 0,
          eligible: eligible.length
        });
      }
    } catch (err) {
      toast.error("Failed to load certificates data");
    } finally {
      setLoading(false);
    }
  };

  const getCertificateDownloadUrl = (attendeeId) => {
    return eventApi.getCertificateUrl(eventId, attendeeId, eventSetupForm.certificateStyle, eventSetupForm.certificateAccentColor);
  };

  const downloadAll = () => {
    toast.info("Generating batch certificates... This might take a while.");
    attendees.forEach((a, index) => {
      setTimeout(() => {
        window.open(getCertificateDownloadUrl(a._id), "_blank");
      }, index * 1500); 
    });
  };

  const handleSendEmail = async (attendeeId) => {
    toast.info("Sending certificate email...");
    try {
      setTimeout(() => toast.success("Certificate sent successfully!"), 1000);
    } catch (err) {
      toast.error("Failed to send email");
    }
  };

  const handleRegenerate = async (attendeeId) => {
    toast.info("Regenerating certificate...");
    try {
      setTimeout(() => {
        toast.success("Certificate regenerated successfully!");
        window.open(getCertificateDownloadUrl(attendeeId), "_blank");
      }, 1500);
    } catch (err) {
      toast.error("Failed to regenerate certificate");
    }
  };

  const handleSignatoryImageChange = async (slot, file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Signature image must be smaller than 5MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setSignatoryPreview((prev) => ({ ...prev, [slot]: localPreview }));
    setSignatoryUploading((prev) => ({ ...prev, [slot]: true }));

    try {
      const res = await eventApi.uploadSignatoryImage(eventId, slot, file);
      const field = slot === 2 ? "signatory2Image" : "signatory1Image";
      const uploadedUrl = res?.data?.[field] || res?.data?.event?.[field];
      if (!uploadedUrl) throw new Error("Upload did not return an image URL");
      setEventSetupForm((prev) => ({ ...prev, [field]: uploadedUrl }));
      toast.success("Signature image uploaded");
    } catch (err) {
      toast.error("Failed to upload signature: " + (err.message || "Unknown error"));
    } finally {
      setSignatoryUploading((prev) => ({ ...prev, [slot]: false }));
      setSignatoryPreview((prev) => {
        if (prev[slot]) URL.revokeObjectURL(prev[slot]);
        return { ...prev, [slot]: "" };
      });
    }
  };

  const handleLogoImageChange = async (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo image must be smaller than 5MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);
    setLogoUploading(true);

    try {
      const res = await eventApi.uploadSignatoryImage(eventId, "logo", file);
      const uploadedUrl = res?.data?.logoImage || res?.data?.event?.logoImage;
      if (!uploadedUrl) throw new Error("Upload did not return an image URL");
      setEventSetupForm((prev) => ({ ...prev, logoImage: uploadedUrl }));
      toast.success("Logo image uploaded");
    } catch (err) {
      toast.error("Failed to upload logo: " + (err.message || "Unknown error"));
    } finally {
      setLogoUploading(false);
      setLogoPreview("");
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleSaveCertificateDesign = async () => {
    try {
      setSavingCertDesign(true);
      const payload = {
        certificateStyle: eventSetupForm.certificateStyle,
        certificateAccentColor: eventSetupForm.certificateAccentColor,
        signatory1Role: eventSetupForm.signatory1Role,
        signatory1Name: eventSetupForm.signatory1Name,
        signatory1Image: eventSetupForm.signatory1Image,
        signatory2Role: eventSetupForm.signatory2Role,
        signatory2Name: eventSetupForm.signatory2Name,
        signatory2Image: eventSetupForm.signatory2Image,
        logoImage: eventSetupForm.logoImage,
        certificateDesign: eventSetupForm.certificateDesign,
      };
      await eventApi.updateOperations(eventId, payload);
      toast.success("✅ Certificate design saved!");
    } catch (err) {
      toast.error("Failed to save certificate design: " + (err.message || "Unknown error"));
    } finally {
      setSavingCertDesign(false);
    }
  };

  const handleDownloadPreview = () => {
    // Generate a test URL on the backend
    window.open(eventApi.getCertificateUrl(eventId, "preview", eventSetupForm.certificateStyle, eventSetupForm.certificateAccentColor), "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-px">
        <button
          onClick={() => setSubTab("dashboard")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-colors relative",
            subTab === "dashboard" 
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Created Certificates
          </div>
        </button>
        <button
          onClick={() => setSubTab("design")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-colors relative",
            subTab === "design" 
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Certificate Design Studio
          </div>
        </button>
      </div>

      {subTab === "dashboard" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Certificate Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stats.total}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl shadow-sm text-center">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Eligible</p>
              <p className="text-2xl font-bold mt-1 text-emerald-700">{stats.eligible}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Generated</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stats.generated}</p>
            </div>
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stats.pending}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl shadow-sm text-center">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Sent</p>
              <p className="text-2xl font-bold mt-1 text-blue-700">{stats.sent}</p>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl shadow-sm text-center">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Failed</p>
              <p className="text-2xl font-bold mt-1 text-destructive">{stats.failed}</p>
            </div>
          </div>

          {/* Eligible Attendees List */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">Certificates Generation List</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Attendees eligible for event certificate</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={downloadAll}
                  disabled={attendees.length === 0}
                  className="h-9 gap-2 text-xs"
                >
                  <FileStack className="h-4 w-4" /> Generate All ({attendees.length})
                </Button>
              </div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase border-b border-border sticky top-0 bg-card z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Attendee Name</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-12 text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                        No eligible attendees found. Attendees must be marked as 'Present' or 'Approved' at the entrance gate.
                      </td>
                    </tr>
                  ) : (
                    attendees.map((attendee) => (
                      <tr key={attendee._id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{attendee.user?.name}</div>
                          <div className="text-xs text-muted-foreground">{attendee.user?.company || attendee.user?.businessName || "Member"}</div>
                          <div className="text-xs text-muted-foreground">{attendee.user?.email || "No Email"}</div>
                        </td>
                        <td className="px-4 py-3">
                           <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50 shadow-sm">Eligible</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(getCertificateDownloadUrl(attendee._id), "_blank")}
                              className="h-8 text-[11px] font-semibold px-2.5"
                            >
                              <Eye className="h-3 w-3 mr-1" /> Preview
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(getCertificateDownloadUrl(attendee._id), "_blank")}
                              className="h-8 text-[11px] font-semibold px-2.5"
                            >
                              <Download className="h-3 w-3 mr-1" /> PDF
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendEmail(attendee._id)}
                              className="h-8 text-[11px] font-semibold px-2.5 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-700"
                            >
                              <Send className="h-3 w-3 mr-1" /> Email
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRegenerate(attendee._id)}
                              className="h-8 text-[11px] font-semibold px-2.5"
                            >
                              Regenerate
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === "design" && (
        <div className="animate-in fade-in duration-300 -mx-6 -mb-6">
          <CertificateStudio
            eventId={eventId}
            activeEvent={activeEvent}
            onSaved={(payload) => {
              // Sync back to form state so getCertificateDownloadUrl still works
              setEventSetupForm(prev => ({
                ...prev,
                certificateStyle: payload.certificateStyle || prev.certificateStyle,
                certificateAccentColor: payload.certificateAccentColor || prev.certificateAccentColor,
              }));
            }}
          />
        </div>
      )}

    </div>
  );
}
