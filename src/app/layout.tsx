import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { SessionTimeoutManager } from '@/components/SessionTimeoutManager';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ASMA - Sistem Aspirasi Mahasiswa | UIN Syarif Hidayatullah Jakarta',
  description:
    'Platform penyampaian aspirasi, kritik, dan saran mahasiswa UIN Syarif Hidayatullah Jakarta secara aman, transparan, dan terstruktur ke tingkat Jurusan, Fakultas, dan Universitas.',
  keywords: ['ASMA', 'UIN Jakarta', 'Aspirasi Mahasiswa', 'Syarif Hidayatullah', 'Pengaduan Kampus'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col selection:bg-slate-900 selection:text-white">
        <SessionTimeoutManager />
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
