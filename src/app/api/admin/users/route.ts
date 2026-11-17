import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getDefaultPassword } from '@/lib/utils';
import { Role, TargetLevel } from '@prisma/client';
import { sanitizeText } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const searchRaw = searchParams.get('search') || '';
    const search = sanitizeText(searchRaw);
    const role = searchParams.get('role');

    const where: any = {};
    if (search) {
      where.OR = [
        { nim_nip: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validRoles: Role[] = ['MAHASISWA', 'AKADEMISI', 'ADMIN'];
    if (role && role !== 'ALL' && validRoles.includes(role as Role)) {
      where.role = role as Role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nim_nip: true,
        name: true,
        email: true,
        role: true,
        scope_level: true,
        must_change_pwd: true,
        created_at: true,
        _count: {
          select: { aspirations: true, responses: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data user.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 });
    }

    const body = await request.json();
    const { nim_nip, name, email, role, scope_level, custom_password } = body;

    if (!nim_nip || !name || !role) {
      return NextResponse.json(
        { error: 'NIM/NIP, Nama, dan Role wajib diisi.' },
        { status: 400 }
      );
    }

    const validRoles: Role[] = ['MAHASISWA', 'AKADEMISI', 'ADMIN'];
    if (!validRoles.includes(role as Role)) {
      return NextResponse.json(
        { error: 'Role tidak valid. Pilihan: Mahasiswa, Akademisi, Admin.' },
        { status: 400 }
      );
    }

    let cleanScopeLevel: TargetLevel | null = null;
    if (role === 'AKADEMISI' && scope_level) {
      if (['JURUSAN', 'FAKULTAS', 'UNIVERSITAS'].includes(scope_level)) {
        cleanScopeLevel = scope_level as TargetLevel;
      }
    }

    const cleanNimNip = sanitizeText(nim_nip);
    const cleanName = sanitizeText(name);
    const cleanEmail = email && typeof email === 'string' && email.trim().length > 0 ? sanitizeText(email).toLowerCase() : null;

    const existing = await prisma.user.findUnique({
      where: { nim_nip: cleanNimNip },
    });

    if (existing) {
      return NextResponse.json(
        { error: `User dengan NIM/NIP ${cleanNimNip} sudah terdaftar.` },
        { status: 400 }
      );
    }

    if (cleanEmail) {
      const emailExisting = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (emailExisting) {
        return NextResponse.json(
          { error: `Email ${cleanEmail} sudah digunakan oleh akun lain.` },
          { status: 400 }
        );
      }
    }

    // Default password is "Uin" + nim_nip unless custom password is provided
    const plainPassword = custom_password && typeof custom_password === 'string' && custom_password.trim().length >= 6
      ? custom_password.trim()
      : getDefaultPassword(cleanNimNip);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(plainPassword, salt);

    const newUser = await prisma.user.create({
      data: {
        nim_nip: cleanNimNip,
        name: cleanName,
        email: cleanEmail,
        password_hash,
        role: role as Role,
        scope_level: cleanScopeLevel,
        must_change_pwd: true,
      },
      select: {
        id: true,
        nim_nip: true,
        name: true,
        email: true,
        role: true,
        scope_level: true,
        must_change_pwd: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${newUser.name} berhasil ditambahkan dengan default password: ${plainPassword}`,
      user: newUser,
      default_password: plainPassword,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Gagal membuat user baru.' }, { status: 500 });
  }
}
