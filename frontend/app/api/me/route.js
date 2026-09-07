import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      id: 'USR-1',
      username: 'admin',
      nama: 'Admin Luwes',
      role: 'admin',
    },
  });
}
