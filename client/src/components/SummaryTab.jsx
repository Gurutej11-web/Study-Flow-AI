import { useState } from 'react';

function CopyBtn({ getText }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(getText()).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handle} className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1">
      {copied
        ? <span className="text-emerald-400">Copied!</span>
        : <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </>
      }
    </button>
  );
}

export default function SummaryTab({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Key Ideas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Key Ideas</h3>
          <CopyBtn getText={() => data.keyIdeas?.map((k, i) => `${i + 1}. ${k}`).join('\n') || ''} />
        </div>
        <ul className="space-y-2">
          {data.keyIdeas?.map((idea, i) => (
            <li key={i} className="flex items-start gap-3 bg-slate-900/60 rounded-xl px-4 py-3 border border-white/5">
              <span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-slate-200 leading-relaxed">{typeof idea === "string" ? idea : JSON.stringify(idea)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Definitions */}
      {data.definitions?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Definitions</h3>
            <CopyBtn getText={() => data.definitions?.map(d => `${d.term}: ${d.definition}`).join('\n') || ''} />
          </div>
          <div className="grid gap-3">
            {data.definitions.map((d, i) => (
              <div key={i} className="bg-slate-900/60 border border-white/5 rounded-xl px-4 py-3">
                <div className="font-semibold text-purple-300 text-sm mb-1">{typeof d.term === "string" ? d.term : JSON.stringify(d.term)}</div>
                <div className="text-sm text-slate-300 leading-relaxed">{typeof d.definition === "string" ? d.definition : JSON.stringify(d.definition)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Concepts */}
      {data.mainConcepts?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Main Concepts</h3>
            <CopyBtn getText={() => data.mainConcepts?.join(', ') || ''} />
          </div>
          <div className="flex flex-wrap gap-2">
            {data.mainConcepts.map((c, i) => (
              <span
                key={i}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm px-3 py-1.5 rounded-lg"
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
