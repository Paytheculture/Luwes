export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPesananById, updatePesanan, deletePesanan } from '@/lib/sheets';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    console.log(`[API ROUTE DEBUG] GET /api/pesanan/[id] received request for id: "${id}" (decoded: "${decodedId}")`);
    const item = await getPesananById(decodedId);
    if (!item) {
      console.warn(`[API ROUTE WARN] Pesanan ID "${decodedId}" not found in getPesananById.`);
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
    }
    console.log(`[API ROUTE SUCCESS] Returning pesanan data for ID "${decodedId}"`);
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
    const decodedId = decodeURIComponent(id);
    const body = await req.json();
    const updated = await updatePesanan(decodedId, body);
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
    const decodedId = decodeURIComponent(id);
    await deletePesanan(decodedId);
    return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (err) {
    console.error('Error DELETE /api/pesanan/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus pesanan: ' + err.message },
      { status: 500 }
    );
  }
}
