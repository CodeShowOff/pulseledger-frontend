"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient once (avoids re-creation on every render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60, // 1 min cache
          },
        },
      })
  );

  // Clear cached server data on logout to avoid showing stale protected content
  useEffect(() => {
    const getIsAuthed = () => {
      const s = useAuthStore.getState();
      return Boolean(s.user || s.accessToken);
    };

    let prevAuthed = getIsAuthed();
    const unsub = useAuthStore.subscribe(() => {
      const nextAuthed = getIsAuthed();
      if (prevAuthed && !nextAuthed) {
        // Transitioned from authed -> logged out
        queryClient.clear();
      }
      prevAuthed = nextAuthed;
    });

    return () => {
      unsub();
    };
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
