"use client";
import { useState } from "react";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { reportApi } from "@shared/lib/api-services";
import { toast } from "sonner";
import { FileDown, Receipt, Users, Megaphone, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@shared/components/ui/dialog";

export function AdminReports() {
  const [revenueDates, setRevenueDates] = useState({ start: "", end: "" });
  const [memberDates, setMemberDates] = useState({ start: "", end: "" });
  const [leadDates, setLeadDates] = useState({ start: "", end: "" });
  
  const [loading, setLoading] = useState({ revenue: false, members: false, leads: false });
  const [viewing, setViewing] = useState({ revenue: false, members: false, leads: false });
  const [viewData, setViewData] = useState(null);

  const handleDownload = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let dates = {};
      if (type === 'revenue') dates = revenueDates;
      else if (type === 'memberships') dates = memberDates;
      else if (type === 'leads') dates = leadDates;

      const params = {};
      if (dates.start) params.startDate = dates.start;
      if (dates.end) params.endDate = dates.end;

      if (type === 'revenue') {
        await reportApi.downloadRevenue(params);
      } else if (type === 'memberships') {
        await reportApi.downloadMemberships(params);
      } else if (type === 'leads') {
        await reportApi.downloadLeads(params);
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully.`);
    } catch (err) {
      toast.error(err.message || "Failed to download report.");
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleView = async (type) => {
    setViewing(prev => ({ ...prev, [type]: true }));
    try {
      let dates = {};
      if (type === 'revenue') dates = revenueDates;
      else if (type === 'memberships') dates = memberDates;
      else if (type === 'leads') dates = leadDates;

      const params = {};
      if (dates.start) params.startDate = dates.start;
      if (dates.end) params.endDate = dates.end;

      let res;
      if (type === 'revenue') {
        res = await reportApi.getRevenue(params);
      } else if (type === 'memberships') {
        res = await reportApi.getMemberships(params);
      } else if (type === 'leads') {
        res = await reportApi.getLeads(params);
      }
      
      setViewData({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        headers: res?.data?.headers || [],
        rows: res?.data?.rows || []
      });
    } catch (err) {
      toast.error(err.message || "Failed to fetch report data.");
    } finally {
      setViewing(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <AppShell
      role="admin"
      title="Data Export & Reports"
      subtitle="Download CSV reports for analysis"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Report */}
        <Panel 
          title="Revenue & Payments" 
          icon={<Receipt className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Export all paid transactions, invoices, and payment details.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date (Optional)</Label>
                <Input type="date" value={revenueDates.start} onChange={e => setRevenueDates({...revenueDates, start: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date (Optional)</Label>
                <Input type="date" value={revenueDates.end} onChange={e => setRevenueDates({...revenueDates, end: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => handleView('revenue')} 
                disabled={viewing.revenue}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button 
                className="w-full" 
                onClick={() => handleDownload('revenue')} 
                disabled={loading.revenue}
              >
                <FileDown className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </Panel>

        {/* Memberships Report */}
        <Panel 
          title="Memberships" 
          icon={<Users className="h-5 w-5 text-blue-500" />}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Export all registered active users, their roles, and chapters.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date (Optional)</Label>
                <Input type="date" value={memberDates.start} onChange={e => setMemberDates({...memberDates, start: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date (Optional)</Label>
                <Input type="date" value={memberDates.end} onChange={e => setMemberDates({...memberDates, end: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => handleView('memberships')} 
                disabled={viewing.members}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button 
                className="w-full" 
                onClick={() => handleDownload('memberships')} 
                disabled={loading.members}
              >
                <FileDown className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </Panel>

        {/* Leads & Enquiries Report */}
        <Panel 
          title="Leads & Enquiries" 
          icon={<Megaphone className="h-5 w-5 text-orange-500" />}
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Export lead distribution data, statuses, and enquiry sources.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date (Optional)</Label>
                <Input type="date" value={leadDates.start} onChange={e => setLeadDates({...leadDates, start: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date (Optional)</Label>
                <Input type="date" value={leadDates.end} onChange={e => setLeadDates({...leadDates, end: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => handleView('leads')} 
                disabled={viewing.leads}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <Button 
                className="w-full" 
                onClick={() => handleDownload('leads')} 
                disabled={loading.leads}
              >
                <FileDown className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      <Dialog open={!!viewData} onOpenChange={(o) => !o && setViewData(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{viewData?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted text-muted-foreground sticky top-0">
                <tr>
                  {viewData?.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {viewData?.rows.length === 0 ? (
                  <tr>
                    <td colSpan={viewData.headers.length} className="px-4 py-8 text-center text-muted-foreground">
                      No data found for the selected dates.
                    </td>
                  </tr>
                ) : (
                  viewData?.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-3 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
