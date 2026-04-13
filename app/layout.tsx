import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

// Mantine CSS imports
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.css";
import "./globals.css";

import { checkSupabaseConnection } from "@/lib/supabase";

const theme = createTheme({
  /** Custom theme options if needed */
  primaryColor: "blue",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contract Expiry Management",
  description: "Centralized tracking and renewal for employee contracts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check connection on server-side
  await checkSupabaseConnection();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <NextTopLoader showSpinner={false} color="#000" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
