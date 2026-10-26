# EditMind AI — Autonomous Video Creation & Editing Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC)](https://tailwindcss.com/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Engine-007808)](https://ffmpeg.org/)

**EditMind AI** is an intelligent web-based studio that transforms raw video clips into polished, social-ready videos. By analyzing footage and reverse-engineering reference styles, it automates the full video creation workflow—from multi-track timeline assembly to final MP4 rendering.

---

## Key Highlights

- **Tri-Direction Planning Engine**: Automatically generates three distinct Edit Decision Lists (EDLs) from the same raw footage:
  - **Story**: Narrative-driven arc with cinematic pacing and breathing room.
  - **Hype**: Fast-paced, punchy, beat-synced cuts optimized for TikTok and Instagram Reels.
  - **Clean**: Crisp, minimal edits tailored for product demos, vlogs, and tutorials.
- **Reference DNA Extraction**: Reverse-engineers any viral reference video to extract and clone its stylistic blueprint—including cut pace, average shot length, aspect ratio, color palette, and caption styling.
- **Conversational AI Copilot**: Allows non-destructive editing via natural language commands (e.g., *"Make the intro faster"*, *"Lower background music"*, *"Make captions minimal"*).
- **AI Quality Inspector & 1-Click Auto-Fix**: Automatically detects production flaws such as micro-cuts under 0.5s, loud soundtrack clipping, and overlapping captions, resolving them with one click.
- **Multi-Language Captions**: Generates styled captions with animated pop highlights supporting English and Indic languages (Hindi, Tamil, Malayalam).
- **Native FFmpeg Render Pipeline**: Features a deterministic backend rendering engine that handles clip trimming, aspect-ratio scaling (9:16, 16:9, 1:1), color grading LUTs, audio ducking, and master MP4 export.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Frontend**: React 19, Tailwind CSS, Lucide Icons
- **Language**: TypeScript & Zod validation
- **Media Engine**: Native FFmpeg & FFprobe child processes
- **Storage**: Local JSON EDLs with automated version history & rollback

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.17+ or v20+)
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/yaddavv7/EditMind-AI.git
cd EditMind-AI
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run the Pipeline Test Suite
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## License
MIT
