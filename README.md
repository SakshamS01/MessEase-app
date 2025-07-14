# 🍽️ Campus MessEase – Mess Management System

A smart mess management system designed for college campuses to streamline menu planning, inventory tracking, announcements, student feedback, and more — all in one place.

## 🚀 Overview

**MessEase** is a full-stack web application built for students and mess administrators to efficiently manage daily mess operations. It supports real-time updates, feedback mechanisms, inventory monitoring, and poll-based meal selection.

---

## 🎯 Features

### 👨‍🎓 Student Dashboard
- 📋 View today’s menu
- ✅ Vote in food preference polls
- 🗣️ Submit complaints and feedback
- 📢 Receive announcements
- 📊 View poll results (if applicable)

### 🧑‍💼 Admin Dashboard
- 🍱 Add/edit daily menus
- 📦 Manage inventory with low stock alerts
- 📢 Post announcements with priority
- 📮 View and resolve student complaints
- 🗳️ Create polls and monitor votes

---

## 🔧 Tech Stack

### 🖥️ Frontend
- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

### 🔥 Backend / Cloud
- **Firebase**:
  - Firebase Authentication
  - Firestore (Database)
  - Firebase Cloud Messaging (optional)
  - Firebase Hosting (optional)
  - Firebase Cloud Functions (optional)

---

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mess-management-app.git
   cd mess-management-app

2. **Install dependencies**
    npm install

3. **Set up environment variables**

    Create a .env.local file with your Firebase config:
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...

4. **Run the development server**
    npm run dev
