
# Blueprint: AI-Powered Exam Generator

## Overview

This application allows users to upload PDF documents, from which the system will automatically generate multiple-choice exam questions using AI. Users can then take these exams and review their results. The application uses Next.js for the frontend, Supabase for the database and authentication, and Firebase Storage for file storage.

## Features & Design

### Implemented
*   **User Authentication:** Users can sign up and log in using Supabase Auth.
*   **PDF Upload:** Authenticated users can upload PDF files.
*   **File Storage:** Uploaded PDFs are stored in a dedicated Firebase Storage bucket.
*   **Database:** Upload metadata is stored in a Supabase `uploads` table.

### Styling & Design
*   **UI:** Modern, clean interface using Tailwind CSS.
*   **Layout:** Responsive design for both desktop and mobile.
*   **Components:** Reusable components for UI elements like buttons, forms, and notifications.
*   **Iconography:** Using Heroicons for clear and intuitive icons.
*   **Feedback:** Snackbar notifications for user actions (e.g., "Upload successful").

## Current Plan

**Objective:** Implement a complete, testable user flow from PDF upload to exam taking, while temporarily disabling the live AI question generation.

**Steps:**
1.  **Modify the Upload Action:** After a PDF is successfully uploaded, insert a predefined set of mock exam questions into the `questions` table, linked to the new upload.
2.  **Update Redirect:** Change the post-upload redirect to go directly to the exam review page, bypassing the non-functional AI parsing step.
3.  **Create the Exam/Review Page:** Build the page where users can view and answer the questions associated with their upload.
4.  **Create the Uploads List:** Develop a central dashboard page where users can see all their past uploads and navigate to the corresponding exam for each one.
