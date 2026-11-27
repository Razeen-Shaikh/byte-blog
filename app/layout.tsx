import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Newsreader } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { auth } from "@/lib/auth";

import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Byte Blog",
    template: "%s · Byte Blog",
  },
  description:
    "Premium editorial stories on software, product craft, and the teams building what comes next.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Byte Blog",
    title: "Byte Blog",
    description:
      "Premium editorial stories on software, product craft, and the teams building what comes next.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Byte Blog",
    description:
      "Premium editorial stories on software, product craft, and the teams building what comes next.",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}