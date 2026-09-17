"use client";
import { ArrowLeft, Send, Loader2, MessageSquare, FileText, Image as ImageIcon, Film, Download, X, Building2, Package, IndianRupee, FileSpreadsheet, ChevronDown, ChevronUp, Mail, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { useConversations, useMessages } from "@shared/hooks/use-rifah-api";
import { messageApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";
import { getSocket } from "@shared/lib/socket";
import { resolveMediaUrl } from "@shared/lib/api-client";

function parseQuotationMessage(text) {
  if (!text) return null;
  if (!text.toUpperCase().includes("OFFICIAL QUOTATION")) return null;

  // Clean out emoji characters
  const clean = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim();
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  const titleLine = lines.find((l) => l.toUpperCase().includes("OFFICIAL QUOTATION")) || "OFFICIAL QUOTATION";
  const refMatch = titleLine.match(/\(([^)]+)\)/);
  const refCode = refMatch ? refMatch[1] : "";

  const extractField = (prefix) => {
    const line = lines.find((l) => l.toLowerCase().startsWith(prefix.toLowerCase()));
    if (!line) return "";
    return line.replace(new RegExp(`^${prefix}:?\\s*`, "i"), "").trim();
  };

  const supplier = extractField("Supplier");
  const requirement = extractField("Requirement");
  const price = extractField("Quoted Price") || extractField("Price") || extractField("Amount");
  const terms = extractField("Details & Terms") || extractField("Terms") || extractField("Notes");

  const footer = lines.find(
    (l) =>
      !l.includes("---") &&
      !l.toUpperCase().includes("OFFICIAL QUOTATION") &&
      !l.toLowerCase().startsWith("supplier") &&
      !l.toLowerCase().startsWith("requirement") &&
      !l.toLowerCase().startsWith("quoted price") &&
      !l.toLowerCase().startsWith("price") &&
      !l.toLowerCase().startsWith("details & terms") &&
      !l.toLowerCase().startsWith("terms")
  );

  return {
    refCode,
    supplier,
    requirement,
    price,
    terms,
    footer,
  };
}

function QuotationCard({ quote, isMe, pdfUrl }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // If pdfUrl is not explicitly given, compute fallback from quotation reference
  const effectivePdfUrl =
    pdfUrl || (quote.refCode ? `/uploads/attachments/quotation-${quote.refCode}.pdf` : null);
  const downloadUrl = effectivePdfUrl ? resolveMediaUrl(effectivePdfUrl) : null;

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!downloadUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const cleanRef = (quote.refCode || "Official").replace(/[^a-zA-Z0-9_-]/g, "");
      a.download = `quotation-${cleanRef}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Direct download failed, opening in new tab:", err);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5 space-y-2 shadow-xs my-1 text-left min-w-[260px] sm:min-w-[320px] transition-all",
        isMe
          ? "border-white/20 bg-white/10 text-white"
          : "border-slate-200/90 bg-white text-slate-800"
      )}
    >
      {/* Header: Left Download Icon, Quotation Title, Verified Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Left Download Icon */}
          {downloadUrl ? (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              title="Download Official PDF Quotation"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 shadow-2xs cursor-pointer",
                isMe
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-sky-50 text-[#0088d1] hover:bg-sky-100 border border-sky-200/60"
              )}
            >
              <Download className={cn("h-4 w-4", downloading && "animate-bounce")} />
            </button>
          ) : (
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                isMe ? "bg-white/20 text-white" : "bg-sky-50 text-sky-700"
              )}
            >
              <FileText className="h-4 w-4" />
            </div>
          )}

          <div className="min-w-0">
            <span className="block text-xs font-bold tracking-wide truncate">
              Official Quotation {quote.refCode ? quote.refCode : ""}
            </span>
            {quote.price && !isExpanded && (
              <span
                className={cn(
                  "block text-xs font-extrabold tracking-tight mt-0.5",
                  isMe ? "text-emerald-200" : "text-emerald-600"
                )}
              >
                {quote.price}
              </span>
            )}
          </div>
        </div>

        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
            isMe ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
          )}
        >
          Verified
        </span>
      </div>

      {/* Read more / Read me Link */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2 transition-colors cursor-pointer",
            isMe ? "text-white/90 hover:text-white" : "text-[#0088d1] hover:text-[#0077b6]"
          )}
        >
          <span>{isExpanded ? "Show less" : "Read more"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="space-y-2.5 pt-2.5 border-t border-current/15 text-xs animate-in fade-in-50 duration-200">
          {quote.supplier && (
            <div className="flex items-start gap-2.5">
              <Building2 className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium opacity-75 block">Supplier</span>
                <span className="font-bold text-xs block truncate">{quote.supplier}</span>
              </div>
            </div>
          )}

          {quote.requirement && (
            <div className="flex items-start gap-2.5">
              <Package className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium opacity-75 block">Requirement</span>
                <span className="font-semibold text-xs block">{quote.requirement}</span>
              </div>
            </div>
          )}

          {quote.price && (
            <div className="flex items-start gap-2.5">
              <IndianRupee className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium opacity-75 block">Quoted Price</span>
                <span
                  className={cn(
                    "font-extrabold text-sm block tracking-tight",
                    isMe ? "text-emerald-200" : "text-emerald-600"
                  )}
                >
                  {quote.price}
                </span>
              </div>
            </div>
          )}

          {quote.terms && (
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium opacity-75 block">Details & Terms</span>
                <span className="font-normal text-xs block leading-relaxed opacity-90">{quote.terms}</span>
              </div>
            </div>
          )}

          {quote.footer && (
            <p className="border-t border-current/15 pt-2 text-[11px] opacity-80 leading-relaxed italic">
              {quote.footer}
            </p>
          )}

          {downloadUrl && (
            <div className="pt-2 border-t border-current/15">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-xs w-full cursor-pointer",
                  isMe
                    ? "bg-white text-sky-700 hover:bg-white/90"
                    : "bg-[#0088d1] text-white hover:bg-[#0077b6]"
                )}
              >
                <Download className={cn("h-3.5 w-3.5", downloading && "animate-bounce")} />
                {downloading ? "Downloading Quotation PDF..." : "Download Quotation PDF"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AttachmentItem({ url, isMe }) {
  const fullUrl = resolveMediaUrl(url);
  const cleanUrl = (url || "").split("?")[0];
  const ext = (cleanUrl.split(".").pop() || "").toLowerCase();
  const [downloading, setDownloading] = useState(false);

  const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext);
  const isVideo = ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext);
  const isAudio = ["mp3", "wav", "m4a", "aac", "ogg"].includes(ext);
  const isPdf = ext === "pdf";
  const rawFileName = cleanUrl.split("/").pop() || "Document.pdf";
  const fileName = decodeURIComponent(rawFileName);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!fullUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  if (isPdf) {
    return (
      <div
        className={cn(
          "my-2 flex items-center justify-between gap-3 rounded-xl border p-3 text-xs transition-all shadow-2xs group",
          isMe
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300"
        )}
      >
        <div
          onClick={() => window.open(fullUrl, "_blank", "noopener,noreferrer")}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
          title="Click to preview PDF"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block truncate font-bold text-xs">
              {fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`}
            </span>
            <span className="block text-[10px] opacity-75">
              Official Quotation PDF Document
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            "flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer",
            isMe
              ? "bg-white text-[#0088cc] hover:bg-white/90"
              : "bg-[#0088cc] text-white hover:bg-[#0077bb]"
          )}
        >
          <Download className={cn("h-3.5 w-3.5", downloading && "animate-bounce")} />
          {downloading ? "Saving..." : "Download PDF"}
        </button>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="my-1 overflow-hidden rounded-xl border border-black/10">
        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
          <img src={fullUrl} alt="Attachment" className="max-h-60 max-w-full object-cover transition-transform hover:scale-[1.02]" />
        </a>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="my-1 overflow-hidden rounded-xl border border-black/10">
        <video controls src={fullUrl} className="max-h-60 max-w-full rounded-xl" />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="my-1 min-w-[200px]">
        <audio controls src={fullUrl} className="w-full" />
      </div>
    );
  }

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={cn(
        "my-1 flex items-center gap-2.5 rounded-xl border p-2.5 text-xs transition-colors",
        isMe
          ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
          : "border-border bg-background text-foreground hover:bg-muted"
      )}
    >
      <FileText className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate font-medium">{fileName}</span>
      <Download className="h-4 w-4 shrink-0 opacity-70" />
    </a>
  );
}

function BizMessages() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams
    ? searchParams.get("userId") || searchParams.get("vendor") || searchParams.get("recipient") || searchParams.get("to") || searchParams.get("id")
    : null;
  const targetName = searchParams ? searchParams.get("name") : null;
  const { user } = useAuth();

  const { data: convData, refetch: refetchConversations } = useConversations();
  const conversations = useMemo(() => convData || [], [convData]);

  const [activeOtherUser, setActiveOtherUser] = useState(null);
  const [contactDetails, setContactDetails] = useState(null);
  const [openOnMobile, setOpenOnMobile] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-select or draft conversation when targetUserId is provided via URL
  useEffect(() => {
    if (targetUserId) {
      const existing = conversations.find(
        (c) => String(c.otherUser?._id) === String(targetUserId)
      );
      if (existing) {
        if (activeOtherUser !== existing.otherUser) {
          setActiveOtherUser(existing.otherUser);
          setOpenOnMobile(true);
        }
      } else if (String(activeOtherUser?._id) !== String(targetUserId)) {
        setActiveOtherUser({
          _id: targetUserId,
          name: targetName ? decodeURIComponent(targetName) : "Buyer / Customer",
          email: "",
        });
        setOpenOnMobile(true);
      }
    } else if (!activeOtherUser && conversations.length > 0) {
      setActiveOtherUser(conversations[0]?.otherUser);
    }
  }, [targetUserId, targetName, conversations, activeOtherUser]);

  const selectedUserId = activeOtherUser?._id;

  // Fetch recipient contact info (Email, Phone, WhatsApp from business profile)
  useEffect(() => {
    if (!selectedUserId) {
      setContactDetails(null);
      return;
    }

    let isMounted = true;
    setContactDetails({
      email: activeOtherUser?.email || "",
      phone: activeOtherUser?.phone || "",
      whatsapp: activeOtherUser?.whatsapp || activeOtherUser?.whatsappNumber || "",
      businessName: activeOtherUser?.businessName || "",
    });

    messageApi
      .getUserContact(selectedUserId)
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (data) {
          setContactDetails((prev) => ({
            ...prev,
            email: data.email || prev?.email || "",
            phone: data.phone || prev?.phone || "",
            whatsapp: data.whatsapp || data.whatsappNumber || prev?.whatsapp || "",
            businessName: data.businessName || prev?.businessName || "",
          }));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch user contact info:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUserId, activeOtherUser]);

  const { data: messagesData, refetch: refetchMessages } = useMessages(selectedUserId);
  const messages = messagesData || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time Socket.io listener
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("join_room", user._id);

    const handleReceiveMessage = () => {
      refetchMessages();
      refetchConversations();
    };

    const handleUpdateConversations = () => {
      refetchConversations();
      refetchMessages();
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("update_conversations", handleUpdateConversations);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("update_conversations", handleUpdateConversations);
    };
  }, [user?._id, refetchMessages, refetchConversations]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !selectedUserId) return;
    setSending(true);

    let attachmentUrl = null;
    if (selectedFile) {
      try {
        setUploadingFile(true);
        const res = await messageApi.uploadAttachment(selectedFile);
        attachmentUrl = res.data?.fileUrl || res.fileUrl;
      } catch (err) {
        alert(err.message || "Failed to upload attachment.");
        setSending(false);
        setUploadingFile(false);
        return;
      } finally {
        setUploadingFile(false);
      }
    }

    const msgText = inputText.trim();
    setInputText("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const payload = {
        recipientId: selectedUserId,
        text: msgText,
        body: msgText,
        attachments: attachmentUrl ? [attachmentUrl] : [],
      };

      await messageApi.sendMessage(payload);

      const socket = getSocket();
      if (socket) {
        socket.emit("send_message", {
          recipientId: selectedUserId,
          senderId: user?._id,
          text: msgText,
          attachments: attachmentUrl ? [attachmentUrl] : [],
        });
      }

      refetchMessages();
      await refetchConversations();
    } catch (err) {
      alert(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  // Prepend draft conversation if chatting with a new buyer not yet in inbox
  const displayConversations = [...conversations];
  if (
    activeOtherUser &&
    !conversations.some((c) => String(c.otherUser?._id) === String(activeOtherUser._id))
  ) {
    displayConversations.unshift({
      otherUser: activeOtherUser,
      lastMessage: { body: "Draft response..." },
      isNewDraft: true,
    });
  }

  return (
    <AppShell role="business" title="Messages" subtitle="Buyer enquiries & direct threads">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel className={cn(openOnMobile && "hidden lg:block")} title="Inbox" bodyClassName="p-0 md:p-0">
          {displayConversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground">
                No active conversations yet. Messages will appear when buyers contact your business or when you message buyers from your Leads.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href="/biz/enquiries">View Enquiries</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {displayConversations.map((c, i) => {
                const isSelected = c.otherUser?._id === selectedUserId;
                return (
                  <li key={c.otherUser?._id || i}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOtherUser(c.otherUser);
                        setOpenOnMobile(true);
                      }}
                      className={cn(
                        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-3.5 text-left transition-colors hover:bg-muted/60",
                        isSelected && "bg-primary-soft/60"
                      )}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {(c.otherUser?.name || "B")[0]}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{c.otherUser?.name || "Buyer"}</span>
                        <span className="block truncate text-xs text-muted-foreground">{c.otherUser?.email || ""}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {c.isNewDraft ? (
                            <span className="italic text-primary">New message draft...</span>
                          ) : (
                            (c.lastMessage?.body || c.lastMessage?.text || "Active thread").replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim()
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel className={cn(!openOnMobile && "hidden lg:block")} bodyClassName="p-0 md:p-0">
          {(() => {
            const effectiveEmail = contactDetails?.email || activeOtherUser?.email || "";
            const effectivePhone = contactDetails?.phone || activeOtherUser?.phone || "";
            const effectiveWhatsapp = contactDetails?.whatsapp || activeOtherUser?.whatsapp || activeOtherUser?.whatsappNumber || "";
            const cleanWhatsappNumber = effectiveWhatsapp ? effectiveWhatsapp.replace(/[^0-9]/g, "") : "";
            const effectiveBizName = contactDetails?.businessName || activeOtherUser?.businessName || "";

            return (
              <header className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border p-3.5 bg-surface">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setOpenOnMobile(false)}
                    aria-label="Back to inbox"
                    className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-border lg:hidden shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="truncate text-sm font-bold text-foreground">
                        {activeOtherUser?.name || "Select a conversation"}
                      </p>
                      {effectiveBizName && effectiveBizName !== activeOtherUser?.name && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground truncate max-w-[200px]">
                          {effectiveBizName}
                        </span>
                      )}
                    </div>

                    {/* Email, Phone & WhatsApp Row */}
                    {selectedUserId && (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        {effectiveEmail ? (
                          <a
                            href={`mailto:${effectiveEmail}`}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                            title="Send email"
                          >
                            <Mail className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                            <span className="truncate max-w-[190px]">{effectiveEmail}</span>
                          </a>
                        ) : null}

                        {effectivePhone ? (
                          <a
                            href={`tel:${effectivePhone}`}
                            className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors"
                            title="Call Phone"
                          >
                            <Phone className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                            <span>{effectivePhone}</span>
                          </a>
                        ) : null}

                        {effectiveWhatsapp ? (
                          <a
                            href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent("Hello from RIFAH Connect, regarding your requirement/quotation.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/10 px-2 py-0.5 text-[11px] font-semibold text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366]/20 transition"
                            title="Chat on WhatsApp"
                          >
                            <svg className="h-3 w-3 fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            <span>WhatsApp: {effectiveWhatsapp}</span>
                          </a>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Action WhatsApp button for desktop */}
                {selectedUserId && effectiveWhatsapp ? (
                  <a
                    href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent("Hello from RIFAH Connect, regarding your requirement/quotation.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                ) : null}
              </header>
            );
          })()}

          <div className="flex min-h-[300px] max-h-[55vh] flex-col gap-3 overflow-y-auto p-4">
            {!selectedUserId ? (
              <div className="my-auto flex flex-col items-center justify-center p-8 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">No conversation selected</h3>
                <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                  Select a buyer conversation from your inbox or message buyers directly from your leads manager.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/biz/enquiries">Go to Enquiries</Link>
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="my-auto text-center text-xs text-muted-foreground">
                Start a conversation with <span className="font-semibold text-foreground">{activeOtherUser?.name}</span> by typing your message below.
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender?._id === user?._id || m.sender === user?._id;
                const msgText = m.body || m.text || "";
                const attachments = m.attachments || [];

                return (
                  <div
                    key={m._id}
                    className={cn(
                      "flex max-w-[85%] sm:max-w-[70%]",
                      isMe ? "self-end justify-end" : "self-start justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm shadow-2xs",
                        isMe
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted text-foreground"
                      )}
                    >
                      {(() => {
                        const quoteData = parseQuotationMessage(msgText);
                        const quotationPdf = quoteData
                          ? attachments.find((att) =>
                              (att.split("?")[0] || "").toLowerCase().endsWith(".pdf")
                            )
                          : null;
                        const otherAttachments = quotationPdf
                          ? attachments.filter((att) => att !== quotationPdf)
                          : attachments;

                        return (
                          <>
                            {otherAttachments.length > 0 && (
                              <div className="space-y-1 mb-1">
                                {otherAttachments.map((att, idx) => (
                                  <AttachmentItem key={idx} url={att} isMe={isMe} />
                                ))}
                              </div>
                            )}
                            {quoteData ? (
                              <QuotationCard quote={quoteData} isMe={isMe} pdfUrl={quotationPdf} />
                            ) : msgText ? (
                              <p className="whitespace-pre-wrap break-words">{msgText}</p>
                            ) : null}
                          </>
                        );
                      })()}
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex flex-col gap-2 border-t border-border p-3">
            {selectedFile && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary-soft/40 px-3 py-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  {selectedFile.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
                  ) : selectedFile.type.startsWith("video/") ? (
                    <Film className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span className="truncate font-medium text-foreground">{selectedFile.name}</span>
                  <span className="text-[10px] text-muted-foreground">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSelectedFile}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedUserId ? "Write a response..." : "Select a conversation to reply..."}
                disabled={!selectedUserId || sending}
                className="h-10 flex-1"
              />

              <Button
                type="submit"
                size="sm"
                disabled={sending || uploadingFile || (!inputText.trim() && !selectedFile) || !selectedUserId}
              >
                {sending || uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}

export { BizMessages };
export default BizMessages;
