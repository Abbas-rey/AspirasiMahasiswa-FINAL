'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  RefreshCw,
  Trash2,
  KeyRound,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Building2,
  Layers,
} from 'lucide-react';
import { TARGET_LEVEL_LABELS } from '@/lib/constants';
import { Role, TargetLevel } from '@prisma/client';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users'>('stats');
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  // User list filters
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add User Form
  const [newNimNip, setNewNimNip] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('MAHASISWA');
  const [newScope, setNewScope] = useState<TargetLevel>('JURUSAN');
  const [customPassword, setCustomPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Bulk Import Form
  const [bulkCsv, setBulkCsv] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      } else {
        const eData = await res.json().catch(() => null);
        setStatsError(eData?.error || 'Gagal memuat statistik dari server.');
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
      setStatsError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const params = new URLSearchParams();
      if (searchUser) params.set('search', searchUser);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        const eData = await res.json().catch(() => null);
        setUsersError(eData?.error || 'Gagal memuat daftar pengguna dari server.');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setUsersError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchUser, roleFilter]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim_nip: newNimNip,
          name: newName,
          email: newEmail,
          role: newRole,
          scope_level: newRole === 'AKADEMISI' ? newScope : null,
          custom_password: customPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan user');

      setShowAddModal(false);
      setNewNimNip('');
      setNewName('');
      setNewEmail('');
      setCustomPassword('');
      setActionNotice({ type: 'success', message: data.message });
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message });
    } finally {
      setAddLoading(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsv.trim()) return;

    setBulkLoading(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/admin/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv_content: bulkCsv }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengimpor user');

      setShowBulkModal(false);
      setBulkCsv('');
      setActionNotice({ type: 'success', message: data.message });
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!confirm(`Reset password untuk "${name}" ke default?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset password');

      setActionNotice({ type: 'success', message: data.message });
      fetchUsers();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message });
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Hapus pengguna "${name}" secara permanen? Data riwayat aspirasi miliknya akan ikut terhapus.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus user');

      setActionNotice({ type: 'success', message: data.message });
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message });
    }
  };

  const sampleCsvExample = `nim_nip,nama,role,scope,email
1251420101,Budi Santoso,MAHASISWA,,budi@mhs.uinjkt.ac.id
1251420102,Siti Aminah,MAHASISWA,,siti@mhs.uinjkt.ac.id
198801012015011005,Dr. Ahmad Fauzi,AKADEMISI,JURUSAN,fauzi@uinjkt.ac.id`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header - Clean Monochrome */}
      <div className="border border-zinc-200 bg-white rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            Dasbor Admin
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Administrasi Sistem
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-xl">
            Kelola operasional pengguna, statistik pelaporan, dan pemeliharaan akun civitas akademika.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200 shrink-0">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Statistik sistem
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Manajemen pengguna
          </button>
        </div>
      </div>

      {/* Global Notice Alert */}
      {actionNotice && (
        <div
          role={actionNotice.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`mb-6 p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 ${
            actionNotice.type === 'success'
              ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
              : 'bg-zinc-100 border-zinc-400 text-zinc-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 size={15} className="shrink-0 text-zinc-900" />
            ) : (
              <AlertCircle size={15} className="shrink-0 text-zinc-900" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            aria-label="Tutup notifikasi"
            className={actionNotice.type === 'success' ? 'text-zinc-900 hover:text-zinc-900' : 'text-zinc-900 hover:text-zinc-950'}
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: RINGKASAN STATISTIK */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {statsError && (
            <div role="alert" className="p-4 rounded-xl bg-zinc-100 border border-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-zinc-900">
                <AlertCircle size={16} className="shrink-0 text-zinc-900" />
                <span>{statsError}</span>
              </div>
              <button
                type="button"
                onClick={fetchStats}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors shrink-0"
              >
                <RefreshCw size={12} />
                <span>Coba lagi</span>
              </button>
            </div>
          )}
          {/* 4 Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-zinc-200">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                Total pengguna
              </span>
              <p className="text-3xl font-semibold font-mono tabular-nums text-zinc-950">
                {stats?.users?.total || 0}
              </p>
              <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>Mhs: {stats?.users?.mahasiswa || 0}</span>
                <span>Dosen: {stats?.users?.akademisi || 0}</span>
                <span>Admin: {stats?.users?.admin || 0}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-zinc-200">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                Aspirasi masuk
              </span>
              <p className="text-3xl font-semibold font-mono tabular-nums text-zinc-950">
                {stats?.aspirations?.total || 0}
              </p>
              <p className="text-xs font-mono text-zinc-500 mt-3 pt-3 border-t border-zinc-100">
                Status diterima: <strong>{stats?.aspirations?.diterima || 0}</strong>
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-zinc-200">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                Dalam penanganan
              </span>
              <p className="text-3xl font-semibold font-mono tabular-nums text-zinc-950">
                {(stats?.aspirations?.diproses || 0) + (stats?.aspirations?.ditindaklanjuti || 0)}
              </p>
              <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>Diproses: {stats?.aspirations?.diproses || 0}</span>
                <span>Ditindaklanjuti: {stats?.aspirations?.ditindaklanjuti || 0}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-zinc-200">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                Tuntas diselesaikan
              </span>
              <p className="text-3xl font-semibold font-mono tabular-nums text-zinc-950">
                {stats?.aspirations?.selesai || 0}
              </p>
              <p className="text-xs font-mono text-zinc-500 mt-3 pt-3 border-t border-zinc-100">
                Rasio tuntas: {stats?.aspirations?.total ? Math.round((stats.aspirations.selesai / stats.aspirations.total) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Breakdown: Target Levels & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Target Levels */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
                Distribusi aspirasi per tingkat tujuan
              </span>

              <div className="space-y-4">
                {[
                  {
                    name: 'Jurusan / Program Studi',
                    count: stats?.targets?.jurusan || 0,
                    barClass: 'bg-zinc-400',
                  },
                  {
                    name: 'Tingkat Fakultas',
                    count: stats?.targets?.fakultas || 0,
                    barClass: 'bg-zinc-600',
                  },
                  {
                    name: 'Tingkat Universitas',
                    count: stats?.targets?.universitas || 0,
                    barClass: 'bg-zinc-900',
                  },
                ].map((item) => {
                  const total = stats?.aspirations?.total || 1;
                  const pct = Math.round((item.count / total) * 100);
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs text-zinc-700">
                        <span>{item.name}</span>
                        <span className="font-mono">{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${item.barClass}`}
                          style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-4">
                Distribusi aspirasi per kategori
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {stats?.categories?.map((cat: any) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-medium text-zinc-900">{cat.name}</p>
                      <span className="text-[11px] font-mono text-zinc-400">ID: {cat.id}</span>
                    </div>
                    <span className="text-sm font-mono font-semibold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN PENGGUNA (CRUD) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Action Row */}
          <div className="bg-white rounded-xl p-3 border border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Cari NIM, NIP, atau nama..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:border-zinc-900 transition-colors"
              >
                <option value="ALL">Semua role</option>
                <option value="MAHASISWA">Mahasiswa</option>
                <option value="AKADEMISI">Akademisi / Dosen</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors"
              >
                <Upload size={13} />
                <span>Bulk import</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
              >
                <UserPlus size={13} />
                <span>Tambah pengguna</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">NIM / NIP</th>
                    <th className="py-3 px-4">Nama lengkap</th>
                    <th className="py-3 px-4">Role & Unit</th>
                    <th className="py-3 px-4">Password default</th>
                    <th className="py-3 px-4">Aktivitas</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 font-mono">
                        Memuat data pengguna...
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle size={20} className="text-zinc-700" />
                          <span className="text-xs text-zinc-900">{usersError}</span>
                          <button
                            type="button"
                            onClick={fetchUsers}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                          >
                            <RefreshCw size={12} />
                            <span>Coba lagi</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400">
                        Tidak ada pengguna yang cocok.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const defaultPass = `Uin${u.nim_nip}`;
                      return (
                        <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                            {u.nim_nip}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-zinc-900 block">{u.name}</span>
                            <span className="text-[11px] text-zinc-400 font-mono">{u.email || 'Tanpa email'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                              {u.role}
                            </span>
                            {u.scope_level && (
                              <span className="block text-[11px] text-zinc-500 mt-0.5">
                                Unit: {TARGET_LEVEL_LABELS[u.scope_level as TargetLevel]?.label}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                            <code>{defaultPass}</code>
                            {u.must_change_pwd && (
                              <span className="block text-[10px] text-zinc-400 mt-0.5">
                                • Belum ganti password
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                            {u.role === 'MAHASISWA' ? (
                              <span>{u._count?.aspirations || 0} aspirasi</span>
                            ) : (
                              <span>{u._count?.responses || 0} tanggapan</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleResetPassword(u.id, u.name)}
                                title="Reset password ke default"
                                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                              >
                                <KeyRound size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                title="Hapus pengguna"
                                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH USER BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-zinc-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">Tambah pengguna baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Pilih role pengguna
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('MAHASISWA')}
                    className={`py-2 rounded-lg border text-center font-medium transition-colors ${
                      newRole === 'MAHASISWA'
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    Mahasiswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('AKADEMISI')}
                    className={`py-2 rounded-lg border text-center font-medium transition-colors ${
                      newRole === 'AKADEMISI'
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    Akademisi / Dosen
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  {newRole === 'MAHASISWA' ? 'NIM Mahasiswa' : 'NIP Dosen / Staf'} <span className="text-zinc-400">*</span>
                </label>
                <input
                  type="text"
                  value={newNimNip}
                  onChange={(e) => setNewNimNip(e.target.value)}
                  placeholder={newRole === 'MAHASISWA' ? 'Contoh: 1251420044' : 'Contoh: 19850315...'}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Nama lengkap civitas <span className="text-zinc-400">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama lengkap beserta gelar jika ada..."
                  required
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              {newRole === 'AKADEMISI' && (
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Lingkup peninjauan (scope)
                  </label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value as TargetLevel)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                  >
                    <option value="JURUSAN">Jurusan / Program Studi</option>
                    <option value="FAKULTAS">Fakultas</option>
                    <option value="UNIVERSITAS">Universitas</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Email kampus (opsional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@uinjkt.ac.id"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Password awal
                </label>
                <input
                  type="text"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder={`Default otomatis: Uin${newNimNip || '<NIM/NIP>'}`}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                />
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                  Kosongkan untuk menggunakan format default sistem (<code>Uin&lt;NIM/NIP&gt;</code>).
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-medium transition-colors disabled:opacity-60"
                >
                  {addLoading ? 'Menyimpan...' : 'Simpan pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK IMPORT */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 border border-zinc-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Bulk import pengguna (CSV)</h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-7 h-7 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
              Unggah atau tempel data CSV pengguna massal. Password default otomatis diset ke <code>Uin&lt;NIM/NIP&gt;</code>.
            </p>

            <form onSubmit={handleBulkImport} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-zinc-700">
                    Format & isi CSV
                  </label>
                  <button
                    type="button"
                    onClick={() => setBulkCsv(sampleCsvExample)}
                    className="text-zinc-600 hover:text-zinc-950 underline text-[11px]"
                  >
                    Gunakan contoh format
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={bulkCsv}
                  onChange={(e) => setBulkCsv(e.target.value)}
                  placeholder={`nim_nip,nama,role,scope,email\n1251420101,Budi Santoso,MAHASISWA,,budi@mhs.uinjkt.ac.id\n198801012015011005,Dr. Ahmad Fauzi,AKADEMISI,JURUSAN,fauzi@uinjkt.ac.id`}
                  className="w-full font-mono text-[11px] px-3 py-2 rounded-lg border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 resize-y leading-normal transition-colors"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 space-y-1 font-mono">
                <p className="font-medium text-zinc-800">Petunjuk kolom CSV:</p>
                <p>• nim_nip: NIM atau NIP</p>
                <p>• nama: Nama lengkap</p>
                <p>• role: MAHASISWA atau AKADEMISI</p>
                <p>• scope: JURUSAN, FAKULTAS, atau UNIVERSITAS</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bulkLoading || !bulkCsv.trim()}
                  className="px-4 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white font-medium transition-colors disabled:opacity-60"
                >
                  {bulkLoading ? 'Memproses impor...' : 'Proses impor massal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
