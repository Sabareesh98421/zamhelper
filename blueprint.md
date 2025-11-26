
# Project Blueprint: ZamHelper

## 1. Overview

ZamHelper is a comprehensive online examination and learning platform. It allows students to take practice exams, review their results, and track their progress. It also provides an administrative interface for managing exams, questions, and user data.

## 2. Implemented Features & Design

### Authentication & User Experience (V3 - Current)

- **Dedicated Login/Signup Pages:** Users are directed to clear, dedicated pages for `/login` and `/signup`, resolving previous 404 errors and providing a standard user experience.
- **Dynamic Navigation Bar:** The main navigation bar now dynamically shows "Login" and "Sign Up" buttons for guest users and a "Sign Out" button for authenticated users.
- **OAuth Integration:** User authentication is handled via Google OAuth, powered by Supabase Auth.
- **Centralized Auth Logic:** All authentication actions (login, logout) and callbacks are managed cleanly within the `app/auth/` directory.

### Student-Facing Features

- **Practice Exams:** Students can take practice exams composed of multiple-choice questions.
- **Exam Results:** After completing an exam, students can see their score and review their answers.
- **Past Attempts:** Students can view a history of their past exam attempts.
- **PDF Upload:** Users can upload PDF documents to Firebase Storage.

### Admin Panel (V2 Complete & Secured)

- **Role-Based Access Control:** The entire `/admin` section is protected. Only users with the `role` of `admin` can access these routes. Non-admins are redirected.
- **Professional Layout:** A responsive sidebar layout for all admin pages.
- **Dashboard:** A central dashboard (`/admin/dashboard`) to display key statistics.
- **Manage PDF Uploads:** A page (`/admin/pdfs`) to view, download, and delete all PDFs in Firebase Storage using Server Actions.
- **View All Attempts:** A page (`/admin/attempts`) for administrators to view all exam attempts from all users.

### Design and Styling

- **Framework:** Next.js with the App Router.
- **Styling:** Tailwind CSS for a modern, utility-first approach.
- **UI Components:** Consistent design for cards, buttons, and layouts.
- **Icons:** Heroicons for a clean and professional look.
- **Dark Mode:** The application includes a dark mode theme.

## 3. Plan for Current Request: Finalizing Authentication Flow

- **[COMPLETED]** Create dedicated `app/login/page.tsx` to resolve 404 error.
- **[COMPLETED]** Create dedicated `app/signup/page.tsx` for a clear user registration path.
- **[COMPLETED]** Update the main navigation component (`Nav.tsx`) to dynamically display authentication status (Login/Sign Up vs. Sign Out).
- **[COMPLETED]** Remove old authentication components from the homepage (`app/page.tsx`).
- **[COMPLETED]** Update `blueprint.md` to document the new, improved authentication flow.

**All authentication-related issues are now resolved.**
