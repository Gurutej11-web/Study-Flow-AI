import { useState, useEffect } from 'react';

export default function QuizTab({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [activeQ, setActiveQ] = useState(0);

  // Reset when new questions arrive from a fresh generation
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setActiveQ(0);
  }, [questions]);

  // Keyboard shortcuts: 1-4 select option, Enter submits/retries
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4 && !submitted) {
        handleSelect(activeQ, num - 1);
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveQ(q => Math.min(q + 1, questions.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveQ(q => Math.max(q - 1, 0)); }
      if (e.key === 'Enter') {
        if (submitted) { handleReset(); }
        else if (allAnswered) { handleSubmit(); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, activeQ, answers, questions]);

  if (!questions || questions.length === 0) return <p className="text-slate-500 text-sm">No quiz questions generated.</p>;

  const score = Object.entries(answers).filter(
    ([i, a]) => questions[parseInt(i)].correctIndex === a
  ).length;

  function handleSelect(qIndex, optIndex) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  function handleSubmit() {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitted(true);
  }

  function handleReset() {
    setAnswers({});
    setSubmitted(false);
  }

  const allAnswered = Object.keys(answers).length === questions.length;
  const percent = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-6">
      {submitted && (
        <div className={`rounded-2xl p-5 border flex items-center justify-between ${
          percent >= 80
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : percent >= 50
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div>
            <div className={`text-2xl font-bold ${percent >= 80 ? 'text-emerald-400' : percent >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {score} / {questions.length} correct
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              {percent >= 80 ? 'Excellent work! 🎉' : percent >= 50 ? 'Good effort — review the missed ones!' : 'Keep studying — you\'ll get there!'}
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-slate-400 hover:text-white border border-white/10 rounded-xl px-4 py-2 transition-colors cursor-pointer"
          >
            Retry Quiz
          </button>
        </div>
      )}

      {questions.map((q, i) => {
        const selected = answers[i];
        const isCorrect = submitted && selected === q.correctIndex;
        const isWrong = submitted && selected !== undefined && selected !== q.correctIndex;

        return (
          <div
            key={i}
            onClick={() => setActiveQ(i)}
            className={`bg-slate-900/60 border rounded-2xl p-5 transition-all cursor-pointer ${
              submitted
                ? isCorrect
                  ? 'border-emerald-500/40'
                  : isWrong
                  ? 'border-red-500/40'
                  : 'border-white/5'
                : activeQ === i
                ? 'border-indigo-500/30'
                : 'border-white/5'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm font-medium text-white leading-relaxed">{q.question}</p>
            </div>

            <div className="grid gap-2 ml-9">
              {q.options.map((opt, j) => {
                const isSelected = selected === j;
                const isCorrectOpt = submitted && j === q.correctIndex;
                const isWrongSelected = submitted && isSelected && j !== q.correctIndex;

                return (
                  <button
                    key={j}
                    onClick={() => handleSelect(i, j)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
                      isCorrectOpt
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                        : isWrongSelected
                        ? 'border-red-500/60 bg-red-500/10 text-red-300'
                        : isSelected
                        ? 'border-indigo-500/60 bg-indigo-500/10 text-white'
                        : 'border-white/5 bg-slate-800/50 text-slate-300 hover:border-white/20 hover:text-white'
                    } ${submitted ? 'cursor-default' : ''}`}
                  >
                    <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + j)})</span>
                    {opt.replace(/^[A-D]\)\s*/, '')}
                    {isCorrectOpt && <span className="ml-2 text-xs">✓</span>}
                    {isWrongSelected && <span className="ml-2 text-xs">✗</span>}
                  </button>
                );
              })}
            </div>

            {submitted && q.explanation && (
              <div className="ml-9 mt-3 text-xs text-slate-400 bg-slate-800/50 rounded-xl px-3 py-2 border border-white/5">
                <span className="text-slate-500 mr-1">Explanation:</span> {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all cursor-pointer text-sm"
          >
            {allAnswered ? 'Submit Quiz' : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
          </button>
          <p className="text-xs text-slate-600 text-center">1–4 to select · ↑↓ to switch question · Enter to submit</p>
        </>
      )}
    </div>
  );
}
