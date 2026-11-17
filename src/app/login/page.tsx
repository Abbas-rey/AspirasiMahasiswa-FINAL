'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { FirstLoginPasswordModal } from '@/components/FirstLoginPasswordModal';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [nimNip, setNimNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active session state (if user already logged in)
  const [activeSession, setActiveSession] = useState<any | null>(null);

  // First Login Modal State
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);

  // Forgot password helper modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setActiveSession(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogoutCurrent = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setActiveSession(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim_nip: nimNip,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      const user = data.user;
      setLoggedInUser(user);

      // If user must change password, open modal
      if (user.must_change_pwd) {
        setShowFirstLoginModal(true);
        setLoading(false);
        return;
      }

      // Otherwise redirect to appropriate dashboard
      proceedToDashboard(user.role);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat login.');
      setLoading(false);
    }
  };

  const proceedToDashboard = (role: string) => {
    if (callbackUrl) {
      router.push(callbackUrl);
      return;
    }
    switch (role) {
      case 'MAHASISWA':
        router.push('/dashboard/mahasiswa');
        break;
      case 'AKADEMISI':
        router.push('/dashboard/akademisi');
        break;
      case 'ADMIN':
        router.push('/dashboard/admin');
        break;
      default:
        router.push('/');
    }
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white">
      {/* First Login Modal */}
      {showFirstLoginModal && loggedInUser && (
        <FirstLoginPasswordModal
          isOpen={showFirstLoginModal}
          userName={loggedInUser.name}
          onSuccess={() => {
            setShowFirstLoginModal(false);
            proceedToDashboard(loggedInUser.role);
          }}
          onSkip={() => {
            setShowFirstLoginModal(false);
            proceedToDashboard(loggedInUser.role);
          }}
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-2">Bantuan Lupa Password</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Password default sistem adalah <code>Uin</code> diikuti nomor NIM/NIP Anda (contoh: <code>Uin1251420044</code>).
              <br /><br />
              Jika Anda sudah pernah mengganti password dan lupa, silakan hubungi <strong>Administrator Sistem ASMA</strong> atau <strong>Bagian Akademik Fakultas</strong> untuk melakukan permohonan reset password ke default.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Main Split Screen Container */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left Side: Login Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="mb-6">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <GraduationCap size={18} />
                </div>
                <span className="font-bold text-slate-900 text-sm">ASMA UIN Jakarta</span>
              </Link>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan NIM bagi Mahasiswa atau NIP bagi Dosen / Tenaga Kependidikan.
              </p>
            </div>

            {/* Active Session Notice Banner (if user already logged in) */}
            {activeSession && (
              <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-slate-500">Sesi aktif: </span>
                  <strong className="text-slate-900">{activeSession.name}</strong>{' '}
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {activeSession.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={
                      activeSession.role === 'MAHASISWA'
                        ? '/dashboard/mahasiswa'
                        : activeSession.role === 'AKADEMISI'
                        ? '/dashboard/akademisi'
                        : '/dashboard/admin'
                    }
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold hover:bg-slate-100 transition"
                  >
                    Buka Dasbor
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogoutCurrent}
                    className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg font-semibold hover:bg-rose-100 transition flex items-center gap-1"
                  >
                    <LogOut size={12} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  NIM / NIP / Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={nimNip}
                    onChange={(e) => setNimNip(e.target.value)}
                    placeholder="Contoh: 1251420044 (Mahasiswa) atau NIP"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs text-slate-600">Ingat Saya</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Kredensial...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Clean Dark Slate Panel (No gradients) */}
        <div className="hidden lg:flex lg:col-span-5 bg-slate-900 p-10 flex-col justify-between text-white relative">
          {/* Top badge */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
              Sistem Keamanan Terpadu
            </span>
          </div>

          {/* Center Graphic & Text */}
          <div className="space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-slate-200">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-extrabold leading-snug">
              Ruang Aman Menyuarakan Perubahan.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Setiap kritik dan keluhan dilindungi oleh enkripsi serta penegakan privasi ketat. Hak suara mahasiswa dijamin bebas intimidasi.
            </p>
          </div>

          {/* Bottom Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <p className="italic">
              &quot;Sistem ini memangkas birokrasi dan menghubungkan keluhan langsung kepada pejabat berwenang.&quot;
            </p>
            <p className="font-semibold text-white mt-2">
              — Tim Penjaminan Mutu FST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Memuat formulir login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
