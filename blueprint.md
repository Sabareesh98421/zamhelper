# Project Blueprint

## Overview

This document provides a comprehensive overview of the `zamhelper` Next.js application, including its purpose, features, design, and the steps taken during its development.

**Your application is hosted at:** [https://zamhelper--zamhelper-240302.asia-southeast1.hosted.app](https://zamhelper--zamhelper-240302.asia-southeast1.hosted.app)

## Application Purpose

The `zamhelper` application is a modern, web-based tool designed to help users prepare for exams. It provides a clean, intuitive interface for accessing practice materials and allows administrators to upload and manage exam content.

## Implemented Features

### Core Application
- **Home Page:** A visually appealing landing page that serves as the entry point to the application. It includes a "Sign In with Google" button for authentication.
- **"Practice Exams" Page (`/practice`):**
    - **Route Protection:** This page is only accessible to logged-in users. Unauthorized users are automatically redirected to the home page to sign in.
    - **Dynamic Content:** Displays a grid of available practice exams uploaded by administrators.

### Authentication
- **Google Sign-In Flow:**
    - **Login Action:** A secure, server-side function (`app/auth/actions.ts`) initiates the Google OAuth flow.
    - **Callback Route:** A dedicated route (`app/auth/callback/route.ts`) handles the callback from Google, securely exchanging the authorization code for a user session.
    - **Error Handling:** A user-friendly error page (`app/auth/auth-code-error/page.tsx`) is displayed if any issues occur during the sign-in process.
- **Sign-Out Functionality:**
    - A "Sign Out" button is present on the "Practice Exams" page.
    - It uses a secure, server-side route (`/auth/signout`) to terminate the user's session and redirect them to the home page.

### Admin Role & Content Management
- **Admin Role:**
    - **Database-Level Roles:** A `claims` table in the Supabase database stores user roles.
    - **Admin Check:** A server-side function (`lib/supabase/admin.ts`) checks if the logged-in user has the `admin` role.
- **Admin Dashboard (`/admin`):**
    - **Protected Route:** Accessible only to users with the `admin` role.
    - **File Uploads:** Provides an interface for administrators to upload new exam papers.

## Design and Styling

- **Framework:** Next.js with the App Router.
- **Styling:** Tailwind CSS for a utility-first styling approach.
- **Component Library:** Shadcn UI for a base set of high-quality, accessible, and customizable components (e.g., Buttons).
- **Icons:** `lucide-react` for clean and modern iconography.

## Current Plan

- **Replace Placeholders:** Update the `/practice` page to display the actual exam papers uploaded by administrators, replacing the current placeholder content.

