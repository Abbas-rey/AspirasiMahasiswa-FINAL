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
    badgeClass: 'bg-white text-zinc-600 border-zinc-300',
    bgClass: 'bg-zinc-400',
    textClass: 'text-zinc-600',
    borderClass: 'border-zinc-300',
    dotClass: 'bg-zinc-400',
    hex: '#A1A1AA',
  },
  DIPROSES: {
    label: 'Diproses',
    description: 'Aspirasi sedang ditelaah dan dikoordinasikan oleh pihak terkait.',
    badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    bgClass: 'bg-zinc-500',
    textClass: 'text-zinc-700',
    borderClass: 'border-zinc-300',
    dotClass: 'bg-zinc-500',
    hex: '#71717A',
  },
  DITINDAKLANJUTI: {
    label: 'Ditindaklanjuti',
    description: 'Langkah penyelesaian nyata sedang dieksekusi di lapangan.',
    badgeClass: 'bg-zinc-200 text-zinc-900 border-zinc-400',
    bgClass: 'bg-zinc-700',
    textClass: 'text-zinc-800',
    borderClass: 'border-zinc-400',
    dotClass: 'bg-zinc-700',
    hex: '#3F3F46',
  },
  SELESAI: {
    label: 'Selesai',
    description: 'Aspirasi telah diselesaikan dan tanggapan tuntas diberikan.',
    badgeClass: 'bg-zinc-900 text-white border-zinc-900',
    bgClass: 'bg-zinc-900',
    textClass: 'text-zinc-900',
    borderClass: 'border-zinc-200',
    dotClass: 'bg-white',
    hex: '#18181B',
  },
};

export const TARGET_LEVEL_LABELS: Record<TargetLevel, { label: string; full: string; badge: string }> = {
  JURUSAN: {
    label: 'Jurusan / Prodi',
    full: 'Tingkat Jurusan / Program Studi (Teknik Informatika)',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  FAKULTAS: {
    label: 'Fakultas',
    full: 'Tingkat Fakultas (Sains dan Teknologi)',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  UNIVERSITAS: {
    label: 'Universitas',
    full: 'Tingkat Universitas (UIN Syarif Hidayatullah Jakarta)',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
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
