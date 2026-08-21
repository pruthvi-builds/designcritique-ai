import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRunDesignCritique } = vi.hoisted(() => ({
  mockRunDesignCritique: vi.fn(),
}));

vi.mock("@/lib/gemini", async () => {
  const actual = await vi.importActual<typeof import("@/lib/gemini")>("@/lib/gemini");
  return {
    ...actual,
    runDesignCritique: mockRunDesignCritique,
  };
});

import { POST } from "@/app/api/critique/route";
import { MissingApiKeyError, GeminiRequestError } from "@/lib/gemini";

const SAMPLE_CRITIQUE = {
  overallScore: 78,
  summary: "Solid layout with a few contrast issues.",
  heuristics: [{ name: "Aesthetic and minimalist design", score: 8, findings: ["Clean spacing."] }],
  topIssues: [
    { severity: "medium", issue: "Low contrast on secondary buttons.", suggestion: "Darken the text color." },
  ],
};

function makeImageFile(sizeBytes = 1024, type = "image/png") {
  const bytes = new Uint8Array(sizeBytes);
  return new File([bytes], "screenshot.png", { type });
}

function requestWithFile(file: File | null) {
  const formData = new FormData();
  if (file) formData.set("image", file);
  return new NextRequest("http://localhost/api/critique", { method: "POST", body: formData });
}

describe("POST /api/critique", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a request with no image", async () => {
    const response = await POST(requestWithFile(null));
    expect(response.status).toBe(400);
  });

  it("rejects an unsupported file type", async () => {
    const response = await POST(requestWithFile(makeImageFile(1024, "application/pdf")));
    expect(response.status).toBe(400);
  });

  it("rejects a file over the size limit", async () => {
    const response = await POST(requestWithFile(makeImageFile(9 * 1024 * 1024)));
    expect(response.status).toBe(400);
  });

  it("returns 503 with a clear message when the API key is missing", async () => {
    mockRunDesignCritique.mockRejectedValue(new MissingApiKeyError());
    const response = await POST(requestWithFile(makeImageFile()));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toMatch(/GEMINI_API_KEY/);
  });

  it("returns 502 when the Gemini request fails", async () => {
    mockRunDesignCritique.mockRejectedValue(new GeminiRequestError("rate limited"));
    const response = await POST(requestWithFile(makeImageFile()));
    expect(response.status).toBe(502);
  });

  it("returns the critique on success", async () => {
    mockRunDesignCritique.mockResolvedValue(SAMPLE_CRITIQUE);
    const response = await POST(requestWithFile(makeImageFile()));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.critique).toEqual(SAMPLE_CRITIQUE);
    expect(mockRunDesignCritique).toHaveBeenCalledWith(
      expect.objectContaining({ mimeType: "image/png" })
    );
  });
});
