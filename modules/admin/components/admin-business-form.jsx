"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { businessApi } from "@shared/lib/api-services";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useChapters, useCategories } from "@shared/hooks/use-rifah-api";

export function AdminBusinessFormModal({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { data: chaptersData } = useChapters();
  const { data: categoriesData } = useCategories();
  
  const chapters = Array.isArray(chaptersData) ? chaptersData : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  const mainCategories = categories.filter(c => !c.parent);
  const subCategories = categories.filter(c => c.parent);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    contactPerson: "",
    email: "",
    phone: "",
    chapter: "",
    industry: "",
    businessType: "Proprietorship",
    founded: "",
    employees: "1-10",
    about: "",
    taxId: "",
    address: "",
    city: "",
    pincode: "",
    region: "national",
    membershipTier: "Free",
    amountCollected: 0
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await businessApi.createAdmin(formData);
      toast.success("Business registered successfully. Welcome email sent to owner.");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      // Reset form
      setFormData({
        businessName: "",
        ownerName: "",
        contactPerson: "",
        email: "",
        phone: "",
        chapter: "",
        industry: "",
        businessType: "Proprietorship",
        founded: "",
        employees: "1-10",
        about: "",
        taxId: "",
        address: "",
        city: "",
        pincode: "",
        region: "national",
        membershipTier: "Free",
        amountCollected: 0
      });
    } catch (err) {
      toast.error(err.message || "Failed to register business.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Business</DialogTitle>
          <DialogDescription>
            Bypass online payment and directly register a business. An auto-generated password will be sent to the owner's email.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapter">Chapter *</Label>
              <Select value={formData.chapter} onValueChange={(val) => handleSelectChange("chapter", val)} required>
                <SelectTrigger id="chapter">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map(ch => (
                    <SelectItem key={ch._id || ch.name} value={ch.name}>{ch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={formData.industry} onValueChange={(val) => handleSelectChange("industry", val)} required>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map(mc => (
                    <SelectItem key={mc._id || mc.name} value={mc.name}>{mc.name}</SelectItem>
                  ))}
                  {mainCategories.length === 0 && (
                    <SelectItem value="General">General</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={formData.businessType} onValueChange={(val) => handleSelectChange("businessType", val)}>
                <SelectTrigger id="businessType">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="LLP">LLP</SelectItem>
                  <SelectItem value="Private Limited">Private Limited</SelectItem>
                  <SelectItem value="Public Limited">Public Limited</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded">Founded Year</Label>
              <Input id="founded" name="founded" type="number" min="1800" max={new Date().getFullYear()} value={formData.founded} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employees">Employees</Label>
              <Select value={formData.employees} onValueChange={(val) => handleSelectChange("employees", val)}>
                <SelectTrigger id="employees">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="500+">500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID (GST/VAT)</Label>
              <Input id="taxId" name="taxId" value={formData.taxId} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(val) => handleSelectChange("region", val)}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National (India)</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">About Business</Label>
            <Input id="about" name="about" value={formData.about} onChange={handleChange} placeholder="Brief description..." />
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-md bg-slate-50 p-4 border border-slate-200">
            <div className="space-y-2">
              <Label>Membership Tier *</Label>
              <Select value={formData.membershipTier} onValueChange={(val) => handleSelectChange("membershipTier", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free (Basic Listing)</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.membershipTier !== "Free" && (
              <div className="space-y-2">
                <Label htmlFor="amountCollected">Cash Collected (₹ / $)</Label>
                <Input id="amountCollected" name="amountCollected" type="number" min="0" value={formData.amountCollected} onChange={handleChange} placeholder="e.g. 5000" />
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : "Register Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
