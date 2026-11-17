import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Gagal memuat kategori.' }, { status: 500 });
  }
}
