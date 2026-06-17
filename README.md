# VitaTrack — Your Personal Health Companion

A premium, production-ready health tracking application built with **Next.js 14**, **React 18**, **TypeScript**, and **Tailwind CSS**. Deployed seamlessly on **Vercel**.

![VitaTrack](https://img.shields.io/badge/VitaTrack-v1.0-0ea5e9)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## Features

| Feature | Description |
|---------|-------------|
| **Home Dashboard** | Real-time health overview with stats, charts, and today's summary |
| **Lab Upload** | Drag & drop PDF/photo uploads with 10 auto-categories (Blood Work, Lipid, Thyroid, Stelo CGM...) |
| **Glucose Tracker** | Manual readings + Stelo CGM photo capture with meal context |
| **Blood Pressure** | Daily BP logging with ACC/AHA classification and trend charts |
| **Medications** | Morning & evening checklists with compliance tracking |
| **Dr. AI** | Context-aware health chat that knows your data (OpenAI-ready, fallback included) |
| **Health News** | Curated longevity, breakthrough, and research news |
| **Export** | Professional PDF reports + JSON data export for doctor visits |
| **Dark Mode** | Full light/dark theme toggle with persistent preference |
| **Toast Notifications** | Beautiful feedback for every action |
| **Responsive** | Mobile-first with bottom nav, desktop-ready with sidebar |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, Static Export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS Variables
- **State:** React Hooks + localStorage (offline-first)
- **Database:** Prisma + SQLite (ready for production upgrade)
- **Charts:** Recharts
- **PDF:** jsPDF (dynamic import)
- **AI:** OpenAI GPT-4o-mini (optional, with smart fallback)
- **Icons:** Lucide React

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- GitHub account
- Vercel account (free)

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/vitatrack.git
cd vitatrack
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```
- `OPENAI_API_KEY` — optional, for advanced AI chat
- `DATABASE_URL` — optional, for server-side database

### 3. Dev Server
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Build
```bash
npm run build
# Static output goes to /dist
```

---

## Deploy to Vercel (GitHub Integration)

### Option A: Auto Deploy Script
```bash
# On Windows, double-click:
./deploy-to-github.bat

# On Mac/Linux:
./deploy-to-github.sh
```

### Option B: Manual
```bash
git init
git add .
git commit -m "VitaTrack v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vitatrack.git
git push -u origin main
```

Then go to [vercel.com/new](https://vercel.com/new), import your repo, and click **Deploy**.

---

## Project Structure

```
vitatrack/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Dashboard
│   │   ├── layout.tsx          # Root layout with Theme & Toast providers
│   │   ├── upload/             # Lab + Glucose upload
│   │   ├── blood-pressure/     # BP tracking
│   │   ├── medications/        # Medication management
│   │   ├── dr-ai/              # AI chat
│   │   ├── news/               # Health news
│   │   └── export/             # PDF + JSON export
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── theme-provider.tsx  # Dark mode
│   │   ├── toast-provider.tsx  # Notifications
│   │   ├── Navigation.tsx      # Top nav
│   │   ├── BottomNav.tsx      # Mobile nav
│   │   ├── StatsCard.tsx      # Dashboard cards
│   │   ├── HealthChart.tsx    # Charts
│   │   └── QuickActions.tsx   # Action grid
│   ├── hooks/
│   │   └── useHealthData.ts   # Data persistence
│   ├── lib/
│   │   ├── health-categories.ts
│   │   ├── ai.ts              # AI logic + news
│   │   └── utils.ts
│   └── app/globals.css
├── prisma/
│   └── schema.prisma           # Full database schema
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Why VitaTrack?

### Professional Design Decisions
- **CSS Variables** — Full HSL theming with light/dark mode
- **Toast System** — Non-blocking user feedback on every action
- **Static Export** — Zero server required, deploys anywhere
- **Context-Aware AI** — Dr. AI reads your actual health data before answering
- **OCR Simulation** — Smart keyword detection auto-categorizes lab uploads
- **Responsive Charts** — Recharts with custom gradients and reference lines
- **PDF Export** — Doctor-ready reports with color-coded status indicators
- **Type Safety** — Strict TypeScript throughout

---

## License

MIT License — free for personal and commercial use.

## Disclaimer

VitaTrack is a personal health tracker, not a medical device. Always consult healthcare professionals for diagnosis and treatment. Dr. AI provides general information only and is not a substitute for professional medical advice.

---

**Built with care for your health journey.**
