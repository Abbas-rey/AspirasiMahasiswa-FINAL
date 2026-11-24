import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer id="kontak" className="border-t border-zinc-200/80 bg-white/60 backdrop-blur-sm mt-20 scroll-mt-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                <GraduationCap size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 leading-tight">ASMA UIN Jakarta</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Sistem Aspirasi Mahasiswa</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Wadah resmi penyaluran kritik, saran, dan keluhan civitas akademika UIN Syarif Hidayatullah Jakarta kepada tingkat Jurusan, Fakultas, hingga Universitas dengan jaminan privasi dan transparansi pelacakan.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-[11px] font-medium">
              <ShieldCheck size={14} className="text-zinc-900" />
              <span>Privasi Terenkripsi & Terlindungi</span>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Navigasi Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-zinc-600 hover:text-zinc-900 transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/#cara-kerja" className="text-zinc-600 hover:text-zinc-900 transition">
                  Cara Kerja Pelaporan
                </Link>
              </li>
              <li>
                <Link href="/#kategori" className="text-zinc-600 hover:text-zinc-900 transition">
                  Kategori Aspirasi
                </Link>
              </li>
              <li>
                <Link href="/lacak" className="text-zinc-600 hover:text-zinc-900 transition">
                  Lacak Status Tiket
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-zinc-600 hover:text-zinc-900 transition">
                  Login Civitas Akademika
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tingkat Penanganan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Tingkat Penanganan</h4>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span>Program Studi / Jurusan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>Fakultas (Dekanat & KTU)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span>Rektorat & Biro Universitas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                <span>Lembaga Penjaminan Mutu (LPM)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak Akademik Kampus */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Pusat Bantuan Akademik</h4>
            <div className="space-y-2.5 text-xs text-zinc-600">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                <span>Gedung Rektorat Lt. 1, Jl. Ir. H. Djuanda No. 95, Ciputat, Tangerang Selatan 15412</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-zinc-400 shrink-0" />
                <a href="mailto:akademik@uinjkt.ac.id" className="hover:text-zinc-900 transition">
                  akademik@uinjkt.ac.id
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-zinc-400 shrink-0" />
                <span>(021) 7401925 / PABX 1234</span>
              </div>
              <div className="pt-1">
                <a
                  href="https://uinjkt.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-900 hover:text-zinc-800 font-medium"
                >
                  <span>Portal Resmi UIN Jakarta</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} UIN Syarif Hidayatullah Jakarta. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-1 text-zinc-500">
            <span>Dikelola bersama Bagian Kemahasiswaan & Pusat Teknologi Informasi (PUSTIPD)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
