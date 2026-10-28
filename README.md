 Customer Support Ticket Mobile App

An intuitive, modern cross-platform mobile application built with React Native and Expo. This app enables users to submit support requests, categorize their issues, attach screenshots, and transmit notifications directly through integrated third-party cloud services.

🌟 Features

Dynamic Issue Categorization: Supports preset categories (Account Problem, Technical Issue, Payment Concern, and Other).

Interactive UI Animations: Smooth animated input transitions when selecting custom issue descriptions.

Modern 3D-Elevated Design: Clean dark-mode interface featuring high-contrast cards, realistic depth shadows, and responsive touch feedback.

Cloud Screenshot Storage: Automatic image upload and transformation via Cloudinary API.

Direct Email Dispatch: Serverless email delivery using EmailJS REST API without heavy frontend SDK dependencies.

Strict Mode Security: Includes private key authentication to comply with strict API execution policies.

🛠️ Tech Stack & Dependencies

Framework: Expo Framework (React Native)

Media Management: expo-image-picker

File System Processing: expo-file-system (Legacy Base64 Encoding)

Cloud Storage: Cloudinary Upload API

Email Service: EmailJS REST API

📂 Required Environment Variables

To run this application securely, create a .env file in the root folder of your project and configure the following variable keys:

# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# EmailJS Service Configuration
EXPO_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EXPO_PUBLIC_EMAILJS_PRIVATE_KEY=your_emailjs_private_key


🚀 Quick Start & Installation

1. Prerequisites

Ensure you have the following installed on your development machine:

Node.js (v18.0.0 or higher)

npm or yarn

Expo Go App on your mobile device (iOS/Android) or an Emulator (Android Studio / Xcode)

2. Setup Project Dependencies

Open your command line terminal in the project directory and run:

# Install core dependencies
npm install

# Start the Metro bundler
npx expo start


3. Launching the App

Physical Device: Scan the QR code displayed in your terminal using the Expo Go application.

Android Emulator: Press a in the terminal session to run on an active Android Virtual Device (AVD).

iOS Simulator: Press i in the terminal session (macOS required).

📖 User Manual & How It Works

 ┌────────────────┐     ┌──────────────────┐     ┌─────────────────┐
 │ User Fills Form│ ──> │ Uploads Image to │ ──> │ Triggers Email  │
 │ & Screenshot   │     │ Cloudinary API   │     │ via EmailJS API │
 └────────────────┘     └──────────────────┘     └─────────────────┘


Filling Details: Enter your full name, email address, and select an issue category.

Custom Category Option: If you select "Other", an animated input field will automatically slide into view asking for a detailed description.

Attaching Media: Tap 📷 SELECT SCREENSHOT to pick an image from your device gallery. You can preview or remove the chosen image before sending.

Submitting Ticket: Press SUBMIT SUPPORT TICKET. The application converts the image into base64 format, uploads it to Cloudinary, attaches the generated image URL to the EmailJS payload, and dispatches the ticket directly to the administrator's inbox.
