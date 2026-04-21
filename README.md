# Kainos Gen

An AI-powered generator for text, code, and images — built with React, Vite, and NVIDIA NIM.

## Features

- **Text Generator** — Write essays, stories, emails and more
- **Code Generator** — Generate and convert code across 20+ languages
- **Image Generator** — Create images using Pollinations AI (free, no key needed)
- **Prompt Library** — Pre-built prompts to get started fast
- **Background Jobs** — All generations run in the background, switch tabs freely

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- NVIDIA NIM API (`qwen/qwen3.5-122b-a10b`) for text & code
- Pollinations.ai for image generation (free, no key needed)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/GiftMahlambi/kainos-Content-Genator.git
cd kainos-Content-Genator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your NVIDIA API key (free at https://build.nvidia.com):

```
VITE_NVIDIA_API_KEY="nvapi-your_key_here"
```

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:8080

## How It Works

- **Text & Code** — Powered by NVIDIA NIM `qwen/qwen3.5-122b-a10b`, one of the most capable free models available
- **Images** — Generated via Pollinations.ai using Flux — no API key or account needed
- **Background Jobs** — Every generation runs in the background so you can switch tabs freely and get notified when done

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_NVIDIA_API_KEY` | NVIDIA NIM API key — get free at https://build.nvidia.com |
