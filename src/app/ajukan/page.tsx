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
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    description?: string;
    incidentDate?: string;
  }>({});
  const errorRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll smooth to error banner whenever error state appears
  useEffect(() => {
    if (error) {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [error]);

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
  const [isDragging, setIsDragging] = useState(false);

  const handleChoiceKey = (e: React.KeyboardEvent, select: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select();
    }
  };

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
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // Exactly 10 MiB (10.485.760 bytes)

  const handleFilesAdded = (files: FileList | File[]) => {
    setError(null);
    const newFiles = Array.from(files);
    if (!newFiles.length) return;

    if (selectedFiles.length + newFiles.length > MAX_FILES) {
      setError(`Maksimal ${MAX_FILES} file bukti yang dapat diunggah.`);
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    const validNewFiles: File[] = [];
    const validExtensions = /\.(jpe?g|png|pdf|webp)$/i;

    for (const file of newFiles) {
      // Strictly greater than: files of exactly 10MB (10.485.760 bytes) are accepted
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" melebihi batas maksimal 10MB (10.485.760 bytes).`);
        setTimeout(() => {
          errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
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
        setTimeout(() => {
          errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
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
      setError('Silakan pilih mode pengirim, tingkat tujuan, dan kategori aspirasi terlebih dahulu.');
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
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

    const errors: { title?: string; description?: string; incidentDate?: string } = {};

    if (!title.trim()) {
      errors.title = 'Silakan diisi terlebih dahulu';
    } else if (title.trim().length > 120) {
      errors.title = 'Judul aspirasi maksimal 120 karakter.';
    }

    if (!description.trim()) {
      errors.description = 'Silakan diisi terlebih dahulu';
    } else if (description.trim().length > 2000) {
      errors.description = 'Uraian kejadian maksimal 2000 karakter.';
    }

    if (!incidentDate) {
      errors.incidentDate = 'Silakan diisi terlebih dahulu';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Mohon lengkapi seluruh kolom wajib yang masih kosong (ditandai garis tebal dan pesan di bawah kolom).');
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    if (!isAgreed) {
      setError('Anda wajib mencentang konfirmasi tanggung jawab sebelum mengirim laporan.');
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setFieldErrors({});
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
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
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
                    ? 'border-[#00638E] bg-[#00638E] text-white shadow-xs'
                    : isCompleted
                    ? 'border-[#8CB9CC]/50 bg-[#BFD8E3]/30 text-[#004A6B]'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-500'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center font-mono text-xs font-medium shrink-0 ${
                    isActive
                      ? 'bg-white text-[#00638E]'
                      : isCompleted
                      ? 'bg-[#00638E] text-white'
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

      {/* Error alert with auto-scroll ref */}
      {error && (
        <div
          ref={errorRef}
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-950">Perhatian / Kendala Pengajuan:</p>
            <p className="mt-0.5 text-red-800 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* STEP 1: Mode Pengirim, Tujuan & Kategori */}
      {step === 1 && (
        <div className="space-y-6 bg-white rounded-xl p-6 border border-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Sub-section 1: Mode Identitas */}
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2.5">
              1. Pilih mode privasi pengirim
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Mode privasi pengirim">
              <div
                role="radio"
                aria-checked={!isAnonymous}
                tabIndex={0}
                onClick={() => setIsAnonymous(false)}
                onKeyDown={(e) => handleChoiceKey(e, () => setIsAnonymous(false))}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  !isAnonymous
                    ? 'border-[#00638E] bg-[#BFD8E3]/15 ring-1 ring-[#00638E]'
                    : 'border-zinc-200 hover:border-[#00638E]/40 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${!isAnonymous ? 'bg-[#00638E] text-white shadow-xs' : 'bg-zinc-100 text-zinc-600'}`}>
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-zinc-950">Pakai Nama Saya</h3>
                    <span className="text-[10px] font-mono text-[#004A6B]">Transparan</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Identitas resmi (Nama & NIM) ditampilkan kepada peninjau untuk memudahkan klarifikasi langsung.
                </p>
              </div>

              <div
                role="radio"
                aria-checked={isAnonymous}
                tabIndex={0}
                onClick={() => setIsAnonymous(true)}
                onKeyDown={(e) => handleChoiceKey(e, () => setIsAnonymous(true))}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  isAnonymous
                    ? 'border-[#00638E] bg-[#BFD8E3]/15 ring-1 ring-[#00638E]'
                    : 'border-zinc-200 hover:border-[#00638E]/40 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${isAnonymous ? 'bg-[#00638E] text-white shadow-xs' : 'bg-zinc-100 text-zinc-600'}`}>
                    <EyeOff size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-zinc-950">Kirim Anonim</h3>
                    <span className="text-[10px] font-mono text-[#004A6B]">Privasi 100%</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Tingkat penanganan tujuan">
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
                  role="radio"
                  aria-checked={targetLevel === t.id}
                  tabIndex={0}
                  onClick={() => setTargetLevel(t.id as any)}
                  onKeyDown={(e) => handleChoiceKey(e, () => setTargetLevel(t.id as any))}
                  className={`p-3.5 rounded-lg border transition-colors cursor-pointer text-center ${
                    targetLevel === t.id
                      ? 'border-[#00638E] bg-[#BFD8E3]/15 ring-1 ring-[#00638E]'
                      : 'border-zinc-200 hover:border-[#00638E]/40 bg-white'
                  }`}
                >
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${targetLevel === t.id ? 'text-[#004A6B] bg-[#BFD8E3]/40 border-[#8CB9CC]/50 font-medium' : 'text-zinc-600 bg-zinc-100 border-zinc-200'}`}>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Kategori aspirasi">
              {categoriesList.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => setCategoryId(cat.id)}
                    onKeyDown={(e) => handleChoiceKey(e, () => setCategoryId(cat.id))}
                    className={`p-3.5 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#00638E] bg-[#BFD8E3]/15 ring-1 ring-[#00638E]'
                        : 'border-zinc-200 hover:border-[#00638E]/40 bg-white'
                    }`}
                  >
                    <h4 className={`text-xs font-medium mb-1 ${isSelected ? 'text-[#004A6B] font-semibold' : 'text-zinc-950'}`}>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00638E] hover:bg-[#004A6B] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <span>Lanjut ke detail & bukti</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Detail Kejadian, Bukti Pendukung (File + Google Drive), & Konfirmasi Kirim */}
      {step === 2 && (
        <form noValidate onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Detail Kejadian Card */}
          <div className="space-y-5 bg-white rounded-xl p-6 border border-zinc-200">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
              1. Isi dan uraian aspirasi
            </span>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="asp-title" className="block text-xs font-medium text-zinc-700">
                  Judul aspirasi / pengaduan <span className="text-red-500 font-bold">*</span>
                </label>
                <span className={`text-[11px] font-mono ${title.length > 110 ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                  {title.length}/120
                </span>
              </div>
              <input
                id="asp-title"
                type="text"
                value={title}
                aria-invalid={!!fieldErrors.title}
                aria-describedby={fieldErrors.title ? 'asp-title-error' : undefined}
                onChange={(e) => {
                  setTitle(e.target.value.slice(0, 120));
                  if (fieldErrors.title) {
                    setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="Contoh: AC di Ruang Lab Komputer 3 Rusak dan Panas"
                className={`w-full px-3 py-2 rounded-lg border text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-colors ${
                  fieldErrors.title
                    ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-zinc-200 focus:border-[#00638E] focus:ring-1 focus:ring-[#00638E]/30'
                }`}
              />
              {fieldErrors.title && (
                <p id="asp-title-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={13} className="shrink-0 text-red-500" />
                  <span>{fieldErrors.title}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="asp-description" className="block text-xs font-medium text-zinc-700">
                  Uraian lengkap kejadian <span className="text-red-500 font-bold">*</span>
                </label>
                <span className={`text-[11px] font-mono ${description.length > 1900 ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                  {description.length}/2000
                </span>
              </div>
              <textarea
                id="asp-description"
                rows={5}
                value={description}
                aria-invalid={!!fieldErrors.description}
                aria-describedby={fieldErrors.description ? 'asp-description-error' : undefined}
                onChange={(e) => {
                  setDescription(e.target.value.slice(0, 2000));
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Ceritakan kejadian, kronologi, dampak terhadap proses belajar, atau saran konkrit yang diharapkan..."
                className={`w-full px-3 py-2 rounded-lg border text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none transition-colors resize-y leading-relaxed ${
                  fieldErrors.description
                    ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-zinc-200 focus:border-[#00638E] focus:ring-1 focus:ring-[#00638E]/30'
                }`}
              />
              {fieldErrors.description && (
                <p id="asp-description-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={13} className="shrink-0 text-red-500" />
                  <span>{fieldErrors.description}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="asp-incident-date" className="block text-xs font-medium text-zinc-700 mb-1">
                  Tanggal kejadian <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="asp-incident-date"
                    type="date"
                    value={incidentDate}
                    aria-invalid={!!fieldErrors.incidentDate}
                    aria-describedby={fieldErrors.incidentDate ? 'asp-date-error' : undefined}
                    onChange={(e) => {
                      setIncidentDate(e.target.value);
                      if (fieldErrors.incidentDate) {
                        setFieldErrors((prev) => ({ ...prev, incidentDate: undefined }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs text-zinc-900 focus:outline-none transition-colors ${
                      fieldErrors.incidentDate
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-zinc-200 focus:border-[#00638E] focus:ring-1 focus:ring-[#00638E]/30'
                    }`}
                  />
                </div>
                {fieldErrors.incidentDate && (
                  <p id="asp-date-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} className="shrink-0 text-red-500" />
                    <span>{fieldErrors.incidentDate}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="asp-incident-time" className="block text-xs font-medium text-zinc-700 mb-1">
                  Waktu kejadian <span className="text-zinc-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="asp-incident-time"
                    type="text"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    placeholder="Contoh: 13:30 WIB atau Siang Hari"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#00638E] focus:ring-1 focus:ring-[#00638E]/30 transition-colors"
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
              <span className="text-[11px] font-mono text-[#004A6B] bg-[#BFD8E3]/35 px-2.5 py-1 rounded-md border border-[#8CB9CC]/50 font-medium">
                {selectedFiles.length}/{MAX_FILES} file
              </span>
            </div>

            {/* Upload Area */}
            {selectedFiles.length < MAX_FILES && (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) {
                    handleFilesAdded(e.dataTransfer.files);
                  }
                }}
                className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#00638E] bg-[#BFD8E3]/15 ring-2 ring-[#00638E]/30'
                    : 'border-zinc-300 hover:border-[#00638E]/60 bg-zinc-50/50'
                }`}
              >
                <UploadCloud size={24} className={`mb-1.5 transition-colors ${isDragging ? 'text-[#00638E]' : 'text-zinc-500'}`} />
                <span className="text-xs font-medium text-zinc-900">
                  {isDragging ? 'Lepaskan berkas di sini' : 'Pilih berkas bukti atau seret ke area ini'}
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
                      <div className="w-7 h-7 rounded bg-[#BFD8E3]/40 text-[#00638E] flex items-center justify-center shrink-0">
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
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Google Drive Link Field */}
            <div className="pt-2 border-t border-zinc-100">
              <label htmlFor="asp-drive-link" className="block text-xs font-medium text-zinc-700 mb-1">
                Tautan Google Drive / Cloud Storage <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="asp-drive-link"
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/... atau tautan cloud lainnya"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#00638E] focus:ring-1 focus:ring-[#00638E]/30 transition-colors"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Gunakan jika Anda ingin menyertakan lebih dari 5 bukti atau berkas berukuran besar. Pastikan izin akses tautan Google Drive disetel ke <em>&quot;Siapa saja yang memiliki tautan dapat melihat&quot;</em>.
              </p>
            </div>
          </div>

          {/* Konfirmasi Tanggung Jawab */}
          <div className="bg-white rounded-xl p-5 border border-zinc-200">
            <label htmlFor="asp-agree" className="flex items-start gap-3 cursor-pointer">
              <input
                id="asp-agree"
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-0.5 rounded border-zinc-300 accent-[#00638E] focus:ring-[#00638E] w-4 h-4 cursor-pointer"
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00638E] hover:bg-[#004A6B] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-xs"
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
