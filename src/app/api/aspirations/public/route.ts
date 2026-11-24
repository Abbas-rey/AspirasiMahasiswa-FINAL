import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/security';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 6;

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateCheck = checkRateLimit(`public_board_${clientIp}`, 60, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Tunggu ${rateCheck.retryAfterSeconds} detik.` },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

    const where = { current_status: 'SELESAI' as const };

    const [total, rows] = await Promise.all([
      prisma.aspiration.count({ where }),
      prisma.aspiration.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          ticket_code: true,
          title: true,
          target_level: true,
          current_status: true,
          is_anonymous: true,
          category: { select: { category_name: true } },
          status_logs: {
            where: { status: 'SELESAI' },
            orderBy: { changed_at: 'desc' },
            take: 1,
            select: { changed_at: true },
          },
        },
      }),
    ]);

    const items = rows.map(({ status_logs, ...rest }) => ({
      ...rest,
      resolved_at: status_logs[0]?.changed_at ?? null,
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (error) {
    console.error('Public aspiration board error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat papan aspirasi.' },
      { status: 500 }
    );
  }
}