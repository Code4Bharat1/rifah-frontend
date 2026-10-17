"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { QrCode, CheckCircle2, AlertCircle, RefreshCw, Send, MessageSquare } from "lucide-react";

export default function WhatsAppAdminPage() {
  const [status, setStatus] = useState("LOADING");
  const [qrCode, setQrCode] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [restarting, setRestarting] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/v1/notifications/whatsapp-status");
      const json = await res.json();
      if (json.success && json.data) {
        setStatus(json.data.status);
        setQrCode(json.data.qrCodeDataUrl);
        setUserInfo(json.data.user);
        setLastError(json.data.lastError || null);
      }
    } catch (err) {
      console.error("Failed to load WhatsApp status:", err);
      setStatus("OFFLINE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    try {
      setRestarting(true);
      await fetch("http://127.0.0.1:5000/api/v1/notifications/whatsapp-restart");
      setTimeout(() => {
        fetchStatus();
        setRestarting(false);
      }, 3000);
    } catch (err) {
      setRestarting(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    try {
      setSendingTest(true);
      setTestResult(null);
      const res = await fetch("http://127.0.0.1:5000/api/v1/notifications/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setTestResult({ success: true, message: json.message || "Test WhatsApp message sent successfully!" });
      } else {
        setTestResult({ success: false, message: json.message || "Failed to send WhatsApp message" });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message || "Network error" });
    } finally {
      setSendingTest(false);
    }
  };

  const isConnected = status === "CONNECTED";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-emerald-600" />
            WhatsApp Automation (whatsapp-web.js)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official RIFAH WhatsApp integration for event tickets, invoices, enquiries, meetings & wishes.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="md:col-span-1 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Connection Status</CardTitle>
            <CardDescription>Live session state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-emerald-600 text-white gap-1 px-3 py-1 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </Badge>
              ) : status === "QR_READY" ? (
                <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 gap-1 px-3 py-1 text-sm font-medium">
                  <QrCode className="w-4 h-4" /> Scan QR Code
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" /> {status}
                </Badge>
              )}
            </div>

            {isConnected && userInfo && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs space-y-1 text-emerald-950">
                <p className="font-semibold text-emerald-900">Connected Device</p>
                <p>Phone: +{userInfo.number}</p>
                {userInfo.name && <p>Name: {userInfo.name}</p>}
              </div>
            )}

            {lastError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 space-y-1">
                <p className="font-semibold text-rose-900">Issue Detected</p>
                <p className="text-[11px] leading-relaxed break-words">{lastError}</p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={restarting}
              className="w-full text-xs gap-1.5 border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${restarting ? "animate-spin" : ""}`} />
              {restarting ? "Reconnecting..." : "Force Reconnect Client"}
            </Button>

            <div className="text-xs text-slate-500 space-y-1.5 border-t pt-3">
              <p className="font-medium text-slate-700">Supported Automated Alerts:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Event Tickets & Registration</li>
                <li>Payment Invoices & Receipts</li>
                <li>New Business Enquiries</li>
                <li>Birthday Wishes</li>
                <li>Anniversary Congratulations</li>
                <li>1-to-1 Meeting Alerts</li>
                <li>Thank You Notes</li>
                <li>Welcome Messages</li>
                <li>Referral Alerts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action / QR Area */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {isConnected ? "Test WhatsApp Messaging" : "Link WhatsApp Account"}
            </CardTitle>
            <CardDescription>
              {isConnected
                ? "Send a test message to any phone number to verify live delivery"
                : "Scan the QR code below using WhatsApp on your phone"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected && qrCode ? (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border rounded-xl space-y-4">
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64 border-4 border-white rounded-lg shadow-md"
                />
                <div className="text-center text-xs text-slate-600 max-w-sm space-y-1">
                  <p className="font-semibold text-slate-800 text-sm">How to scan:</p>
                  <p>1. Open WhatsApp on your phone</p>
                  <p>2. Go to <b>Settings</b> or Menu (⋮) &gt; <b>Linked Devices</b></p>
                  <p>3. Tap <b>Link a Device</b> and point camera at this QR code</p>
                  <p className="text-slate-400 italic mt-2">QR code also appears in the backend terminal console.</p>
                </div>
              </div>
            ) : !isConnected ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                <p className="text-sm font-medium">Initializing WhatsApp client...</p>
                <p className="text-xs text-slate-400">Please wait while headless browser launches.</p>
              </div>
            ) : (
              <form onSubmit={handleSendTest} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Recipient Phone Number</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. 9876543210 or 919876543210"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="max-w-md"
                    />
                    <Button type="submit" disabled={sendingTest || !testPhone.trim()} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <Send className="w-4 h-4" />
                      {sendingTest ? "Sending..." : "Send Test"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Works directly with standard 10-digit Indian numbers or full international format.
                  </p>
                  <p className="text-[11px] text-amber-800 bg-amber-50 rounded p-2 border border-amber-200 leading-normal">
                    💡 <b>Tip:</b> If you send to the linked number itself ({userInfo ? `+${userInfo.number}` : "your scanned WhatsApp"}), it arrives silently inside your WhatsApp <b>&quot;Message yourself&quot; (You)</b> chat without a ringtone. To verify incoming notifications, test with another number.
                  </p>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-sm border flex items-center gap-2 ${
                      testResult.success
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
