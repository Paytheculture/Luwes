export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, message: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImage(buffer, file.name);

    return NextResponse.json({
      success: true,
      message: 'Upload berhasil',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (err) {
    console.error('Error POST /api/upload:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengunggah gambar: ' + err.message },
      { status: 500 }
    );
  }
}
