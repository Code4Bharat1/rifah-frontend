"use client";
import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Send, Sparkles, X, Check, Loader2, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { messageApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { toast } from "sonner";

export function NewMemberDialog({ open, onOpenChange, newMembers = [] }) {
  const { user } = useAuth();
  const [sendingMap, setSendingMap] = useState({});
  const [sentMap, setSentMap] = useState({});
  const [customMsgMap, setCustomMsgMap] = useState({});
  const [openInputMap, setOpenInputMap] = useState({});

  const myName = user?.name || "Fellow Member";
  const myChapter = user?.chapter ? ` (${user.chapter} Chapter)` : "";

  const handleSendWelcome = async (item) => {
    if (!item.userId) return;

    const customText = customMsgMap[item.userId]?.trim();
    const defaultMsg = `Hi ${item.userName || "there"}, welcome to the RIFAH Chamber of Commerce & Industry family! 🎉 We are excited to have ${item.businessName} in our chapter. Looking forward to connecting, collaborating, and growing together! Warm regards, ${myName}${myChapter}.`;
    const messageContent = customText || defaultMsg;

    setSendingMap((prev) => ({ ...prev, [item.userId]: true }));
    try {
      await messageApi.sendMessage({
        recipientId: item.userId,
        text: messageContent,
      });
      setSentMap((prev) => ({ ...prev, [item.userId]: true }));
      toast.success(`Welcome message sent to ${item.businessName}!`);
    } catch (err) {
      toast.error(err.message || "Failed to send welcome message");
    } finally {
      setSendingMap((prev) => ({ ...prev, [item.userId]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border-indigo-200/80 dark:border-indigo-900/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-primary p-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-2xl select-none">
              👋
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                New Chapter Members
                <Sparkles className="h-5 w-5 text-amber-200 animate-pulse" />
              </DialogTitle>
              <DialogDescription className="text-indigo-100 text-xs mt-0.5 font-medium">
                {newMembers.length} new {newMembers.length === 1 ? "business has" : "businesses have"} joined your chapter recently! Say hello and welcome them to RIFAH.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {newMembers.map((item) => {
            const isSending = sendingMap[item.userId];
            const isSent = sentMap[item.userId];
            const showCustomInput = openInputMap[item.userId];
            const cleanWhatsapp = (item.whatsapp || item.phone || "").replace(/[^0-9]/g, "");
            const whatsappDefault = `Hi ${item.userName || "there"}, welcome to RIFAH Chamber! 🎉 Delighted to have ${item.businessName} in our chapter. Warm wishes from ${myName}${myChapter}, RIFAH Chamber.`;
            const whatsappUrl = cleanWhatsapp
              ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappDefault)}`
              : null;

            return (
              <div
                key={String(item.businessId || item.userId)}
                className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border bg-surface hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-base border border-indigo-200 dark:border-indigo-800 select-none">
                      🏢
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate block">
                          {item.businessName}
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded-full">
                          New Member
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>Owner: {item.userName}</span>
                        <span>·</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {item.industry}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {whatsappUrl && (
                      <Button
                        asChild
                        size="sm"
                        className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg gap-1.5 shadow-xs"
                      >
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.983.536 1.838.82 2.796.821 3.183 0 5.769-2.587 5.769-5.768.001-3.181-2.585-5.765-5.769-5.765zm0-2c4.28 0 7.769 3.488 7.769 7.768 0 4.28-3.489 7.768-7.769 7.768-.002 0-.005 0-.007 0-1.287 0-2.459-.344-3.484-.949l-4.54 1.192 1.213-4.434c-.664-1.077-1.04-2.316-1.04-3.577 0-4.28 3.489-7.768 7.769-7.768zm3.626 10.985c-.156.438-.806.829-1.291.884-.33.037-.761.06-2.222-.544-1.868-.772-3.078-2.678-3.171-2.802-.094-.124-.757-1.008-.757-1.923 0-.915.48-1.365.65-1.551.171-.186.374-.233.498-.233.125 0 .25.002.358.008.114.005.267-.043.418.32.156.373.532 1.298.578 1.392.047.094.078.203.016.327-.063.125-.094.203-.187.312-.094.11-.198.246-.282.33-.094.093-.192.195-.083.382.11.187.487.804 1.045 1.302.72.64 1.326.838 1.513.931.187.093.296.078.406-.047.11-.125.468-.546.593-.733.124-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.358.219.047.078.047.453-.109.891z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      </Button>
                    )}

                    {isSent ? (
                      <Button
                        size="sm"
                        disabled
                        className="h-8 px-3 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-lg gap-1 border border-emerald-300"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Welcomed</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isSending}
                        onClick={() => handleSendWelcome(item)}
                        className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg gap-1.5 shadow-xs"
                      >
                        {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>👋</span>}
                        <span>Say Welcome</span>
                      </Button>
                    )}

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1 border-border"
                    >
                      <Link href={`/biz/messages?recipient=${item.userId}`}>
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        <span>Chat</span>
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Optional custom note toggle */}
                {!isSent && (
                  <div className="pt-1 flex items-center gap-2">
                    <Input
                      placeholder={`Type custom welcome (e.g. "Hi ${item.userName}, welcome to RIFAH! Let's connect.")`}
                      value={customMsgMap[item.userId] || ""}
                      onChange={(e) => setCustomMsgMap({ ...customMsgMap, [item.userId]: e.target.value })}
                      className="h-8 text-xs bg-background"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSending || !customMsgMap[item.userId]?.trim()}
                      onClick={() => handleSendWelcome(item)}
                      className="h-8 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold shrink-0"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewMemberDialog;
