import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [totalAspirations, totalUsers, responded, resolved, firstResponses] =
    await Promise.all([
      prisma.aspiration.count(),
      prisma.user.count(),
      prisma.aspiration.count({ where: { responses: { some: {} } } }),
      prisma.aspiration.count({ where: { current_status: 'SELESAI' } }),
      prisma.aspiration.findMany({
        where: { responses: { some: {} } },
        select: {
          created_at: true,
          responses: {
            orderBy: { responded_at: 'asc' },
            take: 1,
            select: { responded_at: true },
          },
        },
      }),
    ]);

  const responseHours = firstResponses
    .map((a) => {
      const first = a.responses[0];
      if (!first) return null;
      return (first.responded_at.getTime() - a.created_at.getTime()) / 3_600_000;
    })
    .filter((h): h is number => h !== null && h >= 0);

  const avgFirstResponseHours =
    responseHours.length > 0
      ? Math.round((responseHours.reduce((s, h) => s + h, 0) / responseHours.length) * 10) / 10
      : null;

  return NextResponse.json({
    totalAspirations,
    totalUsers,
    respondedPercent:
      totalAspirations > 0 ? Math.round((responded / totalAspirations) * 1000) / 10 : 0,
    resolvedPercent:
      totalAspirations > 0 ? Math.round((resolved / totalAspirations) * 1000) / 10 : 0,
    avgFirstResponseHours,
  });
}