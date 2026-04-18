import { useState, useEffect } from 'react';

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function FlashcardsTab({ cards }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(cards);
  const [mastered, setMastered] = useState(new Set());
  const [reviewMode, setReviewMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset when new cards arrive from a fresh generation
  useEffect(() => {
    setShuffled(cards);
    setCurrent(0);
    setFlipped(false);
    setMastered(new Set());
    setReviewMode(false);
  }, [cards]);

  // Keyboard shortcuts: Space=flip, ←/→=navigate
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffled.length, reviewMode, mastered.size, current]);

  const displayCards = reviewMode ? shuffled.filter((_, i) => !mastered.has(i)) : shuffled;

  if (!cards || cards.length === 0) return <p className="text-slate-500 text-sm">No flashcards generated.</p>;

  // All mastered in review mode
  if (reviewMode && displayCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-bold text-white">All cards mastered!</h3>
        <p className="text-slate-400 text-sm">You've learned all {cards.length} cards.</p>
        <button
          onClick={() => { setMastered(new Set()); setReviewMode(false); setCurrent(0); }}
          className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-xl px-4 py-2 transition-colors cursor-pointer"
        >
          Start Over
        </button>
      </div>
    );
  }

  function handleShuffle() {
    const arr = [...shuffled].sort(() => Math.random() - 0.5);
    setShuffled(arr);
    setCurrent(0);
    setFlipped(false);
    setMastered(new Set());
  }

  function go(dir) {
    setCurrent((c) => (c + dir + displayCards.length) % displayCards.length);
    setFlipped(false);
  }

  function toggleMastered(idx) {
    setMastered(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function handleCopyAll() {
    const text = shuffled.map((c, i) => `Q${i + 1}: ${c.question}\nA: ${c.answer}`).join('\n\n');
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const card = displayCards[current % displayCards.length];
  const cardOriginalIdx = shuffled.indexOf(card);
  const isMastered = mastered.has(cardOriginalIdx);
  const masteredCount = mastered.size;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Stats & controls */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>{current + 1} / {displayCards.length}{reviewMode ? ' (review)' : ''}</span>
          {masteredCount > 0 && (
            <span className="text-emerald-400 font-medium">{masteredCount}/{shuffled.length} mastered</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setReviewMode(r => !r); setCurrent(0); setFlipped(false); }}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              reviewMode ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300' : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {reviewMode ? 'Exit Review' : 'Review Mode'}
          </button>
          <button onClick={handleShuffle} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Shuffle
          </button>
          <button onClick={handleCopyAll} className="flex items-center gap-1 transition-colors cursor-pointer">
            {copied
              ? <span className="text-emerald-400">Copied!</span>
              : <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-400 hover:text-white">Copy All</span>
                </>
            }
          </button>
        </div>
      </div>

      {/* Progress bars */}
      <div className="w-full space-y-1">
        <div className="w-full bg-slate-800 rounded-full h-1">
          <div
            className="bg-indigo-500 h-1 rounded-full transition-all"
            style={{ width: `${((current + 1) / displayCards.length) * 100}%` }}
          />
        </div>
        {masteredCount > 0 && (
          <div className="w-full bg-slate-800 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full transition-all" style={{ width: `${(masteredCount / shuffled.length) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped((f) => !f)}
        className="w-full max-w-xl cursor-pointer select-none"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '220px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {isMastered && (
              <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">✓ Mastered</div>
            )}
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">Question</div>
            <p className="text-lg font-medium text-white leading-relaxed">{card.question}</p>
            <p className="text-xs text-slate-500 mt-6">Click or Space to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-4">Answer</div>
            <p className="text-lg text-white leading-relaxed">{card.answer}</p>
          </div>
        </div>
      </div>

      {/* Navigation + mastery */}
      <div className="flex items-center gap-3 w-full max-w-xl justify-between">
        <button
          onClick={() => go(-1)}
          className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => { toggleMastered(cardOriginalIdx); if (!isMastered) go(1); }}
            className={`text-sm px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              isMastered
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                : 'border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40'
            }`}
          >
            {isMastered ? '✓ Mastered' : '✓ Got it'}
          </button>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
          >
            {flipped ? 'Show question' : 'Reveal answer'}
          </button>
        </div>
        <button
          onClick={() => go(1)}
          className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-slate-600">← → to navigate · Space to flip</p>

      {/* All cards overview */}
      <div className="w-full mt-2 border-t border-white/5 pt-6">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">All Cards</h4>
        <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
          {shuffled.map((c, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(reviewMode ? Math.max(0, displayCards.indexOf(c)) : i); setFlipped(false); }}
              className={`text-left p-3 rounded-xl border text-sm transition-all cursor-pointer flex items-start gap-2 ${
                mastered.has(i)
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/5 bg-slate-900/50 text-slate-400 hover:text-white hover:border-white/10'
              }`}
            >
              {mastered.has(i) && <span className="text-emerald-400 shrink-0 mt-0.5 text-xs">✓</span>}
              <span className={`font-mono text-xs mr-1 shrink-0 ${mastered.has(i) ? 'text-emerald-500/50' : 'text-indigo-400'}`}>{i + 1}.</span>
              <span className={mastered.has(i) ? 'text-emerald-300/50 line-through line-clamp-1' : 'line-clamp-1'}>{c.question}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
