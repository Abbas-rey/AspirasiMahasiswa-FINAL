'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  LayoutDashboard,
  Search,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export default function AjukanSuksesPage() {
  const params = useParams();
  const ticketCode = (params?.ticketCode as string) || '';
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('Mahasiswa');
  const [aspiration, setAspiration] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user and ticket detail
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch(`/api/aspirations/track/${ticketCode}`).then((r) => r.json()),
    ])
      .then(([userData, aspData]) => {
        if (userData?.user?.name) {
          setUserName(userData.user.name.split(' ')[0]);
        }
        if (aspData?.aspiration) {
          setAspiration(aspData.aspiration);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [ticketCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-zinc-200 text-center">
        {/* Success Icon */}
        <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} />
        </div>

        {/* Heading */}
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
          Pengajuan Berhasil
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Aspirasi Anda Telah Diterima
        </h1>
        <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto leading-relaxed">
          Laporan telah masuk ke sistem ASMA dan diteruskan kepada unit terkait untuk diverifikasi dan ditindaklanjuti.
        </p>

        {/* Ticket Code Box */}
        <div className="my-6 p-5 rounded-lg bg-zinc-50 border border-zinc-200 max-w-md mx-auto">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
            Kode pelacakan tiket
          </span>
          <div className="flex items-center justify-center gap-2.5">
            <span className="font-mono text-xl sm:text-2xl font-semibold text-zinc-950 tracking-wider">
              {ticketCode}
            </span>
            <button
              onClick={handleCopy}
              title="Salin kode tiket"
              className="p-1.5 rounded-md bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors"
            >
              {copied ? <Check size={14} className="text-zinc-950" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 font-mono">
            Simpan kode ini untuk melacak status penanganan sewaktu-waktu.
          </p>
        </div>

        {/* Short Summary Card */}
        {aspiration && (
          <div className="text-left p-4 rounded-lg bg-zinc-50 border border-zinc-200 mb-6 max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
              <span className="text-zinc-500">Status saat ini:</span>
              <StatusBadge status={aspiration.current_status} size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Judul laporan:</span>
              <span className="font-medium text-zinc-950 truncate max-w-[200px]">
                {aspiration.title}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Tingkat tujuan:</span>
              <span className="font-medium text-zinc-900">
                {aspiration.target_level}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/dashboard/mahasiswa"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
          >
            <LayoutDashboard size={14} />
            <span>Kembali ke dasbor</span>
          </Link>
          <Link
            href={`/lacak?code=${ticketCode}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors"
          >
            <Search size={14} />
            <span>Lacak progres tiket</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
