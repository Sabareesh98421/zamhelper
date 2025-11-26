
# Project Blueprint: ZamHelper

## 1. Overview

ZamHelper is a comprehensive online examination and learning platform. It allows students to take practice exams, review their results, and track their progress. It also provides an administrative interface for managing exams, questions, and user data.

## 2. Resolved Issues (Current Session)

During this session, several critical issues were identified and resolved to stabilize the application and ensure a successful build.

- **Dynamic Rendering for Admin Pages:** The admin pages were failing to build due to their reliance on environment variables that were not available at build time. This was resolved by forcing these pages to render dynamically.
- **Database Query Correction:** A persistent build error was traced to an incorrect database query in the `app/exam/page.tsx` file. The query was targeting the `pdf_uploads` table for a `name` column, when it should have been querying the `exams` table for the `title` column. This has been corrected.
- **Type Definition Update:** The `Exam` type in `app/lib/types.ts` was updated to expect a `title` property instead of a `name` property, aligning it with the database schema.
- **RLS Policy Recursion:** A critical infinite recursion error in the Supabase Row Level Security policies was identified and fixed. The policy for allowing admins to view all profiles was querying the `profiles` table, creating a loop. The policy has been rewritten to use a custom `get_my_claim` function that checks for an 'admin' claim, resolving the recursion.

## 3. Core Features

### Student-Facing
- **User Authentication:** Students can sign up and log in using Supabase Auth.
- **Practice Exams:** Students can take practice exams composed of multiple-choice questions.
- **Exam Results:** After completing an exam, students can see their score and review their answers.
- **Past Attempts:** Students can view a history of their past exam attempts.
- **PDF Upload:** Users can upload PDF documents to Firebase Storage.

### Admin Panel (V2 Complete & Secured)
- **Role-Based Access Control:** The entire `/admin` section is now protected. Only users with the `role` of `admin` in the Supabase `users` table can access these routes. Non-admins are redirected to the homepage.
- **Professional Layout:** A responsive sidebar layout for all admin pages.
- **Dashboard:** A central dashboard page (`/admin/dashboard`) to display key statistics.
- **Manage PDF Uploads:** A page (`/admin/pdfs`) to view, download, and delete all PDFs in Firebase Storage. Implemented with Server Actions.
- **View All Attempts:** A page (`/admin/attempts`) for administrators to view all exam attempts from all users, fetched securely from Supabase.

## 4. Design and Styling

- **Framework:** Next.js with React
- **Styling:** Tailwind CSS for a modern, utility-first approach.
- **UI Components:** Utilizes a consistent design for cards, buttons, and layouts.
- **Icons:** Uses Heroicons for a clean and professional look.
- **Dark Mode:** The application includes a dark mode theme.

## 5. Next Plan: Build and Verify

With the critical build errors and runtime issues resolved, the immediate next step is to run the build command and ensure the application compiles successfully. Once the build is verified, I will move on to implementing new features.

### Action Items:
- **Step 1: Run `npm run build`:** Execute the build command to confirm that all fixes have been correctly implemented and the application is stable.
- **Step 2: Address any remaining issues:** If any new errors arise during the build process, I will address them immediately.
- **Step 3: Begin new feature development:** Once the build is successful, I will begin working on the next set of features for the ZamHelper platform.
