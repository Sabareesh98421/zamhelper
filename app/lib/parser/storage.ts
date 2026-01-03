
import { adminStorage } from "@/app/lib/firebase-admin";

export async function getFileBufferFromStorage(storagePath: string): Promise<Buffer> {
    if (!adminStorage) {
        throw new Error("Firebase Admin Storage is not initialized.");
    }

    const bucket = adminStorage.bucket();
    // storagePath is the full path e.g. uploads/user/file.pdf
    const file = bucket.file(storagePath);

    const [buffer] = await file.download();
    return buffer;
}
