'use client';

import React, { useState, useMemo } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { validatePasswordRules } from '@/lib/utils';

interface FirstLoginPasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onSkip?: () => void;
  userName?: string;
  tempToken?: string;
}

export function FirstLoginPasswordModal({
  isOpen,
  onSuccess,
  onSkip,
  userName = 'Pengguna',
  tempToken,
}: FirstLoginPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => {
    return validatePasswordRules(newPassword);
  }, [newPassword]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validation.isValid) {
      setError(validation.error || 'Password belum memenuhi seluruh syarat keamanan.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_password: newPassword,
          ...(tempToken && { temp_token: tempToken }),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah password.');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (tempToken) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/skip-first-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ temp_token: tempToken }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Gagal memproses sesi login.');
        }

        if (onSkip) onSkip();
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setLoading(false);
      }
    } else {
      if (onSkip) onSkip();
    }
  };

  const criteria = [
    { label: 'Minimal 8 karakter', valid: validation.hasMinLength },
    { label: 'Ada huruf besar (A-Z)', valid: validation.hasUppercase },
    { label: 'Ada huruf kecil (a-z)', valid: validation.hasLowercase },
    { label: 'Ada angka (0-9)', valid: validation.hasNumber },
    { label: 'Ada simbol khusus (!@#$%^&*)', valid: validation.hasSymbol },
    { label: 'Tanpa spasi', valid: validation.hasNoSpaces },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-3">
          <KeyRound size={22} />
        </div>

        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Perbarui Password Akun
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Halo <span className="font-semibold text-slate-900">{userName}</span>, akun Anda masih menggunakan default password sistem. Disarankan untuk menggantinya sekarang demi keamanan akun Anda.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Real-time Checklist Criteria */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Syarat Keamanan Password:
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {criteria.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5 text-[11px]">
                  {c.valid ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                    </div>
                  )}
                  <span className={c.valid ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
            />
            {confirmPassword.length > 0 && (
              <p className={`text-[11px] mt-1 flex items-center gap-1 ${passwordsMatch ? 'text-emerald-700 font-medium' : 'text-rose-600'}`}>
                {passwordsMatch ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span>Konfirmasi password sesuai</span>
                  </>
                ) : (
                  <>
                    <X size={12} className="text-rose-600" />
                    <span>Konfirmasi password belum cocok</span>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Action Buttons: Simpan & Nanti */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="submit"
              disabled={loading || !validation.isValid || !passwordsMatch}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Simpan Password</span>
                </>
              )}
            </button>

            {onSkip && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-medium transition cursor-pointer"
              >
                Nanti
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
