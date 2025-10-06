import { NextResponse } from 'next/server';
import getServerSession from 'next-auth';
import { authConfig } from '@/lib/auth.config';

export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    
    if (session) {
      // Return success response
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'No active session' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
} 