import { NextResponse } from 'next/server';
import { getPesananById, updatePesanan, deletePesanan } from '@/lib/sheets';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const item = await getPesananById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item.data });
  } catch (err) {
    console.error('Error GET /api/pesanan/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pesanan: ' + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updatePesanan(id, body);
    return NextResponse.json({ success: true, message: 'Pesanan berhasil diperbarui', data: updated });
  } catch (err) {
    console.error('Error PUT /api/pesanan/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui pesanan: ' + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await deletePesanan(id);
    return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (err) {
    console.error('Error DELETE /api/pesanan/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pesanan: ' + err.message },
      { status: 500 }
    );
  }
}
