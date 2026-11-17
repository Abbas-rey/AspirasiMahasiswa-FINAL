'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  EyeOff,
  UserCheck,
  Calendar,
  ChevronRight,
  Building2,
  FileText,
  KeyRound,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { TARGET_LEVEL_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { FirstLoginPasswordModal } from '@/components/FirstLoginPasswordModal';

export default function AkademisiDashboard() {
  const [user, setUser] = useState<any | null>(null);
  const [aspirations, setAspirations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [uRes, catRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/categories'),
      ]);
      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData.user);
      }
      if (catRes.ok) {
        const cData = await catRes.json();
        setCategories(cData.categories || []);
      }
      await fetchAspirations();
    } catch (err) {
      console.error('Error loading reviewer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAspirations = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedTarget !== 'ALL') params.set('target_level', selectedTarget);
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      if (selectedCategory !== 'ALL') params.set('category_id', selectedCategory);

      const res = await fetch(`/api/aspirations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAspirations(data.aspirations || []);
      }
    } catch (err) {
      console.error('Error fetching aspirations:', err);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAspirations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedTarget, selectedStatus, selectedCategory]);

  const scopeLabel = user?.scope_level
    ? TARGET_LEVEL_LABELS[user.scope_level as keyof typeof TARGET_LEVEL_LABELS]?.label
    : 'Semua Tingkat';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header - Clean Monochrome */}
      <div className="border border-zinc-200 bg-white rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            Dasbor Peninjau
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Peninjauan Aspirasi Mahasiswa
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-2xl">
            Tinjau, ubah status penanganan, dan berikan tanggapan resmi pada setiap aspirasi masuk sesuai kewenangan unit Anda.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-400 block text-[10px] uppercase font-mono">Kewenangan:</span>
            <span className="font-medium text-zinc-900">{scopeLabel}</span>
          </div>
        </div>
      </div>

      {/* Password Change Reminder Banner if user still uses default password */}
      {user?.must_change_pwd && (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <KeyRound size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">Akun Anda masih menggunakan password bawaan (default)</p>
              <p className="text-[11px] text-amber-800">Tingkatkan keamanan akun peninjau dengan memperbarui password Anda sekarang.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition"
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

      {/* Filter Row */}
      <div className="bg-white rounded-xl p-4 border border-zinc-200 mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, tiket, isi..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          {/* Filter Tingkat Tujuan */}
          <div>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition-colors"
            >
              <option value="ALL">Semua tingkat tujuan</option>
              <option value="JURUSAN">Jurusan / Program Studi</option>
              <option value="FAKULTAS">Fakultas</option>
              <option value="UNIVERSITAS">Universitas</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition-colors"
            >
              <option value="ALL">Semua status</option>
              <option value="DITERIMA">Diterima</option>
              <option value="DIPROSES">Diproses</option>
              <option value="DITINDAKLANJUTI">Ditindaklanjuti</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition-colors"
            >
              <option value="ALL">Semua kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters count summary */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
          <span>Menampilkan <strong className="font-mono text-zinc-900">{aspirations.length}</strong> aspirasi</span>
          {(search || selectedTarget !== 'ALL' || selectedStatus !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedTarget('ALL');
                setSelectedStatus('ALL');
                setSelectedCategory('ALL');
              }}
              className="text-zinc-600 hover:text-zinc-950 underline font-medium text-xs"
            >
              Reset semua filter
            </button>
          )}
        </div>
      </div>

      {/* Aspirations List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-zinc-200 p-5 animate-pulse" />
          ))}
        </div>
      ) : aspirations.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-zinc-200">
          <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto mb-3">
            <FileText size={24} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">Tidak ada aspirasi</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Tidak ada laporan aspirasi yang cocok dengan kriteria filter saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {aspirations.map((asp) => {
            const targetMeta = TARGET_LEVEL_LABELS[asp.target_level as keyof typeof TARGET_LEVEL_LABELS];
            const isAnon = asp.is_anonymous;

            return (
              <Link
                key={asp.id}
                href={`/dashboard/akademisi/aspirasi/${asp.ticket_code}`}
                className="block bg-white rounded-xl p-5 border border-zinc-200 hover:border-zinc-400 transition-colors group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                        {asp.ticket_code}
                      </span>
                      <span className="text-xs text-zinc-600 px-2 py-0.5 rounded border border-zinc-200">
                        {targetMeta?.label || asp.target_level}
                      </span>
                      <span className="text-xs text-zinc-600 px-2 py-0.5 rounded bg-zinc-50 border border-zinc-200">
                        {asp.category?.category_name}
                      </span>

                      {/* Sender Info with strict privacy check */}
                      {isAnon ? (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-500 px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50">
                          <EyeOff size={11} />
                          <span>Mahasiswa (Anonim)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50">
                          <UserCheck size={11} />
                          <span>{asp.user?.name} ({asp.user?.nim_nip})</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-zinc-950 group-hover:text-zinc-700 transition-colors">
                      {asp.title}
                    </h3>
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {asp.description}
                    </p>
                  </div>

                  {/* Right Status & Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                    <div className="text-left lg:text-right">
                      <StatusBadge status={asp.current_status} size="md" />
                      <p className="text-xs font-mono text-zinc-400 mt-1">
                        {formatDate(asp.created_at)}
                      </p>
                    </div>

                    <div className="w-7 h-7 rounded-lg border border-zinc-200 group-hover:bg-zinc-100 text-zinc-400 group-hover:text-zinc-900 flex items-center justify-center transition-colors">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
