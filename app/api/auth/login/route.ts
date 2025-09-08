import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { users } from '@/db/user.schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { generateToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = await generateToken(user.id);

    const response = NextResponse.json({ message: 'Login successful' });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Login failed' }, { status: 401 });
  }
}