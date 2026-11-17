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
  Link as LinkIcon,
  Plus,
} from 'lucide-react';

function AjukanAspirasiForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get('kategori') || '';

  // 2-Step Form Flow:
  // Step 1: Mode Identitas, Tingkat Tujuan & Kategori
  // Step 2: Detail Kejadian, Bukti Pendukung (File + Google Drive), & Konfirmasi Kirim
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  // Step 1: Mode, Tujuan & Kategori
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [targetLevel, setTargetLevel] = useState<'JURUSAN' | 'FAKULTAS' | 'UNIVERSITAS'>('JURUSAN');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Step 2: Detail Kejadian & Bukti
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('10:00 WIB');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [driveLink, setDriveLink] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
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

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleFilesAdded = (files: FileList | File[]) => {
    setError(null);
    const newFiles = Array.from(files);
    if (!newFiles.length) return;

    if (selectedFiles.length + newFiles.length > MAX_FILES) {
      setError(`Maksimal ${MAX_FILES} file bukti yang dapat diunggah.`);
      return;
    }

    const validNewFiles: File[] = [];
    const validExtensions = /\.(jpe?g|png|pdf|webp)$/i;

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" melebihi batas maksimal 10MB.`);
        return;
      }

      const isValidMime = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'application/pdf',
      ].includes(file.type);
      const isValidExt = validExtensions.test(file.name);

      if (!isValidMime && !isValidExt) {
        setError(`File "${file.name}" tidak valid. Hanya JPG, PNG, PDF, atau WEBP yang diperbolehkan.`);
        return;
      }

      validNewFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validNewFiles]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesAdded(e.target.files);
    }
    // Reset value so user can re-select the same file if needed
    e.target.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const validateStep1 = () => {
    if (!targetLevel || !categoryId) {
      setError('Silakan pilih mode pengirim, tingkat tujuan, dan kategori aspirasi.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
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
    if (!title.trim()) {
      setError('Judul aspirasi wajib diisi.');
      return;
    }
    if (title.length > 120) {
      setError('Judul aspirasi maksimal 120 karakter.');
      return;
    }
    if (!description.trim()) {
      setError('Uraian lengkap kejadian wajib diisi.');
      return;
    }
    if (description.length > 2000) {
      setError('Uraian kejadian maksimal 2000 karakter.');
      return;
    }
    if (!incidentDate) {
      setError('Tanggal kejadian wajib diisi.');
      return;
    }
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
      if (driveLink.trim()) {
        formData.append('drive_link', driveLink.trim());
      }

      // Append all selected files
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border border-zinc-200 bg-white rounded-xl p-6 mb-6">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">
          Formulir Pengaduan Mahasiswa
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Ajukan Aspirasi Baru
        </h1>
        <p className="text-sm text-zinc-600 mt-1 max-w-xl">
          Sampaikan keluhan, kritik, atau saran konstruktif dengan format terstruktur, bukti pendukung, dan perlindungan privasi transparan maupun anonim.
        </p>
      </div>

      {/* Step Indicator - Ringkas 2 Langkah */}
      <div className="bg-white rounded-xl p-4 border border-zinc-200 mb-6">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { num: 1, label: 'Mode & Kategori' },
            { num: 2, label: 'Detail & Bukti Aspirasi' },
          ].map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;

            return (
              <div
                key={s.num}
                className={`p-3 rounded-lg border transition-colors flex items-center gap-2.5 ${
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

      {/* STEP 1: Mode Pengirim, Tujuan & Kategori */}
      {step === 1 && (
        <div className="space-y-6 bg-white rounded-xl p-6 border border-zinc-200">
          {/* Sub-section 1: Mode Identitas */}
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
              1. Pilih mode privasi pengirim
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setIsAnonymous(false)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  !isAnonymous
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${!isAnonymous ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-zinc-950">Pakai Nama Saya</h3>
                    <span className="text-[10px] font-mono text-zinc-500">Transparan</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Identitas resmi (Nama & NIM) ditampilkan kepada peninjau untuk memudahkan klarifikasi langsung.
                </p>
              </div>

              <div
                onClick={() => setIsAnonymous(true)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  isAnonymous
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isAnonymous ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                    <EyeOff size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-zinc-950">Kirim Anonim</h3>
                    <span className="text-[10px] font-mono text-zinc-500">Privasi 100%</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Sistem menyamarkan nama dan NIM menjadi Anonim untuk melindungi privasi Anda seutuhnya.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-section 2: Tingkat Penanganan */}
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
              2. Tingkat penanganan tujuan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'JURUSAN',
                  title: 'Jurusan / Prodi',
                  sub: 'Teknik Informatika',
                  badge: 'Kaprodi & Sekprodi',
                },
                {
                  id: 'FAKULTAS',
                  title: 'Fakultas (FST)',
                  sub: 'Sains dan Teknologi',
                  badge: 'Dekanat & Bagian Umum',
                },
                {
                  id: 'UNIVERSITAS',
                  title: 'Universitas',
                  sub: 'UIN Jakarta',
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
              <span>Lanjut ke detail & bukti</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Detail Kejadian, Bukti Pendukung (File + Google Drive), & Konfirmasi Kirim */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Detail Kejadian Card */}
          <div className="space-y-5 bg-white rounded-xl p-6 border border-zinc-200">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
              1. Isi dan uraian aspirasi
            </span>

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
                required
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
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                placeholder="Ceritakan kejadian, kronologi, dampak terhadap proses belajar, atau saran konkrit yang diharapkan..."
                required
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
                    required
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
          </div>

          {/* Bukti Pendukung Card: Upload File (Maks 5, 10MB) + Link Google Drive */}
          <div className="space-y-4 bg-white rounded-xl p-6 border border-zinc-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-0.5">
                  2. Bukti pendukung aspirasi <span className="text-zinc-400 lowercase">(opsional)</span>
                </span>
                <p className="text-xs text-zinc-600">
                  Unggah berkas foto/dokumen (maksimal 5 file, maks 10MB per file) atau cantumkan tautan Google Drive.
                </p>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                {selectedFiles.length}/{MAX_FILES} file
              </span>
            </div>

            {/* Upload Area */}
            {selectedFiles.length < MAX_FILES && (
              <label className="border border-dashed border-zinc-300 hover:border-zinc-500 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-zinc-50/50">
                <UploadCloud size={24} className="text-zinc-500 mb-1.5" />
                <span className="text-xs font-medium text-zinc-900">
                  Pilih berkas bukti atau seret ke area ini
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                  JPG, JPEG, PNG, PDF, WEBP (maks. 10 MB per berkas)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-zinc-500 block">
                  Daftar berkas terlampir:
                </span>
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0">
                        <FileText size={15} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-zinc-900 truncate max-w-xs sm:max-w-md">
                          {file.name}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'dokumen'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      title="Hapus berkas ini"
                      className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Google Drive Link Field */}
            <div className="pt-2 border-t border-zinc-100">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Tautan Google Drive / Cloud Storage <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/... atau tautan cloud lainnya"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Gunakan jika Anda ingin menyertakan lebih dari 5 bukti atau berkas berukuran besar. Pastikan izin akses tautan Google Drive disetel ke <em>&quot;Siapa saja yang memiliki tautan dapat melihat&quot;</em>.
              </p>
            </div>
          </div>

          {/* Konfirmasi Tanggung Jawab */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-zinc-700 leading-relaxed">
                Saya menyatakan dengan sungguh-sungguh bahwa seluruh informasi dan bukti yang disampaikan adalah benar, objektif, dapat dipertanggungjawabkan, serta tidak memuat unsur fitnah di lingkungan civitas akademika UIN Syarif Hidayatullah Jakarta.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>
            <button
              type="submit"
              disabled={loading || !isAgreed}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirimkan aspirasi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Kirim aspirasi sekarang</span>
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
