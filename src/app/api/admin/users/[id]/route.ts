import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getDefaultPassword } from '@/lib/utils';
import { TargetLevel } from '@prisma/client';
import { sanitizeText } from '@/lib/security';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 });
    }

    if (id === session.id) {
      return NextResponse.json(
        { error: 'Anda tidak dapat menghapus akun admin Anda sendiri.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Gagal menghapus user.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin.' }, { status: 403 });
    }

    const body = await request.json();
    const { action, name, email, scope_level } = body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    // Action 1: Reset Password to default Uin<NIM/NIP>
    if (action === 'reset_password') {
      const defaultPassword = getDefaultPassword(user.nim_nip);
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(defaultPassword, salt);

      await prisma.user.update({
        where: { id },
        data: {
          password_hash: newHash,
          must_change_pwd: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Password user ${user.name} berhasil di-reset ke default: ${defaultPassword}`,
        default_password: defaultPassword,
      });
    }

    // Validate scope_level if provided
    let cleanScopeLevel: TargetLevel | null = null;
    if (scope_level !== undefined) {
      if (['JURUSAN', 'FAKULTAS', 'UNIVERSITAS'].includes(scope_level)) {
        cleanScopeLevel = scope_level as TargetLevel;
      }
    }

    const cleanName = name ? sanitizeText(name) : undefined;
    const cleanEmail = email !== undefined ? (email && email.trim() ? sanitizeText(email).toLowerCase() : null) : undefined;

    // Check email uniqueness if email is changed
    if (cleanEmail && cleanEmail !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: `Email ${cleanEmail} sudah digunakan oleh akun lain.` },
          { status: 400 }
        );
      }
    }

    // Action 2: Update info (Excluding password_hash with select)
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(cleanName && { name: cleanName }),
        ...(cleanEmail !== undefined && { email: cleanEmail }),
        ...(scope_level !== undefined && { scope_level: cleanScopeLevel }),
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
        updated_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data user berhasil diperbarui.',
      user: updated,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data user.' }, { status: 500 });
  }
}
