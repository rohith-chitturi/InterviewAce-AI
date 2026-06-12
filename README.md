<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

<h1 align="center">InterviewAce AI 🎙️</h1>

<p align="center">
  <strong>A Real-Time, Voice-Native AI Interview Coach powered by Google's Gemini 2.5 Flash</strong>
</p>

---

## 🌟 Overview

**InterviewAce AI** is a production-grade, full-stack SaaS application designed to help job seekers master their interview skills. Instead of just typing text into a chatbot, users engage in **real-time, spoken-word mock interviews** with an advanced AI agent. 

The platform intelligently parses the user's PDF resume, understands the target job role, and dynamically orchestrates a personalized interview experience—complete with follow-up questions, technical deep-dives, and real-time voice synthesis.

## 🚀 Key Features

- **Real-Time Voice Engine:** Utilizes the browser's native Web Speech API for zero-latency Speech-to-Text (STT) transcription and Text-to-Speech (TTS) synthesis. 
- **Context-Aware Intelligence:** Automatically extracts and analyzes text from PDF resumes using `pdf-parse` and feeds the context into the LLM, ensuring every question is highly relevant to the candidate's actual experience.
- **Premium UI/UX:** Built with a modern, "SaaS-tier" aesthetic featuring dark-mode gradients, glassmorphism, and complex micro-animations using Framer Motion (including a dynamic, pulsing AI Orb during voice sessions).
- **Secure Authentication:** Fully integrated with Clerk for seamless, modern user authentication and session management.
- **Robust Relational Data:** Powered by a PostgreSQL database hosted on Supabase and managed entirely through Prisma ORM to track users, resumes, interviews, and full conversational transcripts.

## 💻 Tech Stack

This application is built using a modern, scalable two-tier architecture:

### Frontend
* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **Authentication:** Clerk Auth
* **Voice Integration:** `react-speech-recognition` (Web Speech API)

### Backend
* **Runtime:** Node.js with Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL (Supabase)
* **ORM:** Prisma
* **AI Engine:** `@google/genai` (Gemini 2.5 Flash model)
* **File Processing:** Multer (in-memory parsing) & PDF-Parse

## 🧠 Technical Highlights for Recruiters & Hiring Managers

1. **Complex System Integration:** Successfully bridged a Next.js frontend with an Express backend, managing strict CORS policies and seamless data handoffs between the client and server.
2. **Advanced AI Orchestration:** Didn't just use a basic API wrapper. Engineered a prompt-chaining system that takes raw PDF text, ongoing transcript history, and user role preferences to generate highly contextual, non-repetitive responses.
3. **State & Lifecycle Management:** Built a complex React lifecycle for the Voice Engine, ensuring the microphone only listens when the AI stops speaking, preventing feedback loops and ensuring a natural conversational flow.
4. **Database Design:** Architected a robust, normalized relational database schema in PostgreSQL capable of handling cascading deletes, 1-to-Many relational linking (User -> Interviews -> Transcripts), and secure remote storage.

## ⚙️ Running Locally

If you'd like to run this application locally, you'll need two terminal windows.

**1. Start the Backend:**
```bash
cd backend
npm install
npm run dev
```
*The backend will run on `http://localhost:8080`*

**2. Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000` or `3001`*

> **Note:** You will need your own `.env` variables for Clerk, Supabase (Database & Storage), and a Google Gemini API key to run this successfully.
