import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskRoom | Assignment and Review",
  description: "Secure task assignment, review, and earnings management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f5f7f4] font-[Inter,'Avenir_Next','Segoe_UI',Arial,sans-serif] text-[#16221d]">
        {children}
      </body>
    </html>
  );
}
