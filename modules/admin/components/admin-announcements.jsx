"use client";
import { Megaphone, Plus, Trash2, Send, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@shared/components/rifah/app-shell";
import { Pill, StatusBadge } from "@shared/components/rifah/badges";
import { Panel, ResponsiveTable, StatCard } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { useAnnouncements } from "@shared/hooks/use-rifah-api";
import { announcementApi } from "@shared/lib/api-services";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@shared/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";

function AdminAnnouncements() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Draft");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: announcementsData, refetch } = useAnnouncements();
  const announcements = Array.isArray(announcementsData) ? announcementsData : [];

  const handleOpenForm = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement._id);
      setTitle(announcement.title);
      setMessage(announcement.message);
      setStatus(announcement.status);
    } else {
      setEditingId(null);
      setTitle("");
      setMessage("");
      setStatus("Draft");
    }
    setIsCreating(true);
  };

  const handleSave = async (e, overrideStatus = null) => {
    if (e) e.preventDefault();
    if (!title || !message) return toast.error("Title and message are required.");
    setSaving(true);
    const finalStatus = overrideStatus || status;
    try {
      if (editingId) {
        await announcementApi.update(editingId, { title, message, status: finalStatus });
        toast.success(`Announcement ${finalStatus === 'Published' ? 'published' : 'updated'} successfully`);
      } else {
        await announcementApi.create({ title, message, status: finalStatus, chapter: "dummy" }); 
        // backend will auto-override chapter with req.user.chapter
        toast.success("Announcement created successfully");
      }
      setIsCreating(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await announcementApi.delete(confirmDelete);
      toast.success("Announcement deleted successfully.");
      setConfirmDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete announcement.");
    }
  };

  const handlePublishDirectly = async (id) => {
    try {
      await announcementApi.update(id, { status: "Published" });
      toast.success("Announcement published and broadcasted to chapter members.");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to publish announcement.");
    }
  };

  return (
    <AppShell role="admin" title="Chapter Announcements" subtitle="Manage and publish circulars to your members">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Announcements" value={String(announcements.length)} icon={Megaphone} tone="primary" />
          <StatCard label="Published" value={String(announcements.filter(a => a.status === 'Published').length)} tone="success" />
          <StatCard label="Drafts" value={String(announcements.filter(a => a.status === 'Draft').length)} tone="warning" />
        </div>

        <Panel 
          title="Announcements List" 
          action={
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" /> Create Announcement
            </Button>
          }
        >
          {announcements.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No announcements found. Create one to get started.</p>
          ) : (
            <ResponsiveTable
              rows={announcements}
              columns={[
                { key: "title", header: "Title", cell: (r) => <span className="font-semibold">{r.title}</span> },
                { key: "message", header: "Message", cell: (r) => <span className="line-clamp-1">{r.message}</span> },
                { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
                { key: "date", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
                { key: "actions", header: "", cell: (r) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {r.status === "Draft" && (
                        <>
                          <DropdownMenuItem onClick={() => handlePublishDirectly(r._id)}>
                            <Send className="mr-2 h-4 w-4 text-success" /> Publish Now
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenForm(r)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setConfirmDelete(r._id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              ]}
            />
          )}
        </Panel>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
              <DialogDescription>
                {status === "Published" ? "Note: This announcement is already published." : "Drafts can be published later."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. September Chapter Meeting"
                  className="h-11"
                  disabled={status === "Published"}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write the announcement details here..."
                  disabled={status === "Published"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              {status === "Draft" && (
                <>
                  <Button type="button" variant="secondary" onClick={() => { setStatus("Draft"); handleSave(null, "Draft"); }} disabled={saving}>
                    Save as Draft
                  </Button>
                  <Button type="button" onClick={() => { setStatus("Published"); handleSave(null, "Published"); }} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish & Broadcast"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
              If it was published, the broadcast alert will also be recalled from members.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { AdminAnnouncements };
export default AdminAnnouncements;
