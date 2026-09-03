"use client";
import { ArrowLeft, Send, Loader2, MessageSquare, Paperclip, FileText, Image as ImageIcon, Film, Download, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

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

function AttachmentItem({ url, isMe }) {
  const fullUrl = resolveMediaUrl(url);
  const ext = (url.split(".").pop() || "").toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext);
  const isVideo = ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext);
  const isAudio = ["mp3", "wav", "m4a", "aac", "ogg"].includes(ext);
  const fileName = url.split("/").pop() || "Attachment";

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

function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const targetUserId = searchParams ? searchParams.get("userId") || searchParams.get("to") : null;
  const targetName = searchParams ? searchParams.get("name") : null;

  const { data: convData, refetch: refetchConversations } = useConversations();
  const conversations = convData || [];

  const [activeOtherUser, setActiveOtherUser] = useState(null);
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
        setActiveOtherUser(existing.otherUser);
      } else {
        setActiveOtherUser({
          _id: targetUserId,
          name: targetName ? decodeURIComponent(targetName) : "Business Member",
          businessName: targetName ? decodeURIComponent(targetName) : "",
        });
      }
      setOpenOnMobile(true);
    } else if (!activeOtherUser && conversations.length > 0) {
      setActiveOtherUser(conversations[0]?.otherUser);
    }
  }, [targetUserId, targetName, conversations]);

  const selectedUserId = activeOtherUser?._id;
  const { data: messagesData, refetch: refetchMessages } = useMessages(selectedUserId);
  const messages = messagesData || [];

  // Auto-scroll when messages update
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

  // Prepend draft conversation if chatting with a new vendor not yet in inbox
  const displayConversations = [...conversations];
  if (
    activeOtherUser &&
    !conversations.some((c) => String(c.otherUser?._id) === String(activeOtherUser._id))
  ) {
    displayConversations.unshift({
      otherUser: activeOtherUser,
      lastMessage: { body: "Draft new message..." },
      isNewDraft: true,
    });
  }

  return (
    <AppShell role="customer" title="Messages" subtitle="Conversations with member businesses">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Conversation list */}
        <Panel
          className={cn(openOnMobile && "hidden lg:block")}
          title="Inbox"
          bodyClassName="p-0 md:p-0"
        >
          {displayConversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground">
                No conversations yet. Message businesses directly from their profile pages.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href="/discover">Discover businesses</Link>
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
                      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {(c.otherUser?.name || "U")[0]}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{c.otherUser?.name || "Business Member"}</span>
                        <span className="block truncate text-xs text-muted-foreground">{c.otherUser?.businessName || c.otherUser?.email}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {c.isNewDraft ? (
                            <span className="italic text-primary">New conversation...</span>
                          ) : (
                            c.lastMessage?.body || "Active conversation"
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

        {/* Thread */}
        <Panel className={cn(!openOnMobile && "hidden lg:block")} bodyClassName="p-0 md:p-0">
          <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-border p-3.5">
            <button
              type="button"
              onClick={() => setOpenOnMobile(false)}
              aria-label="Back to inbox"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{activeOtherUser?.name || "Select a conversation"}</p>
              <p className="truncate text-xs text-muted-foreground">{activeOtherUser?.businessName || activeOtherUser?.email || ""}</p>
            </div>
          </header>

          <div className="flex min-h-[300px] max-h-[55vh] flex-col gap-3 overflow-y-auto p-4">
            {!selectedUserId ? (
              <div className="my-auto flex flex-col items-center justify-center p-8 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">No conversation selected</h3>
                <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                  Explore verified businesses in the directory and click "Message" to connect directly.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/discover">Discover businesses</Link>
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="my-auto text-center text-xs text-muted-foreground">
                Start a conversation with <span className="font-semibold text-foreground">{activeOtherUser?.name}</span> by typing your message below.
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender?._id === user?._id || m.sender === user?._id;
                const msgText = m.text || m.body || "";
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
                      {attachments.length > 0 && (
                        <div className="space-y-1 mb-1">
                          {attachments.map((att, idx) => (
                            <AttachmentItem key={idx} url={att} isMe={isMe} />
                          ))}
                        </div>
                      )}
                      {msgText && <p className="whitespace-pre-wrap break-words">{msgText}</p>}
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedUserId || sending || uploadingFile}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                title="Attach PDF, Image, Video, Document"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                className="hidden"
              />

              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedUserId ? "Type your message..." : "Select a business to start messaging..."}
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

export { MessagesPage as CustomerMessages };
export default MessagesPage;
