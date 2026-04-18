import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { rateLimit } from "express-rate-limit";

dotenv.config();

if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
  console.error("\n[ERROR] GROQ_API_KEY is not set. Please add it to your .env file.\n");
  process.exit(1);
}

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment and try again." },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/api", limiter);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MAX_TEXT_LENGTH = 15000;

async function callGroq(prompt) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are an expert study assistant. You always respond with valid JSON only — no markdown, no code blocks, no extra text.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });
  return JSON.parse(response.choices[0].message.content);
}

async function generateStudyMaterials(text, questionCount = 5) {
  const trimmed = text.slice(0, MAX_TEXT_LENGTH);
  const qc = [5, 10, 15].includes(Number(questionCount)) ? Number(questionCount) : 5;
  const prompt = `Analyze the following study material and generate all four outputs.

---
${trimmed}
---

Return a single JSON object with exactly this structure:
{
  "summary": {
    "keyIdeas": ["bullet point 1", "bullet point 2", ...],
    "definitions": [{"term": "...", "definition": "..."}, ...],
    "mainConcepts": ["concept 1", "concept 2", ...]
  },
  "flashcards": [{"question": "...", "answer": "..."}, ...],
  "quiz": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": 0,
      "explanation": "..."
    }
  ],
  "studyPlan": [{"day": 1, "title": "...", "tasks": ["task 1", "task 2"]}, ...]
}

Requirements:
- Summary: at least 5 key ideas, 3-5 definitions, 3-5 main concepts
- Flashcards: at least 8 cards covering key concepts
- Quiz: exactly ${qc} multiple-choice questions with 4 options each (correctIndex is 0-based)
- Study Plan: 3-5 day plan appropriate for the content volume`;

  return callGroq(prompt);
}

async function generateFromTopic(topic, difficulty, questionCount = 5) {
  const level = ["beginner", "intermediate", "advanced"].includes(difficulty) ? difficulty : "intermediate";
  const qc = [5, 10, 15].includes(Number(questionCount)) ? Number(questionCount) : 5;
  const prompt = `Generate comprehensive study materials about the following topic at a ${level} level.

Topic: ${topic}

Return a single JSON object with exactly this structure:
{
  "summary": {
    "keyIdeas": ["bullet point 1", "bullet point 2", ...],
    "definitions": [{"term": "...", "definition": "..."}, ...],
    "mainConcepts": ["concept 1", "concept 2", ...]
  },
  "flashcards": [{"question": "...", "answer": "..."}, ...],
  "quiz": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": 0,
      "explanation": "..."
    }
  ],
  "studyPlan": [{"day": 1, "title": "...", "tasks": ["task 1", "task 2"]}, ...]
}

Requirements:
- Summary: at least 6 key ideas, 4-6 definitions of core terms, 4-6 main concepts
- Flashcards: at least 10 cards covering the most important aspects of the topic
- Quiz: exactly ${qc} multiple-choice questions testing real understanding (correctIndex is 0-based)
- Study Plan: 3-5 day plan to learn this topic thoroughly
- Tailor depth and vocabulary to ${level} level`;

  return callGroq(prompt);
}

// Route: Generate from text
app.post("/api/generate", async (req, res) => {
  const { text, questionCount } = req.body;
  if (!text || typeof text !== "string") return res.status(400).json({ error: "Invalid input." });
  const trimmed = text.trim();
  if (trimmed.length < 20) return res.status(400).json({ error: "Please provide at least 20 characters of study material." });
  if (trimmed.length > MAX_TEXT_LENGTH) return res.status(400).json({ error: `Text is too long. Maximum is ${MAX_TEXT_LENGTH.toLocaleString()} characters.` });
  try {
    res.json(await generateStudyMaterials(trimmed, questionCount));
  } catch (err) {
    console.error("Generation error:", err.message);
    res.status(500).json({ error: "AI generation failed. Please check your API key and try again." });
  }
});

// Route: Generate from topic
app.post("/api/generate-topic", async (req, res) => {
  const { topic, difficulty, questionCount } = req.body;
  if (!topic || typeof topic !== "string") return res.status(400).json({ error: "Please provide a topic." });
  const trimmed = topic.trim();
  if (trimmed.length < 2) return res.status(400).json({ error: "Topic is too short." });
  if (trimmed.length > 200) return res.status(400).json({ error: "Topic is too long." });
  try {
    res.json(await generateFromTopic(trimmed, difficulty, questionCount));
  } catch (err) {
    console.error("Topic generation error:", err.message);
    res.status(500).json({ error: "AI generation failed. Please try again." });
  }
});

// Route: Generate from file upload
app.post("/api/generate-file", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided." });
  const allowedMimes = ["application/pdf", "text/plain"];
  if (!allowedMimes.includes(req.file.mimetype)) return res.status(400).json({ error: "Only PDF and TXT files are allowed." });
  let text = "";
  try {
    if (req.file.mimetype === "application/pdf") {
      const parsed = await pdfParse(req.file.buffer);
      text = parsed.text;
    } else {
      text = req.file.buffer.toString("utf-8");
    }
  } catch (err) {
    return res.status(400).json({ error: "Could not read file. Please upload a valid PDF or TXT file." });
  }
  const trimmed = text.trim();
  if (trimmed.length < 20) return res.status(400).json({ error: "File appears to be empty or too short." });
  const { questionCount } = req.body;
  try {
    res.json(await generateStudyMaterials(trimmed, questionCount));
  } catch (err) {
    console.error("Generation error:", err.message);
    res.status(500).json({ error: "AI generation failed. Please check your API key and try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`StudyFlow AI server running on port ${PORT}`));
