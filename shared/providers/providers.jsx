"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { PrototypeActionProvider } from "@shared/components/rifah/prototype-action";

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <PrototypeActionProvider>{children}</PrototypeActionProvider>
    </QueryClientProvider>
  );
}
