"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Label } from "@shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Zap, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useCreatePowerRequirement, useCategories } from "@shared/hooks/use-rifah-api";

const requirementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  category: z.string().min(2, "Please select or specify a category"),
  productService: z.string().min(2, "Product or service name is required"),
  quantity: z.string().min(1, "Quantity is required (e.g. 500 Bags, 10 Units)"),
  requiredBy: z.string().min(1, "Required by date is required"),
  location: z.string().optional(),
  preferredLocation: z.string().optional(),
  budget: z.string().optional(),
  urgency: z.enum(["Low", "Medium", "High", "Immediate"]).default("Medium"),
  description: z.string().optional(),
});

const DEFAULT_CATEGORIES = [
  "Construction Materials",
  "Building & Architecture",
  "Electrical & Electronics",
  "Plumbing & Sanitation",
  "IT & Software Services",
  "Manufacturing & Industrial",
  "Automotive & Transport",
  "Textiles & Apparel",
  "Food & Agriculture",
  "Healthcare & Pharma",
  "Financial & Legal Services",
  "Printing & Packaging",
  "Consulting & Professional Services",
];

export function CreateRequirementModal({
  isOpen,
  onClose,
  onRequirementCreated,
}) {
  const [step, setStep] = useState(1);
  const createMutation = useCreatePowerRequirement();
  const { data: dynamicCategories } = useCategories();

  const categoryOptions = React.useMemo(() => {
    if (dynamicCategories && Array.isArray(dynamicCategories) && dynamicCategories.length > 0) {
      return dynamicCategories.map((c) => (typeof c === "string" ? c : c.name || c.title));
    }
    return DEFAULT_CATEGORIES;
  }, [dynamicCategories]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      title: "",
      category: "",
      productService: "",
      quantity: "",
      requiredBy: "",
      location: "",
      preferredLocation: "",
      budget: "",
      urgency: "Medium",
      description: "",
    },
  });

  const selectedCategory = watch("category");
  const selectedUrgency = watch("urgency");

  const onSubmit = async (values) => {
    try {
      const created = await createMutation.mutateAsync({
        ...values,
        requiredBy: new Date(values.requiredBy).toISOString(),
      });
      reset();
      setStep(1);
      onClose();
      if (onRequirementCreated) {
        onRequirementCreated(created?.data || created);
      }
    } catch (err) {
      console.error("Failed to create requirement:", err);
    }
  };

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl w-full max-w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 rounded-2xl border border-border bg-card shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
            <Zap className="h-4 w-4 fill-primary text-primary" />
            <span>Power Networking · B2B Matching</span>
          </div>
          <DialogTitle className="text-xl font-bold">
            Post a Business Requirement
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Tell us what you need and our matching engine will instantly discover relevant verified RIFAH businesses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          {/* Step 1: Title & Category */}
          <div className="space-y-3 rounded-xl bg-muted/30 p-4 border border-border">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <h4 className="font-semibold text-sm">What do you need?</h4>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-title" className="text-xs font-medium">
                Requirement Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-title"
                placeholder="e.g. Need Cement for Upcoming Residential Project"
                {...register("title")}
                className="text-sm"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="req-category" className="text-xs font-medium">
                  Industry Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => setValue("category", val, { shouldValidate: true })}
                >
                  <SelectTrigger id="req-category" className="text-xs">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-productService" className="text-xs font-medium">
                  Product / Service Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="req-productService"
                  placeholder="e.g. OPC Cement, Steel, Web App"
                  {...register("productService")}
                  className="text-sm"
                />
                {errors.productService && (
                  <p className="text-xs text-destructive">{errors.productService.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Quantity, Timeline & Location */}
          <div className="space-y-3 rounded-xl bg-muted/30 p-4 border border-border">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <h4 className="font-semibold text-sm">Quantity & Timeline</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="req-quantity" className="text-xs font-medium">
                  Quantity Required <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="req-quantity"
                  placeholder="e.g. 500 Bags, 10 MT, 1 Contract"
                  {...register("quantity")}
                  className="text-sm"
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-requiredBy" className="text-xs font-medium">
                  Required By Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="req-requiredBy"
                  type="date"
                  {...register("requiredBy")}
                  className="text-sm"
                />
                {errors.requiredBy && (
                  <p className="text-xs text-destructive">{errors.requiredBy.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="req-location" className="text-xs font-medium">
                  Delivery / Project Location
                </Label>
                <Input
                  id="req-location"
                  placeholder="e.g. Mumbai, Pune, All India"
                  {...register("location")}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="req-budget" className="text-xs font-medium">
                  Estimated Budget (Optional)
                </Label>
                <Input
                  id="req-budget"
                  placeholder="e.g. ₹2,50,000 / Best Quote"
                  {...register("budget")}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Details & Urgency */}
          <div className="space-y-3 rounded-xl bg-muted/30 p-4 border border-border">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <h4 className="font-semibold text-sm">Details & Urgency</h4>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-urgency" className="text-xs font-medium">
                Urgency Level
              </Label>
              <Select
                value={selectedUrgency}
                onValueChange={(val) => setValue("urgency", val)}
              >
                <SelectTrigger id="req-urgency" className="text-xs">
                  <SelectValue placeholder="Select Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Immediate" className="text-xs font-semibold text-red-600">
                    🔴 Immediate (1–3 days)
                  </SelectItem>
                  <SelectItem value="High" className="text-xs font-medium text-amber-600">
                    🟠 High Priority (Within 1 week)
                  </SelectItem>
                  <SelectItem value="Medium" className="text-xs">
                    🟡 Standard / Medium
                  </SelectItem>
                  <SelectItem value="Low" className="text-xs">
                    🟢 Flexible / Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="req-desc" className="text-xs font-medium">
                Detailed Requirement Description
              </Label>
              <Textarea
                id="req-desc"
                rows={3}
                placeholder="Describe specifications, grade, delivery preferences, or technical details..."
                {...register("description")}
                className="text-xs resize-none"
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{createMutation.error?.message || "Failed to post requirement. Please try again."}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" type="button" onClick={handleClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-xs"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {createMutation.isPending ? "Posting & Finding Matches..." : "Find RIFAH Businesses"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
