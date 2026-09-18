import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight Offer Expert",
  description: "Compare flight offers with transparent fare and policy context.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
