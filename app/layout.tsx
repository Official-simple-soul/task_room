import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TaskRoom | Task Assignment and Review",
    template: "%s | TaskRoom",
  },
  description:
    "TaskRoom helps teams assign coding tasks, manage review workflows, track rework, and calculate approved user earnings.",
  applicationName: "TaskRoom",
  icons: {
    icon: "/task-room-logo.png",
    shortcut: "/task-room-logo.png",
    apple: "/task-room-logo.png",
  },
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
