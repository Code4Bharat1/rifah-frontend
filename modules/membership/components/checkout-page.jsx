"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Landmark, Lock, Smartphone, Loader2, ArrowRight, FileText, Printer, Sparkles, Building2, Globe, LayoutDashboard, ShieldCheck, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { PublicLayout } from "@shared/components/rifah/public-layout";
import { Panel, SectionHeader, Steps } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { PhoneInput } from "@shared/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@shared/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { parsePhoneNumber } from "@shared/lib/countries";
import { useMembershipPlans, useMyBusiness } from "@shared/hooks/use-rifah-api";
import { membershipApi, paymentApi, businessApi } from "@shared/lib/api-services";
import { useAuth } from "@shared/providers/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@shared/lib/utils";

const steps = ["Plan", "Billing", "Payment", "Confirmation"];

const methods = [
  { id: "razorpay", label: "Razorpay Secure Gateway", note: "UPI, Cards, Netbanking, Wallets", icon: Smartphone },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout() {
  const searchParams = useSearchParams();
  const planParam = searchParams?.get("plan") || "";

  const queryClient = useQueryClient();
  const { user: currentUser, refreshProfile } = useAuth();
  const { data: business } = useMyBusiness();
  const { data: plansData } = useMembershipPlans();
  const plans = plansData 
    ? (Array.isArray(plansData) ? plansData.map((p) => ({ id: p.id || p.planId, ...p })) : Object.entries(plansData))
        .map((item) => (Array.isArray(item) ? { id: item[0], ...item[1] } : item))
        .filter((p) => p.isActive !== false && p.price > 0)
        .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
    : [];

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(planParam);

  useEffect(() => {
    if (plans.length > 0) {
      const match = plans.find(
        (p) => p.id === (planParam || selected) || p.name?.toLowerCase() === (planParam || selected).toLowerCase()
      );
      if (match) {
        setSelected(match.id);
      } else if (!plans.some((p) => p.id === selected)) {
        const fallback = plans.find((p) => p.isRecommended) || plans[0];
        if (fallback) setSelected(fallback.id);
      }
    }
  }, [plans, planParam]);
  const [method, setMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [legalName, setLegalName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [gstLoading, setGstLoading] = useState(false);
  const [gstSuccess, setGstSuccess] = useState("");

  const initialCurrency = searchParams?.get("currency") || (business?.region === "international" || business?.currency === "USD" ? "USD" : "INR");
  const [currency, setCurrency] = useState(initialCurrency);
  const isIntl = currency === "USD";

  const active = plans.find((p) => p.id === selected) || plans[0];

  const checkoutAmount = isIntl
    ? (active?.priceUsd ?? (active?.price === 0 ? 0 : Math.round((active?.price || 0) / 80)))
    : (active?.price || 0);

  // GST breakdown — applies to both INR and USD payments
  const gstRate = Number(active?.gstRate ?? 0);
  const subtotal = checkoutAmount; // base price before GST
  const gstAmount = Math.round(subtotal * gstRate / 100);
  const totalWithGst = subtotal + gstAmount;

  // Duration label for selected plan
  const durationYears = Number(active?.durationYears) || 1;
  const durationLabel = durationYears === 1 ? "1 Year Validity" : `${durationYears} Years Validity`;

  // Pre-fill existing business or user details if available
  useEffect(() => {
    if (business) {
      if (business.name && !legalName) setLegalName(business.name);
      if (business.email && !billingEmail) setBillingEmail(business.email);
      if (business.phone && !billingPhone) setBillingPhone(business.phone);
      if (business.taxId && !gstNumber) setGstNumber(business.taxId);
      if (business.address && !billingAddress) setBillingAddress(business.address);
      if (business.city && !billingCity) setBillingCity(business.city);
      if (business.state && !billingState) setBillingState(business.state);
      if ((business.pincode || business.postalCode) && !postalCode) setPostalCode(business.pincode || business.postalCode);
    } else if (currentUser) {
      if (currentUser.organization && !legalName) setLegalName(currentUser.organization);
      if (currentUser.email && !billingEmail) setBillingEmail(currentUser.email);
      if (currentUser.phone && !billingPhone) setBillingPhone(currentUser.phone);
      if (currentUser.city && !billingCity) setBillingCity(currentUser.city);
      if (currentUser.state && !billingState) setBillingState(currentUser.state);
    }
  }, [business, currentUser]);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateBillingStep = () => {
    const newErrors = {};

    // 1. Registered business name
    if (!legalName || !legalName.trim()) {
      newErrors.legalName = "Registered business name is required";
    }

    // 2. Billing email
    if (!billingEmail || !billingEmail.trim()) {
      newErrors.billingEmail = "Billing email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(billingEmail.trim())) {
        newErrors.billingEmail = "Please enter a valid email address";
      }
    }

    // 3. Contact Number (with Country Code)
    if (!billingPhone || !billingPhone.trim()) {
      newErrors.billingPhone = "Contact number is required";
    } else {
      const parsed = parsePhoneNumber(billingPhone);
      const digits = (parsed?.nationalNumber || billingPhone).replace(/\D/g, "");
      if (digits.length < 7) {
        newErrors.billingPhone = "Please enter a valid contact number (at least 7 digits)";
      }
    }

    // 4. Billing address
    if (!billingAddress || !billingAddress.trim()) {
      newErrors.billingAddress = "Billing address is required";
    }

    // 5. City
    if (!billingCity || !billingCity.trim()) {
      newErrors.billingCity = "City is required";
    }

    // 6. State
    if (!billingState || !billingState.trim()) {
      newErrors.billingState = "State is required";
    }

    // 7. Postal code / PIN code
    if (!postalCode || !postalCode.trim()) {
      newErrors.postalCode = "Postal / PIN code is required";
    } else if (!isIntl && !/^\d{6}$/.test(postalCode.trim())) {
      newErrors.postalCode = "Please enter a valid 6-digit PIN code";
    }

    // 8. GST (optional, but validate 15 alphanumeric format if entered)
    if (gstNumber && gstNumber.trim()) {
      const cleanGst = gstNumber.trim().toUpperCase();
      if (cleanGst.length !== 15) {
        newErrors.gstNumber = "GSTIN must be exactly 15 characters";
      }
    }

    // 9. Terms and Conditions agreement
    if (!agreeTerms) {
      newErrors.agreeTerms = "You must agree to the Terms and Conditions and Privacy Policy to proceed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const gstDebounceRef = useRef(null);

  // Automatically fetch business data as soon as 15-character GST is entered
  const fetchAndPopulateGst = async (gstin) => {
    const cleanGst = (gstin || "").trim().toUpperCase();
    if (cleanGst.length !== 15) return;
    setGstLoading(true);
    setGstSuccess("");
    try {
      const res = await businessApi.verifyGst(cleanGst);
      const data = res?.data || res;
      if (data && (data.isValid || data.valid || data.status === "Active" || data.taxpayerStatus === "Active")) {
        const fetchedName = data.businessName || data.tradeName || data.legalName || "";
        if (fetchedName) setLegalName(fetchedName);
        if (data.address) setBillingAddress(data.address);
        if (data.city) setBillingCity(data.city);
        if (data.state) setBillingState(data.state);
        if (data.pincode) setPostalCode(data.pincode);
        setGstSuccess("Verified");
      }
    } catch (err) {
      console.warn("[Checkout GST] Auto-fetch error:", err.message);
    } finally {
      setGstLoading(false);
    }
  };

  const handleGstChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setGstNumber(val);
    setGstSuccess("");
    if (gstDebounceRef.current) {
      clearTimeout(gstDebounceRef.current);
    }
    if (val.length === 15) {
      gstDebounceRef.current = setTimeout(() => {
        fetchAndPopulateGst(val);
      }, 400);
    }
  };

  const handleConfirmAndPay = async () => {
    // Check if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("rifah_access_token") : null;
    if (!token) {
      alert("Please log in to upgrade your membership.");
      window.location.href = `/login?redirect=/membership/checkout?plan=${selected}`;
      return;
    }

    setLoading(true);
    try {
      // Direct upgrade for Free Plan (no payment gateway needed)
      if (selected === "free" || checkoutAmount <= 0) {
        const upgradeRes = await membershipApi.upgradePlan({
          planId: "free",
          businessId: business?._id,
        });
        const resultData = upgradeRes?.data || upgradeRes;
        if (resultData?.accessToken) {
          localStorage.setItem("rifah_access_token", resultData.accessToken);
        }
        if (resultData?.user) {
          localStorage.setItem("rifah_user", JSON.stringify(resultData.user));
        }
        if (refreshProfile) {
          try { await refreshProfile(); } catch (e) {}
        }
        queryClient.invalidateQueries({ queryKey: ["my-business"] });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setInvoiceId(`FREE-${Date.now().toString().slice(-4)}`);
        setStep(3);
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Step 1: Create Razorpay Order (total = base + 18% GST)
      const orderRes = await paymentApi.createOrder({
        amount: totalWithGst,
        currency,
        planId: selected,
        itemType: "Membership",
        description: `${active.name} Membership Subscription (${currency})`,
      });

      const orderData = orderRes?.data || orderRes;
      if (!orderData?.orderId) {
        throw new Error(orderRes?.message || "Could not create payment order");
      }

      // Step 2: Open Razorpay Payment Gateway Modal
      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TTykh9OVkLKNHl",
        amount: orderData.amount,
        currency: orderData.currency || currency,
        name: "RIFAH Chamber of Commerce",
        description: `${active.name} Membership Subscription (${currency})`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            // Step 3: Verify Payment & Upgrade Membership on Backend
            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selected,
              businessId: business?._id,
              amount: subtotal,       // base price; backend will add GST
              subtotal: subtotal,
              gstAmount: gstAmount,
              currency,
              itemType: "Membership",
              description: `${active.name} Membership Subscription (${currency})`,
              billingEmail: billingEmail || business?.email || "",
              billingPhone: billingPhone || business?.phone || currentUser?.phone || "",
              businessName: legalName || business?.name || "",
              taxId: gstNumber || business?.taxId || "",
              billingAddress,
              city: billingCity,
              state: billingState,
              postalCode,
            });

            const resultData = verifyRes?.data || verifyRes;

            // Immediately update local session with upgraded business owner credentials
            if (resultData?.accessToken) {
              localStorage.setItem("rifah_access_token", resultData.accessToken);
            }
            if (resultData?.refreshToken) {
              localStorage.setItem("rifah_refresh_token", resultData.refreshToken);
            }
            if (resultData?.user) {
              localStorage.setItem("rifah_user", JSON.stringify(resultData.user));
            }
            if (refreshProfile) {
              try {
                await refreshProfile();
              } catch (e) {
                console.warn("[Checkout] Profile refresh warning:", e.message);
              }
            }

            // Invalidate React Query cache so /biz/profile instantly fetches the real business
            queryClient.invalidateQueries({ queryKey: ["my-business"] });
            if (resultData?.business) {
              queryClient.setQueryData(["my-business"], resultData.business);
            }
            queryClient.invalidateQueries({ queryKey: ["businesses"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });

            const invoiceNum = resultData?.payment?.invoiceNumber || orderData.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`;
            setInvoiceId(invoiceNum);
            setStep(3);
          } catch (err) {
            console.error("Verification error:", err);
            alert(err.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: legalName || business?.name || currentUser?.name || "",
          email: billingEmail || business?.email || currentUser?.email || "",
          contact: billingPhone || business?.phone || currentUser?.phone || "",
        },
        theme: {
          color: "#0F2942",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        alert(resp.error?.description || "Payment failed.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      if (err.status === 401 || err.message?.includes("Authentication token")) {
        alert("Your session has expired. Please log in to complete your membership upgrade.");
        window.location.href = `/login?redirect=/membership/checkout?plan=${selected}`;
      } else {
        alert(err.message || "Failed to process plan checkout. Ensure you are signed in as a business owner.");
      }
      setLoading(false);
    }
  };

  const handlePrintTaxInvoice = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const currSymbol = isIntl ? "$" : "₹";
    const currSuffix = isIntl ? " USD" : "";
    const locale = isIntl ? "en-US" : "en-IN";
    const formattedAmt = `${currSymbol} ${(Number(totalWithGst) || 0).toLocaleString(locale)}${currSuffix}`;
    const dateFormatted = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const logoUrl = `${window.location.origin}/rifah-logo.png`;
    const invNumber = invoiceId || `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const payerName = legalName || business?.name || currentUser?.name || "Registered Member";
    const payerEmail = billingEmail || business?.email || currentUser?.email || "";
    const payerPhone = billingPhone || business?.phone || currentUser?.phone || "";
    const payerGst = gstNumber || business?.gstin || "N/A";
    const payerAddress = [billingAddress, billingCity, billingState, postalCode].filter(Boolean).join(", ") || (business?.city ? `${business.city}, India` : "India");

    const invoiceHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Tax Invoice - ${invNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              background-color: #f8fafc;
              color: #0f172a;
              padding: 16px;
            }
            .print-toolbar {
              max-width: 680px;
              margin: 0 auto 12px auto;
              display: flex;
              justify-content: flex-end;
              gap: 10px;
            }
            .print-btn {
              background: #0088d1;
              color: #fff;
              border: none;
              padding: 7px 16px;
              font-size: 13px;
              font-weight: 700;
              border-radius: 6px;
              cursor: pointer;
            }
            .invoice-card {
              max-width: 680px;
              margin: 0 auto;
              background: #fff;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            }
            .brand-stripe {
              height: 5px;
              background: linear-gradient(90deg, #c90000, #0088d1, #0b1f33);
            }
            .invoice-body {
              padding: 22px 26px;
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1.5px solid #e2e8f0;
              padding-bottom: 14px;
              margin-bottom: 14px;
            }
            .logo-img {
              height: 36px;
            }
            .chamber-sub {
              font-size: 10px;
              color: #64748b;
              margin-top: 2px;
              font-weight: 500;
            }
            .invoice-title {
              font-size: 17px;
              font-weight: 800;
              color: #0b1f33;
              letter-spacing: 0.5px;
            }
            .invoice-number {
              font-size: 13px;
              font-weight: 700;
              color: #0088d1;
              margin-top: 2px;
              font-family: monospace;
            }
            .paid-badge {
              display: inline-block;
              background: #ecfdf5;
              color: #059669;
              border: 1px solid #a7f3d0;
              font-size: 10px;
              font-weight: 800;
              padding: 2px 7px;
              border-radius: 9999px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 4px;
            }
            .grid-two {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 14px;
            }
            .info-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 10px 12px;
            }
            .info-card-header {
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              color: #0088d1;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .table-container {
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              overflow: hidden;
              margin-bottom: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            thead tr {
              background: #0b1f33;
              color: #fff;
            }
            th {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 8px 10px;
              text-align: left;
              letter-spacing: 0.5px;
            }
            td {
              padding: 10px;
              font-size: 11px;
              border-bottom: 1px solid #f1f5f9;
            }
            .total-box {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 14px;
            }
            .total-line {
              width: 200px;
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              font-weight: 800;
              border-top: 2px solid #0b1f33;
              padding-top: 5px;
            }
            .footer-section {
              text-align: center;
              font-size: 9.5px;
              color: #64748b;
              border-top: 1px dashed #e2e8f0;
              padding-top: 10px;
              line-height: 1.4;
            }
            .auth-seal {
              margin-top: 3px;
              font-weight: 700;
              color: #0088d1;
            }
            @media print {
              body {
                background: #fff;
                padding: 0;
              }
              .print-toolbar {
                display: none !important;
              }
              .invoice-card {
                box-shadow: none;
                border: 1px solid #cbd5e1;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-toolbar">
            <button class="print-btn" onclick="window.print()">Print / Save as PDF (1 Page)</button>
          </div>
          <div class="invoice-card">
            <div class="brand-stripe"></div>
            <div class="invoice-body">
              <div class="header-row">
                <div>
                  <img src="${logoUrl}" class="logo-img" alt="RIFAH Chamber" onerror="this.style.display='none'" />
                  <div style="font-size: 13px; font-weight: 800; color: #0b1f33;">RIFAH CONNECT</div>
                  <div class="chamber-sub">Chamber of Commerce & Industry · Business Network</div>
                </div>
                <div style="text-align: right;">
                  <div class="invoice-title">TAX INVOICE / RECEIPT</div>
                  <div class="invoice-number"># ${invNumber}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Date: ${dateFormatted}</div>
                  <div class="paid-badge">● PAID & CONFIRMED</div>
                </div>
              </div>

              <div class="grid-two">
                <div class="info-card">
                  <div class="info-card-header">BILLED TO (MEMBER)</div>
                  <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${payerName}</div>
                  <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">Email: ${payerEmail}</div>
                  ${payerPhone ? `<div style="font-size: 10.5px; color: #475569; margin-top: 2px;">Phone: <strong>${payerPhone}</strong></div>` : ""}
                  ${payerGst !== "N/A" ? `<div style="font-size: 10.5px; color: #475569; margin-top: 2px;">GSTIN: <strong>${payerGst}</strong></div>` : ""}
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${payerAddress}</div>
                </div>

                <div class="info-card">
                  <div class="info-card-header">PAYMENT & CHAMBER DETAILS</div>
                  <div style="font-size: 10.5px; color: #0f172a;">Issuer: <strong>RIFAH Chamber Central Admin</strong></div>
                  <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">Payment Mode: <strong>Razorpay Online (Txn Verified)</strong></div>
                  <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">Subscription Term: <strong>${durationLabel} (${active.name} Tier)</strong></div>
                  <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">Support: admin@rifah.org</div>
                </div>
              </div>

              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Plan / Service Description</th>
                      <th style="text-align: center; width: 60px;">Term</th>
                      <th style="text-align: right; width: 110px;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong style="color: #0b1f33; font-size: 12px;">${active.name} Membership Tier Subscription</strong>
                        <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
                          ${durationLabel} chamber access — directory placement, verified credentials, enquiry routing &amp; B2B trading privileges.
                        </div>
                      </td>
                      <td style="text-align: center; font-size: 10.5px;">${durationLabel}</td>
                      <td style="text-align: right; font-weight: 700; font-size: 11px; color: #0f172a;">${currSymbol}${(subtotal).toLocaleString(locale)}${currSuffix}</td>
                    </tr>
                    ${gstAmount > 0 ? `
                    <tr style="background: #f8fafc;">
                      <td style="font-size: 10.5px; color: #475569; padding-left: 14px;">GST / Tax @ ${gstRate}% (Statutory Tax)</td>
                      <td style="text-align: center; font-size: 10px; color: #94a3b8;">${gstRate}%</td>
                      <td style="text-align: right; font-size: 11px; color: #475569;">+ ${currSymbol}${gstAmount.toLocaleString(locale)}${currSuffix}</td>
                    </tr>` : ''}
                  </tbody>
                </table>
              </div>

              <div class="total-box">
                <div style="width: 240px;">
                  ${gstAmount > 0 ? `
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;padding-bottom:4px;"><span>Base Amount:</span><span>${currSymbol}${subtotal.toLocaleString(locale)}${currSuffix}</span></div>
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;padding-bottom:4px;"><span>GST / Tax (${gstRate}%):</span><span>+ ${currSymbol}${gstAmount.toLocaleString(locale)}${currSuffix}</span></div>` : ''}
                  <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;border-top:2px solid #0b1f33;padding-top:5px;">
                    <span>Total Paid:</span>
                    <span style="color: #0088d1;">${currSymbol}${(totalWithGst).toLocaleString(locale)}${currSuffix}</span>
                  </div>
                </div>
              </div>

              <div class="footer-section">
                <p>This is a computer-generated tax invoice receipt for membership services on RIFAH Connect.</p>
                <div class="auth-seal">RIFAH CHAMBER OF COMMERCE & INDUSTRY · DIGITAL ACCREDITATION DESK</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  return (
    <PublicLayout>
      <div className="rifah-container py-6 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            title="Membership checkout"
            description="Upgrade or activate your RIFAH Chamber of Commerce subscription."
          />
          <div className="mt-5">
            <Steps steps={steps} current={step} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              {step === 0 && (
                <Panel title="Select membership tier">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Currency:
                    </span>
                    <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setCurrency("INR")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all",
                          !isIntl ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>₹ INR (India)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency("USD")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all",
                          isIntl ? "bg-white dark:bg-slate-900 text-primary shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>$ USD (Global)</span>
                      </button>
                    </div>
                  </div>

                  <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2.5">
                    {plans.map((p) => {
                      const pAmt = isIntl
                        ? (p.priceUsd ?? (p.price === 0 ? 0 : Math.round(p.price / 80)))
                        : p.price;
                      return (
                        <label
                          key={p.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                            selected === p.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted/60"
                          )}
                        >
                          <RadioGroupItem value={p.id} className="mt-0.5" />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold">{p.name}</span>
                              <span className="text-sm font-bold text-primary">
                                {isIntl ? `$ ${pAmt.toLocaleString("en-US")} USD` : `₹ ${pAmt.toLocaleString("en-IN")}`}
                                {p.durationYears && <span className="font-normal text-muted-foreground text-xs ml-1">/ {p.durationYears === 1 ? "1 yr" : `${p.durationYears} yrs`}</span>}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{p.summary}</span>
                            {pAmt > 0 && (
                              <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                + {isIntl ? `$ ${Math.round(pAmt * (p.gstRate || 18) / 100).toLocaleString("en-US")} USD` : `₹ ${Math.round(pAmt * (p.gstRate || 18) / 100).toLocaleString("en-IN")}`} GST ({p.gstRate || 18}%) = {isIntl ? `$ ${(pAmt + Math.round(pAmt * (p.gstRate || 18) / 100)).toLocaleString("en-US")} USD` : `₹ ${(pAmt + Math.round(pAmt * (p.gstRate || 18) / 100)).toLocaleString("en-IN")}`} total payable
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </Panel>
              )}

              {step === 1 && (
                <Panel
                  title="Billing details"
                  description="Provide your registered billing and contact information for your official membership invoice."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* 1. Registered Business Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="legal">
                        Registered business name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="legal"
                        value={legalName}
                        onChange={(e) => {
                          setLegalName(e.target.value);
                          clearError("legalName");
                        }}
                        placeholder="As per registration certificate"
                        className={cn(
                          errors.legalName && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {errors.legalName && (
                        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline shrink-0" />
                          {errors.legalName}
                        </p>
                      )}
                    </div>

                    {/* 2. GST / Tax Registration Number */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="gst">GST / Tax registration number</Label>
                        {gstLoading ? (
                          <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                            <Loader2 className="h-3 w-3 animate-spin" /> Fetching...
                          </span>
                        ) : gstSuccess ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {(gstNumber || "").length}/15
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id="gst"
                          maxLength={15}
                          value={gstNumber}
                          onChange={(e) => {
                            handleGstChange(e);
                            clearError("gstNumber");
                          }}
                          onBlur={() => {
                            if (gstNumber.length === 15 && !gstSuccess) {
                              fetchAndPopulateGst(gstNumber);
                            }
                          }}
                          placeholder="27AAAAA0000A1Z5"
                          className={cn(
                            "font-mono uppercase tracking-wider pr-8",
                            errors.gstNumber && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {gstLoading && (
                          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                        )}
                        {!gstLoading && gstSuccess && (
                          <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      {errors.gstNumber && (
                        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline shrink-0" />
                          {errors.gstNumber}
                        </p>
                      )}
                    </div>

                    {/* 3. Billing Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bemail">
                        Billing email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bemail"
                        type="email"
                        value={billingEmail}
                        onChange={(e) => {
                          setBillingEmail(e.target.value);
                          clearError("billingEmail");
                        }}
                        placeholder="billing@example.com"
                        className={cn(
                          errors.billingEmail && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {errors.billingEmail && (
                        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline shrink-0" />
                          {errors.billingEmail}
                        </p>
                      )}
                    </div>

                    {/* 4. Contact Number with Country Code */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="bphone">
                        Contact Number <span className="text-red-500">*</span>
                      </Label>
                      <PhoneInput
                        id="bphone"
                        name="billingPhone"
                        value={billingPhone}
                        onChange={(e) => {
                          setBillingPhone(e.target.value);
                          clearError("billingPhone");
                        }}
                        defaultCountry={isIntl ? "AE" : "IN"}
                        placeholder="98765 43210"
                        className={cn(
                          errors.billingPhone && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20"
                        )}
                      />
                      {errors.billingPhone ? (
                        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline shrink-0" />
                          {errors.billingPhone}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">
                          Select country code and enter active WhatsApp/mobile number for order updates.
                        </p>
                      )}
                    </div>

                    {/* 5. Billing Address */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="baddr">
                        Billing address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="baddr"
                        value={billingAddress}
                        onChange={(e) => {
                          setBillingAddress(e.target.value);
                          clearError("billingAddress");
                        }}
                        placeholder="Street address, building, suite"
                        className={cn(
                          errors.billingAddress && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {errors.billingAddress && (
                        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline shrink-0" />
                          {errors.billingAddress}
                        </p>
                      )}
                    </div>

                    {/* 6. City */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bcity">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bcity"
                        value={billingCity}
                        onChange={(e) => {
                          setBillingCity(e.target.value);
                          clearError("billingCity");
                        }}
                        placeholder="City"
                        className={cn(
                          errors.billingCity && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {errors.billingCity && (
                        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline shrink-0" />
                          {errors.billingCity}
                        </p>
                      )}
                    </div>

                    {/* 7. State */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bstate">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bstate"
                        value={billingState}
                        onChange={(e) => {
                          setBillingState(e.target.value);
                          clearError("billingState");
                        }}
                        placeholder="State / Province"
                        className={cn(
                          errors.billingState && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {errors.billingState && (
                        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline shrink-0" />
                          {errors.billingState}
                        </p>
                      )}
                    </div>

                    {/* 8. Postal code */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="bpin">
                        Postal code / PIN code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bpin"
                        value={postalCode}
                        onChange={(e) => {
                          setPostalCode(e.target.value);
                          clearError("postalCode");
                        }}
                        placeholder={isIntl ? "ZIP / Postal code" : "6-digit PIN code (e.g. 400001)"}
                        className={cn(
                          errors.postalCode && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {errors.postalCode && (
                        <p className="text-[11px] text-destructive font-medium mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline shrink-0" />
                          {errors.postalCode}
                        </p>
                      )}
                    </div>

                    {/* 9. Terms and Conditions & Policy Agreement */}
                    <div className="pt-3 border-t border-border/80 sm:col-span-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms-agree"
                          checked={agreeTerms}
                          onCheckedChange={(checked) => {
                            setAgreeTerms(Boolean(checked));
                            if (checked) {
                              clearError("agreeTerms");
                            }
                          }}
                          className={cn(
                            "mt-0.5",
                            errors.agreeTerms && "border-destructive ring-2 ring-destructive/30"
                          )}
                        />
                        <div className="space-y-1">
                          <label
                            htmlFor="terms-agree"
                            className="text-xs sm:text-sm font-medium leading-normal text-foreground cursor-pointer select-none"
                          >
                            I agree to the{" "}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowTermsModal(true);
                              }}
                              className="font-bold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                            >
                              Terms and Conditions
                            </button>{" "}
                            and{" "}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowPrivacyModal(true);
                              }}
                              className="font-bold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                            >
                              Privacy Policy
                            </button>
                            <span className="text-red-500 ml-1 font-bold">*</span>
                          </label>
                          {errors.agreeTerms && (
                            <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3 inline shrink-0" />
                              {errors.agreeTerms}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Panel>
              )}

              {step === 2 && (
                <Panel title="Payment method" description="Select your preferred payment channel">
                  <RadioGroup value={method} onValueChange={setMethod} className="space-y-2.5">
                    {methods.map((m) => (
                      <label
                        key={m.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 sm:p-5 transition-all",
                          method === m.id ? "border-primary bg-primary/5 shadow-xs" : "border-border hover:bg-muted/60"
                        )}
                      >
                        <RadioGroupItem value={m.id} />
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <m.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-foreground">{m.label}</span>
                          <span className="block text-xs text-muted-foreground mt-0.5">{m.note}</span>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 shrink-0">
                          Instant Activation
                        </span>
                      </label>
                    ))}
                  </RadioGroup>

                  <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Clicking <strong className="text-foreground">"Confirm & Pay"</strong> opens the secure Razorpay payment modal where you can pay seamlessly via Debit/Credit Card, UPI (Google Pay, PhonePe, Paytm), Net Banking (50+ Banks), or Corporate Wallets.
                    </p>
                  </div>

                  <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" /> 256-bit encrypted chamber payment gateway with official GST invoice.
                  </p>
                  <label className="mt-3 flex items-start gap-2.5 text-sm">
                    <Checkbox className="mt-0.5" defaultChecked />
                    <span>Enable annual auto-renewal reminders from the RIFAH membership desk.</span>
                  </label>
                </Panel>
              )}

              {step === 3 && (
                <div className="rounded-2xl border border-emerald-200/90 bg-white p-6 sm:p-8 shadow-sm dark:bg-card dark:border-emerald-900/50">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Payment Successful & Confirmed
                    </span>
                  </div>

                  <div className="mt-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                      <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {active.name} Membership Activated
                      </h2>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                        Invoice <span className="font-mono font-bold text-foreground">{invoiceId || "INV-8661"}</span> has been issued. Your business profile now holds the official{" "}
                        <strong className="text-foreground font-semibold">{active.name} Tier</strong> with chamber privileges active from today.
                      </p>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="mt-6 rounded-xl bg-slate-50/80 p-4 border border-slate-200/80 dark:bg-muted/30 dark:border-border/60">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Privileges Unlocked with {active.name}:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {active.features?.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col gap-2.5">
                    <Button asChild size="lg" className="w-full shadow-sm">
                      <Link href="/biz" className="flex items-center justify-center gap-2 font-semibold">
                        <LayoutDashboard className="h-4 w-4" /> Go to Dashboard <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground mt-1">
                      Your business profile and tier are activated. You can explore your dashboard and manage your account anytime.
                    </p>
                  </div>
                </div>
              )}

              {step < 3 && (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (step === 0) window.location.href = "/membership";
                      else setStep((s) => s - 1);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="sm:min-w-48 font-semibold shadow-xs"
                    disabled={loading}
                    onClick={() => {
                      if (step === 0) {
                        setStep(1);
                      } else if (step === 1) {
                        const isValid = validateBillingStep();
                        if (!isValid) return;
                        setStep(2);
                      } else if (step === 2) {
                        handleConfirmAndPay();
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : step === 2 ? (
                      "Confirm and pay"
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              {step === 3 ? (
                <Panel title="Tax Invoice Receipt">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        ● Paid & Active
                      </span>
                    </div>

                    <dl className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Invoice No.</dt>
                        <dd className="font-mono font-bold text-foreground">{invoiceId || "INV-8661"}</dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Date</dt>
                        <dd className="font-medium text-foreground">
                          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Billed To</dt>
                        <dd className="font-medium text-foreground text-right truncate max-w-[150px]">
                          {legalName || business?.name || "Registered Member"}
                        </dd>
                      </div>
                      {gstNumber && (
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">GSTIN</dt>
                          <dd className="font-mono font-medium text-foreground">{gstNumber}</dd>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Plan</dt>
                        <dd className="font-semibold text-primary">{active.name} ({durationLabel})</dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Payment Mode</dt>
                        <dd className="font-medium text-foreground">Razorpay Online</dd>
                      </div>
                    </dl>

                    {gstAmount > 0 && (
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <dt>Base Amount</dt>
                        <dd className="font-medium">{isIntl ? `$ ${subtotal.toLocaleString("en-US")} USD` : `₹ ${subtotal.toLocaleString("en-IN")}`}</dd>
                      </div>
                    )}
                    {gstAmount > 0 && (
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <dt>GST / Tax ({gstRate}%)</dt>
                        <dd className="font-medium text-orange-600 dark:text-orange-400">
                          + {isIntl ? `$ ${gstAmount.toLocaleString("en-US")} USD` : `₹ ${gstAmount.toLocaleString("en-IN")}`}
                        </dd>
                      </div>
                    )}
                    <div className="pt-3 border-t border-dashed border-border flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-foreground">Total Paid</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {isIntl ? `$ ${totalWithGst.toLocaleString("en-US")} USD` : `₹ ${totalWithGst.toLocaleString("en-IN")}`}
                      </span>
                    </div>

                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePrintTaxInvoice}
                          className="w-full text-xs flex items-center justify-center gap-1.5 border-dashed hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:border-sky-300"
                        >
                          <Printer className="h-3.5 w-3.5 text-sky-600" /> Print Tax Receipt (1 Page PDF)
                        </Button>
                      </div>

                    <p className="text-[11px] text-muted-foreground text-center pt-1">
                      Confirmation receipt sent to {billingEmail || business?.email || "registered email"}.
                    </p>
                  </div>
                </Panel>
              ) : (
                <Panel title="Order summary">
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Plan</dt>
                      <dd className="font-semibold">{active.name}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Term</dt>
                      <dd className="font-medium">{durationLabel}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Base Amount</dt>
                      <dd className="font-medium">
                        {isIntl ? `$ ${subtotal.toLocaleString("en-US")} USD` : `₹ ${subtotal.toLocaleString("en-IN")}`}
                      </dd>
                    </div>
                    {gstAmount > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">GST / Tax ({gstRate}%)</dt>
                        <dd className="font-medium text-orange-600 dark:text-orange-400">
                          + {isIntl ? `$ ${gstAmount.toLocaleString("en-US")} USD` : `₹ ${gstAmount.toLocaleString("en-IN")}`}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
                      <dt className="font-semibold">Total Payable</dt>
                      <dd className="font-bold text-primary">
                        {isIntl ? `$ ${totalWithGst.toLocaleString("en-US")} USD` : `₹ ${totalWithGst.toLocaleString("en-IN")}`}
                      </dd>
                    </div>
                  </dl>
                  <ul className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                    {active.features?.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </Panel>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              RIFAH Chamber — Terms & Conditions
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official membership subscription terms and chamber governing rules.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed pt-2">
            <div>
              <h4 className="font-bold text-foreground text-sm">1. Membership & Chamber Privileges</h4>
              <p className="mt-1">
                Membership in RIFAH Chamber of Commerce and Industry provides access to verified B2B directory listings, networking events, business referrals, chapter activities, and cross-border trade opportunities according to the tier selected.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">2. Verification & Compliance</h4>
              <p className="mt-1">
                All business listings and memberships undergo accreditation verification by Chapter and Central Administrators. Members agree to provide authentic business documentation (GST, Trade License, or Incorporation Certificate) upon request.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">3. Code of Ethical Conduct</h4>
              <p className="mt-1">
                Members are expected to adhere to ethical business practices, honest dealings, and respect the chamber community guidelines. Any fraudulent or misleading activity may result in suspension of chamber privileges without refund.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">4. Subscription Term & Renewal</h4>
              <p className="mt-1">
                Membership fees are billed on an annual or multi-year basis according to the selected plan. Invoices are generated with statutory tax compliances (GST/tax invoice).
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">5. Cancellations & Refunds</h4>
              <p className="mt-1">
                Membership fees are non-refundable once activated. In the event of a duplicate or incorrect charge, refund requests submitted within 7 business days will be processed through the original payment method.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTermsModal(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setAgreeTerms(true);
                clearError("agreeTerms");
                setShowTermsModal(false);
              }}
            >
              I Understand &amp; Agree
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-600" />
              RIFAH Chamber — Privacy Policy
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              How we protect and manage your business contact and payment data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed pt-2">
            <div>
              <h4 className="font-bold text-foreground text-sm">1. Data Collection & Usage</h4>
              <p className="mt-1">
                We collect business details, billing addresses, contact numbers, and representative emails solely for membership administration, directory indexing, and transactional communications.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">2. Payment Security</h4>
              <p className="mt-1">
                Payment transactions are processed securely via RBI-authorized/PCI-DSS compliant payment gateways (Razorpay). RIFAH does not store sensitive credit/debit card numbers or bank account credentials on its servers.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">3. Directory Visibility Control</h4>
              <p className="mt-1">
                Members have full control over public visibility settings for their phone numbers, email addresses, and catalog items through their Business Dashboard profile settings.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">4. Data Sharing & Third Parties</h4>
              <p className="mt-1">
                We never sell or rent your business or personal data to third-party advertisers. Data is shared exclusively with designated chapter secretaries and chamber administrators for governance and networking services.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPrivacyModal(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setAgreeTerms(true);
                clearError("agreeTerms");
                setShowPrivacyModal(false);
              }}
            >
              I Understand &amp; Agree
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}

export { Checkout as CheckoutPage };
export default Checkout;
