import { NextResponse } from 'next/server';
import { adminStorage } from '@/app/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const status = {
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'MISSING',
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'MISSING',
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'MISSING',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET' : 'MISSING',
        ADMIN_INITIALIZED: !!adminStorage,
    };

    // Check if private key is malformed (common issue)
    if (process.env.FIREBASE_PRIVATE_KEY) {
        const pk = process.env.FIREBASE_PRIVATE_KEY;
        // @ts-ignore
        status.PRIVATE_KEY_HAS_NEWLINES = pk.includes('\n') || pk.includes('\\n');
        // @ts-ignore
        status.PRIVATE_KEY_LENGTH = pk.length;
    }

    return NextResponse.json(status);
}
