# Project Blueprint

## Overview

This document provides a comprehensive overview of the `zamhelper` Next.js application, including its purpose, features, design, and the steps taken during its development and deployment.

## Application Purpose and Capabilities

The `zamhelper` application is a tool designed to assist with exam preparation. It allows users to upload exam documents, which are then parsed to create interactive practice exams. The application provides a dashboard for users to track their progress and review their performance on past exams.

## Implemented Features

- **Authentication:** Users can log in to the application.
- **Dashboard:** A central hub for users to access practice exams and view their progress.
- **Exam Practice:** Users can take practice exams based on uploaded documents.
- **Results:** After completing an exam, users can view their results.
- **Admin Section:** A dedicated area for administrative tasks, including:
    - **Uploads:** Administrators can upload exam documents.
    - **Parsing:** Uploaded documents can be parsed to generate exams.
    - **Faults:** A section to view and manage any faults or errors that occur during the parsing process.

## Design and Styling

- **Framework:** The application is built with Next.js and React.
- **Styling:** The application uses Tailwind CSS for styling, with a modern and clean design.
- **Component Library:** Shadcn UI is used for a set of pre-built, accessible, and customizable UI components.
- **Layout:** The application has a consistent layout with a sidebar for navigation and a main content area.

## Development and Deployment Steps

### Initial Deployment

1.  **Secret Creation:** The following secrets were created in Google Cloud Secret Manager to securely store environment variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `NEXT_PUBLIC_BASE_URL`
2.  **Service Account Permissions:** To resolve a deployment issue where the App Hosting service account did not have permission to access the secrets, the `secretAccessor` role was granted to the default Compute Engine service account (`666446126828-compute@developer.gserviceaccount.com`) for each of the secrets.
3.  **App Hosting Configuration:** The `apphosting.yaml` file was updated to specify the service account to be used by App Hosting:
    ```yaml
    run:
      serviceAccount: 666446126828-compute@developer.gserviceaccount.com
      environment:
        - variable: NEXT_PUBLIC_SUPABASE_URL
          secret: NEXT_PUBLIC_SUPABASE_URL
        - variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
          secret: NEXT_PUBLIC_SUPABASE_ANON_KEY
        - variable: NEXT_PUBLIC_BASE_URL
          secret: NEXT_PUBLIC_BASE_URL
    ```
4.  **Firebase Configuration:** The `firebase.json` file was created to configure the deployment for the Firebase CLI:
    ```json
    {
      "hosting": {
        "source": ".",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "frameworksBackend": {
          "region": "asia-southeast1"
        }
      }
    }
    ```
5.  **Initial Deployment:** The `firebase deploy` command was run, which successfully built and deployed the application to a default Firebase Hosting URL.

### Domain Change and Re-Deployment

1.  **New Site Creation:** A new Firebase Hosting site named `zamhelper` was created to provide the URL `https://zamhelper.web.app`.
2.  **Authentication Fix (`redirect_uri_mismatch`):**
    *   The Supabase project's "URL Configuration" was updated to include `https://zamhelper.web.app/auth/callback` in the list of allowed "Redirect URLs".
    *   The `NEXT_PUBLIC_BASE_URL` secret was updated to the new value `https://zamhelper.web.app`.
3.  **Firebase Configuration Update:** The `firebase.json` file was modified to target the new `zamhelper` site for deployment:
    ```json
    {
      "hosting": {
        "site": "zamhelper",
        "source": ".",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "frameworksBackend": {
          "region": "asia-southeast1"
        }
      }
    }
    ```
4.  **Final Deployment:** The `firebase deploy` command was run again, which successfully built and deployed the application to the new `https://zamhelper.web.app` URL.
