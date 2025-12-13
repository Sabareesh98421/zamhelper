'use server';

import { adminStorage } from '@/app/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function deletePdf(fileName: string) {
  if (!adminStorage) {
    const errorMessage = 'Firebase Admin Storage is not initialized.';
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }
  const bucket = adminStorage.bucket();
  const file = bucket.file(`uploads/${fileName}`);

  try {
    await file.delete();
    revalidatePath('/admin/pdfs');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
}

export async function getDownloadUrl(fullPath: string): Promise<string> {
    if (!adminStorage) {
        throw new Error('Firebase Admin Storage is not initialized.');
    }
    const bucket = adminStorage.bucket();
    const file = bucket.file(fullPath);
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // A long time in the future.
    });
    return url;
}
