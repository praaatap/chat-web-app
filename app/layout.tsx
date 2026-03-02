import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tars Connect",
  description: "A Tars Connect is a tool that allows you to connect to your Tars Members",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Tars Connect",
    description: "Connect instantly. Collaborate effortlessly.",
    type: "website",
  },
};

export default function RootLayout({
  appbar,
  children,
}: Readonly<{
  appbar: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <ConvexClientProvider>
            {appbar}
            <div className="flex-1 min-h-0">{children}</div>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
