import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AspirationStatus } from '@prisma/client';
import { sanitizeText } from '@/lib/security';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  try {
    const { ticketCode } = await params;
    const cleanTicketCode = sanitizeText(ticketCode).toUpperCase();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const aspiration = await prisma.aspiration.findUnique({
      where: { ticket_code: cleanTicketCode },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            nim_nip: true,
            email: true,
          },
        },
        attachments: true,
        status_logs: {
          orderBy: { changed_at: 'asc' },
        },
        responses: {
          include: {
            responder: {
              select: {
                id: true,
                name: true,
                nim_nip: true,
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
      return NextResponse.json({ error: 'Aspirasi dengan kode tersebut tidak ditemukan.' }, { status: 404 });
    }

    // Role check: Mahasiswa can strictly only view their own aspirations (IDOR Prevention)
    if (session.role === 'MAHASISWA' && aspiration.user_id !== session.id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki hak akses untuk melihat aspirasi ini.' },
        { status: 403 }
      );
    }

    // Strict Privacy: censor user info if anonymous for AKADEMISI
    if (aspiration.is_anonymous && session.role === 'AKADEMISI') {
      return NextResponse.json({
        aspiration: {
          ...aspiration,
          user: {
            id: 'ANONYMOUS',
            name: 'Mahasiswa (Anonim)',
            nim_nip: '******',
            email: null,
          },
        },
      });
    }

    return NextResponse.json({ aspiration });
  } catch (error) {
    console.error('Fetch aspiration detail error:', error);
    return NextResponse.json({ error: 'Gagal memuat detail aspirasi.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  try {
    const { ticketCode } = await params;
    const cleanTicketCode = sanitizeText(ticketCode).toUpperCase();
    const session = await getSession();

    if (!session || (session.role !== 'AKADEMISI' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Hanya akademisi atau admin yang dapat menindaklanjuti aspirasi.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, note, response_text } = body;

    const validStatuses: AspirationStatus[] = ['DITERIMA', 'DIPROSES', 'DITINDAKLANJUTI', 'SELESAI'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
    }

    const aspiration = await prisma.aspiration.findUnique({
      where: { ticket_code: cleanTicketCode },
    });

    if (!aspiration) {
      return NextResponse.json({ error: 'Aspirasi tidak ditemukan.' }, { status: 404 });
    }

    // Scope-based RBAC verification for AKADEMISI
    if (session.role === 'AKADEMISI' && session.scope_level) {
      if (session.scope_level !== aspiration.target_level) {
        return NextResponse.json(
          {
            error: `Akses ditolak: Kewenangan akun Anda adalah unit ${session.scope_level}, sedangkan aspirasi ini ditujukan untuk unit ${aspiration.target_level}.`,
          },
          { status: 403 }
        );
      }
    }

    // Update status and create status log
    const updatedStatus = status || aspiration.current_status;
    const cleanNote = note ? sanitizeText(note).substring(0, 1000) : '';
    const cleanResponseText = response_text ? sanitizeText(response_text).substring(0, 2000) : '';

    const logNote =
      cleanNote ||
      cleanResponseText ||
      `Status diperbarui menjadi ${updatedStatus} oleh ${session.name}`;

    const updatedAspiration = await prisma.$transaction(async (tx) => {
      // 1. Update aspiration
      const updated = await tx.aspiration.update({
        where: { id: aspiration.id },
        data: {
          current_status: updatedStatus,
        },
      });

      // 2. Create Status Log
      await tx.statusLog.create({
        data: {
          aspiration_id: aspiration.id,
          status: updatedStatus,
          note: logNote,
          updated_by_name: session.name,
        },
      });

      // 3. Create Official Response if provided
      if (cleanResponseText.length > 0) {
        await tx.response.create({
          data: {
            aspiration_id: aspiration.id,
            responder_id: session.id,
            response_text: cleanResponseText,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: 'Status dan tanggapan resmi berhasil diperbarui.',
      aspiration: updatedAspiration,
    });
  } catch (error) {
    console.error('Update aspiration error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui status aspirasi.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  try {
    const { ticketCode } = await params;
    const cleanTicketCode = sanitizeText(ticketCode).toUpperCase();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const aspiration = await prisma.aspiration.findUnique({
      where: { ticket_code: cleanTicketCode },
      include: { attachments: true },
    });

    if (!aspiration) {
      return NextResponse.json(
        { error: 'Aspirasi tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Role check & Anti-IDOR:
    // Mahasiswa can only delete their OWN aspiration
    // Admin can delete any aspiration
    if (session.role === 'MAHASISWA' && aspiration.user_id !== session.id) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda hanya dapat menghapus aspirasi milik Anda sendiri.' },
        { status: 403 }
      );
    }

    if (session.role !== 'MAHASISWA' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Hanya mahasiswa pemilik aspirasi atau admin yang dapat menghapus aspirasi.' },
        { status: 403 }
      );
    }

    // Delete uploaded files on disk
    if (aspiration.attachments && aspiration.attachments.length > 0) {
      for (const att of aspiration.attachments) {
        try {
          if (att.file_path && att.file_path.startsWith('/uploads/')) {
            const fileName = path.basename(att.file_path);
            const fullPath = path.join(process.cwd(), 'public', 'uploads', fileName);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        } catch (unlinkErr) {
          console.error('Failed to unlink file:', unlinkErr);
        }
      }
    }

    // Delete from database
    await prisma.aspiration.delete({
      where: { id: aspiration.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Aspirasi berhasil dihapus.',
    });
  } catch (error) {
    console.error('Delete aspiration error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus aspirasi.' },
      { status: 500 }
    );
  }
}
