'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  Check,
  LayoutDashboard,
  Search,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { TARGET_LEVEL_LABELS } from '@/lib/constants';

export default function AjukanSuksesPage() {
  const params = useParams();
  const ticketCode = (params?.ticketCode as string) || '';
  const [copied, setCopied] = useState(false);
  const [aspiration, setAspiration] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadDetail = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()).catch(() => null),
      fetch(`/api/aspirations/track/${ticketCode}`).then((r) => {
        if (!r.ok) throw new Error('Gagal memuat ringkasan tiket.');
        return r.json();
      }),
    ])
      .then(([, aspData]) => {
        if (aspData?.aspiration) {
          setAspiration(aspData.aspiration);
        }
      })
      .catch((err) => {
        console.error(err);
        setFetchError('Ringkasan tiket gagal dimuat. Kode tiket di atas tetap valid dan tersimpan di sistem.');
      })
      .finally(() => setLoading(false));
  }, [ticketCode]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketCode);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = ticketCode;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-zinc-200 text-center animate-in fade-in zoom-in-95 duration-500">
        {/* Success Icon */}
        <div className="w-12 h-12 rounded-lg bg-[#BFD8E3]/35 text-[#00638E] border border-[#8CB9CC]/50 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <CheckCircle2 size={24} />
        </div>

        {/* Heading */}
        <span className="text-xs font-mono text-[#00638E] uppercase tracking-wider block mb-1 font-semibold">
          Pengajuan Berhasil
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Aspirasi Anda Telah Diterima
        </h1>
        <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto leading-relaxed">
          Laporan telah masuk ke sistem ASMA dan diteruskan kepada unit terkait untuk diverifikasi dan ditindaklanjuti.
        </p>

        {/* Ticket Code Box */}
        <div className="my-6 p-5 rounded-lg bg-[#BFD8E3]/20 border border-[#8CB9CC]/40 max-w-md mx-auto">
          <span className="text-[11px] font-mono text-[#004A6B] uppercase tracking-wider block mb-2 font-semibold">
            Kode pelacakan tiket
          </span>
          <div className="flex items-center justify-center gap-2.5">
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#004A6B] tracking-wider">
              {ticketCode}
            </span>
            <button
              onClick={handleCopy}
              title="Salin kode tiket"
              aria-label={copied ? 'Kode tiket tersalin' : 'Salin kode tiket'}
              className="p-1.5 rounded-md bg-white border border-[#8CB9CC]/50 hover:bg-[#BFD8E3]/30 text-[#004A6B] transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-700 font-bold" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-[11px] text-zinc-600 mt-2 font-mono" role="status" aria-live="polite">
            {copied ? 'Kode tiket tersalin ke clipboard.' : 'Simpan kode ini untuk melacak status penanganan sewaktu-waktu.'}
          </p>
        </div>

        {/* Short Summary Card */}
        {loading ? (
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 mb-6 max-w-md mx-auto space-y-2.5 animate-pulse">
            <div className="h-3 bg-zinc-200 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-zinc-200 rounded w-1/2 mx-auto" />
            <div className="h-3 bg-zinc-200 rounded w-2/3 mx-auto" />
          </div>
        ) : fetchError ? (
          <div role="alert" className="p-4 rounded-lg bg-zinc-50 border border-zinc-300 mb-6 max-w-md mx-auto text-xs text-zinc-800 space-y-2.5">
            <div className="flex items-start gap-2 text-left">
              <AlertCircle size={15} className="shrink-0 text-zinc-600 mt-0.5" />
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={loadDetail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw size={12} />
              <span>Muat ulang ringkasan</span>
            </button>
          </div>
        ) : (
          aspiration && (
            <div className="text-left p-4 rounded-lg bg-zinc-50 border border-zinc-200 mb-6 max-w-md mx-auto text-xs space-y-2 animate-in fade-in duration-300">
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
                  {TARGET_LEVEL_LABELS[aspiration.target_level as keyof typeof TARGET_LEVEL_LABELS]?.label || aspiration.target_level}
                </span>
              </div>
            </div>
          )
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/dashboard/mahasiswa"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00638E] hover:bg-[#004A6B] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <LayoutDashboard size={14} />
            <span>Kembali ke dasbor</span>
          </Link>
          <Link
            href={`/lacak?code=${ticketCode}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-[#BFD8E3]/20 text-[#004A6B] hover:border-[#00638E] text-xs font-semibold transition-colors"
          >
            <Search size={14} />
            <span>Lacak progres tiket</span>
          </Link>
        </div>
      </div>
    </div>
  );
}