'use client'

import React from 'react'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <>
      <html lang='en' suppressHydrationWarning>
        <head />
        <body className='overscroll-none'>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute='class'
              defaultTheme='dark'
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={true}/>
          </QueryClientProvider>
        </body>
      </html>
    </>
  )
}

export default RootLayout