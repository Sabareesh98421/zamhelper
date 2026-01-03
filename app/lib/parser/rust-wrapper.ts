import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ParseResult } from './types';

const RUST_BINARY_PATH = path.join(process.cwd(), 'app', 'lib', 'parser', 'rust-ocr', 'target', 'release', 'rust-ocr');
// Fallback to debug build if release doesn't exist (for development)
const RUST_BINARY_PATH_DEBUG = path.join(process.cwd(), 'app', 'lib', 'parser', 'rust-ocr', 'target', 'debug', 'rust-ocr');

export async function invokeRustParser(filePath: string): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
        let binary = RUST_BINARY_PATH;

        // Binary detection logic (same as before)
        if (!fs.existsSync(binary)) {
            if (fs.existsSync(RUST_BINARY_PATH_DEBUG)) {
                binary = RUST_BINARY_PATH_DEBUG;
            } else {
                if (process.platform === 'win32') {
                    if (fs.existsSync(binary + '.exe')) binary += '.exe';
                    else if (fs.existsSync(RUST_BINARY_PATH_DEBUG + '.exe')) binary = RUST_BINARY_PATH_DEBUG + '.exe';
                }
            }
        }

        if (!fs.existsSync(binary) && !fs.existsSync(binary + (process.platform === 'win32' ? '.exe' : ''))) {
            reject(new Error(`Rust binary not found at ${binary}. Please run 'cargo build --release' in the rust-ocr directory.`));
            return;
        }

        execFile(binary, [filePath], { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Rust Parser Error (stderr):', stderr);
                reject(error);
                return;
            }

            try {
                // Stdout should be the JSON result
                const result = JSON.parse(stdout.trim());
                resolve(result);
            } catch (e) {
                console.error("Failed to parse Rust output as JSON:", stdout);
                reject(new Error("Rust binary returned invalid JSON"));
            }
        });
    });
}
