/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const TOKEN_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

export interface UserPayload {
  id: number;
  email: string;
  role: string;
  username?: string;
  name?: string;
}

// For API Route (Node.js)
export function createToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyTokenNode(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

// For Edge Runtime (middleware)
export async function verifyTokenEdge(token: string): Promise<UserPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

// ...kode lain...

export function clearAuthCookie(response: any) {
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0), // Expire now
  });
}