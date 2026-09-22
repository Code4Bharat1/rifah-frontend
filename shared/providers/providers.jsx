"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "./auth-provider";
import { PrototypeActionProvider } from "@shared/components/rifah/prototype-action";
import { Toaster } from "@shared/components/ui/sonner";

// Patch Node.prototype.removeChild and insertBefore to prevent React reconciliation crashes
// caused by Google Translate, browser extensions, or third-party scripts modifying DOM nodes.
if (typeof window !== "undefined") {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.call(this, child);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
}

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PrototypeActionProvider>
          {children}
          <Toaster richColors position="top-center" />
        </PrototypeActionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default Providers;
