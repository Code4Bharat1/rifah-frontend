"use client";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { conversations } from "@shared/lib/mock-data";
import { cn } from "@shared/lib/utils";

function MessagesPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [openOnMobile, setOpenOnMobile] = useState(false);
  const active = conversations.find((c) => c.id === activeId);

  return (
    <AppShell role="customer" title="Messages" subtitle="Conversations with member businesses">
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Conversation list */}
        <Panel
          className={cn(openOnMobile && "hidden lg:block")}
          title="Inbox"
          bodyClassName="p-0 md:p-0"
        >
          <ul className="divide-y divide-border">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(c.id);
                    setOpenOnMobile(true);
                  }}
                  className={cn(
                    "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-3.5 text-left transition-colors hover:bg-muted/60",
                    c.id === activeId && "bg-primary-soft/60",
                  )}
                >
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                    {c.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.org}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{c.last}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[11px] text-muted-foreground">{c.time}</span>
                    {c.unread > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-primary-foreground">
                        {c.unread}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
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
              <p className="truncate text-sm font-semibold">{active.name}</p>
              <p className="truncate text-xs text-muted-foreground">{active.org}</p>
            </div>
          </header>

          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto p-4">
            {active.messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[70%]",
                  m.from === "me"
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start border border-border bg-muted",
                )}
              >
                <p>{m.text}</p>
                <p
                  className={cn(
                    "mt-1 text-[11px]",
                    m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {m.time}
                </p>
              </div>
            ))}
          </div>

          <form
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <Button type="button" variant="ghost" size="icon" aria-label="Attach file">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input placeholder="Write a message (prototype only)" className="h-11" />
            <Button type="submit" size="icon" aria-label="Send message" className="h-11 w-11">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}


const CustomerMessages = MessagesPage;

export { CustomerMessages };
export default CustomerMessages;
