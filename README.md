# CareTrack — Patient Health Monitoring System

A full-stack health monitoring system for patients with conditions like Type 2 Diabetes and Obesity.

## Project Structure

```
caretrack/
├── backend/          ← Node.js + Express + MongoDB
└── frontend/         ← Next.js 14 + Tailwind CSS
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add your MongoDB URI and JWT secret
npm run dev
```

Backend runs on: http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## Features

- 🏠 **Landing Page** — Public-facing page with feature overview
- 🔐 **Auth** — Register / Login with JWT
- 📊 **Dashboard** — Live stats, charts, risk badge
- 📁 **Reports** — Upload lab reports, view history
- 🏃 **Daily Activity** — Log steps, weight, glucose, water
- ⚠️ **Risk & Insights** — Rule-based risk detection
- 🤖 **Care Assistant** — AI-powered chatbot (Claude API)
- 👤 **Profile** — View & edit patient details

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend   | Node.js, Express, MongoDB, Mongoose, JWT, Multer |
| AI        | Anthropic Claude API (chatbot) |
