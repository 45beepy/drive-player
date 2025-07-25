# Drive Player

A personal full-stack web application designed to be a free and simple music player that streams audio files directly from a user's personal Google Drive. This project is built with a focus on learning modern web development practices, including full-stack architecture, secure authentication, and API integration.

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Architecture Overview](#architecture-overview)
* [Key Challenges & Solutions](#key-challenges--solutions)
* [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Firebase & Google Cloud Setup](#firebase--google-cloud-setup)
    * [Local Setup](#local-setup)
* [Running the Application](#running-the-application)
* [Future Enhancements](#future-enhancements)
* [License](#license)

## Features

This project is in its early stages of development. Current and planned features include:

* **Google Account Login:** Secure user authentication via Google Sign-In using Firebase Authentication.
* **Personal Google Drive Access:** Stream audio files directly from the user's Google Drive.
* **Music File Listing:** Display a list of supported audio files (MP3, FLAC, WAV, OGG) found in the user's Drive.
* **Basic Audio Playback:** Play, pause, and simple control over streamed music.
* **MVC Backend Structure:** Organized and scalable backend built with Node.js and Express.js.
* **Plain UI:** A simple, old-school web page aesthetic using Tailwind CSS.

**Planned Features:**
* Upload functionality for new music files to Google Drive.
* Listener statistics (most listened song, album, artist, total listen time).
* Categorization of files by artist, album, etc.
* "Recently Played" list.
* Album art display (if available/extractable).

## Tech Stack

This project leverages the following technologies:

**Frontend (Client-side - The "View")**
* **React:** A JavaScript library for building user interfaces.
* **Vite:** A fast development build tool for modern web projects.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **Firebase SDK (Client):** For client-side Google Authentication.
* **HTML5 `<audio>` API:** For native audio playback.

**Backend (Server-side - The "Controller" & "Model")**
* **Node.js:** JavaScript runtime environment.
* **Express.js:** A minimalist web framework for building RESTful APIs.
* **Firebase Admin SDK:** For server-side authentication (ID token verification) and future database (Firestore) interactions.
* **Google APIs Node.js Client Library (`googleapis`):** For interacting with the Google Drive API.
* **`dotenv`:** For managing environment variables.
* **`cors`:** Middleware for enabling Cross-Origin Resource Sharing.
* **`nodemon`:** (Development) For automatically restarting the server during development.

**Database / External Services**
* **Firebase Authentication:** For user sign-in and management.
* **Google Drive API:** For file storage and streaming.
* **Firestore (via Firebase Admin SDK):** (Future) For storing listener statistics and app-specific data.

**Hosting (Local Development)**
* **Vite Dev Server:** For the React frontend.
* **Node.js/Express Server:** For the backend API.

## Architecture Overview

The project follows a modified MVC pattern suitable for a Single Page Application (SPA) with a dedicated backend:

* **Client (View):** The React application. It handles user interactions, renders the UI, and makes API calls to the Node.js backend.
* **Server (Controller & Model):** The Node.js/Express application.
    * **Controller Layer:** Defined by Express routes and controller functions (`controllers/`). It receives requests from the frontend, performs basic validation, and orchestrates the interaction with the Model.
    * **Model Layer:** Encapsulates business logic and data access (`models/`). This is where the core logic for interacting with Google Drive API and Firebase Firestore resides.
    * **Middleware:** Handles cross-cutting concerns like authentication (`middleware/`).

Authentication flows from the frontend to the backend via Firebase ID tokens and a custom `X-Google-Access-Token` header, which the backend then uses to make secure, user-delegated calls to the Google Drive API.

## Key Challenges & Solutions

Developing this project from scratch has presented several interesting challenges, crucial for learning full-stack development:

1.  **Full-Stack Integration & Modular Architecture:**
    * **Challenge:** Setting up distinct client and server environments and ensuring seamless communication while maintaining a clear MVC separation.
    * **Solution:** Implemented a monorepo-like structure (`client/` and `server/` folders) and used Express.js with dedicated `routes/`, `controllers/`, and `models/` folders to enforce MVC principles. A simple health check endpoint (`/`) confirmed initial connectivity.

2.  **Secure User Authentication with Google:**
    * **Challenge:** Implementing secure user login using Google accounts to access user-specific data, rather than a single, shared account.
    * **Solution:** Leveraged Firebase Authentication's Google Sign-In, handling the OAuth flow on the client. On the backend, custom middleware was developed to intercept every protected route, verify the ID token's authenticity using the Firebase Admin SDK, and only allow valid requests to proceed.

3.  **Google Drive API Permissions & Access Token Management (The Deep Dive):**
    * **Challenge:** Even after successful user authentication, the backend initially failed to access Google Drive due to "invalid credentials." This was because the generic access token from Firebase login didn't automatically include the correct Google Drive API scopes.
    * **Solution:** This required meticulous debugging. I learned to explicitly add the `drive.readonly` scope to the Firebase `GoogleAuthProvider` on the frontend. Crucially, I discovered the need to capture the specific Google OAuth access token directly from the `signInWithPopup` result (using `GoogleAuthProvider.credentialFromResult(result).accessToken`), as `currentUser.getIdTokenResult(true).accessToken` was `undefined` in this context. This ensured my backend had the correct, permissioned token.

4.  **Google Cloud API Enablement & Consent Flow:**
    * **Challenge:** Encountering "API not enabled" errors or browser warnings like "Google hasn't verified this app" due to missing API enablement or incomplete OAuth consent.
    * **Solution:** Systematically enabled the Google Drive API in the Google Cloud Console for the correct project. For development, I learned to bypass the "unverified app" warning by clicking "Advanced" and then the "unsafe" link, which allowed the required Google Drive consent screen to appear and be accepted.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

* Node.js (v18.x or higher recommended) and npm (v9.x or higher recommended)
* A Google Account
* A Firebase Project (created as per instructions below)

### Firebase & Google Cloud Setup

1.  **Create a Firebase Project:**
    * Go to [Firebase Console](https://console.firebase.google.com/).
    * Click "Add project" and follow the prompts. Disable Google Analytics for simplicity.
2.  **Enable Google Sign-in:**
    * In your Firebase project, navigate to **Build > Authentication > Sign-in method**.
    * Enable "Google" as a provider. Set a project support email.
3.  **Register Web App & Get Firebase Config:**
    * Go to "Project Overview" in Firebase, click the "</>" (Web) icon to "Add app".
    * Register your app (e.g., "Web Client App"), uncheck "Firebase Hosting".
    * **Copy the `firebaseConfig` JavaScript object.** You will need it for `client/src/firebaseConfig.js`.
4.  **Generate Service Account Key (for Backend):**
    * In Firebase, go to **Project settings > Service accounts**.
    * Click "Generate new private key" and download the JSON file.
    * **Rename this file to `firebase-admin-sdk.json`** and move it into your `y2k-drive-player/server/` directory. **Keep this file secure and do NOT commit it to Git!**
5.  **Enable Google Drive API:**
    * Go to [Google Cloud Console](https://console.cloud.google.com/).
    * Select your project (it's the same ID as your Firebase project).
    * Navigate to **APIs & Services > Enabled APIs & Services**.
    * Click "+ ENABLE APIS AND SERVICES", search for "Google Drive API", and enable it. Wait a few minutes for propagation.

### Local Setup

1.  **Clone the repository (or create directories manually):**
    ```bash
    mkdir y2k-drive-player
    cd y2k-drive-player
    ```

2.  **Client-side Setup:**
    ```bash
    cd client
    npm create vite@latest . -- --template react
    npm install
    npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
    npx tailwindcss init -p
    ```
    * **Update `client/.env`**: Add `VITE_BACKEND_URL=http://localhost:3000`.
    * **Update `client/tailwind.config.js`**: Set `content` to `["./index.html", "./src/**/*.{js,jsx}"]`.
    * **Update `client/postcss.config.js`**: Ensure `plugins` include `'@tailwindcss/postcss': {}`.
    * **Update `client/src/index.css`**: Replace content with `@tailwind base; @tailwind components; @tailwind utilities; body { margin: 0; font-family: sans-serif; }`.
    * **Update `client/src/firebaseConfig.js`**: Paste your `firebaseConfig` object and ensure `googleProvider.addScope(...)` and `export { ..., GoogleAuthProvider };` are present.
    * **Update `client/src/context/AuthContext.jsx`**: Copy the complete updated code.
    * **Update `client/src/main.jsx`**: Ensure `AuthProvider` wraps `App`.
    * **Update `client/src/App.jsx`**: Copy the complete updated code.
    ```bash
    cd ..
    ```

3.  **Server-side Setup:**
    ```bash
    mkdir server
    cd server
    npm init -y
    npm install express dotenv cors firebase-admin googleapis
    npm install -D nodemon
    ```
    * **Create `server/.gitignore`**: Add `firebase-admin-sdk.json`, `node_modules/`, `.env`, `dist/`.
    * **Move/Create `server/src/` folders**: Create `src/`, `src/config/`, `src/controllers/`, `src/models/`, `src/middleware/`, `src/routes/`.
    * **Move `server/server.js` to `server/src/app.js`**: Copy the provided `app.js` content into `server/src/app.js`.
    * **Create `server/server.js` (root entry point):** Copy the provided `server.js` content into this new file.
    * **Update `server/package.json`**: Set `main` to `"server.js"`, and `scripts` for `start` and `dev` to use `server.js`.
    * **Create `server/src/config/firebaseConfig.js`**: Copy the provided code, ensuring `serviceAccount` path is correct.
    * **Create `server/src/middleware/authMiddleware.js`**: Copy the provided code.
    * **Create `server/src/models/googleDriveModel.js`**: Copy the provided code.
    * **Create `server/src/controllers/musicController.js`**: Copy the provided code.
    * **Create `server/src/routes/musicRoutes.js`**: Copy the provided code.

## Running the Application

Open two separate terminal windows:

**Terminal 1 (for Backend):**
```bash
cd y2k-drive-player/server
npm run dev
