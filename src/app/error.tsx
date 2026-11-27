'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-xl p-8 sm:p-10 border border-zinc-400 text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="w-12 h-12 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <span className="text-xs font-mono text-zinc-900 uppercase tracking-wider block mb-1">
          Terjadi Kesalahan
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Halaman Gagal Dimuat
        </h1>
        <p className="text-xs text-zinc-600 mt-2 leading-relaxed max-w-sm mx-auto">
          Sistem mengalami kendala saat memproses permintaan Anda. Data yang sudah tersimpan tetap aman. Coba muat ulang halaman ini.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#00638E] hover:bg-[#004A6B] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Muat ulang halaman</span>
          </button>
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors"
          >
            <Home size={14} />
            <span>Kembali ke beranda</span>
          </a>
        </div>
      </div>
    </div>
  );
}