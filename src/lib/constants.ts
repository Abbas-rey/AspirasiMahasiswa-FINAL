import { AspirationStatus, TargetLevel } from '@prisma/client';

export const STATUS_META: Record<
  AspirationStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
    hex: string;
  }
> = {
  DITERIMA: {
    label: 'Diterima',
    description: 'Aspirasi telah masuk ke dalam sistem dan terverifikasi.',
    badgeClass: 'bg-[#BFD8E3]/35 text-[#004A6B] border-[#8CB9CC]/70',
    bgClass: 'bg-[#BFD8E3]',
    textClass: 'text-[#004A6B]',
    borderClass: 'border-[#8CB9CC]',
    dotClass: 'bg-[#00638E]',
    hex: '#00638E',
  },
  DIPROSES: {
    label: 'Diproses',
    description: 'Aspirasi sedang ditelaah dan dikoordinasikan oleh pihak terkait.',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    bgClass: 'bg-amber-400',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300',
    dotClass: 'bg-amber-500',
    hex: '#D97706',
  },
  DITINDAKLANJUTI: {
    label: 'Ditindaklanjuti',
    description: 'Langkah penyelesaian nyata sedang dieksekusi di lapangan.',
    badgeClass: 'bg-sky-50 text-[#004A6B] border-sky-300',
    bgClass: 'bg-[#00638E]',
    textClass: 'text-[#004A6B]',
    borderClass: 'border-sky-300',
    dotClass: 'bg-[#00638E]',
    hex: '#00638E',
  },
  SELESAI: {
    label: 'Selesai',
    description: 'Aspirasi telah diselesaikan dan tanggapan tuntas diberikan.',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    bgClass: 'bg-emerald-600',
    textClass: 'text-emerald-900',
    borderClass: 'border-emerald-300',
    dotClass: 'bg-emerald-600',
    hex: '#059669',
  },
};

export const TARGET_LEVEL_LABELS: Record<TargetLevel, { label: string; full: string; badge: string }> = {
  JURUSAN: {
    label: 'Jurusan / Prodi',
    full: 'Tingkat Jurusan / Program Studi (Teknik Informatika)',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  FAKULTAS: {
    label: 'Fakultas',
    full: 'Tingkat Fakultas (Sains dan Teknologi)',
    badge: 'bg-[#BFD8E3]/30 text-[#004A6B] border-[#8CB9CC]/50',
  },
  UNIVERSITAS: {
    label: 'Universitas',
    full: 'Tingkat Universitas (UIN Syarif Hidayatullah Jakarta)',
    badge: 'bg-[#004A6B]/10 text-[#004A6B] border-[#004A6B]/20',
  },
};

export const CATEGORY_ICONS: Record<string, { icon: string; subtitle: string }> = {
  Akademik: {
    icon: 'GraduationCap',
    subtitle: 'Kurikulum, perkuliahan, jadwal, dan KRS',
  },
  Dosen: {
    icon: 'Users',
    subtitle: 'Pengajaran, bimbingan, dan komunikasi dosen',
  },
  Fasilitas: {
    icon: 'Building2',
    subtitle: 'Ruang kelas, laboratorium, proyektor, dan AC',
  },
  Administrasi: {
    icon: 'FileText',
    subtitle: 'Layanan TU, surat rekomendasi, dan berkas',
  },
  'Sarana Prasarana': {
    icon: 'Wrench',
    subtitle: 'Toilet, musholla, parkiran, dan kebersihan',
  },
  Lainnya: {
    icon: 'HelpCircle',
    subtitle: 'Saran umum dan topik kampus lainnya',
  },
};
