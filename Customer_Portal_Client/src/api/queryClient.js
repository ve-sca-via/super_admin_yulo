import { QueryClient } from "@tanstack/react-query";

// Global configuration for TanStack Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed requests once before failing
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    },
  },
});
