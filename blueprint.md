# Project Blueprint

## Overview
This project is a comprehensive exam preparation platform. It allows administrators to upload PDF documents, which are then parsed to generate exam questions. Students can take these exams, review their results, and practice the questions they answered incorrectly.

## Features

### Admin
- **PDF Upload:** Admins can upload PDF files containing exam questions.
- **PDF Management:** Admins can view a list of uploaded PDFs and their parsing status.
- **Question Parsing:** A server-side process extracts questions from the PDFs.
- **Fault Management:** Admins can view and resolve any issues that occur during parsing.

### Student
- **Exam Dashboard:** Students can see a list of available exams.
- **Exam Taking:** A clean interface for taking exams, with one question displayed at a time.
- **Results Page:** Detailed results are provided after an exam is submitted, including the final score and a review of each answer.
- **Practice Dashboard:** Students can see their past exam attempts.
- **Practice Sessions:** Students can practice the specific questions they answered incorrectly in past exams.

## Technical Details

- **Framework:** Next.js with App Router
- **Database:** Supabase
- **Authentication:** Supabase Auth, with support for:
    - Google
- **Styling:** Tailwind CSS
