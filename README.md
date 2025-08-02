# TerraSnap

An environmental photo sharing platform built with Next.js and Firebase.

## Features

- User authentication with Firebase (email/password)
- Protected routes
- Navigation header with routing to:
  - Take Photo page
  - Feed page
  - Profile page
- Responsive design with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication and choose Email/Password as a sign-in method
   - Copy your Firebase config from Project Settings
   - Update the config in `src/lib/firebase.js`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Configuration

Update the Firebase configuration in `src/lib/firebase.js` with your project details:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Project Structure

- `/src/app/` - Next.js app router pages
- `/src/components/` - Reusable React components
- `/src/contexts/` - React context providers
- `/src/lib/` - Utility libraries and configurations
