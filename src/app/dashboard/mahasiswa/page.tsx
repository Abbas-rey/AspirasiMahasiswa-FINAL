'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Search,
  Filter,
  EyeOff,
  UserCheck,
  FileText,
  Calendar,
  ChevronRight,
  X,
  ExternalLink,
  KeyRound,
  Link as LinkIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { FirstLoginPasswordModal } from '@/components/FirstLoginPasswordModal';
import { TARGET_LEVEL_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function MahasiswaDashboard() {
  const [user, setUser] = useState<any | null>(null);
  const [aspirations, setAspirations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedAspiration, setSelectedAspiration] = useState<any | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [aspirationToDelete, setAspirationToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [userRes, aspRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/aspirations'),
      ]);

      if (userRes.ok) {
        const uData = await userRes.json();
        setUser(uData.user);
      }
      if (aspRes.ok) {
        const aData = await aspRes.json();
        setAspirations(aData.aspirations || []);
      } else {
        const eData = await aspRes.json().catch(() => null);
        setFetchError(eData?.error || 'Gagal memuat daftar aspirasi dari server.');
      }
    } catch (err) {
      console.error('Fetch student dashboard error:', err);
      setFetchError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAspiration = async (ticketCode: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/aspirations/${ticketCode}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus aspirasi.');
      }

      setAspirations((prev) => prev.filter((a) => a.ticket_code !== ticketCode));
      if (selectedAspiration?.ticket_code === ticketCode) {
        setSelectedAspiration(null);
      }
      setAspirationToDelete(null);
      setToastMessage(`Aspirasi ${ticketCode} berhasil dihapus.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setDeleteError(err.message || 'Terjadi kesalahan sistem saat menghapus.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredAspirations = aspirations.filter((asp) => {
    const matchSearch =
      asp.title.toLowerCase().includes(search.toLowerCase()) ||
      asp.ticket_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || asp.current_status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header - Clean Monochrome */}
      <div className="border border-zinc-200 bg-white rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            Dasbor Mahasiswa
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Aspirasi & Laporan Saya
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-xl">
            Pantau status penanganan aspirasi, kritik, dan masukan yang telah kamu sampaikan secara transparan.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/ajukan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00638E] text-white font-semibold text-xs hover:bg-[#004A6B] transition-colors shadow-xs"
          >
            <Send size={14} />
            <span>Ajukan aspirasi</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="mb-6 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-zinc-900 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-zinc-900 hover:text-zinc-900 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Password Change Reminder Banner if user still uses default password */}
      {user?.must_change_pwd && (
        <div className="mb-6 p-4 rounded-xl border border-zinc-300 bg-zinc-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
              <KeyRound size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950">Akun Anda masih menggunakan password bawaan (default)</p>
              <p className="text-[11px] text-zinc-800">Tingkatkan keamanan akun dengan memperbarui password Anda sekarang.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#00638E] hover:bg-[#004A6B] text-white text-xs font-semibold shrink-0 transition shadow-xs"
          >
            Ganti Password
          </button>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && user && (
        <FirstLoginPasswordModal
          isOpen={showPasswordModal}
          userName={user.name}
          onSuccess={() => {
            setShowPasswordModal(false);
            setUser((prev: any) => ({ ...prev, must_change_pwd: false }));
          }}
          onSkip={() => setShowPasswordModal(false)}
        />
      )}

      {/* Main Grid: Left List (8 cols), Right Info Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Riwayat Aspirasi */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl p-3 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul atau kode tiket..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-zinc-400 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 w-full sm:w-auto"
              >
                <option value="ALL">Semua status</option>
                <option value="DITERIMA">Diterima</option>
                <option value="DIPROSES">Diproses</option>
                <option value="DITINDAKLANJUTI">Ditindaklanjuti</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>
          </div>

          {/* List of Aspirations */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-white rounded-xl border border-zinc-200 p-5 animate-pulse" />
              ))}
            </div>
          ) : fetchError ? (
            <div role="alert" className="bg-white rounded-xl p-12 text-center border border-zinc-400">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Gagal memuat aspirasi</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">{fetchError}</p>
              <button
                type="button"
                onClick={fetchData}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw size={13} />
                <span>Coba lagi</span>
              </button>
            </div>
          ) : filteredAspirations.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-zinc-200">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto mb-3">
                <FileText size={24} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Belum ada aspirasi</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {search || selectedStatus !== 'ALL'
                  ? 'Tidak ada laporan yang sesuai dengan filter pencarian.'
                  : 'Kamu belum mengajukan aspirasi apa pun. Klik tombol di bawah untuk membuat laporan pertamamu.'}
              </p>
              {!search && selectedStatus === 'ALL' && (
                <div className="mt-4">
                  <Link
                    href="/ajukan"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                  >
                    <Send size={13} />
                    <span>Mulai ajukan sekarang</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAspirations.map((asp) => {
                const targetMeta = TARGET_LEVEL_LABELS[asp.target_level as keyof typeof TARGET_LEVEL_LABELS];

                return (
                  <div
                    key={asp.id}
                    onClick={() => setSelectedAspiration(asp)}
                    className="bg-white rounded-xl p-5 border border-zinc-200 hover:border-[#00638E]/60 hover:shadow-card-hover transition cursor-pointer group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-[#004A6B] bg-[#BFD8E3]/35 border border-[#8CB9CC]/50 px-2 py-0.5 rounded">
                          {asp.ticket_code}
                        </span>
                        <span className="text-xs text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">
                          {targetMeta?.label || asp.target_level}
                        </span>
                        <span className="text-xs text-zinc-600 px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">
                          {asp.category?.category_name}
                        </span>
                        {asp.is_anonymous ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#004A6B] px-2 py-0.5 rounded border border-[#8CB9CC]/40 bg-[#BFD8E3]/20 font-mono text-[10px]">
                            <EyeOff size={11} />
                            <span>Anonim</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50">
                            <UserCheck size={11} />
                            <span>Identitas asli</span>
                          </span>
                        )}
                      </div>
                      <StatusBadge status={asp.current_status} size="sm" />
                    </div>

                    <h3 className="text-sm font-semibold text-zinc-950 group-hover:text-[#00638E] transition-colors line-clamp-1 mb-1">
                      {asp.title}
                    </h3>
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                      {asp.description}
                    </p>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Calendar size={13} className="text-zinc-400" />
                        <span>{formatDate(asp.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAspirationToDelete(asp);
                          }}
                          title="Hapus aspirasi ini"
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                        <span className="text-[#00638E] font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                          <span>Detail</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Identity & Info Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Session Card */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3">
              Sesi akun aktif
            </span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-mono font-medium text-sm">
                {user?.name?.charAt(0) || 'M'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-zinc-950 truncate">{user?.name || '-'}</p>
                <p className="text-xs font-mono text-zinc-500">{user?.nim_nip || '-'}</p>
                <span className="inline-block mt-0.5 text-[11px] font-mono text-zinc-600 px-1.5 py-0.2 rounded bg-zinc-100 border border-zinc-200">
                  Mahasiswa
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Total laporan:</span>
                <span className="font-mono font-medium text-zinc-950">{aspirations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Sedang diproses:</span>
                <span className="font-mono font-medium text-zinc-800">
                  {aspirations.filter((a) => a.current_status === 'DIPROSES' || a.current_status === 'DITINDAKLANJUTI').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Selesai:</span>
                <span className="font-mono font-medium text-zinc-950">
                  {aspirations.filter((a) => a.current_status === 'SELESAI').length}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Reassurance Card - Matching Palette (#004A6B to #00638E) */}
          <div className="rounded-xl p-5 bg-gradient-to-br from-[#004A6B] to-[#00638E] text-white border border-[#00638E]/40 shadow-xs">
            <h4 className="text-xs font-semibold text-white mb-1.5">
              Bisa anonim, tetap terlacak olehmu
            </h4>
            <p className="text-xs text-[#BFD8E3] leading-relaxed mb-3">
              Laporan berstatus anonim hanya menyamarkan namamu dari hadapan dosen dan pimpinan kampus. Di dasbor pribadimu, laporan tetap tampil lengkap.
            </p>
            <Link
              href="/ajukan"
              className="inline-flex items-center gap-1.5 text-xs text-white font-medium hover:underline"
            >
              <span>Ajukan laporan baru &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Detail Aspirasi */}
      {selectedAspiration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 border border-zinc-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  {selectedAspiration.ticket_code}
                </span>
                <span className="text-xs text-zinc-500">
                  {selectedAspiration.category?.category_name}
                </span>
              </div>
              <button
                onClick={() => setSelectedAspiration(null)}
                className="w-7 h-7 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-zinc-950">
                {selectedAspiration.title}
              </h2>
              <StatusBadge status={selectedAspiration.current_status} size="md" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs mb-5">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Tujuan:</span>
                <span className="font-medium text-zinc-800">
                  {TARGET_LEVEL_LABELS[selectedAspiration.target_level as keyof typeof TARGET_LEVEL_LABELS]?.label}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Mode Identitas:</span>
                <span className="font-medium text-zinc-800">
                  {selectedAspiration.is_anonymous ? 'Anonim' : 'Nama saya'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Waktu kejadian:</span>
                <span className="font-medium text-zinc-800">
                  {selectedAspiration.incident_time}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
                Deskripsi kejadian
              </span>
              <p className="text-xs text-zinc-800 leading-relaxed bg-zinc-50 p-4 rounded-lg border border-zinc-200 whitespace-pre-wrap">
                {selectedAspiration.description}
              </p>
            </div>

            {selectedAspiration.attachments && selectedAspiration.attachments.length > 0 && (
              <div className="mb-5">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  Lampiran bukti ({selectedAspiration.attachments.length} berkas)
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedAspiration.attachments.map((att: any) => (
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

            {/* Google Drive Link if present */}
            {selectedAspiration.drive_link && (
              <div className="mb-5">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  Tautan Bukti Google Drive / Cloud
                </span>
                <a
                  href={selectedAspiration.drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-xs font-medium border border-zinc-200 transition-colors group"
                >
                  <LinkIcon size={13} className="text-zinc-500 group-hover:text-zinc-950" />
                  <span className="max-w-[260px] sm:max-w-md truncate">{selectedAspiration.drive_link}</span>
                  <ExternalLink size={11} className="text-zinc-400" />
                </a>
              </div>
            )}

            {/* Perjalanan Status */}
            <div className="pt-4 border-t border-zinc-200">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-3">
                Riwayat dan tanggapan resmi
              </span>
              <Timeline
                logs={selectedAspiration.status_logs || []}
                responses={selectedAspiration.responses || []}
                currentStatus={selectedAspiration.current_status}
              />
            </div>

            {/* Modal Actions: Hapus & Tutup */}
            <div className="pt-4 mt-6 border-t border-zinc-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAspirationToDelete(selectedAspiration)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-zinc-900 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-400 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Hapus aspirasi ini</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAspiration(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Aspirasi */}
      {aspirationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-zinc-200 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} />
            </div>

            <div className="text-center mb-4">
              <h3 className="text-base font-semibold text-zinc-950">
                Hapus Aspirasi Ini?
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Aspirasi dengan kode <span className="font-mono font-medium text-zinc-900">{aspirationToDelete.ticket_code}</span> (&quot;{aspirationToDelete.title}&quot;) beserta seluruh file bukti lampiran akan dihapus secara permanen dari sistem.
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-zinc-100 border border-zinc-400 text-zinc-900 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAspirationToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAspiration(aspirationToDelete.ticket_code)}
                disabled={deleting}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-900 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {deleting ? (
                  <span>Menghapus...</span>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
