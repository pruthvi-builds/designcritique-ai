"use client";

import { useMemo, useState } from "react";
import { checkContrast, isValidHexColor, type WcagLevel } from "@/lib/contrast";

const LEVEL_STYLES: Record<WcagLevel, string> = {
  AAA: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  AA: "bg-amber-50 text-amber-700 ring-amber-200",
  Fail: "bg-rose-50 text-rose-700 ring-rose-200",
};

function LevelBadge({ label, level }: { label: string; level: WcagLevel }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-stone-100 px-3 py-2">
      <span className="text-sm text-stone-600">{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${LEVEL_STYLES[level]}`}
      >
        {level === "Fail" ? "Fail" : `Pass (${level})`}
      </span>
    </div>
  );
}

export default function ContrastCheckerPage() {
  const [foreground, setForeground] = useState("#1c1917");
  const [background, setBackground] = useState("#fafaf9");

  const result = useMemo(() => {
    if (!isValidHexColor(foreground) || !isValidHexColor(background)) return null;
    return checkContrast(foreground, background);
  }, [foreground, background]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Contrast checker</h1>
        <p className="mt-1 text-stone-600">
          WCAG 2.x contrast ratio and AA/AAA conformance for a foreground/background color
          pair — computed locally, deterministically, no AI involved.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Text (foreground) color
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={isValidHexColor(foreground) ? foreground : "#000000"}
                onChange={(e) => setForeground(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-stone-300"
              />
              <input
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-stone-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">Background color</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={isValidHexColor(background) ? background : "#ffffff"}
                onChange={(e) => setBackground(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-stone-300"
              />
              <input
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-stone-500 focus:outline-none"
              />
            </div>
          </div>

          <div
            className="rounded-md border border-stone-200 p-6 text-center text-lg font-medium"
            style={{
              color: isValidHexColor(foreground) ? foreground : undefined,
              background: isValidHexColor(background) ? background : undefined,
            }}
          >
            The quick brown fox
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Result
          </h2>
          {!result ? (
            <p className="mt-3 text-sm text-stone-400">Enter two valid hex colors.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-3xl font-bold text-stone-900">{result.ratio}:1</p>
              <LevelBadge label="Normal text" level={result.normalText} />
              <LevelBadge label="Large text (18pt+/14pt bold+)" level={result.largeText} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
