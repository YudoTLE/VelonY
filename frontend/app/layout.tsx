import './globals.css';

import React from 'react';

import { ThemeProvider } from '@/components/theme-provider';

export const metadata = {
  title: 'VelonY',
  description: 'Build, share, and chat with custom AI agents...',
  openGraph: {
    title: 'VelonY',
    description: 'Build, share, and chat with custom AI agents...',
    url: 'https://velony.vercel.app',
    siteName: 'VelonY',
    images: [
      {
        url: 'https://velony.vercel.app/images/velony-icon.png',
        width: 1200,
        height: 630,
        alt: 'VelonY Preview',
      },
    ],
    type: 'website',
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="overscroll-none">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
};

export default RootLayout;
