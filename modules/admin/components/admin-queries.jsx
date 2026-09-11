"use client";
import { useState } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill } from "@shared/components/rifah/badges";
import { EmptyState } from "@shared/components/rifah/empty-state";
import { Panel, ResponsiveTable } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { Textarea } from "@shared/components/ui/textarea";
import { useQueries } from "@shared/hooks/use-rifah-api";
import { contactApi } from "@shared/lib/api-services";
import { MessageSquareText, Search, Send, Clock } from "lucide-react";
import { toast } from "sonner";

export function AdminQueries() {
  const [search, setSearch] = useState("");
  const { data: queriesData, refetch, isLoading } = useQueries({ search: search || undefined });
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const queries = queriesData?.queries || queriesData || [];

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsReplying(true);
    try {
      await contactApi.replyQuery(selectedQuery._id, replyText);
      toast.success("Reply sent successfully");
      setSelectedQuery(null);
      setReplyText("");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusTone = (status) => {
    switch (status) {
      case "Open": return "warning";
      case "Replied": return "success";
      case "Closed": return "default";
      default: return "default";
    }
  };

  return (
    <AppShell
      role="chapter_admin"
      title="Queries"
      subtitle={`${queries.length} queries received`}
    >
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queries..."
            className="h-11 pl-10"
          />
        </div>

        <Panel>
          <ResponsiveTable
            rows={queries}
            isLoading={isLoading}
            empty={
              <EmptyState
                icon={MessageSquareText}
                title="No queries found"
                description="When visitors submit queries on the contact page, they will appear here."
              />
            }
            columns={[
              { key: "date", header: "Date", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
              { key: "name", header: "Name", cell: (r) => <span className="font-semibold">{r.fullName}</span> },
              { key: "org", header: "Organisation", cell: (r) => r.organization },
              { key: "desk", header: "Desk", cell: (r) => r.desk },
              { key: "status", header: "Status", cell: (r) => <Pill tone={getStatusTone(r.status)}>{r.status}</Pill> },
              {
                key: "act",
                header: "",
                cell: (r) => (
                  <Button variant="outline" size="sm" onClick={() => setSelectedQuery(r)}>
                    View
                  </Button>
                ),
              },
            ]}
            mobile={(r) => (
              <div className="rounded-xl border border-border p-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.fullName}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.organization}</p>
                  </div>
                  <Pill tone={getStatusTone(r.status)}>{r.status}</Pill>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                   <Clock className="w-3 h-3" /> {new Date(r.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-medium">{r.desk}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedQuery(r)}>
                    View Details
                  </Button>
                </div>
              </div>
            )}
          />
        </Panel>
      </div>

      <Dialog open={!!selectedQuery} onOpenChange={(o) => !o && setSelectedQuery(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
            <DialogDescription>From {selectedQuery?.fullName} ({selectedQuery?.organization})</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="font-semibold mt-0.5"><a href={`mailto:${selectedQuery?.email}`} className="hover:underline">{selectedQuery?.email}</a></p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Phone</p>
                <p className="font-semibold mt-0.5"><a href={`tel:${selectedQuery?.phone}`} className="hover:underline">{selectedQuery?.phone}</a></p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Target Desk</p>
                <p className="font-semibold mt-0.5">{selectedQuery?.desk}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                   <Pill tone={getStatusTone(selectedQuery?.status)}>{selectedQuery?.status}</Pill>
                </div>
              </div>
            </div>
            <div>
               <p className="text-sm font-medium mb-1">Message:</p>
               <div className="rounded-md border p-3 text-sm bg-surface whitespace-pre-wrap">
                 {selectedQuery?.message}
               </div>
            </div>

            {selectedQuery?.status === "Replied" ? (
               <div className="mt-4 border-l-2 border-primary pl-4">
                  <p className="text-sm font-medium mb-1">Your Reply (Sent {new Date(selectedQuery?.repliedAt).toLocaleDateString()}):</p>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedQuery?.replyMessage}
                  </div>
               </div>
            ) : (
              <form onSubmit={handleReply} className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium">Send a Reply</p>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here. This will be sent as an email to the requester."
                  rows={4}
                  required
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setSelectedQuery(null)} disabled={isReplying}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isReplying}>
                    <Send className="mr-2 h-4 w-4" /> {isReplying ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default AdminQueries;
