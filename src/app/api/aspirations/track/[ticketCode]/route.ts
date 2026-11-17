import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, getClientIp, sanitizeText } from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  try {
    const clientIp = getClientIp(request.headers);
    // Rate limit: max 30 tracking queries per IP per minute (anti-enumeration)
    const rateCheck = checkRateLimit(`track_${clientIp}`, 30, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan pelacakan. Tunggu ${rateCheck.retryAfterSeconds} detik.` },
        { status: 429 }
      );
    }

    const { ticketCode } = await params;
    const cleanCode = sanitizeText(ticketCode).toUpperCase();

    // Validate format: ASP-YYYY-XXXXXX (max 20 chars, alphanumeric with dashes)
    if (!cleanCode || cleanCode.length > 20 || !/^ASP-\d{4}-[A-Z0-9]{4,10}$/.test(cleanCode)) {
      return NextResponse.json(
        { error: 'Format kode tiket tidak valid. Format resmi: ASP-YYYY-XXXXXX' },
        { status: 400 }
      );
    }

    const aspiration = await prisma.aspiration.findUnique({
      where: { ticket_code: cleanCode },
      select: {
        id: true,
        ticket_code: true,
        title: true,
        description: true,
        target_level: true,
        current_status: true,
        incident_date: true,
        incident_time: true,
        created_at: true,
        updated_at: true,
        is_anonymous: true,
        drive_link: true,
        attachments: {
          select: {
            id: true,
            file_name: true,
            file_path: true,
            file_type: true,
            file_size: true,
          },
        },
        category: {
          select: {
            id: true,
            category_name: true,
          },
        },
        status_logs: {
          select: {
            id: true,
            status: true,
            note: true,
            updated_by_name: true,
            changed_at: true,
          },
          orderBy: { changed_at: 'asc' },
        },
        responses: {
          select: {
            id: true,
            response_text: true,
            responded_at: true,
            responder: {
              select: {
                name: true,
                role: true,
                scope_level: true,
              },
            },
          },
          orderBy: { responded_at: 'asc' },
        },
      },
    });

    if (!aspiration) {
      return NextResponse.json(
        { error: `Aspirasi dengan kode tiket "${cleanCode}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ aspiration });
  } catch (error) {
    console.error('Track aspiration error:', error);
    return NextResponse.json(
      { error: 'Gagal melacak aspirasi.' },
      { status: 500 }
    );
  }
}
