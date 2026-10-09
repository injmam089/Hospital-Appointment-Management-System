import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router';
import { ThemeProvider } from './theme/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: 'var(--shadow-modal)',
            },
            success: {
              iconTheme: { primary: 'var(--success)', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: 'var(--danger)', secondary: '#fff' },
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
