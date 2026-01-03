# Production Deployment Guide (Automated)

We use **GitHub Actions** to handle the complex Rust compilation automatically.

## How it works
1.  **You push code** to GitHub.
2.  **GitHub Action** (`.github/workflows/build-rust.yml`) triggers:
    - Boots up a Linux server.
    - Installs Rust, Tesseract, and dependencies.
    - Compiles the `rust-ocr` binary for Linux.
    - **Commits the binary back to your repo** into `app/lib/parser/bin/linux/`.
3.  **Firebase App Hosting** deploys your app:
    - It sees the binary is already there.
    - It skips compilation.
    - It uses the pre-built Linux binary to parse PDFs.

## Configuration
- **Package.json**: Standard Next.js build (`"build": "next build"`).
- **GitHub Action**: Handles the cross-compilation.

## Manual Testing (Linux)
If you ever need to test the Linux binary path:
`app/lib/parser/bin/linux/rust-ocr`
