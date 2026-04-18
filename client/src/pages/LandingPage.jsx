import { useNavigate } from 'react-router-dom';

const QUICK_TOPICS = [
  { emoji: '🧬', label: 'Biology', topic: 'Cell Biology and Genetics' },
  { emoji: '⚗️', label: 'Chemistry', topic: 'Chemical Bonding and Reactions' },
  { emoji: '⚡', label: 'Physics', topic: "Newton's Laws of Motion" },
  { emoji: '📐', label: 'Algebra', topic: 'Algebraic Equations and Functions' },
  { emoji: '🌍', label: 'World History', topic: 'World War II' },
  { emoji: '🏛️', label: 'US History', topic: 'The American Civil War' },
  { emoji: '📖', label: 'Literature', topic: "Shakespeare's Hamlet" },
  { emoji: '💰', label: 'Economics', topic: 'Supply and Demand' },
  { emoji: '🧠', label: 'Psychology', topic: 'Classical and Operant Conditioning' },
  { emoji: '💻', label: 'CS Basics', topic: 'How Computers Work — CPU, Memory, and Storage' },
  { emoji: '🔬', label: 'Anatomy', topic: 'Human Digestive System' },
  { emoji: '🌱', label: 'Environment', topic: 'Climate Change and the Carbon Cycle' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">StudyFlow AI</span>
        </div>
        <button
          onClick={() => navigate('/workspace')}
          className="text-sm text-indigo-300 hover:text-white transition-colors cursor-pointer"
        >
          Go to App →
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-300 text-sm mb-8">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
          AI-Powered Study Assistant
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent leading-tight">
          Transform Notes<br />Into Mastery
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
          Paste your notes, upload a file, or just type any topic. StudyFlow AI instantly generates a summary, flashcards, a quiz, and a personalized study plan — no notes required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/workspace')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-indigo-900/50 hover:shadow-indigo-700/50 hover:-translate-y-0.5 cursor-pointer"
          >
            Start Studying →
          </button>
          <button
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 cursor-pointer border border-white/10"
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '4 Outputs', label: 'per session' },
            { value: 'Notes or Topics', label: 'two input modes' },
            { value: '100%', label: 'AI-powered' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Quick Start */}
      <section className="bg-slate-900/40 border-t border-white/5 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">No Notes? No Problem.</h2>
            <p className="text-slate-400">Pick any subject and AI will build your full study package from scratch.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {QUICK_TOPICS.map((t) => (
              <button
                key={t.label}
                onClick={() => navigate(`/workspace?topic=${encodeURIComponent(t.topic)}`)}
                className="group bg-slate-800/60 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/40 rounded-2xl p-5 text-left transition-all duration-200 cursor-pointer"
              >
                <div className="text-2xl mb-2">{t.emoji}</div>
                <div className="font-semibold text-sm text-white group-hover:text-indigo-200 transition-colors">{t.label}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-snug">{t.topic}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-900/60 border-t border-white/5 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-white">Everything You Need to Study</h2>
          <p className="text-slate-400 text-center mb-14">One input. Four powerful outputs.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📄',
                title: 'Smart Summary',
                desc: 'Key ideas, definitions, and main concepts extracted and simplified from your notes.',
              },
              {
                icon: '🃏',
                title: 'Flashcards',
                desc: 'Active recall cards generated from core concepts. Flip, shuffle, and review.',
              },
              {
                icon: '✅',
                title: 'Practice Quiz',
                desc: 'Multiple-choice questions with instant feedback and explanations to test your understanding.',
              },
              {
                icon: '📅',
                title: 'Study Plan',
                desc: 'A structured day-by-day learning schedule tailored to your material.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-slate-800/60 border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to study smarter?</h2>
        <p className="text-slate-400 mb-8">This tool reduces hours of manual studying into a structured learning system in seconds.</p>
        <button
          onClick={() => navigate('/workspace')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-indigo-900/50 cursor-pointer"
        >
          Start Studying for Free →
        </button>
      </section>

      <footer className="border-t border-white/5 px-8 py-6 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} StudyFlow AI. Built to help students learn better.
      </footer>
    </div>
  );
}
