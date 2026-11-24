import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-xl p-8 sm:p-10 border border-zinc-200 text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="w-12 h-12 rounded-lg bg-zinc-50 text-zinc-900 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
          <FileQuestion size={24} />
        </div>
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
          Galat 404
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-xs text-zinc-600 mt-2 leading-relaxed max-w-sm mx-auto">
          Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan. Periksa kembali tautan, atau lacak aspirasi Anda melalui kode tiket.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
          >
            <Home size={14} />
            <span>Kembali ke beranda</span>
          </Link>
          <Link
            href="/lacak"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors"
          >
            <Search size={14} />
            <span>Lacak tiket aspirasi</span>
          </Link>
        </div>
      </div>
    </div>
  );
}