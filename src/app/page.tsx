'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Search,
  CheckCircle2,
  EyeOff,
  UserCheck,
  GraduationCap,
  Users,
  Building2,
  FileText,
  Wrench,
  HelpCircle,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { StatusBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { LiveStats } from '@/components/LiveStats';
import { Reveal } from '@/components/Reveal';
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
    <div className="min-h-screen bg-paper text-zinc-900 flex flex-col">
      {/* 1. HERO SECTION (Split 2-Column Layout matching Monotree reference image) */}
      <section id="beranda" className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-zinc-100 scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Description, Quick Action Box, and Stats */}
            <div className="lg:col-span-6 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
              {/* Headline with ink block highlight */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.18]">
                  Suaramu{' '}
                  <span className="bg-[#00638E] text-white px-2.5 py-0.5 sm:px-3 sm:py-0.5 rounded-md inline-block shadow-xs">
                    didengar.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                  Sampaikan aspirasi, keluhan, kritik, dan saran konstruktif langsung ke pihak <strong>Jurusan, Fakultas, maupun Universitas</strong> secara aman, terstruktur, dan transparan.
                </p>
              </div>

              {/* Action Box: Direct Ticket Tracker & Submit Button (Matches email/demo bar in reference) */}
              <div className="space-y-3">
                <form
                  onSubmit={handleTrackSubmit}
                  className="p-1.5 bg-white border border-zinc-300 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-2 max-w-lg focus-within:border-[#00638E] focus-within:ring-2 focus-within:ring-[#00638E]/20 transition"
                >
                  <div className="relative flex-1 w-full">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={trackCode}
                      onChange={(e) => setTrackCode(e.target.value)}
                      placeholder="Masukkan kode tiket (ASP-2026-XXXXXX)..."
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-mono uppercase tracking-wider text-zinc-900 placeholder:normal-case placeholder:font-sans placeholder:text-zinc-400 focus:outline-none rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={trackingLoading || !trackCode.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00638E] hover:bg-[#004A6B] text-white font-semibold text-xs sm:text-sm transition disabled:opacity-50 shrink-0 shadow-xs"
                  >
                    {trackingLoading ? 'Mencari...' : 'Lacak Status'}
                  </button>
                </form>

                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <Link
                    href="/ajukan"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#BFD8E3]/35 hover:bg-[#BFD8E3]/55 text-[#004A6B] border border-[#8CB9CC]/40 font-semibold transition"
                  >
                    <Send size={13} />
                    <span>Ajukan aspirasi baru</span>
                  </Link>
                  <span>•</span>
                  <span className="text-zinc-500">Dukungan mode Transparan & Anonim</span>
                </div>
              </div>

              {/* Statistik live dari database + count-up saat masuk viewport */}
              <LiveStats />
            </div>

            {/* Right Column: Isometric Device Wireframe & Floating UI Cards (Matching Reference Style) */}
            <div className="lg:col-span-6 relative flex items-center justify-center py-6 animate-in fade-in zoom-in-95 duration-700 [animation-delay:150ms] fill-mode-both">
              {/* Isometric Wireframe Graphics Canvas */}
              <div className="relative w-full max-w-[480px] h-[460px] select-none">
                <div aria-hidden className="absolute top-16 right-4 w-64 h-64 rounded-full bg-[#BFD8E3]/25 blur-3xl" />
                <div aria-hidden className="absolute bottom-8 left-0 w-48 h-48 rounded-full bg-[#8CB9CC]/20 blur-3xl" />
                {/* SVG Isometric Background Line-art / Device Shell */}
                <svg
                  className="absolute inset-0 w-full h-full text-zinc-200 stroke-current"
                  viewBox="0 0 500 480"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Isometric base grid & guide lines */}
                  <path d="M50 240 L250 360 L450 240 L250 120 Z" strokeWidth="1" strokeDasharray="4 4" className="dash-flow stroke-[#8CB9CC]/60" />
                  {/* Smartphone wireframe outline in isometric angle */}
                  <path d="M310 140 L410 200 L410 380 L310 320 Z" stroke="#8CB9CC" strokeWidth="2" fill="#FAFAFA" />
                  <path d="M310 140 L240 180 L240 360 L310 320 Z" stroke="#00638E" strokeWidth="2" fill="#FFFFFF" />
                  {/* Subtle branch lines */}
                  <line x1="240" y1="270" x2="160" y2="310" stroke="#8CB9CC" strokeWidth="1.5" />
                  <line x1="280" y1="180" x2="180" y2="120" stroke="#8CB9CC" strokeWidth="1.5" />
                </svg>

                {/* Floating Card 1: Ticket Header Card (Top Left) */}
                <div className="absolute top-4 left-4 sm:left-8 bg-white border border-[#BFD8E3]/60 rounded-2xl p-4 shadow-lg w-[260px] float-a hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-[#004A6B] bg-[#BFD8E3]/35 border border-[#8CB9CC]/40 px-2 py-0.5 rounded-md">
                      ASP-2026-004812
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                      Diproses
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">
                    AC Ruang Lab Komputer 3
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Unit: Jurusan Teknik Informatika
                  </p>
                </div>

                {/* Floating Card 2: Official Response Chat Bubble (Right Middle) */}
                <div className="absolute top-28 right-0 sm:right-4 bg-white border border-[#BFD8E3]/60 rounded-2xl p-4 shadow-lg w-[270px] float-b hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#00638E] text-white flex items-center justify-center text-[10px] font-bold">
                      H
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-zinc-900">Dr. Husni Teja Sukmana</p>
                      <p className="text-[10px] text-zinc-500">Kaprodi Teknik Informatika</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#BFD8E3]/15 border border-[#BFD8E3]/40 text-[11px] text-zinc-800 leading-snug">
                    &quot;Teknisi sarana sedang memeriksa freon dan modul blower AC Lab 3.&quot;
                  </div>
                </div>

                {/* Floating Card 3: Task Progress Sheet (Bottom Left) */}
                <div className="absolute bottom-6 left-6 sm:left-12 bg-white border border-[#BFD8E3]/60 rounded-2xl p-4 shadow-xl w-[260px] float-c hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-zinc-900 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-[#00638E]" />
                      <span>Progres Tindak Lanjut</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#00638E]">
                      85.3%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-2">
                    <div className="bg-[#00638E] h-full rounded-full" style={{ width: '85.3%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Verifikasi</span>
                    <span>•</span>
                    <span>Perbaikan Fisik</span>
                    <span>•</span>
                    <span className="text-[#00638E] font-semibold">Tuntas</span>
                  </div>
                </div>

                {/* Floating Category Dock Pill (Bottom Center) */}
                <div className="absolute -bottom-2 right-12 bg-white border border-[#BFD8E3]/60 rounded-2xl px-4 py-2 shadow-md flex items-center gap-3 text-zinc-600 float-flat">
                  <GraduationCap size={16} className="text-[#00638E]" />
                  <Users size={16} className="text-[#00638E]" />
                  <Building2 size={16} className="text-[#00638E]" />
                  <FileText size={16} className="text-[#00638E]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Tracking Result preview (if user searched in hero) */}
      {trackError && (
        <section className="py-6 bg-zinc-100 border-b border-zinc-400">
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-3 text-zinc-900 text-xs sm:text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{trackError}</span>
          </div>
        </section>
      )}

      {trackResult && (
        <section className="py-10 bg-zinc-50 border-b border-zinc-200 animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-zinc-700 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                      {trackResult.ticket_code}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      {TARGET_LEVEL_LABELS[trackResult.target_level as keyof typeof TARGET_LEVEL_LABELS]?.label}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900">
                    {trackResult.title}
                  </h3>
                </div>
                <StatusBadge status={trackResult.current_status} size="md" />
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                {trackResult.description}
              </p>

              <div className="pt-4 border-t border-zinc-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-4">
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
      <section id="cara-kerja" className="py-20 border-b border-zinc-100 scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-md">
              Alur Pengaduan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mt-3">
              Tiga langkah, tanpa berputar-putar.
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2">
              Proses penyampaian aspirasi dirancang terstruktur, aman, dan mudah dipantau.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 100} className="h-full">
                <div
                  className="group h-full bg-white rounded-2xl p-7 border border-zinc-200 hover:border-[#00638E]/50 hover:shadow-card-hover hover:-translate-y-1 transition duration-200"
                >
                  <span className="text-2xl font-mono font-bold text-[#00638E] block mb-4">
                    {step.num}
                  </span>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECTION KATEGORI (Clean Solid Cards, No Rainbow Colors) */}
      <section id="kategori" className="py-20 bg-zinc-50/60 border-b border-zinc-100 scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#004A6B] bg-[#BFD8E3]/30 border border-[#8CB9CC]/40 px-3 py-1 rounded-md">
              Kategori Terstruktur
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mt-3">
              Apa yang ingin kamu sampaikan?
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2">
              Setiap kategori dikelola oleh pejabat peninjau yang berwenang.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const IconComp = cat.icon;
              return (
                <Reveal key={cat.id} delay={i * 70} className="h-full">
                  <div
                    className="group h-full bg-white rounded-2xl p-6 border border-zinc-200 hover:border-[#00638E]/50 hover:shadow-card-hover hover:-translate-y-1 transition flex flex-col justify-between"
                  >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#BFD8E3]/30 text-[#00638E] group-hover:bg-[#00638E] group-hover:text-white transition-colors flex items-center justify-center mb-4">
                      <IconComp size={20} />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1.5">{cat.name}</h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-100 text-xs font-semibold text-[#00638E]">
                    <Link
                      href={`/ajukan?kategori=${encodeURIComponent(cat.name)}`}
                      className="inline-flex items-center gap-1 hover:text-[#004A6B] hover:underline"
                    >
                      <span>Ajukan di kategori ini</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SECTION EDUKASI PRIVASI (Clean Flat Contrast, No Rainbow Gradients) */}
      <section className="py-20 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#004A6B] bg-[#BFD8E3]/30 border border-[#8CB9CC]/40 px-3 py-1 rounded-md">
              Keamanan & Privasi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mt-3">
              Anonim bukan berarti tak tercatat.
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base mt-2">
              Pilihlah mode yang paling sesuai dengan kebutuhan penyampaian laporan Anda.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card 1: Pakai Nama Saya */}
            <Reveal className="h-full">
            <div className="bg-white h-full rounded-2xl p-7 border border-zinc-200 flex flex-col justify-between hover:shadow-card-hover transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#00638E] flex items-center justify-center mb-4">
                  <UserCheck size={20} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-zinc-900">Pakai Nama Saya</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    Transparan
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  Identitas resmi Anda (Nama & NIM) akan disampaikan langsung kepada pihak Jurusan, Fakultas, atau Universitas.
                </p>

                <ul className="space-y-2.5 text-xs text-zinc-700">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#00638E] shrink-0" />
                    <span>Dosen atau staf dapat mengklarifikasi kendala langsung kepada Anda.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#00638E] shrink-0" />
                    <span>Cocok untuk permohonan fasilitas, surat akademik, atau administrasi pribadi.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#00638E] shrink-0" />
                    <span>Tercatat lengkap di Dasbor Mahasiswa Anda.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-zinc-500">
                Pilihan tepat untuk urusan administratif dan perkuliahan harian.
              </div>
            </div>
            </Reveal>

            {/* Card 2: Kirim Anonim */}
            <Reveal delay={120} className="h-full">
            <div className="bg-white h-full rounded-2xl p-7 border-2 border-[#00638E] flex flex-col justify-between shadow-sm hover:shadow-card-hover transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#00638E] text-white flex items-center justify-center mb-4">
                  <EyeOff size={20} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-zinc-900">Kirim Anonim</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#00638E] text-white">
                    Privasi 100%
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  Sistem ASMA secara otomatis menyensor nama, NIM, dan email Anda dari seluruh tampilan akademisi dan dosen.
                </p>

                <ul className="space-y-2.5 text-xs text-zinc-700">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#00638E] shrink-0" />
                    <span>Peninjau hanya melihat label resmi <strong>Mahasiswa (Anonim)</strong>.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#00638E] shrink-0" />
                    <span>Aman dari kekhawatiran intimidasi atau subjektivitas penilaian nilai.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-[#00638E] shrink-0" />
                    <span>Anda tetap dapat memantau tiket di Dasbor Mahasiswa pribadi Anda.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 text-[11px] text-[#00638E] font-medium">
                Pilihan tepat untuk kritik pelayanan dosen, transparansi ujian, atau fasilitas darurat.
              </div>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. PITA CTA PENUTUP (Branding Gradient Palette: #000000 via #004A6B to #00638E) */}
      <section className="relative bg-gradient-to-br from-[#000000] via-[#004A6B] to-[#00638E] text-white overflow-hidden">
        <span
          aria-hidden
          className="absolute -right-8 -bottom-24 text-[11rem] sm:text-[15rem] font-extrabold tracking-tighter text-white/5 select-none leading-none"
        >
          ASMA
        </span>
        <div aria-hidden className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#8CB9CC]/15 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#8CB9CC] mb-5">
              ASP-2026 · Transparan · Anonim · Terlacak
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-3xl">
              Suarakan{' '}
              <span className="bg-white text-[#004A6B] px-2.5 py-0.5 sm:px-3 rounded-md inline-block shadow-md">
                sekarang.
              </span>
            </h2>
            <p className="text-[#BFD8E3] text-sm sm:text-base mt-5 max-w-xl leading-relaxed">
              Satu tiket resmi untuk setiap suara. Tulis hari ini, pantau penanganannya sampai tuntas.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-9">
              <Link
                href="/ajukan"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#004A6B] font-semibold text-sm hover:bg-[#BFD8E3] hover:-translate-y-0.5 transition shadow-sm"
              >
                <Send size={15} />
                <span>Ajukan aspirasi</span>
              </Link>
              <Link
                href="/lacak"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-sm hover:border-white hover:bg-white/10 hover:-translate-y-0.5 transition"
              >
                <Search size={15} />
                <span>Lacak status tiket</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. FOOTER */}
      <Footer />
    </div>
  );
}
