import { NextResponse } from 'next/server';
import { updateModel, deleteModel } from '@/lib/sheets';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateModel(id, body);
    return NextResponse.json({ success: true, message: 'Model dekorasi berhasil diperbarui', data: updated });
  } catch (err) {
    console.error('Error PUT /api/models/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui model: ' + err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await deleteModel(id);
    return NextResponse.json({ success: true, message: 'Model dekorasi berhasil dihapus' });
  } catch (err) {
    console.error('Error DELETE /api/models/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus model: ' + err.message },
      { status: 500 }
    );
  }
}
