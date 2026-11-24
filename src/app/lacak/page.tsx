'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  FileSearch,
  AlertCircle,
  Calendar,
  FileText,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { PublicAspirationBoard } from '@/components/PublicAspirationBoard';
import { TARGET_LEVEL_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { Footer } from '@/components/Footer';

function LacakStatusContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [ticketCode, setTicketCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [aspiration, setAspiration] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      searchTicket(initialCode);
    }
  }, [initialCode]);

  const searchTicket = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setAspiration(null);

    try {
      const res = await fetch(`/api/aspirations/track/${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Tiket aspirasi tidak ditemukan.');
      }
      setAspiration(data.aspiration);
    } catch (err: any) {
      setError(err.message || 'Gagal mencari kode tiket.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchTicket(ticketCode);
  };

  const trackFromBoard = (code: string) => {
    setTicketCode(code);
    searchTicket(code);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  const targetMeta = aspiration
    ? TARGET_LEVEL_LABELS[aspiration.target_level as keyof typeof TARGET_LEVEL_LABELS]
    : null;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="border border-zinc-200 bg-white rounded-xl p-6 mb-6">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            Pelacakan Terbuka
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Lacak Status Aspirasi
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-xl">
            Pantau transparansi penanganan laporan Anda di lingkungan UIN Syarif Hidayatullah Jakarta menggunakan kode tiket resmi.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white rounded-xl p-4 border border-zinc-200 mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <FileSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <label htmlFor="lacak-code" className="sr-only">Kode tiket aspirasi</label>
              <input
                id="lacak-code"
                type="text"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="contoh: asp-2026-xxxxx"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs font-mono uppercase tracking-wider text-zinc-900 placeholder:normal-case placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/30 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !ticketCode.trim()}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
            >
              {loading ? (
                <span>Mencari...</span>
              ) : (
                <>
                  <Search size={14} />
                  <span>Lacak tiket</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-1/3" />
            <div className="h-6 bg-zinc-200 rounded w-2/3" />
            <div className="h-20 bg-zinc-100 rounded" />
            <div className="h-4 bg-zinc-200 rounded w-1/2" />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div role="alert" className="mb-6 p-3.5 rounded-lg bg-zinc-100 border border-zinc-400 text-zinc-900 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={15} className="shrink-0 text-zinc-900" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Card */}
        {aspiration && (
          <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  {aspiration.ticket_code}
                </span>
                <span className="text-xs text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">
                  {targetMeta?.label || aspiration.target_level}
                </span>
                <span className="text-xs text-zinc-600 px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">
                  {aspiration.category?.category_name}
                </span>
              </div>
              <StatusBadge status={aspiration.current_status} size="md" />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 leading-snug">
                {aspiration.title}
              </h2>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                <Calendar size={13} className="text-zinc-400" />
                <span>Diajukan pada {formatDateTime(aspiration.created_at)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">
              {aspiration.description}
            </div>

            {/* Lampiran Bukti */}
            {aspiration.attachments && aspiration.attachments.length > 0 && (
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  Lampiran bukti ({aspiration.attachments.length} berkas)
                </span>
                <div className="flex flex-wrap gap-2">
                  {aspiration.attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium border border-zinc-200 transition-colors"
                    >
                      <FileText size={13} />
                      <span className="max-w-[200px] truncate">{att.file_name}</span>
                      <ExternalLink size={11} className="text-zinc-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Google Drive Link */}
            {aspiration.drive_link && (
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  Tautan Bukti Google Drive / Cloud
                </span>
                <a
                  href={aspiration.drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-xs font-medium border border-zinc-200 transition-colors group"
                >
                  <LinkIcon size={13} className="text-zinc-500 group-hover:text-zinc-950" />
                  <span className="max-w-[260px] sm:max-w-md truncate">{aspiration.drive_link}</span>
                  <ExternalLink size={11} className="text-zinc-400" />
                </a>
              </div>
            )}

            {/* Timeline */}
            <div className="pt-4 border-t border-zinc-200">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
                Perjalanan progres penanganan
              </span>
              <Timeline
                logs={aspiration.status_logs || []}
                responses={aspiration.responses || []}
                currentStatus={aspiration.current_status}
              />
            </div>
          </div>
        )}

        <PublicAspirationBoard onTrack={trackFromBoard} />
      </div>

      <Footer />
    </div>
  );
}

export default function LacakStatusPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs font-mono text-zinc-400">Memuat halaman pelacakan...</div>}>
      <LacakStatusContent />
    </Suspense>
  );
}
