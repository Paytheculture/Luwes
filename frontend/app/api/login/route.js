import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      token: 'dummy_token',
      user: {
        id: 'USR-1',
        username: body.username || 'admin',
        nama: 'Admin Luwes',
        role: 'admin',
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
