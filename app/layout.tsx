import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TaskRoom | Task Assignment and Review',
    template: '%s | TaskRoom',
  },
  description:
    'TaskRoom helps teams assign coding tasks, manage review workflows, track rework, and calculate approved user earnings.',
  applicationName: 'TaskRoom',
  icons: {
    icon: '/task-room2.png',
    shortcut: '/task-room2.png',
    apple: '/task-room2.png',
  },
};

const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch (e) {}
  })()
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-[#f5f7f4] text-[#16221d] dark:bg-[#0a0f0d] dark:text-[#ecf2ee] font-[Inter,'Avenir_Next','Segoe_UI',Arial,sans-serif] transition-colors duration-250">
        {children}
      </body>
    </html>
  );
}
