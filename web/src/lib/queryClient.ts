import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: Error) => {
        // Don't retry on 4xx errors (client errors)  
        if ('response' in error && typeof error.response === 'object' && error.response && 'status' in error.response) {
          const status = error.response.status as number;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30, // 30 minutes cache time
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});