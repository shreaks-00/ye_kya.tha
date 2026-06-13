import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_change_me'
);

export async function verifyAdmin(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, JWT_SECRET);
    return null; // no error — admin verified
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
