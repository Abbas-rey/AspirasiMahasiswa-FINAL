import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateTicketCode } from '@/lib/utils';
import { AspirationStatus, TargetLevel } from '@prisma/client';
import {
  validateFileMagicBytes,
  sanitizeFileName,
  sanitizeText,
  generateSecureId,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchRaw = searchParams.get('search') || '';
    const search = sanitizeText(searchRaw);
    const targetLevel = searchParams.get('target_level');
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');

    // Role MAHASISWA: strictly filter by their own user_id (IDOR Prevention)
    if (session.role === 'MAHASISWA') {
      const aspirations = await prisma.aspiration.findMany({
        where: {
          user_id: session.id,
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { ticket_code: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          category: true,
          attachments: true,
          status_logs: {
            orderBy: { changed_at: 'desc' },
          },
          responses: {
            include: {
              responder: {
                select: { name: true, role: true, scope_level: true },
              },
            },
            orderBy: { responded_at: 'desc' },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return NextResponse.json({ aspirations });
    }

    // Role AKADEMISI or ADMIN
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { ticket_code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validTargetLevels: TargetLevel[] = ['JURUSAN', 'FAKULTAS', 'UNIVERSITAS'];
    if (targetLevel && targetLevel !== 'ALL' && validTargetLevels.includes(targetLevel as TargetLevel)) {
      whereClause.target_level = targetLevel as TargetLevel;
    }

    if (categoryId && categoryId !== 'ALL') {
      const parsedCatId = parseInt(categoryId, 10);
      if (!isNaN(parsedCatId)) {
        whereClause.category_id = parsedCatId;
      }
    }

    const validStatuses: AspirationStatus[] = ['DITERIMA', 'DIPROSES', 'DITINDAKLANJUTI', 'SELESAI'];
    if (status && status !== 'ALL' && validStatuses.includes(status as AspirationStatus)) {
      whereClause.current_status = status as AspirationStatus;
    }

    const aspirations = await prisma.aspiration.findMany({
      where: whereClause,
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
          orderBy: { changed_at: 'desc' },
        },
        responses: {
          include: {
            responder: {
              select: { name: true, role: true, scope_level: true },
            },
          },
          orderBy: { responded_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // PRIVACY ENFORCEMENT:
    // If is_anonymous is true and requester is AKADEMISI, censor sender identity!
    const sanitizedAspirations = aspirations.map((item) => {
      if (item.is_anonymous && session.role === 'AKADEMISI') {
        return {
          ...item,
          user: {
            id: 'ANONYMOUS',
            name: 'Mahasiswa (Anonim)',
            nim_nip: '******',
            email: null,
          },
        };
      }
      return item;
    });

    return NextResponse.json({ aspirations: sanitizedAspirations });
  } catch (error) {
    console.error('Fetch aspirations error:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar aspirasi.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya mahasiswa yang dapat mengajukan aspirasi.' },
        { status: 403 }
      );
    }

    // Rate limit submission: max 5 submissions per user/IP per 5 minutes
    const clientIp = getClientIp(request.headers);
    const rateCheck = checkRateLimit(`submit_asp_${session.id}_${clientIp}`, 5, 300);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak pengajuan dalam waktu singkat. Silakan tunggu ${rateCheck.retryAfterSeconds} detik.` },
        { status: 429 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let title = '';
    let description = '';
    let incident_date_raw = '';
    let incident_time = '';
    let target_level: TargetLevel = 'JURUSAN';
    let category_id = 1;
    let is_anonymous = false;
    let drive_link = '';
    const uploadedFiles: Array<{ name: string; path: string; type: string; size: number }> = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string) || '';
      description = (formData.get('description') as string) || '';
      incident_date_raw = (formData.get('incident_date') as string) || '';
      incident_time = (formData.get('incident_time') as string) || '';
      drive_link = (formData.get('drive_link') as string) || '';
      const rawTarget = (formData.get('target_level') as string) || 'JURUSAN';
      if (['JURUSAN', 'FAKULTAS', 'UNIVERSITAS'].includes(rawTarget)) {
        target_level = rawTarget as TargetLevel;
      }
      category_id = parseInt((formData.get('category_id') as string) || '1', 10);
      is_anonymous = formData.get('is_anonymous') === 'true';

      // Support multiple files from 'files' or 'file' keys
      const rawFiles = [
        ...formData.getAll('files'),
        ...formData.getAll('file'),
      ].filter((item): item is File => item instanceof File && item.size > 0);

      // Max 5 files
      if (rawFiles.length > 5) {
        return NextResponse.json(
          { error: 'Maksimal 5 file bukti yang dapat diunggah.' },
          { status: 400 }
        );
      }

      // Max size per file: 10MB
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const file of rawFiles) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `Ukuran file "${file.name}" melebihi batas maksimal 10MB.` },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Deep file signature / magic bytes validation
        const magicValidation = validateFileMagicBytes(buffer);
        if (!magicValidation.isValid) {
          return NextResponse.json(
            { error: `Format file "${file.name}" tidak valid. Hanya JPG, PNG, PDF, atau WEBP asli yang diperbolehkan.` },
            { status: 400 }
          );
        }

        // Canonical extension derived exclusively from validated magic bytes
        const safeExt = magicValidation.ext;
        const sanitizedOriginalName = sanitizeFileName(file.name);
        const uniqueFileName = `${generateSecureId()}${safeExt}`;
        const fullPath = path.join(uploadDir, uniqueFileName);
        fs.writeFileSync(fullPath, buffer);

        uploadedFiles.push({
          name: sanitizedOriginalName,
          path: `/uploads/${uniqueFileName}`,
          type: magicValidation.mime,
          size: file.size,
        });
      }
    } else {
      const body = await request.json();
      title = body.title || '';
      description = body.description || '';
      incident_date_raw = body.incident_date || '';
      incident_time = body.incident_time || '';
      drive_link = body.drive_link || '';
      if (['JURUSAN', 'FAKULTAS', 'UNIVERSITAS'].includes(body.target_level)) {
        target_level = body.target_level as TargetLevel;
      }
      category_id = Number(body.category_id) || 1;
      is_anonymous = Boolean(body.is_anonymous);
    }

    const cleanTitle = sanitizeText(title);
    const cleanDescription = sanitizeText(description);
    const cleanIncidentTime = sanitizeText(incident_time);

    if (!cleanTitle || cleanTitle.length === 0) {
      return NextResponse.json({ error: 'Judul aspirasi wajib diisi.' }, { status: 400 });
    }
    if (cleanTitle.length > 120) {
      return NextResponse.json({ error: 'Judul aspirasi maksimal 120 karakter.' }, { status: 400 });
    }
    if (!cleanDescription || cleanDescription.length === 0) {
      return NextResponse.json({ error: 'Detail kejadian wajib diisi.' }, { status: 400 });
    }
    if (cleanDescription.length > 2000) {
      return NextResponse.json({ error: 'Detail kejadian maksimal 2000 karakter.' }, { status: 400 });
    }

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: category_id },
    });
    if (!categoryExists) {
      return NextResponse.json({ error: 'Kategori yang dipilih tidak valid.' }, { status: 400 });
    }

    // Generate unique ticket code: ASP-YYYY-XXXXXX
    let ticket_code = generateTicketCode();
    let exists = await prisma.aspiration.findUnique({ where: { ticket_code } });
    while (exists) {
      ticket_code = generateTicketCode();
      exists = await prisma.aspiration.findUnique({ where: { ticket_code } });
    }

    let cleanDriveLink = sanitizeText(drive_link);
    if (cleanDriveLink) {
      if (!/^https?:\/\//i.test(cleanDriveLink)) {
        cleanDriveLink = `https://${cleanDriveLink}`;
      }
    }

    const incidentDate = incident_date_raw ? new Date(incident_date_raw) : new Date();

    const newAspiration = await prisma.aspiration.create({
      data: {
        ticket_code,
        user_id: session.id,
        category_id,
        target_level,
        is_anonymous,
        title: cleanTitle,
        description: cleanDescription,
        incident_date: incidentDate,
        incident_time: cleanIncidentTime || 'Waktu tidak dispesifikasikan',
        current_status: 'DITERIMA',
        drive_link: cleanDriveLink || null,
        status_logs: {
          create: {
            status: 'DITERIMA',
            note: 'Aspirasi telah berhasil dikirim dan diverifikasi sistem ASMA.',
            updated_by_name: 'Sistem ASMA',
          },
        },
        ...(uploadedFiles.length > 0 && {
          attachments: {
            create: uploadedFiles.map((f) => ({
              file_name: f.name,
              file_path: f.path,
              file_type: f.type,
              file_size: f.size,
            })),
          },
        }),
      },
      include: {
        category: true,
        attachments: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Aspirasi berhasil dikirim.',
      aspiration: newAspiration,
      ticket_code: newAspiration.ticket_code,
    });
  } catch (error) {
    console.error('Submit aspiration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses aspirasi.' },
      { status: 500 }
    );
  }
}
