
'use server';

import { adminStorage } from '@/app/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function deletePdf(fileName: string) {
  if (!adminStorage) {
    return { error: 'Firebase Admin Storage is not initialized.' };
  }

  if (!fileName) {
    return { error: 'File name not provided.' };
  }

  try {
    console.log(`Attempting to delete file: ${fileName}`);
    await adminStorage.file(fileName).delete();
    console.log(`Successfully deleted file: ${fileName}`);
    
    revalidatePath('/admin/pdfs');
    
    return { success: `Successfully deleted ${fileName}` };
  } catch (err: any) {
    console.error(`Failed to delete file ${fileName}:`, err);
    return { error: `Failed to delete file: ${err.message}` };
  }
}

export async function getDownloadUrl(fileName: string) {
  if (!adminStorage) {
    return { error: 'Firebase Admin Storage is not initialized.' };
  }

  if (!fileName) {
    return { error: 'File name not provided.' };
  }

  try {
    const [url] = await adminStorage.file(fileName).getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 5, // 5 minutes
    });
    return { url };
  } catch (err: any) {
    console.error(`Failed to get download URL for ${fileName}:`, err);
    return { error: `Failed to get download URL: ${err.message}` };
  }
}
