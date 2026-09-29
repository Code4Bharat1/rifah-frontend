"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export function VerificationGuardAlert({
  title = "Business Verification Pending",
  message = "This business is currently pending verification. It cannot be allocated to a State Admin or Chapter Admin until the verification process is completed.",
  className = "",
  onClose,
}) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 dark:border-amber-500/20 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-500/20 p-1.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm leading-tight text-amber-900 dark:text-amber-200">
            {title}
          </h4>
          <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/90">
            {message}
          </p>
          {onClose ? (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 underline underline-offset-2"
              >
                Close
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default VerificationGuardAlert;
