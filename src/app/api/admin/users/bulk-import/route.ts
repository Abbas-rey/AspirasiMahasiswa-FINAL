import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getDefaultPassword } from '@/lib/utils';
import { Role, TargetLevel } from '@prisma/client';
import { sanitizeText } from '@/lib/security';

const MAX_BULK_LIMIT = 500;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 });
    }

    const body = await request.json();
    let records: Array<{
      nim_nip: string;
      name: string;
      role: Role;
      scope_level?: TargetLevel | null;
      email?: string | null;
    }> = [];

    if (body.users && Array.isArray(body.users)) {
      records = body.users;
    } else if (body.csv_content && typeof body.csv_content === 'string') {
      // Parse CSV
      const lines = body.csv_content.trim().split(/\r?\n/);
      if (lines.length <= 1) {
        return NextResponse.json({ error: 'Data CSV kosong atau tidak memiliki baris data.' }, { status: 400 });
      }

      const header = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
      const nimIdx = header.findIndex((h: string) => h === 'nim' || h === 'nip' || h === 'nim_nip');
      const nameIdx = header.findIndex((h: string) => h === 'nama' || h === 'name');
      const roleIdx = header.findIndex((h: string) => h === 'role');
      const scopeIdx = header.findIndex((h: string) => h === 'scope' || h === 'scope_level' || h === 'unit');
      const emailIdx = header.findIndex((h: string) => h === 'email');

      if (nimIdx === -1 || nameIdx === -1) {
        return NextResponse.json(
          { error: 'Header CSV wajib memiliki kolom "nim_nip" (atau "nim"/"nip") dan "name" (atau "nama").' },
          { status: 400 }
        );
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map((c: string) => c.trim().replace(/^["']|["']$/g, ''));
        const nim_nip = cols[nimIdx];
        const name = cols[nameIdx];
        let role: Role = 'MAHASISWA';

        if (roleIdx !== -1 && cols[roleIdx]) {
          const rUpper = cols[roleIdx].toUpperCase();
          if (rUpper === 'AKADEMISI' || rUpper === 'DOSEN') role = 'AKADEMISI';
          else if (rUpper === 'ADMIN') role = 'ADMIN';
        }

        let scope_level: TargetLevel | null = null;
        if (scopeIdx !== -1 && cols[scopeIdx]) {
          const sUpper = cols[scopeIdx].toUpperCase();
          if (sUpper.includes('JURUSAN') || sUpper.includes('PRODI')) scope_level = 'JURUSAN';
          else if (sUpper.includes('FAKULTAS')) scope_level = 'FAKULTAS';
          else if (sUpper.includes('UNIVERSITAS') || sUpper.includes('PUSAT')) scope_level = 'UNIVERSITAS';
        }

        const email = emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : null;

        if (nim_nip && name) {
          records.push({ nim_nip, name, role, scope_level, email });
        }
      }
    }

    if (records.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data valid yang ditemukan untuk diimpor.' }, { status: 400 });
    }

    // Protection against Resource / Memory Exhaustion (DoS)
    if (records.length > MAX_BULK_LIMIT) {
      return NextResponse.json(
        { error: `Jumlah data impor maksimal ${MAX_BULK_LIMIT} baris per transaksi.` },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    const salt = await bcrypt.genSalt(10);

    for (const item of records) {
      const cleanNimNip = sanitizeText(item.nim_nip);
      const cleanName = sanitizeText(item.name);
      const cleanEmail = item.email ? sanitizeText(item.email).toLowerCase() : null;

      if (!cleanNimNip || !cleanName) {
        skippedCount++;
        continue;
      }

      const existing = await prisma.user.findUnique({
        where: { nim_nip: cleanNimNip },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      try {
        const defaultPassword = getDefaultPassword(cleanNimNip);
        const password_hash = await bcrypt.hash(defaultPassword, salt);

        await prisma.user.create({
          data: {
            nim_nip: cleanNimNip,
            name: cleanName,
            email: cleanEmail,
            role: item.role || 'MAHASISWA',
            scope_level: item.scope_level || null,
            password_hash,
            must_change_pwd: true,
          },
        });
        importedCount++;
      } catch (err: any) {
        skippedCount++;
        // Sanitized error message: Never leak raw database error strings to client
        errors.push(`Gagal menambahkan ${cleanNimNip}: Data tidak valid atau terjadi konflik email.`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Impor massal selesai: ${importedCount} user ditambahkan, ${skippedCount} dilewati.`,
      imported: importedCount,
      skipped: skippedCount,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Gagal memproses impor massal user.' }, { status: 500 });
  }
}
