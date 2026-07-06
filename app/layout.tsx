import type { Metadata } from "next";
import { Vazirmatn, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "HabbitRider | هبیت رایدر",
  description: "ردیاب عادت بازی‌وار شده با رقابت لیدربرد",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      className={`${vazir.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster dir="rtl" richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
