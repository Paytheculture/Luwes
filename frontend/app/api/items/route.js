import { NextResponse } from 'next/server';
import { getAllItems, createItem } from '@/lib/sheets';

export async function GET() {
  try {
    const items = await getAllItems();
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error('Error GET /api/items:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data item: ' + err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.nama) {
      return NextResponse.json(
        { success: false, message: 'Nama item tidak boleh kosong' },
        { status: 400 }
      );
    }

    const item = await createItem({
      nama: body.nama,
      harga: body.harga || 0,
      gambar_url: body.gambar_url || '',
      deskripsi: body.deskripsi || '',
      kategori: body.kategori || '',
    });

    return NextResponse.json({ success: true, message: 'Item berhasil ditambahkan', data: item }, { status: 201 });
  } catch (err) {
    console.error('Error POST /api/items:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan item: ' + err.message },
      { status: 500 }
    );
  }
}
