"use client";
import { ArrowLeft, Send, Loader2, MessageSquare } from "lucide-react";
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

function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId") || searchParams.get("to");
  const targetName = searchParams.get("name");

  const { data: convData, refetch: refetchConversations } = useConversations();
  const conversations = convData || [];

  const [activeOtherUser, setActiveOtherUser] = useState(null);
  const [openOnMobile, setOpenOnMobile] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId) return;
    setSending(true);
    const msgText = inputText.trim();
    setInputText("");
    try {
      await messageApi.sendMessage({
        recipientId: selectedUserId,
        text: msgText,
        body: msgText,
      });

      const socket = getSocket();
      if (socket) {
        socket.emit("send_message", {
          recipientId: selectedUserId,
          senderId: user?._id,
          text: msgText,
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
                const isSelected = (c.otherUser?._id === selectedUserId);
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
                const isMe = (m.sender?._id === user?._id || m.sender === user?._id);
                const msgText = m.text || m.body || "";
                return (
                  <div
                    key={m._id}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[70%]",
                      isMe
                        ? "self-end bg-primary text-primary-foreground"
                        : "self-start border border-border bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msgText}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedUserId ? "Type your message..." : "Select a business to start messaging..."}
              disabled={!selectedUserId || sending}
              className="h-10 flex-1"
            />
            <Button type="submit" size="sm" disabled={sending || !inputText.trim() || !selectedUserId}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}

export { MessagesPage as CustomerMessages };
export default MessagesPage;
