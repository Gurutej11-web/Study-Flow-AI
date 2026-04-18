# StudyFlow AI

AI-powered study assistant that converts raw notes into summaries, flashcards, quizzes, and study plans.

## Setup

### 1. Configure the server

```bash
cd server
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 2. Install & run the server

```bash
cd server
npm install
npm run dev
# Runs on http://localhost:3001
```

### 3. Install & run the frontend

```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-4o-mini
- **File parsing**: pdf-parse (PDF support)

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key from https://platform.openai.com |
| `PORT` | Server port (default: 3001) |
