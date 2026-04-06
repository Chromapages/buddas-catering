import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      NEXT_PUBLIC_SANITY_PROJECT_ID: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || 'unknown',
    },
    system: {
      arch: process.arch,
      platform: process.platform,
      nodeVersion: process.version,
    }
  };

  return NextResponse.json(diagnostics);
}
