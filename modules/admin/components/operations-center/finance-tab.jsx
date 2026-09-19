import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Download, FileText, Lock, Unlock, CheckCircle2, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { Label } from "@shared/components/ui/label";
import { toast } from "sonner";
import { eventApi } from "@shared/lib/api-services";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@shared/lib/utils";

export function FinanceTab({ eventId, financeRecords, setFinanceRecords, attendees, chapterMembers, activeEvent }) {
  const [saving, setSaving] = useState(false);
  const [financeDialogOpen, setFinanceDialogOpen] = useState(false);
  const [financeForm, setFinanceForm] = useState({ type: "moneyIn", desc: "", amount: "", from: "", to: "", method: "Online", invoice: "", date: new Date().toISOString().split('T')[0] });
  
  const [notes, setNotes] = useState(financeRecords.notes || "");
  const [isClosed, setIsClosed] = useState(financeRecords.isClosed || false);

  useEffect(() => {
    setNotes(financeRecords.notes || "");
    setIsClosed(financeRecords.isClosed || false);
  }, [financeRecords]);

  // Calculate Desk Fees dynamically
  const deskFees = attendees
    .filter(a => a.paymentStatus === 'Paid' || a.paymentStatus === 'Free')
    .reduce((sum, a) => sum + (Number(activeEvent?.ticketPrice) || 0), 0);
  const deskAttendeesCount = attendees.filter(a => a.paymentStatus === 'Paid' || a.paymentStatus === 'Free').length;

  const totalMoneyIn = deskFees + (financeRecords.moneyIn || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalMoneyOut = (financeRecords.moneyOut || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const netBalance = totalMoneyIn - totalMoneyOut;

  const saveFinanceToBackend = async (updatedFinance) => {
    if (!eventId) return;
    try {
      setSaving(true);
      const res = await eventApi.updateOperations(eventId, { finance: updatedFinance });
      if (res.success) {
        setFinanceRecords(updatedFinance);
        toast.success("Finance records updated");
      }
    } catch (err) {
      toast.error("Failed to save finance records");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFinanceTransaction = async (e) => {
    e.preventDefault();
    if (!financeForm.desc || !financeForm.amount) return toast.error("Description and amount required");
    
    let updated;
    if (financeForm.type === "moneyIn") {
      updated = {
        ...financeRecords,
        moneyIn: [...(financeRecords.moneyIn || []), { ...financeForm, id: Date.now().toString() }]
      };
    } else {
      updated = {
        ...financeRecords,
        moneyOut: [...(financeRecords.moneyOut || []), { ...financeForm, id: Date.now().toString() }]
      };
    }

    await saveFinanceToBackend(updated);
    setFinanceDialogOpen(false);
    setFinanceForm({ type: "moneyIn", desc: "", amount: "", from: "", to: "", method: "Online", invoice: "", date: new Date().toISOString().split('T')[0] });
  };

  const handleSaveNotes = () => {
    saveFinanceToBackend({ ...financeRecords, notes });
  };

  const handleToggleClose = () => {
    saveFinanceToBackend({ ...financeRecords, isClosed: !isClosed });
  };

  const getBase64ImageFromUrl = async (imageUrl) => {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);
      reader.onerror = () => reject(this);
      reader.readAsDataURL(blob);
    });
  };

  const generateStatementPDF = async () => {
    const doc = new jsPDF();
    try {
      const logo = await getBase64ImageFromUrl("/rifah-logo.png");
      doc.addImage(logo, 'PNG', 20, 15, 30, 12);
    } catch (e) {
      console.warn("Could not load logo for PDF", e);
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 20, 80);
    doc.text("RIFAH CENTRAL MUMBAI", 55, 22);
    doc.setFontSize(14);
    doc.text("Statement of Accounts", 55, 30);
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`${activeEvent?.title || "Business Growth Networking Meet"}`, 20, 45);
    doc.setFontSize(10);
    doc.text(`Event date: ${activeEvent?.date || ""}  |  Printed: ${new Date().toLocaleString()}`, 20, 52);

    doc.setFontSize(12);
    doc.setTextColor(0, 150, 80);
    doc.text("MONEY IN", 20, 65);
    
    const moneyInRows = [
      ["Registration fees at the desk", `${deskAttendeesCount} attendees`, `Rs. ${deskFees.toLocaleString()}`],
      ...(financeRecords.moneyIn || []).map(m => [m.desc, m.from || "-", `Rs. ${Number(m.amount).toLocaleString()}`])
    ];

    autoTable(doc, {
      startY: 70,
      head: [["Item", "Detail", "Amount"]],
      body: moneyInRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] },
      foot: [["Total", "", `Rs. ${totalMoneyIn.toLocaleString()}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold' }
    });

    const finalY = doc.lastAutoTable.finalY || 70;
    doc.setFontSize(12);
    doc.setTextColor(200, 40, 40);
    doc.text("MONEY OUT", 20, finalY + 15);

    const moneyOutRows = (financeRecords.moneyOut || []).length > 0 
      ? (financeRecords.moneyOut || []).map(m => [m.desc, m.to || "-", `Rs. ${Number(m.amount).toLocaleString()}`])
      : [["Nothing recorded.", "", ""]];

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Item", "Detail", "Amount"]],
      body: moneyOutRows,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69] },
      foot: [["Total", "", `Rs. ${totalMoneyOut.toLocaleString()}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold' }
    });

    const finalY2 = doc.lastAutoTable.finalY || finalY + 20;
    doc.setDrawColor(0, 100, 0);
    doc.setFillColor(245, 255, 245);
    doc.rect(20, finalY2 + 10, 170, 15, 'FD');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("BALANCE IN HAND", 25, finalY2 + 20);
    doc.text(`Rs. ${netBalance.toLocaleString()}`, 150, finalY2 + 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("These accounts are still open — figures may change.", 20, 280);
    doc.text("RIFAH Chamber of Commerce & Industry", 130, 280);

    doc.save("Statement_of_Accounts.pdf");
  };

  const generateLedgerPDF = async () => {
    const doc = new jsPDF();
    try {
      const logo = await getBase64ImageFromUrl("/rifah-logo.png");
      doc.addImage(logo, 'PNG', 20, 15, 30, 12);
    } catch (e) {
      console.warn("Could not load logo for PDF", e);
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 20, 80);
    doc.text("RIFAH CENTRAL MUMBAI", 55, 22);
    doc.setFontSize(14);
    doc.text("Financial Ledger Report", 55, 30);
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`${activeEvent?.title || "Business Growth Networking Meet"}`, 20, 45);
    doc.setFontSize(10);
    doc.text(`Event Date: ${activeEvent?.date || ""}  |  Report Generated: ${new Date().toLocaleString()}`, 20, 52);

    doc.setFillColor(240, 245, 250);
    doc.setDrawColor(100, 100, 100);
    doc.rect(20, 60, 170, 15, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`INCOME: Rs.${totalMoneyIn.toLocaleString()} fees (${deskAttendeesCount} attendees) + Rs.0 sponsors = Rs.${totalMoneyIn.toLocaleString()}`, 22, 66);
    doc.text(`EXPENSES: Rs.${totalMoneyOut.toLocaleString()}      NET BALANCE: Rs.${netBalance.toLocaleString()}`, 22, 72);

    doc.setFontSize(12);
    doc.setTextColor(30, 20, 80);
    doc.text("Income", 20, 85);
    
    const incomeRows = [
      ["Event Fees", `${deskAttendeesCount} attendees`, deskFees.toLocaleString()],
      ...(financeRecords.moneyIn || []).map(m => [m.from || "External", m.desc, Number(m.amount).toLocaleString()])
    ];

    autoTable(doc, {
      startY: 90,
      head: [["Source", "Details", "Amount (Rs.)"]],
      body: incomeRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 20, 100] },
      foot: [["Total Income", "", totalMoneyIn.toLocaleString()]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold' }
    });

    const finalY = doc.lastAutoTable.finalY || 90;
    doc.setFontSize(12);
    doc.setTextColor(150, 20, 20);
    doc.text("Expenses", 20, finalY + 15);

    const expenseRows = (financeRecords.moneyOut || []).length > 0 
      ? (financeRecords.moneyOut || []).map(m => [m.date || "-", m.desc, m.to || "-", Number(m.amount).toLocaleString()])
      : [["No expenses recorded", "", "", ""]];

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Date", "Description", "Given By", "Amount (Rs.)"]],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [150, 20, 20] },
      foot: [["Total Expenses", "", "", totalMoneyOut.toLocaleString()]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold' }
    });

    const finalY2 = doc.lastAutoTable.finalY || finalY + 20;
    doc.setDrawColor(0, 50, 100);
    doc.setFillColor(245, 250, 250);
    doc.rect(20, finalY2 + 10, 170, 15, 'FD');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`NET BALANCE: Rs.${netBalance.toLocaleString()}`, 80, finalY2 + 20);

    doc.save("Financial_Ledger_Report.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Chapter Event Financial Ledger
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track collections, expenses, vendor invoices, and statement reports backed by MongoDB
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setFinanceDialogOpen(true)}
              disabled={isClosed}
              className="font-semibold text-xs h-9 gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={generateStatementPDF}
              className="text-xs h-9 gap-1.5 font-semibold"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Statement PDF</span>
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={generateLedgerPDF}
              className="text-xs h-9 gap-1.5 font-semibold"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Ledger PDF</span>
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={handleToggleClose}
              className={cn("text-xs h-9 gap-1.5 font-semibold", isClosed ? "text-amber-500 border-amber-200 bg-amber-500/10" : "text-muted-foreground")}
            >
              {isClosed ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              <span>{isClosed ? "Locked" : "Open"}</span>
            </Button>
          </div>
        </div>

        {/* 3 Summary Ledger KPI Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Total Collections (Money In)
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
              ₹{totalMoneyIn.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
              Total Expenses (Money Out)
            </span>
            <span className="text-2xl font-black text-rose-500 font-mono mt-1 block">
              ₹{totalMoneyOut.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-primary-soft border border-primary/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
              Net Event Balance
            </span>
            <span className="text-2xl font-black text-primary font-mono mt-1 block">
              ₹{netBalance.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Ledger Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Money In */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Collections & Deposits
              </h4>
              <span className="font-black text-emerald-600 text-sm font-mono">
                ₹{totalMoneyIn.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-border bg-emerald-500/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">Registration Desk Fees</p>
                  <p className="text-[10px] text-muted-foreground">Automatically synced from Attendees list</p>
                </div>
                <span className="font-black text-emerald-500 font-mono">+₹{deskFees.toLocaleString()}</span>
              </div>
              
              {(financeRecords.moneyIn || []).map((item, idx) => (
                <div key={item.id || idx} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{item.desc}</p>
                    <p className="text-[10px] text-muted-foreground">
                      From: {item.from || "Attendee / Sponsor"} · {item.method || "Online"} · {item.date ? String(item.date).split("T")[0] : ""}
                    </p>
                  </div>
                  <span className="font-black text-emerald-500 font-mono">
                    +₹{Number(item.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Money Out */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-rose-500 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Expenses & Payments
              </h4>
              <span className="font-black text-rose-500 text-sm font-mono">
                ₹{totalMoneyOut.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="space-y-2">
              {(financeRecords.moneyOut || []).length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  No expenses recorded yet. Click &ldquo;Add Transaction&rdquo; above.
                </div>
              ) : (
                (financeRecords.moneyOut || []).map((item, idx) => (
                  <div key={item.id || idx} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">{item.desc}</p>
                      <p className="text-[10px] text-muted-foreground">
                        To: {item.to || "Vendor"} · Ref: {item.invoice || "N/A"} · {item.date ? String(item.date).split("T")[0] : ""}
                      </p>
                    </div>
                    <span className="font-black text-rose-500 font-mono">
                      -₹{Number(item.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Treasurer Notes */}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Pencil className="h-4 w-4 text-muted-foreground" /> Treasurer&apos;s Notes
            </h4>
            <Button variant="ghost" size="sm" onClick={handleSaveNotes} disabled={isClosed} className="h-7 text-[10px] gap-1 px-2">
              Save Notes
            </Button>
          </div>
          <Textarea 
            value={notes} onChange={e => setNotes(e.target.value)} disabled={isClosed}
            placeholder="Add any internal ledger notes, venue advance details, or reimbursement reminders here..."
            className="text-xs bg-muted/30 border-border"
          />
        </div>
      </div>

      {/* Add Finance Transaction Dialog */}
      <Dialog open={financeDialogOpen} onOpenChange={setFinanceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Ledger Transaction</DialogTitle>
            <DialogDescription>
              Record income collection or venue/catering expense directly into the chapter ledger in MongoDB.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddFinanceTransaction} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Transaction Type</Label>
              <Select value={financeForm.type} onValueChange={(val) => setFinanceForm({ ...financeForm, type: val })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="moneyIn">Money In (Collection / Ticket / Sponsor)</SelectItem>
                  <SelectItem value="moneyOut">Money Out (Expense / Venue / Catering)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Input
                placeholder="e.g. Venue Hall Advance or Sponsor Contribution"
                value={financeForm.desc} onChange={(e) => setFinanceForm({ ...financeForm, desc: e.target.value })}
                className="mt-1" required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Amount (₹)</Label>
                <Input
                  type="number" placeholder="5000"
                  value={financeForm.amount} onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
                  className="mt-1" required
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">
                  {financeForm.type === "moneyIn" ? "Received From" : "Paid To (select member)"}
                </Label>
                <Input
                  list={financeForm.type === "moneyOut" ? "members-list" : undefined}
                  placeholder={financeForm.type === "moneyIn" ? "Payer / Sponsor" : "Vendor or Member"}
                  value={financeForm.type === "moneyIn" ? financeForm.from : financeForm.to}
                  onChange={(e) => {
                    if (financeForm.type === "moneyIn") setFinanceForm({ ...financeForm, from: e.target.value });
                    else setFinanceForm({ ...financeForm, to: e.target.value });
                  }}
                  className="mt-1"
                />
                {financeForm.type === "moneyOut" && (
                  <datalist id="members-list">
                    {chapterMembers.map(m => <option key={m._id} value={m.name} />)}
                  </datalist>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Payment Method</Label>
                <Select value={financeForm.method} onValueChange={(val) => setFinanceForm({ ...financeForm, method: val })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online / Gateway</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer (NEFT/IMPS)</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Invoice / Reference No.</Label>
                <Input
                  placeholder="INV-102 or UPI Ref"
                  value={financeForm.invoice} onChange={(e) => setFinanceForm({ ...financeForm, invoice: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Date</Label>
              <Input
                type="date"
                value={financeForm.date} onChange={(e) => setFinanceForm({ ...financeForm, date: e.target.value })}
                className="mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setFinanceDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="font-semibold text-xs shadow-xs">
                {saving ? "Saving..." : "Record Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
