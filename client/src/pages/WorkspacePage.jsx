import { useState, useRef, useEffect } from "react";
import axios from "axios";
import SummaryTab from "../components/SummaryTab";
import FlashcardsTab from "../components/FlashcardsTab";
import QuizTab from "../components/QuizTab";
import StudyPlanTab from "../components/StudyPlanTab";
import { useNavigate, useSearchParams } from "react-router-dom";

const TABS = [
  { label: "Summary", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Flashcards", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { label: "Quiz", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { label: "Study Plan", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const LS_KEY = "studyflow_last_session";
const MAX_CHARS = 15000;
const QUESTION_COUNTS = [5, 10, 15];
const LOADING_STEPS = [
  "Reading your content�",
  "Identifying key concepts�",
  "Generating summary�",
  "Creating flashcards�",
  "Building quiz questions�",
  "Designing study plan�",
  "Almost done�",
];

const POPULAR_TOPICS = [
  "Photosynthesis", "World War II", "Newton's Laws of Motion",
  "The American Civil War", "Cell Division (Mitosis & Meiosis)",
  "Supply and Demand", "Shakespeare's Hamlet", "The French Revolution",
  "DNA and Genetics", "Algebra � Quadratic Equations",
];

export default function WorkspacePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: "notes" or "topic"
  const [mode, setMode] = useState("notes");

  // Notes mode state
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const fileRef = useRef(null);

  // Topic mode state
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [questionCount, setQuestionCount] = useState(5);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch { return null; }
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // If launched with a topic param, switch to topic mode and auto-generate
  useEffect(() => {
    const t = searchParams.get("topic");
    if (t) {
      setMode("topic");
      setTopic(t);
    }
  }, []);

  useEffect(() => {
    if (results) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(results)); } catch {}
    }
  }, [results]);

  // Animate loading steps
  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const id = setInterval(() => {
      setLoadingStep(s => (s + 1) % LOADING_STEPS.length);
    }, 1800);
    return () => clearInterval(id);
  }, [loading]);

  const hasInput = mode === "topic" ? topic.trim().length >= 2 : (text.trim().length > 0 || !!fileName);
  const charCount = text.length;
  const overLimit = mode === "notes" && charCount > MAX_CHARS;

  async function handleGenerate() {
    if (overLimit) return;
    setError("");
    setLoading(true);
    setResults(null);
    try {
      let res;
      if (mode === "topic") {
        res = await axios.post("/api/generate-topic", { topic: topic.trim(), difficulty, questionCount });
      } else if (fileName && fileRef.current) {
        const formData = new FormData();
        formData.append("file", fileRef.current);
        formData.append("questionCount", String(questionCount));
        res = await axios.post("/api/generate-file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post("/api/generate", { text, questionCount });
      }
      setResults(res.data);
      setActiveTab(0);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(file) {
    if (!file) return;
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt)$/i)) {
      setError("Please upload a PDF or TXT file."); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB."); return;
    }
    fileRef.current = file;
    setFileName(file.name);
    setText("");
    setError("");
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (loading) return;
    handleFileChange(e.dataTransfer.files[0]);
  }

  function clearFile() {
    fileRef.current = null;
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  }

  function handleReset() {
    setText(""); clearFile();
    setTopic(""); setResults(null); setError("");
    localStorage.removeItem(LS_KEY);
  }

  function switchMode(m) {
    setMode(m);
    setError("");
    setResults(null);
    localStorage.removeItem(LS_KEY);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-sm">StudyFlow AI</span>
        </button>
        <div className="flex items-center gap-3">
          {results && <span className="text-xs text-slate-500 hidden sm:block">Session saved</span>}
          {(results || text || fileName || topic) && (
            <button onClick={handleReset} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10 rounded-lg px-3 py-1.5">
              New Session
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 max-w-screen-2xl mx-auto w-full">
        {/* LEFT: Input Panel */}
        <div className="lg:w-[440px] lg:min-w-[400px] border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-semibold text-base mb-1">Study Input</h2>
            <p className="text-xs text-slate-400">Use your own notes or let AI teach you any topic.</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-900 rounded-xl p-1 gap-1">
            <button
              onClick={() => switchMode("notes")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${mode === "notes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              My Notes
            </button>
            <button
              onClick={() => switchMode("topic")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${mode === "topic" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Any Topic
            </button>
          </div>

          {/* NOTES MODE */}
          {mode === "notes" && (
            <>
              {/* File Upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); if (!loading) setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !fileName && !loading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                  loading ? "border-white/5 opacity-40 cursor-not-allowed"
                  : isDragging ? "border-indigo-500 bg-indigo-500/10 cursor-copy"
                  : fileName ? "border-emerald-500/50 bg-emerald-500/5 cursor-default"
                  : "border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" disabled={loading} onChange={(e) => handleFileChange(e.target.files[0])} />
                {fileName ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate max-w-[220px] text-left">{fileName}</span>
                    </div>
                    {!loading && <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="text-slate-500 hover:text-white text-xs cursor-pointer ml-2 shrink-0">Remove</button>}
                  </div>
                ) : (
                  <div>
                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-slate-400">Drag & drop or <span className="text-indigo-400">browse</span></p>
                    <p className="text-xs text-slate-600 mt-1">PDF or TXT, max 10MB</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-white/5"></div>
                <span className="text-xs text-slate-500">or paste below</span>
                <div className="flex-1 border-t border-white/5"></div>
              </div>

              <div className="relative flex flex-col">
                <textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value); if (e.target.value && fileName) clearFile(); }}
                  disabled={!!fileName || loading}
                  placeholder="Paste your lecture notes, textbook content, or any study material here..."
                  className={`min-h-[200px] lg:min-h-[280px] bg-slate-900 border rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none transition-colors disabled:opacity-40 ${overLimit ? "border-red-500/60" : "border-white/10 focus:border-indigo-500/60"}`}
                />
                {!fileName && (
                  <div className={`text-xs mt-1.5 text-right ${overLimit ? "text-red-400" : "text-slate-600"}`}>
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TOPIC MODE */}
          {mode === "topic" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Topic or Subject</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && hasInput && !loading && handleGenerate()}
                  disabled={loading}
                  placeholder="e.g. Photosynthesis, World War II, Quadratic Equations..."
                  className="w-full bg-slate-900 border border-white/10 focus:border-indigo-500/60 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors disabled:opacity-40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Difficulty Level</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm capitalize font-medium transition-all cursor-pointer border ${
                        difficulty === d
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Topics */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Popular Topics</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        topic === t
                          ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                          : "border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quiz question count */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Quiz Questions</label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                    questionCount === n
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {n} Qs
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!hasInput || loading || overLimit}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {LOADING_STEPS[loadingStep]}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {overLimit ? "Text too long � trim it down" : mode === "topic" ? "Generate Study Materials" : "Generate Study Materials"}
              </>
            )}
          </button>
        </div>

        {/* RIGHT: Output Panel */}
        <div className="flex-1 flex flex-col p-6 min-h-[60vh] lg:min-h-0">
          {loading && <LoadingState mode={mode} topic={topic} />}
          {!loading && !results && <EmptyState mode={mode} />}
          {!loading && results && (
            <div className="flex flex-col h-full">
              {results._topic && (
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Topic: <span className="text-white font-medium">{results._topic}</span></span>
                  <span className="text-slate-600">�</span>
                  <span className="capitalize text-slate-500">{results._difficulty} level</span>
                </div>
              )}
              <div className="flex gap-1 bg-slate-900 rounded-xl p-1 mb-6 overflow-x-auto shrink-0">
                {TABS.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${activeTab === i ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeTab === 0 && <SummaryTab data={results.summary} />}
                {activeTab === 1 && <FlashcardsTab cards={results.flashcards} />}
                {activeTab === 2 && <QuizTab questions={results.quiz} />}
                {activeTab === 3 && <StudyPlanTab plan={results.studyPlan} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ mode, topic }) {
  const steps = mode === "topic"
    ? ["Researching topic", "Writing summary", "Creating flashcards", "Building quiz", "Planning schedule"]
    : ["Extracting key concepts", "Generating flashcards", "Building quiz", "Planning schedule"];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-white mb-2">
          {mode === "topic" ? `Generating materials for "${topic}"...` : "Analyzing your material..."}
        </h3>
        <p className="text-sm text-slate-400 max-w-xs">
          {mode === "topic"
            ? "AI is building a complete study package on this topic from scratch."
            : "AI is generating your summary, flashcards, quiz, and study plan."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500 max-w-sm">
        {steps.map((s, i) => (
          <span key={s} className="bg-slate-800 px-3 py-1 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.25}s` }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ mode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center text-slate-500">
      <div className="w-20 h-20 bg-slate-800/60 rounded-2xl flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-slate-300 mb-1">Your study materials will appear here</h3>
        <p className="text-sm max-w-sm">
          {mode === "topic"
            ? <>Type any topic on the left and click <span className="text-indigo-400">Generate Study Materials</span>.</>
            : <>Paste notes or upload a file on the left, then click <span className="text-indigo-400">Generate Study Materials</span>.</>}
        </p>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-600">
        <span>?? Summary</span>
        <span>?? Flashcards</span>
        <span>? Quiz</span>
        <span>?? Study Plan</span>
      </div>
    </div>
  );
}
