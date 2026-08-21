import type { CritiqueResult } from "@/lib/critique-schema";

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-slate-50 text-slate-600 ring-slate-200",
};

function scoreColor(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.75) return "text-emerald-600";
  if (pct >= 0.5) return "text-amber-600";
  return "text-rose-600";
}

export function CritiqueResultView({ result }: { result: CritiqueResult }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Overall usability score
          </h2>
          <span className={`text-3xl font-bold ${scoreColor(result.overallScore, 100)}`}>
            {result.overallScore}
            <span className="text-base font-normal text-stone-400">/100</span>
          </span>
        </div>
        <p className="mt-2 text-stone-700">{result.summary}</p>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Top issues
        </h2>
        {result.topIssues.length === 0 ? (
          <p className="mt-2 text-sm text-stone-400">No major issues found.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {result.topIssues.map((item, i) => (
              <li key={i} className="rounded-md border border-stone-100 p-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.low
                    }`}
                  >
                    {item.severity}
                  </span>
                  <p className="text-sm font-medium text-stone-900">{item.issue}</p>
                </div>
                <p className="mt-1 text-sm text-stone-600">{item.suggestion}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Heuristic breakdown
        </h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {result.heuristics.map((h) => (
            <li key={h.name} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-900">{h.name}</p>
                <span className={`text-sm font-semibold ${scoreColor(h.score, 10)}`}>
                  {h.score}/10
                </span>
              </div>
              {h.findings.length > 0 && (
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-stone-600">
                  {h.findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
