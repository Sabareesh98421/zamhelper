# Project Blueprint

## Overview

This document provides a comprehensive overview of the `zamhelper` Next.js application, including its purpose, features, design, and the steps taken during its development.

**Your application is hosted at:** [https://zamhelper--zamhelper-240302.asia-southeast1.hosted.app](https://zamhelper--zamhelper-240302.asia-southeast1.hosted.app)

## Application Purpose

The `zamhelper` application is a modern, web-based tool designed to help users prepare for exams. It provides a clean, intuitive interface for accessing practice materials and, in future versions, will allow for interactive exam sessions.

## Implemented Features

### Core Application
- **Home Page:** A visually appealing landing page that serves as the entry point to the application. It includes a link to the practice exams.
- **"Practice Exams" Page (`/practice`):**
    - **Route Protection:** This page is only accessible to logged-in users. Unauthorized users are automatically redirected to the home page to sign in.
    - **Dynamic UI:** Displays a grid of available practice exams with titles, descriptions, and categories.
    - **Modern Design:** Features a card-based layout with hover effects and clear calls-to-action.

### Authentication
- **Embedded Google Sign-In:**
    - The Supabase Auth UI component is seamlessly embedded into the home page.
    - It is displayed conditionally, appearing only for users who are not logged in.
    - The form is configured to use Google as the sole OAuth provider, with specific scopes (`openid email profile`) for a streamlined user experience.
- **Sign-Out Functionality:**
    - A "Sign Out" button is present on the "Practice Exams" page.
    - It uses a secure, server-side route (`/auth/signout`) to terminate the user's session and redirect them to the home page.

## Design and Styling

- **Framework:** Next.js with the App Router.
- **Styling:** Tailwind CSS for a utility-first styling approach.
- **Component Library:** Shadcn UI for a base set of high-quality, accessible, and customizable components (e.g., Buttons).
- **Icons:** `lucide-react` for clean and modern iconography.
- **Layout:**
    - **Home Page:** A centered, two-column layout featuring a hero section with a title, description, and a call-to-action button, alongside the embedded authentication form.
    - **Practice Page:** A full-width layout with a dedicated header and a main content area that uses a responsive grid to display exam cards.

## Development and Deployment Steps

### Initial Deployment & Configuration
*(This section details the initial setup involving secret management, service account permissions, and Firebase configuration for the first successful deployment.)*

1.  **Secret Creation:** Securely created secrets in Google Cloud Secret Manager for Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2.  **Permissions & Configuration:** Resolved initial deployment failures by granting the `secretAccessor` role to the service account and configuring `apphosting.yaml` and `firebase.json` to correctly link the service account and secrets.
3.  **Domain Change:** Successfully transitioned the deployment from a default Firebase URL to the custom `zamhelper.web.app` domain, which involved updating Supabase redirect URIs and the `firebase.json` configuration.

### Refactoring Authentication & Building Core Features
1.  **Fixing Authentication Flow:**
    - **Problem:** A `500 Internal Server Error` was occurring due to a misconfigured authentication callback.
    - **Solution:** The authentication logic was refactored to use a purely client-side flow. The incorrect server-side callback route (`/auth/callback/route.ts`) was deleted.
    - The `redirectTo` parameter in the `Auth` component was corrected to point to the application's base URL, allowing the Supabase client library to handle the session correctly after the user returns from Google.
2.  **Embedding the Login Form:**
    - The dedicated `/auth/login` page was removed.
    - The Supabase Auth UI component was moved directly into the main `app/page.tsx` and is now rendered conditionally, providing a much smoother user experience.
3.  **Building the Practice Exams Page:**
    - Created the new protected route at `app/practice/page.tsx`.
    - Implemented server-side logic to check for an active session and redirect non-authenticated users.
    - Designed and built the UI using a responsive grid layout to display placeholder exam data.
4.  **Implementing Sign-Out:**
    - Created the `app/auth/signout/route.ts` file to handle POST requests.
    - This server action securely signs the user out using `supabase.auth.signOut()` and redirects them to the home page.

