import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM System — 專案管理系統",
  description: "業務提案管理、專案管理、任務追蹤的一站式解決方案",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
