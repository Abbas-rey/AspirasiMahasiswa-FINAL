import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 });
    }

    const [
      totalUsers,
      totalMahasiswa,
      totalAkademisi,
      totalAdmin,
      totalAspirations,
      diterimaCount,
      diprosesCount,
      ditindaklanjutiCount,
      selesaiCount,
      jurusanCount,
      fakultasCount,
      universitasCount,
      categoriesWithCount,
      recentAspirations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MAHASISWA' } }),
      prisma.user.count({ where: { role: 'AKADEMISI' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.aspiration.count(),
      prisma.aspiration.count({ where: { current_status: 'DITERIMA' } }),
      prisma.aspiration.count({ where: { current_status: 'DIPROSES' } }),
      prisma.aspiration.count({ where: { current_status: 'DITINDAKLANJUTI' } }),
      prisma.aspiration.count({ where: { current_status: 'SELESAI' } }),
      prisma.aspiration.count({ where: { target_level: 'JURUSAN' } }),
      prisma.aspiration.count({ where: { target_level: 'FAKULTAS' } }),
      prisma.aspiration.count({ where: { target_level: 'UNIVERSITAS' } }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { aspirations: true },
          },
        },
      }),
      prisma.aspiration.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          category: true,
          user: {
            select: { name: true, nim_nip: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          mahasiswa: totalMahasiswa,
          akademisi: totalAkademisi,
          admin: totalAdmin,
        },
        aspirations: {
          total: totalAspirations,
          diterima: diterimaCount,
          diproses: diprosesCount,
          ditindaklanjuti: ditindaklanjutiCount,
          selesai: selesaiCount,
        },
        targets: {
          jurusan: jurusanCount,
          fakultas: fakultasCount,
          universitas: universitasCount,
        },
        categories: categoriesWithCount.map((c) => ({
          id: c.id,
          name: c.category_name,
          count: c._count.aspirations,
        })),
        recent: recentAspirations.map((a) => ({
          ...a,
          user: a.is_anonymous ? { name: 'Mahasiswa (Anonim)', nim_nip: '******' } : a.user,
        })),
      },
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    return NextResponse.json({ error: 'Gagal memuat statistik admin.' }, { status: 500 });
  }
}
