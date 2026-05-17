# IPL Akinator (Ranchi)

A fun, AI-powered "Akinator" style game for guessing IPL players. 

## Project Structure

This project is built using a modern React frontend (Vite) and a Node.js/Express backend (`server.ts`) for server-side logic and database interactions.

```text
ipl-genius/
├── .env                        # Environment variables
├── firebase-applet-config.json # Firebase Configuration
├── firestore.rules             # Firestore Database Security Rules
├── package.json                # Project Dependencies & Scripts
├── server.ts                   # Backend Express Server Entry Point
├── vite.config.ts              # Vite Frontend Build Config
├── src/                        # Frontend React Application Source
│   ├── App.tsx                 # Main App Component
│   ├── main.tsx                # React Entry Point
│   ├── index.css               # Global Styles
│   ├── components/             # Reusable UI Components
│   │   ├── game/               # Game-specific Components (Container, History, Leaderboard)
│   │   └── layout/             # Layout Components (Navbar)
│   ├── context/                # React Context (AuthContext)
│   ├── data/                   # Static Data & Configurations
│   │   ├── players.ts          # IPL Players Data
│   │   └── questions.ts        # Akinator Questions
│   └── lib/                    # Library code and Utilities
│       ├── engine.ts           # Core Game Logic/Engine
│       └── firebase.ts         # Firebase Initialization
```

## Setup and Installation

**Prerequisites:** 
- Node.js
- Firebase Project Setup (if using live DB)

1. **Install dependencies:**
   ```bash
   npm install ("to install npm packages")
   ```

2. **Configure Environment Variables:**
   Update the `.env` file with your Gemini API key and Firebase configuration details (if applicable).
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the Application locally:**
   ```bash
   npm run dev
   ```
   *This command spins up the local server (via `tsx server.ts`) which serves both the API endpoints and the frontend application.*

## Technologies Used

- **Frontend:** React, Vite, TypeScript, Tailwind CSS (or standard CSS)
- **Backend:** Node.js, Express, TypeScript (`tsx`)
- **Database / Auth:** Firebase Firestore, Firebase Authentication
- **AI Integration:** Google Gemini API
