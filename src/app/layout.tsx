import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afterplay",
  description: "Explore what your listening history says about you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
