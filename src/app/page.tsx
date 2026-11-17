'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Search,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  EyeOff,
  UserCheck,
  GraduationCap,
  Users,
  Building2,
  FileText,
  Wrench,
  HelpCircle,
  Sparkles,
  ChevronRight,
  AlertCircle,
  FileSearch,
  Star,
  Check,
  MessageSquare,
  Activity,
  Layers,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { TARGET_LEVEL_LABELS } from '@/lib/constants';

export default function LandingPage() {
  const [trackCode, setTrackCode] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCode.trim()) return;

    setTrackingLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const res = await fetch(`/api/aspirations/track/${encodeURIComponent(trackCode.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Tiket aspirasi tidak ditemukan');
      }
      setTrackResult(data.aspiration);
    } catch (err: any) {
      setTrackError(err.message || 'Gagal mencari kode tiket aspirasi');
    } finally {
      setTrackingLoading(false);
    }
  };

  const categories = [
    {
      id: 'akademik',
      name: 'Akademik',
      icon: GraduationCap,
      description: 'Kurikulum, pengisian KRS, jadwal perkuliahan, dan pelaksanaan ujian semester.',
    },
    {
      id: 'dosen',
      name: 'Dosen',
      icon: Users,
      description: 'Pelayanan pengajaran, kedisiplinan jam kuliah, bimbingan akademik dan tugas akhir.',
    },
    {
      id: 'fasilitas',
      name: 'Fasilitas',
      icon: Building2,
      description: 'Pendingin ruangan (AC), proyektor, kelayakan ruang kelas, dan perangkat lab komputer.',
    },
    {
      id: 'administrasi',
      name: 'Administrasi',
      icon: FileText,
      description: 'Pelayanan tata usaha (TU), legalisir, surat pengantar, transkrip nilai, dan ijazah.',
    },
    {
      id: 'sarpras',
      name: 'Sarana Prasarana',
      icon: Wrench,
      description: 'Musholla, toilet, ketertiban area parkir kendaraan, kebersihan dan fasilitas umum.',
    },
    {
      id: 'lainnya',
      name: 'Lainnya',
      icon: HelpCircle,
      description: 'Kritik membangun, aspirasi kegiatan kemahasiswaan, dan masukan umum seputar kampus.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Tulis',
      desc: 'Sampaikan aspirasi dengan memilih tingkat tujuan (Jurusan, Fakultas, atau Universitas) serta kategori yang relevan.',
    },
    {
      num: '02',
      title: 'Kirim',
      desc: 'Pilih mode kenyamananmu: pakai identitas resmi atau anonim total. Unggah bukti pendukung jika ada.',
    },
    {
      num: '03',
      title: 'Pantau',
      desc: 'Terima kode tiket resmi (ASP-2026-XXXXXX). Pantau setiap tahap penanganan dan tanggapan akademisi secara real-time.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* 1. HERO SECTION (Split 2-Column Layout matching Monotree reference image) */}
      <section id="beranda" className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-100 scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Description, Quick Action Box, and Stats */}
            <div className="lg:col-span-6 space-y-8">
              {/* Headline with blue block highlight */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                  Suaramu{' '}
                  <span className="bg-blue-600 text-white px-2.5 py-0.5 sm:px-3 sm:py-0.5 rounded-md inline-block">
                    didengar.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Sampaikan aspirasi, keluhan, kritik, dan saran konstruktif langsung ke pihak <strong>Jurusan, Fakultas, maupun Universitas</strong> secara aman, terstruktur, dan transparan.
                </p>
              </div>

              {/* Action Box: Direct Ticket Tracker & Submit Button (Matches email/demo bar in reference) */}
              <div className="space-y-3">
                <form
                  onSubmit={handleTrackSubmit}
                  className="p-1.5 bg-white border border-slate-300 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-2 max-w-lg focus-within:border-slate-800 transition"
                >
                  <div className="relative flex-1 w-full">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={trackCode}
                      onChange={(e) => setTrackCode(e.target.value)}
                      placeholder="Masukkan kode tiket (ASP-2026-XXXXXX)..."
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:outline-none rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={trackingLoading || !trackCode.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition disabled:opacity-50 shrink-0"
                  >
                    {trackingLoading ? 'Mencari...' : 'Lacak Status'}
                  </button>
                </form>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Link
                    href="/ajukan"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition"
                  >
                    <Send size={13} />
                    <span>Ajukan aspirasi baru</span>
                  </Link>
                  <span>•</span>
                  <span className="text-slate-400">Dukungan mode Transparan & Anonim</span>
                </div>
              </div>

              {/* Stats Metrics (75.2% and ~20k style) */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-8 max-w-sm">
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      89.4%
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      Aspirasi ditindaklanjuti
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      ~25k
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                      Civitas akademika aktif
                    </p>
                  </div>
                </div>

                {/* Rating badge */}
                <div className="flex items-center gap-2 pt-2 text-xs text-slate-600">
                  <div className="flex items-center text-slate-900">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="fill-slate-900 text-slate-900" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">4.8</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">Tingkat kepuasan penanganan pengaduan</span>
                </div>
              </div>
            </div>

            {/* Right Column: Isometric Device Wireframe & Floating UI Cards (Matching Reference Style) */}
            <div className="lg:col-span-6 relative flex items-center justify-center py-6">
              {/* Isometric Wireframe Graphics Canvas */}
              <div className="relative w-full max-w-[480px] h-[460px] select-none">
                {/* SVG Isometric Background Line-art / Device Shell */}
                <svg
                  className="absolute inset-0 w-full h-full text-slate-200 stroke-current"
                  viewBox="0 0 500 480"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Isometric base grid & guide lines */}
                  <path d="M50 240 L250 360 L450 240 L250 120 Z" strokeWidth="1" strokeDasharray="4 4" />
                  {/* Smartphone wireframe outline in isometric angle */}
                  <path d="M310 140 L410 200 L410 380 L310 320 Z" stroke="#CBD5E1" strokeWidth="2" fill="#F8FAFC" />
                  <path d="M310 140 L240 180 L240 360 L310 320 Z" stroke="#CBD5E1" strokeWidth="2" fill="#FFFFFF" />
                  {/* Subtle branch lines */}
                  <line x1="240" y1="270" x2="160" y2="310" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="280" y1="180" x2="180" y2="120" stroke="#CBD5E1" strokeWidth="1.5" />
                </svg>

                {/* Floating Card 1: Ticket Header Card (Top Left) */}
                <div className="absolute top-4 left-4 sm:left-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg w-[260px] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      ASP-2026-004812
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Diproses
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    AC Ruang Lab Komputer 3
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Unit: Jurusan Teknik Informatika
                  </p>
                </div>

                {/* Floating Card 2: Official Response Chat Bubble (Right Middle) */}
                <div className="absolute top-28 right-0 sm:right-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg w-[270px] transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                      H
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900">Dr. Husni Teja Sukmana</p>
                      <p className="text-[9px] text-slate-400">Kaprodi Teknik Informatika</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 leading-snug">
                    &quot;Teknisi sarana sedang memeriksa freon dan modul blower AC Lab 3.&quot;
                  </div>
                </div>

                {/* Floating Card 3: Task Progress Sheet (Bottom Left) */}
                <div className="absolute bottom-6 left-6 sm:left-12 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl w-[260px] transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>Progres Tindak Lanjut</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-900">
                      85.3%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                    <div className="bg-slate-900 h-full rounded-full" style={{ width: '85.3%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Verifikasi</span>
                    <span>•</span>
                    <span>Perbaikan Fisik</span>
                    <span>•</span>
                    <span className="text-slate-900 font-semibold">Tuntas</span>
                  </div>
                </div>

                {/* Floating Category Dock Pill (Bottom Center) */}
                <div className="absolute -bottom-2 right-12 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-md flex items-center gap-3 text-slate-600">
                  <GraduationCap size={16} className="text-slate-900" />
                  <Users size={16} className="text-slate-900" />
                  <Building2 size={16} className="text-slate-900" />
                  <FileText size={16} className="text-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Tracking Result preview (if user searched in hero) */}
      {trackError && (
        <section className="py-6 bg-rose-50 border-b border-rose-200">
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-3 text-rose-700 text-xs sm:text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{trackError}</span>
          </div>
        </section>
      )}

      {trackResult && (
        <section className="py-10 bg-slate-50 border-b border-slate-200 animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {trackResult.ticket_code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {TARGET_LEVEL_LABELS[trackResult.target_level as keyof typeof TARGET_LEVEL_LABELS]?.label}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {trackResult.title}
                  </h3>
                </div>
                <StatusBadge status={trackResult.current_status} size="md" />
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {trackResult.description}
              </p>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                  Perjalanan Tindak Lanjut Tiket
                </h4>
                <Timeline
                  logs={trackResult.status_logs}
                  responses={trackResult.responses}
                  currentStatus={trackResult.current_status}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. SECTION CARA KERJA (Clean Minimalist Cards, No Gradients) */}
      <section id="cara-kerja" className="py-20 border-b border-slate-100 scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
              Alur Pengaduan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Tiga langkah, tanpa berputar-putar.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Proses penyampaian aspirasi dirancang terstruktur, aman, dan mudah dipantau.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-7 border border-slate-200 hover:border-slate-400 transition duration-200"
              >
                <span className="text-2xl font-mono font-bold text-slate-400 block mb-4">
                  {step.num}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION KATEGORI (Clean Solid Cards, No Rainbow Colors) */}
      <section id="kategori" className="py-20 bg-slate-50/60 border-b border-slate-100 scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-md">
              Kategori Terstruktur
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Apa yang ingin kamu sampaikan?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Setiap kategori dikelola oleh pejabat peninjau yang berwenang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-400 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                      <IconComp size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">{cat.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-900">
                    <Link
                      href={`/ajukan?kategori=${encodeURIComponent(cat.name)}`}
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Ajukan di kategori ini</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SECTION EDUKASI PRIVASI (Clean Flat Contrast, No Rainbow Gradients) */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
              Keamanan & Privasi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Anonim bukan berarti tak tercatat.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Pilihlah mode yang paling sesuai dengan kebutuhan penyampaian laporan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card 1: Pakai Nama Saya */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                  <UserCheck size={20} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Pakai Nama Saya</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Transparan
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Identitas resmi Anda (Nama & NIM) akan disampaikan langsung kepada pihak Jurusan, Fakultas, atau Universitas.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-slate-900 shrink-0" />
                    <span>Dosen atau staf dapat mengklarifikasi kendala langsung kepada Anda.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-slate-900 shrink-0" />
                    <span>Cocok untuk permohonan fasilitas, surat akademik, atau administrasi pribadi.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-slate-900 shrink-0" />
                    <span>Tercatat lengkap di Dasbor Mahasiswa Anda.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                Pilihan tepat untuk urusan administratif dan perkuliahan harian.
              </div>
            </div>

            {/* Card 2: Kirim Anonim */}
            <div className="bg-white rounded-2xl p-7 border-2 border-slate-900 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                  <EyeOff size={20} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">Kirim Anonim</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                    Privasi 100%
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Sistem ASMA secara otomatis menyensor nama, NIM, dan email Anda dari seluruh tampilan akademisi dan dosen.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-slate-900 shrink-0" />
                    <span>Peninjau hanya melihat label resmi <strong>Mahasiswa (Anonim)</strong>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-slate-900 shrink-0" />
                    <span>Aman dari kekhawatiran intimidasi atau subjektivitas penilaian nilai.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-slate-900 shrink-0" />
                    <span>Anda tetap dapat memantau tiket di Dasbor Mahasiswa pribadi Anda.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-900 font-medium">
                Pilihan tepat untuk kritik pelayanan dosen, transparansi ujian, atau fasilitas darurat.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
}
