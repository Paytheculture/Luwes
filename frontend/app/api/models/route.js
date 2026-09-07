import { NextResponse } from 'next/server';
import { getAllModels, createModel } from '@/lib/sheets';

export async function GET() {
  try {
    const list = await getAllModels();
    return NextResponse.json({ success: true, data: list });
  } catch (err) {
    console.error('Error GET /api/models:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data model: ' + err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.nama) {
      return NextResponse.json(
        { success: false, message: 'Nama model tidak boleh kosong' },
        { status: 400 }
      );
    }

    const created = await createModel(body);
    return NextResponse.json({ success: true, message: 'Model dekorasi berhasil ditambahkan', data: created }, { status: 201 });
  } catch (err) {
    console.error('Error POST /api/models:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan model: ' + err.message },
      { status: 500 }
    );
  }
}
