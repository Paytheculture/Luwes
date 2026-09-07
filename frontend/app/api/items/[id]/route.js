import { NextResponse } from 'next/server';
import { updateItem, deleteItem } from '@/lib/sheets';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateItem(id, {
      nama: body.nama,
      harga: body.harga || 0,
      gambar_url: body.gambar_url || '',
      deskripsi: body.deskripsi || '',
    });

    return NextResponse.json({ success: true, message: 'Item berhasil diperbarui', data: updated });
  } catch (err) {
    console.error('Error PUT /api/items/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui item: ' + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await deleteItem(id);
    return NextResponse.json({ success: true, message: 'Item berhasil dihapus' });
  } catch (err) {
    console.error('Error DELETE /api/items/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus item: ' + err.message },
      { status: 500 }
    );
  }
}
