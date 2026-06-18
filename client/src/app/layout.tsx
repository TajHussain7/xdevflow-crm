"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { queryClient } from "@/lib/queryClient";
import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>XDevFlow CRM</title>
        <meta
          name="description"
          content="Secure premium CRM portal for enterprise client management."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="application-name" content="XDevFlow CRM" />
        <meta property="og:title" content="XDevFlow CRM" />
        <meta
          property="og:description"
          content="Secure premium CRM portal for enterprise client management."
        />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />

        {/* ── Google Fonts: preconnect for performance ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* ── Inter + JetBrains Mono + Material Symbols Outlined ── */}
        {/* font-display=block prevents icons showing as text (FOIT over FOUT) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            {children}
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
