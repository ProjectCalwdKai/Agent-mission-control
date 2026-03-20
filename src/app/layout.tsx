import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './shell';

export const metadata: Metadata = {
  title: 'Agent Mission Control',
  description: 'Orchestration dashboard for AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen bg-gray-50">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}