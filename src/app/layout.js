// layout.js
// This file defines the root layout for the BreachSense Next.js app.
// It sets up global fonts, metadata, and the main HTML/body structure for all pages.
//
// Main responsibilities:
//   - Import and configure custom fonts
//   - Define global metadata (title, description)
//   - Provide the root HTML and body structure for the app
//
// Exports:
//   - RootLayout: The main layout component wrapping all pages

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BreachSense",
  description:
    "Agent-based cyber-legal analysis framework for data breach detection and compliance mapping.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
