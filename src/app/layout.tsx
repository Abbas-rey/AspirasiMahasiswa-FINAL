import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { SessionTimeoutManager } from '@/components/SessionTimeoutManager';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aspirasimahasiswafstuinjakarta.vercel.app'),
  title: {
    default: 'ASMA — Sistem Aspirasi Mahasiswa | FST UIN Syarif Hidayatullah Jakarta',
    template: '%s | ASMA FST UIN Jakarta',
  },
  description:
    'Wadah resmi penyampaian aspirasi, kritik, dan keluhan mahasiswa FST UIN Syarif Hidayatullah Jakarta secara aman, transparan, dan terstruktur ke tingkat Jurusan, Fakultas, dan Universitas.',
  keywords: [
    'ASMA',
    'UIN Jakarta',
    'FST UIN Jakarta',
    'Aspirasi Mahasiswa',
    'Syarif Hidayatullah',
    'Pengaduan Kampus',
    'Sistem Aspirasi',
  ],
  authors: [{ name: 'FST UIN Syarif Hidayatullah Jakarta' }],
  creator: 'Pusat Sistem ASMA FST UIN Jakarta',
  publisher: 'UIN Syarif Hidayatullah Jakarta',
  openGraph: {
    title: 'ASMA — Sistem Aspirasi Mahasiswa | FST UIN Syarif Hidayatullah Jakarta',
    description:
      'Wadah resmi penyampaian aspirasi, kritik, dan keluhan mahasiswa FST UIN Syarif Hidayatullah Jakarta secara aman, transparan, dan terstruktur ke tingkat Jurusan, Fakultas, dan Universitas.',
    url: 'https://aspirasimahasiswafstuinjakarta.vercel.app',
    siteName: 'ASMA FST UIN Jakarta',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: 'https://aspirasimahasiswafstuinjakarta.vercel.app/og-banner.png',
        secureUrl: 'https://aspirasimahasiswafstuinjakarta.vercel.app/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'ASMA — Sistem Aspirasi Mahasiswa FST UIN Syarif Hidayatullah Jakarta',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASMA — Sistem Aspirasi Mahasiswa | FST UIN Syarif Hidayatullah Jakarta',
    description:
      'Wadah resmi penyampaian aspirasi, kritik, dan keluhan mahasiswa FST UIN Syarif Hidayatullah Jakarta secara aman, transparan, dan terstruktur ke tingkat Jurusan, Fakultas, dan Universitas.',
    images: ['https://aspirasimahasiswafstuinjakarta.vercel.app/og-banner.png'],
  },
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link rel="image_src" href="https://aspirasimahasiswafstuinjakarta.vercel.app/og-banner.png" />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] text-[#141414] font-sans antialiased flex flex-col selection:bg-[#00638E] selection:text-white">
        <NextTopLoader
          color="#00638E"
          height={2.5}
          showSpinner={false}
          shadow="0 0 10px #00638E,0 0 5px #004A6B"
          speed={350}
          crawlSpeed={250}
          zIndex={1600}
        />
        <SessionTimeoutManager />
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
