export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAllPesanan, createPesanan } from '@/lib/sheets';

export async function GET() {
  try {
    const list = await getAllPesanan();
    return NextResponse.json({ success: true, data: list });
  } catch (err) {
    console.error('Error GET /api/pesanan:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pesanan: ' + err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.nama_pengantin) {
      return NextResponse.json(
        { success: false, message: 'Nama pengantin tidak boleh kosong' },
        { status: 400 }
      );
    }

    const created = await createPesanan(body);
    return NextResponse.json({ success: true, message: 'Pesanan berhasil dibuat', data: created }, { status: 201 });
  } catch (err) {
    console.error('Error POST /api/pesanan:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pesanan: ' + err.message },
      { status: 500 }
    );
  }
}
