'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UserCheck,
  EyeOff,
  Calendar,
  Clock,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Trash2,
} from 'lucide-react';

function AjukanAspirasiForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get('kategori') || '';

  // Multi-step state: 1, 2, 3
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  // Step 1: Mode, Tujuan & Kategori
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [targetLevel, setTargetLevel] = useState<'JURUSAN' | 'FAKULTAS' | 'UNIVERSITAS'>('JURUSAN');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Step 2: Detail Kejadian
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('10:00 WIB');

  // Step 3: Bukti & Konfirmasi
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategoriesList(data.categories);
          if (preselectedCategory) {
            const found = data.categories.find(
              (c: any) => c.category_name.toLowerCase() === preselectedCategory.toLowerCase()
            );
            if (found) setCategoryId(found.id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [preselectedCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file bukti melebihi 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Format bukti harus berupa JPG, PNG, atau PDF.');
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const validateStep1 = () => {
    if (!targetLevel || !categoryId) {
      setError('Silakan pilih mode pengirim, tingkat tujuan, dan kategori aspirasi.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!title.trim()) {
      setError('Judul aspirasi wajib diisi.');
      return false;
    }
    if (title.length > 120) {
      setError('Judul aspirasi maksimal 120 karakter.');
      return false;
    }
    if (!description.trim()) {
      setError('Detail kejadian wajib diisi.');
      return false;
    }
    if (description.length > 2000) {
      setError('Detail kejadian maksimal 2000 karakter.');
      return false;
    }
    if (!incidentDate) {
      setError('Tanggal kejadian wajib diisi.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) {
      setError('Anda wajib mencentang konfirmasi tanggung jawab sebelum mengirim laporan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('incident_date', incidentDate);
      formData.append('incident_time', incidentTime.trim());
      formData.append('target_level', targetLevel);
      formData.append('category_id', categoryId.toString());
      formData.append('is_anonymous', isAnonymous ? 'true' : 'false');

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/aspirations', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim aspirasi.');
      }

      router.push(`/ajukan/sukses/${data.ticket_code}`);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat pengiriman.');
      setLoading(false);
    }
  };

  const selectedCategoryObj = categoriesList.find((c) => c.id === categoryId);

  const getTargetTitle = (t: string) => {
    switch (t) {
      case 'JURUSAN':
        return 'Jurusan (Teknik Informatika)';
      case 'FAKULTAS':
        return 'Fakultas (Sains dan Teknologi)';
      case 'UNIVERSITAS':
        return 'Universitas (UIN Syarif Hidayatullah)';
      default:
        return t;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border border-zinc-200 bg-white rounded-xl p-6 mb-6">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
          Formulir Pengaduan
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Ajukan Aspirasi Baru
        </h1>
        <p className="text-sm text-zinc-600 mt-1 max-w-xl">
          Sampaikan keluhan, kritik, atau saran konstruktif dengan format terstruktur dan pilihan privasi transparan maupun anonim.
        </p>
      </div>

      {/* Step Indicator - Clean Monochrome */}
      <div className="bg-white rounded-xl p-4 border border-zinc-200 mb-6">
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { num: 1, label: 'Mode & Kategori' },
            { num: 2, label: 'Detail Kejadian' },
            { num: 3, label: 'Bukti & Konfirmasi' },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;

            return (
              <div
                key={s.num}
                className={`p-2.5 rounded-lg border transition-colors flex items-center gap-2.5 ${
                  isActive
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : isCompleted
                    ? 'border-zinc-300 bg-zinc-100 text-zinc-900'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                    isActive
                      ? 'bg-white text-zinc-950'
                      : isCompleted
                      ? 'bg-zinc-800 text-white'
                      : 'bg-zinc-200 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={13} /> : s.num}
                </span>
                <span className="truncate font-medium">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-3.5 rounded-lg bg-zinc-100 border border-zinc-400 text-zinc-950 text-xs flex items-center gap-2.5">
          <AlertCircle size={15} className="shrink-0 text-zinc-700" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Mode, Tujuan & Kategori */}
      {step === 1 && (
        <div className="space-y-6 bg-white rounded-xl p-6 border border-zinc-200">
          {/* Sub-section 1: Mode Pengirim */}
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
              1. Mode identitas pengirim
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Transparan */}
              <div
                onClick={() => setIsAnonymous(false)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer flex items-start gap-3.5 ${
                  !isAnonymous
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                    !isAnonymous ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  <UserCheck size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-medium text-zinc-950">Nama Saya</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      Transparan
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Nama dan NIM dicantumkan resmi untuk mempermudah klarifikasi dan koordinasi langsung.
                  </p>
                </div>
              </div>

              {/* Option: Anonim */}
              <div
                onClick={() => setIsAnonymous(true)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer flex items-start gap-3.5 ${
                  isAnonymous
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                    isAnonymous ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  <EyeOff size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-medium text-zinc-950">Kirim Anonim</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      Disensor
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Identitas pelapor disembunyikan total dari pihak dosen dan peninjau. Tetap terlacak di dasbor Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-section 2: Tingkat Tujuan */}
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
              2. Tingkat tujuan aspirasi
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'JURUSAN',
                  title: 'Jurusan / Prodi',
                  sub: 'Teknik Informatika',
                  badge: 'Kaprodi & Dosen',
                },
                {
                  id: 'FAKULTAS',
                  title: 'Fakultas',
                  sub: 'Sains dan Teknologi',
                  badge: 'Dekanat & TU',
                },
                {
                  id: 'UNIVERSITAS',
                  title: 'Universitas',
                  sub: 'UIN Syarif Hidayatullah',
                  badge: 'Rektorat & Biro',
                },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTargetLevel(t.id as any)}
                  className={`p-3.5 rounded-lg border transition-colors cursor-pointer text-center ${
                    targetLevel === t.id
                      ? 'border-zinc-900 bg-zinc-50'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    {t.badge}
                  </span>
                  <h4 className="text-xs font-medium text-zinc-950 mt-2">{t.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section 3: Kategori Aspirasi */}
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
              3. Kategori aspirasi
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categoriesList.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <h4 className="text-xs font-medium text-zinc-950 mb-1">
                      {cat.category_name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2">
                      {cat.description || 'Topik terkait'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
            >
              <span>Lanjut ke detail kejadian</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Detail Kejadian */}
      {step === 2 && (
        <div className="space-y-5 bg-white rounded-xl p-6 border border-zinc-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-700">
                Judul aspirasi / pengaduan <span className="text-zinc-400">*</span>
              </label>
              <span className={`text-[11px] font-mono ${title.length > 110 ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                {title.length}/120
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              placeholder="Contoh: AC di Ruang Lab Komputer 3 Rusak dan Panas"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-700">
                Uraian lengkap kejadian <span className="text-zinc-400">*</span>
              </label>
              <span className={`text-[11px] font-mono ${description.length > 1900 ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                {description.length}/2000
              </span>
            </div>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
              placeholder="Ceritakan kejadian, kronologi, dampak terhadap proses belajar, atau saran konkrit yang diharapkan..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors resize-y leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Tanggal kejadian <span className="text-zinc-400">*</span>
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Waktu kejadian <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  placeholder="Contoh: 13:30 WIB atau Siang Hari"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
            >
              <span>Lanjut ke bukti & konfirmasi</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Bukti & Kirim */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ringkasan Laporan Box */}
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-3">
              Ringkasan laporan
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs mb-4">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Tujuan:</span>
                <span className="font-medium text-zinc-800">{getTargetTitle(targetLevel)}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Kategori:</span>
                <span className="font-medium text-zinc-800">{selectedCategoryObj?.category_name}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Mode Identitas:</span>
                <span className="font-medium text-zinc-800">
                  {isAnonymous ? 'Anonim' : 'Nama saya'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Waktu Kejadian:</span>
                <span className="font-medium text-zinc-800">{incidentDate} • {incidentTime}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
              <span className="text-zinc-400 block text-[10px] uppercase font-mono mb-1">Judul:</span>
              <p className="font-medium text-zinc-950 mb-2">{title}</p>
              <span className="text-zinc-400 block text-[10px] uppercase font-mono mb-1">Uraian:</span>
              <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>
          </div>

          {/* Bukti Pendukung Upload Area */}
          <div className="bg-white rounded-xl p-6 border border-zinc-200">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
              Bukti pendukung <span className="text-zinc-400 lowercase">(opsional)</span>
            </span>
            <p className="text-xs text-zinc-500 mb-3">
              Unggah foto kondisi fasilitas atau dokumen bukti (JPG, PNG, atau PDF maksimal 5MB).
            </p>

            {selectedFile ? (
              <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-zinc-200 text-zinc-700 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-900 max-w-xs truncate">{selectedFile.name}</p>
                    <p className="text-[11px] font-mono text-zinc-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-zinc-50/50">
                <UploadCloud size={28} className="text-zinc-500 mb-2" />
                <span className="text-xs font-medium text-zinc-900">
                  Pilih file atau seret ke area ini
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                  JPG, PNG, PDF (maksimal 5 MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Konfirmasi Tanggung Jawab */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 w-4 h-4"
              />
              <span className="text-xs text-zinc-700 leading-relaxed">
                Saya menyatakan dengan sungguh-sungguh bahwa seluruh informasi dan bukti yang disampaikan adalah benar, objektif, dapat dipertanggungjawabkan, serta tidak memuat unsur fitnah di lingkungan civitas akademika UIN Syarif Hidayatullah Jakarta.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>
            <button
              type="submit"
              disabled={loading || !isAgreed}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Mengirimkan...</span>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Kirim aspirasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AjukanAspirasiPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs font-mono text-zinc-400">Memuat formulir pengaduan...</div>}>
      <AjukanAspirasiForm />
    </Suspense>
  );
}
