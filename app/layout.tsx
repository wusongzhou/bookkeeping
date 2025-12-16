import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookkeeping",
  description: "物品成本管理应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
