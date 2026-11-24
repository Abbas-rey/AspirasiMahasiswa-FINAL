'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AspirationStatus } from '@prisma/client';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { TARGET_LEVEL_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface PublicItem {
  ticket_code: string;
  title: string;
  target_level: keyof typeof TARGET_LEVEL_LABELS;
  current_status: AspirationStatus;
  resolved_at: string | null;
  is_anonymous: boolean;
  category: { category_name: string } | null;
}

interface BoardData {
  items: PublicItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function PublicAspirationBoard({ onTrack }: { onTrack: (code: string) => void }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/aspirations/public?page=${p}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat papan aspirasi.');
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat papan aspirasi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const rangeStart = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const rangeEnd = data ? Math.min(data.page * data.pageSize, data.total) : 0;

  return (
    <section className="mt-10" aria-label="Papan aspirasi yang telah diselesaikan">
      {/* Section header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            Papan Transparansi
          </span>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            Aspirasi yang telah diselesaikan
          </h2>
          <p className="text-sm text-zinc-600 mt-1 max-w-xl">
            Bukti nyata penanganan aspirasi di lingkungan UIN Syarif Hidayatullah Jakarta.
            Klik kartu untuk melihat detail dan riwayat penyelesaiannya.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 border border-zinc-200 bg-white rounded-lg px-2.5 py-1.5">
          <ShieldCheck size={13} className="text-zinc-400" />
          Identitas pelapor anonim dilindungi
        </span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3.5 bg-zinc-200 rounded w-32" />
                <div className="h-5 bg-zinc-100 rounded w-24" />
              </div>
              <div className="h-4 bg-zinc-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div role="alert" className="p-4 rounded-xl bg-zinc-100 border border-zinc-400 text-zinc-900 text-xs flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => load(page)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-colors"
          >
            <RefreshCw size={12} />
            Coba lagi
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data && data.items.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-8 text-center">
          <FileSearch size={22} className="mx-auto text-zinc-300 mb-2" />
          <p className="text-sm font-medium text-zinc-700">
            Belum ada aspirasi yang diselesaikan saat ini.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Aspirasi yang tuntas ditangani akan tampil di papan ini.
          </p>
        </div>
      )}

      {/* Board list */}
      {!loading && !error && data && data.items.length > 0 && (
        <>
          <ul className="space-y-2.5">
            {data.items.map((item) => (
              <li key={item.ticket_code}>
                <button
                  type="button"
                  onClick={() => onTrack(item.ticket_code)}
                  className="w-full text-left bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-900 hover:shadow-sm transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      {item.ticket_code}
                    </span>
                    <StatusBadge status={item.current_status} size="sm" />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-950 leading-snug group-hover:underline underline-offset-4 decoration-zinc-300">
                        {item.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                        <span className="px-1.5 py-px rounded bg-zinc-50 border border-zinc-200 text-zinc-600">
                          {item.category?.category_name || 'Umum'}
                        </span>
                        <span>{TARGET_LEVEL_LABELS[item.target_level]?.label || item.target_level}</span>
                        {item.resolved_at && (
                          <>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-1 text-zinc-700 font-medium">
                              <CheckCircle2 size={12} className="text-zinc-900" />
                              Diselesaikan {formatDate(item.resolved_at)}
                            </span>
                          </>
                        )}
                        {item.is_anonymous && (
                          <span className="px-1.5 py-px rounded border border-zinc-300 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                            Anonim
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors mt-0.5">
                      <Search size={13} />
                      <span className="hidden sm:inline">Lacak</span>
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-zinc-500">
              Menampilkan {rangeStart}–{rangeEnd} dari {data.total} aspirasi selesai
            </span>
            {data.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1}
                  aria-label="Halaman sebelumnya"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:border-zinc-400 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft size={13} />
                  Sebelumnya
                </button>
                <span className="text-xs font-mono text-zinc-500">
                  {data.page} / {data.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={data.page >= data.totalPages}
                  aria-label="Halaman berikutnya"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:border-zinc-400 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  Berikutnya
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}