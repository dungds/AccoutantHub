import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Chuyen ma Unicode / VNI / TCVN3",
  description:
    "Cong cu chuyen doi bang ma tieng Viet chay hoan toan tren trinh duyet voi Next.js va TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
