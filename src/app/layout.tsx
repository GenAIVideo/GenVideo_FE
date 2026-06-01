import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Antigravity TikTok Automation Dashboard',
  description: 'Production-ready dashboard center for video crawling, processing and TikTok upload automation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900 antialiased overflow-hidden`}>
        <div className="flex h-screen w-screen overflow-hidden">
          {/* Left Sidebar Menu */}
          <Sidebar />

          {/* Right Core Frame */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Header Bar */}
            <Header />

            {/* Main Content Workspace */}
            <main className="flex-1 overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto space-y-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
