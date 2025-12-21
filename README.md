# ZamHelper

**ZamHelper** is an advanced exam preparation tool designed to convert static PDF question papers into interactive, online exams. It streamlines the study process for students by automatically parsing uploaded documents and generating trackable practice sessions.

Your application is hosted at: [https://zamhelper--zamhelper-240302.asia-southeast1.hosted.app](https://zamhelper--zamhelper-240302.asia-southeast1.hosted.app)

## 🚀 Key Features

*   **PDF to Exam Conversion:** Upload PDF question papers and automatically extract questions.
*   **Interactive Practice:** Take exams in a real-time environment with immediate feedback.
*   **Progress Tracking:** (Planned) Track attempts and scores over time.
*   **Secure Authentication:** Google OAuth integration via Supabase.

## 🛠 Tech Stack

*   **Framework:** [Next.js 14+](https://nextjs.org) (App Router)
*   **Database & Auth:** [Supabase](https://supabase.com) (PostgreSQL, GoTrue)
*   **Storage & Hosting:** [Firebase](https://firebase.google.com) (Cloud Storage, App Hosting)
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript

## ⚙️ Configuration & Environment

To run this project correctly, you must configure the following environment variables.

### Critical: Dynamic URL Handling
We have implemented **environment-agnostic redirection** to solve issues with `0.0.0.0` or `localhost` redirects in containerized environments.

*   `NEXT_PUBLIC_APP_URL`: **REQUIRED**. This variable dictates the base URL for authentication callbacks and middleware redirects.
    *   **Local Development:** `http://localhost:3000`
    *   **Production:** `https://zamhelper--zamhelper-240302.asia-southeast1.hosted.app`

### Other Variables
*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

## 📝 Recent Development Updates

### 1. Dynamic URL Refactoring (Dec 2025)
**Problem:** The application was hardcoding URLs, causing authentication redirects to fail (sending users to `0.0.0.0`) in the hosted container environment.
**Solution:**
*   Refactored `proxy.ts`, `app/auth/actions.ts`, and `app/auth/signout/route.ts` to use `NEXT_PUBLIC_APP_URL`.
*   Implemented a fallback mechanism: `process.env.NEXT_PUBLIC_APP_URL` ?? `request.nextUrl.origin`.
*   Updated `proxy.ts` middleware to parse the hostname dynamically, making the code valid for both `localhost` and `hosted.app` domains without code changes.

### 2. Upload Debugging
**Problem:** File uploads were failing silently in production.
**Solution:**
*   Added verbose logging to `app/upload/actions.ts` prefixed with `[Upload Debug]`.
*   These logs trace the entire upload lifecycle: Admin Storage Initialization -> User Auth -> Profile Check -> File Buffer Processing -> Database Insert.

## 📦 Getting Started

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up `.env.local`:**
    ```bash
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    # Add Supabase and Firebase keys...
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
