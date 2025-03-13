import type { Metadata } from "next";
import Footer from "@/components/custom/footer";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "DeShip",
  description: "A dApp that ensure fair and equal opportunities for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetBrainsMono.className} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
