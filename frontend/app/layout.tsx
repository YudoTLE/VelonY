'use client';

import './globals.css';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ThemeProvider } from '@/components/theme-provider';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="overscroll-none">
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </body>
      </html>
    </>
  );
};

export default RootLayout;
