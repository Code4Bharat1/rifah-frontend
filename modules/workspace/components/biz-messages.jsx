"use client";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { useConversations, useMessages } from "@shared/hooks/use-rifah-api";
import { messageApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { cn } from "@shared/lib/utils";

function BizMessages() {
  const { user } = useAuth();
  const { data: convData, refetch: refetchConversations } = useConversations();
  const conversations = convData || [];

  const [activeOtherUser, setActiveOtherUser] = useState(conversations[0]?.otherUser || null);
  const [openOnMobile, setOpenOnMobile] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const selectedUserId = activeOtherUser?._id || conversations[0]?.otherUser?._id;
  const { data: messagesData, refetch: refetchMessages } = useMessages(selectedUserId);
  const messages = messagesData || [];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId) return;
    setSending(true);
    try {
      await messageApi.sendMessage({
        recipientId: selectedUserId,
        body: inputText.trim(),
      });
      setInputText("");
      refetchMessages();
      refetchConversations();
    } catch (err) {
      alert(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell role="business" title="Messages" subtitle="Buyer enquiries & direct threads">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel className={cn(openOnMobile && "hidden lg:block")} title="Inbox" bodyClassName="p-0 md:p-0">
          {conversations.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">
              No active conversations. Messages will appear when buyers contact your business.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {conversations.map((c, i) => {
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
                        <span className="block truncate text-xs text-muted-foreground">{c.lastMessage?.body || "New thread"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

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
              <p className="truncate text-xs text-muted-foreground">{activeOtherUser?.email || ""}</p>
            </div>
          </header>

          <div className="flex min-h-[300px] max-h-[55vh] flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="my-auto text-center text-xs text-muted-foreground">
                No messages in this conversation yet.
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender?._id === user?._id || m.sender === user?._id;
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
                    <p>{m.body}</p>
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
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a response..."
              className="h-10 flex-1"
            />
            <Button type="submit" size="sm" disabled={sending || !inputText.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}

export { BizMessages };
export default BizMessages;
