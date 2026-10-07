"use client";
import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Plus, Eye } from "lucide-react";
import { enquiryApi } from "@shared/lib/api-services";
import { resolveMediaUrl } from "@shared/lib/api-client";
import { toast } from "sonner";
import { cn } from "@shared/lib/utils";

/**
 * EnquiryImageUpload
 * Reusable image uploader for enquiry forms.
 * Supports multiple images (up to maxImages), file drag-and-drop,
 * automatic upload via enquiryApi.uploadPhoto, preview thumbnails, and deletion.
 */
export function EnquiryImageUpload({
  images = [],
  onChange,
  maxImages = 3,
  disabled = false,
  compact = false,
  label = "Upload Reference Photos / Drawings",
  subLabel = "Attach technical drawings, sample photos, or product specs (Max 5MB each)",
  className,
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const fileInputRef = useRef(null);

  const safeImages = Array.isArray(images) ? images : [];
  const canUploadMore = safeImages.length < maxImages;

  const handleFiles = async (files) => {
    if (!files || files.length === 0 || disabled) return;

    const remainingSlots = maxImages - safeImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const validFiles = [];
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the 5MB file size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const newUploadedUrls = [];

    try {
      for (const file of validFiles) {
        const res = await enquiryApi.uploadPhoto(file);
        const url = res?.data?.url || res?.url;
        if (url) {
          newUploadedUrls.push(url);
        } else {
          throw new Error("Invalid response from upload server.");
        }
      }

      if (newUploadedUrls.length > 0) {
        const updated = [...safeImages, ...newUploadedUrls];
        if (onChange) onChange(updated);
        toast.success(
          newUploadedUrls.length === 1
            ? "Photo uploaded successfully"
            : `${newUploadedUrls.length} photos uploaded successfully`
        );
      }
    } catch (err) {
      toast.error(err?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (indexToRemove) => {
    const updated = safeImages.filter((_, idx) => idx !== indexToRemove);
    if (onChange) onChange(updated);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || !canUploadMore || uploading) return;
    if (e.dataTransfer?.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header labels */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              <span>{label}</span>
              <span className="text-[11px] font-normal text-muted-foreground">(Optional)</span>
            </label>
            {subLabel && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{subLabel}</p>
            )}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {safeImages.length}/{maxImages}
          </span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple={maxImages > 1}
        disabled={disabled || uploading || !canUploadMore}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
        }}
      />

      {/* Grid of uploaded images + upload trigger box */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {/* Render uploaded image thumbnails */}
        {safeImages.map((imgUrl, index) => {
          const resolvedSrc = resolveMediaUrl(imgUrl);
          return (
            <div
              key={`${imgUrl}-${index}`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-border/80 bg-muted/40 shadow-2xs transition-all hover:border-primary/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedSrc}
                alt={`Enquiry attachment ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Hover Overlay with Preview & Remove actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(resolvedSrc)}
                  title="View full image"
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-slate-800 hover:bg-white transition-transform hover:scale-110 shadow-xs cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    title="Remove photo"
                    className="grid h-7 w-7 place-items-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-transform hover:scale-110 shadow-xs cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Upload Trigger Dropzone Box */}
        {canUploadMore && (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-dashed transition-all cursor-pointer p-3 select-none text-center",
              compact || safeImages.length > 0 ? "aspect-square" : "h-24 sm:h-28 col-span-3 sm:col-span-4",
              dragOver
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/40 text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              uploading && "pointer-events-none"
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1.5 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-[10px] font-semibold">Uploading...</span>
              </div>
            ) : compact || safeImages.length > 0 ? (
              <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-foreground">
                <Plus className="h-5 w-5" />
                <span className="text-[10px] font-medium">Add Photo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-muted shadow-2xs">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-0.5">
                  <span className="text-xs font-semibold text-foreground underline decoration-dotted">
                    Click to browse
                  </span>{" "}
                  <span className="text-xs text-muted-foreground">or drag & drop</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  PNG, JPG, WebP up to 5MB (Max {maxImages})
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {previewModalImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewModalImg}
              alt="Enquiry attachment full view"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiryImageUpload;
