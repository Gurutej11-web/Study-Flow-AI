export default function StudyPlanTab({ plan }) {
  if (!plan || plan.length === 0) return <p className="text-slate-500 text-sm">No study plan generated.</p>;

  const dayColors = [
    'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30',
    'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  ];

  const dotColors = [
    'bg-indigo-500',
    'bg-purple-500',
    'bg-cyan-500',
    'bg-emerald-500',
    'bg-amber-500',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm text-slate-400">{plan.length}-day study plan</span>
      </div>

      {plan.map((day, i) => (
        <div
          key={i}
          className={`bg-gradient-to-br ${dayColors[i % dayColors.length]} border rounded-2xl p-5`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2.5 h-2.5 rounded-full ${dotColors[i % dotColors.length]}`}></div>
            <h3 className="font-semibold text-white text-sm">
              Day {day.day}{day.title ? `: ${day.title}` : ''}
            </h3>
          </div>
          <ul className="space-y-2 ml-4">
            {day.tasks?.map((task, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                <svg className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {task}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
