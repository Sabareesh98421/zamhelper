import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

const RUST_BINARY_PATH = path.join(process.cwd(), 'rust-ocr', 'target', 'release', 'rust-ocr');
// Fallback to debug build if release doesn't exist (for development)
const RUST_BINARY_PATH_DEBUG = path.join(process.cwd(), 'rust-ocr', 'target', 'debug', 'rust-ocr');

export async function performOcr(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let binary = RUST_BINARY_PATH;
        if (!fs.existsSync(binary)) {
            if (fs.existsSync(RUST_BINARY_PATH_DEBUG)) {
                binary = RUST_BINARY_PATH_DEBUG;
            } else {
                // In a real scenario, we might want to compile it if missing, 
                // but for now let's assume it's built.
                // Or maybe we haven't built it yet?
                // Let's try to detect if we have the binary at all.
                // If not, maybe we can't run.
                // For this demo, we'll try to execute it, it will fail if missing.
                // But let's check for windows extension?
                // On windows it might be .exe
                if (process.platform === 'win32') {
                    if (fs.existsSync(binary + '.exe')) binary += '.exe';
                    else if (fs.existsSync(RUST_BINARY_PATH_DEBUG + '.exe')) binary = RUST_BINARY_PATH_DEBUG + '.exe';
                }
            }
        }

        // Check if binary really exists now
        if (!fs.existsSync(binary) && !fs.existsSync(binary + (process.platform === 'win32' ? '.exe' : ''))) {
            // As a fallback for the "first run" before compilation, 
            // IF the user hasn't run the build command yet, we could try to just use tesseract directly?
            // But the requirement was "in Rust".
            // So we will reject.
            reject(new Error(`Rust binary not found at ${binary}. Please run 'cargo build --release' in the rust-ocr directory.`));
            return;
        }

        execFile(binary, [imagePath], (error, stdout, stderr) => {
            if (error) {
                console.error('OCR Error:', stderr);
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}
