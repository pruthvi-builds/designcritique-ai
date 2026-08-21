"use client";

import { useRef, useState } from "react";
import type { CritiqueResult } from "@/lib/critique-schema";
import { CritiqueResultView } from "@/components/CritiqueResultView";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CritiqueResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    setError(null);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.set("image", file);

      const response = await fetch("/api/critique", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResult(data.critique);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Design critique</h1>
        <p className="mt-1 text-stone-600">
          Upload a UI screenshot and get a real AI-powered heuristic evaluation — scored
          against Nielsen&apos;s 10 usability heuristics, with specific findings and
          suggested fixes.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-md file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-stone-700"
        />

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a static asset
          <img
            src={previewUrl}
            alt="Selected screenshot preview"
            className="mt-4 max-h-96 rounded-md border border-stone-200"
          />
        )}

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="mt-4 rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze design"}
        </button>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </div>

      {result && <CritiqueResultView result={result} />}
    </div>
  );
}
