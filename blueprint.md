# Blueprint

## Overview

This document outlines the project structure and implementation details of the Next.js application.

## Project Structure & Features

### Implemented (as of this version)

*   **Firebase Integration:** Securely upload PDFs to Firebase Storage and save the path in Firestore.
*   **PDF Parsing:** Parse uploaded PDFs to extract text content.
*   **Secure Storage:** Store parsed content in Firestore.
*   **Exam Page:** Display a list of available exams from Firestore.
*   **Question Generation:** Parse exam content to generate multiple-choice questions.
*   **Dynamic Question Display:** Display questions for the selected exam, allowing users to select answers.

### Current Implementation Plan

*   **Secure PDF Upload:**
    *   The `uploadPdf` function in `app/upload/actions.ts` now uploads files to Firebase Storage instead of the local filesystem.
    *   The storage path is saved in Firestore along with the exam data.
*   **Question Parsing and Storage:**
    *   The `getOrCreateQuestions` server action in `app/exam/[id]/actions.ts` parses the exam content to extract questions.
    *   The parsed questions, options, and answers are stored in a `questions` subcollection within the corresponding exam document in Firestore.
*   **Dynamic Exam Page:**
    *   The `app/exam/[id]/page.tsx` component fetches and displays the questions for the selected exam.
    *   Users can select their answers and submit the form.

