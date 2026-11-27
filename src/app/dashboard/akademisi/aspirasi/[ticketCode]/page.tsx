'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  EyeOff,
  UserCheck,
  Calendar,
  FileText,
  ExternalLink,
  ShieldAlert,
  Link as LinkIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { TARGET_LEVEL_LABELS } from '@/lib/constants';
import { formatDateTime, formatDate } from '@/lib/utils';
import { AspirationStatus } from '@prisma/client';

export default function AkademisiAspirasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketCode = (params?.ticketCode as string) || '';

  const [aspiration, setAspiration] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update form state
  const [newStatus, setNewStatus] = useState<AspirationStatus>('DIPROSES');
  const [officialResponse, setOfficialResponse] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [ticketCode]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/aspirations/${ticketCode}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Aspirasi tidak ditemukan');
      }
      setAspiration(data.aspiration);
      setNewStatus(data.aspiration.current_status);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat detail laporan.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      const res = await fetch(`/api/aspirations/${ticketCode}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          response_text: officialResponse.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui status');
      }

      setOfficialResponse('');
      setUpdateSuccess(true);
      await fetchDetail();
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-zinc-500">Memuat detail laporan...</p>
      </div>
    );
  }

  if (error && !aspiration) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div role="alert" className="p-4 rounded-lg bg-zinc-100 border border-zinc-400 text-zinc-900 text-xs mb-4">
          {error}
        </div>
        <Link
          href="/dashboard/akademisi"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke dasbor</span>
        </Link>
      </div>
    );
  }

  const targetMeta = TARGET_LEVEL_LABELS[aspiration.target_level as keyof typeof TARGET_LEVEL_LABELS];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Navigation */}
      <div className="mb-6">
        <Link
          href="/dashboard/akademisi"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke daftar peninjauan</span>
        </Link>
      </div>

      {/* Main Grid: Left Details (7 cols), Right Actions & Timeline (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Detail Lengkap Kejadian */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200">
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
            <h1 className="text-xl font-semibold text-zinc-950 mt-4 leading-snug">
              {aspiration.title}
            </h1>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono mb-1">
                  Pelapor
                </span>
                {aspiration.is_anonymous ? (
                  <span className="inline-flex items-center gap-1 text-zinc-700 font-medium">
                    <EyeOff size={12} />
                    <span>Mahasiswa (Anonim)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-zinc-900 font-medium">
                    <UserCheck size={12} />
                    <span>{aspiration.user?.name}</span>
                  </span>
                )}
                {!aspiration.is_anonymous && (
                  <span className="block font-mono text-[11px] text-zinc-500 mt-0.5">
                    NIM: {aspiration.user?.nim_nip}
                  </span>
                )}
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono mb-1">
                  Waktu kejadian
                </span>
                <span className="font-medium text-zinc-900">
                  {formatDate(aspiration.incident_date)}
                </span>
                <span className="block text-[11px] font-mono text-zinc-500 mt-0.5">
                  {aspiration.incident_time}
                </span>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono mb-1">
                  Waktu masuk sistem
                </span>
                <span className="font-medium text-zinc-900 font-mono">
                  {formatDateTime(aspiration.created_at)}
                </span>
              </div>
            </div>

            {/* Privacy notice if anonymous */}
            {aspiration.is_anonymous && (
              <div className="mb-5 p-3 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs flex items-center gap-2">
                <ShieldAlert size={15} className="shrink-0 text-zinc-500" />
                <span>
                  <strong>Aturan Privasi:</strong> Laporan ini dikirim dalam mode Anonim. Identitas asli mahasiswa dilindungi sistem.
                </span>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
                Uraian lengkap kejadian
              </span>
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">
                {aspiration.description}
              </div>
            </div>

            {/* Attachments */}
            {aspiration.attachments && aspiration.attachments.length > 0 && (
              <div className="mt-5 pt-5 border-t border-zinc-200">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  Bukti pendukung terlampir ({aspiration.attachments.length} berkas)
                </span>
                <div className="space-y-2">
                  {aspiration.attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-zinc-200 hover:border-zinc-400 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-600 flex items-center justify-center">
                          <FileText size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-900 group-hover:text-zinc-700">
                            {att.file_name}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-500">
                            {(att.file_size / (1024 * 1024)).toFixed(2)} MB • {att.file_type}
                          </p>
                        </div>
                      </div>
                      <ExternalLink size={13} className="text-zinc-400 group-hover:text-zinc-800" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Google Drive / Cloud Link */}
            {aspiration.drive_link && (
              <div className="mt-5 pt-5 border-t border-zinc-200">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  Tautan Bukti Eksternal (Google Drive / Cloud)
                </span>
                <a
                  href={aspiration.drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-zinc-400 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center shrink-0">
                      <LinkIcon size={14} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-zinc-900 group-hover:underline truncate max-w-xs sm:max-w-md">
                        {aspiration.drive_link}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        Buka tautan bukti di tab baru
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={13} className="text-zinc-400 group-hover:text-zinc-800 shrink-0" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions (Status Update & Response) + Vertical Journey Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Perbarui Status & Tanggapan Resmi */}
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
              Tindak lanjut & tanggapan
            </span>

            {updateSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-zinc-700" />
                <span>Pembaruan status dan tanggapan berhasil disimpan.</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Ubah status laporan
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AspirationStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/30 transition-colors"
                >
                  <option value="DITERIMA">DITERIMA (Verifikasi awal)</option>
                  <option value="DIPROSES">DIPROSES (Sedang ditelaah/dikoordinasikan)</option>
                  <option value="DITINDAKLANJUTI">DITINDAKLANJUTI (Aksi di lapangan)</option>
                  <option value="SELESAI">SELESAI (Tuntas & Ditutup)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Tuliskan tanggapan resmi
                </label>
                <textarea
                  rows={4}
                  value={officialResponse}
                  onChange={(e) => setOfficialResponse(e.target.value)}
                  placeholder="Tuliskan keterangan tindakan, jawaban untuk mahasiswa pelapor, atau penjelasan penyelesaian..."
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/30 transition-colors leading-relaxed resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={updateLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#00638E] hover:bg-[#004A6B] text-white text-xs font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {updateLoading ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Simpan pembaruan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card Perjalanan Aspirasi (Vertical Chronological Timeline) */}
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-5">
              Perjalanan aspirasi
            </span>

            <Timeline
              logs={aspiration.status_logs || []}
              responses={aspiration.responses || []}
              currentStatus={aspiration.current_status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
