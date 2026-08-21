import { describe, expect, it } from "vitest";
import { MissingApiKeyError, runDesignCritique } from "@/lib/gemini";
import { CritiqueResultSchema } from "@/lib/critique-schema";

// A well-known 1x1 transparent PNG, used only to exercise the request wiring
// (auth, schema, JSON parsing) — not to test critique quality.
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

describe("runDesignCritique", () => {
  it("throws MissingApiKeyError when GEMINI_API_KEY is not set", async () => {
    const original = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    await expect(
      runDesignCritique({ imageBase64: TINY_PNG_BASE64, mimeType: "image/png" })
    ).rejects.toBeInstanceOf(MissingApiKeyError);

    if (original !== undefined) process.env.GEMINI_API_KEY = original;
  });
});

// Opt-in: only runs when a real GEMINI_API_KEY is present in the environment,
// so the default test suite never makes a network call or costs anything.
describe.skipIf(!process.env.GEMINI_API_KEY)("runDesignCritique (real API)", () => {
  it(
    "returns a schema-conformant critique from the live Gemini API",
    async () => {
      const result = await runDesignCritique({
        imageBase64: TINY_PNG_BASE64,
        mimeType: "image/png",
      });
      expect(CritiqueResultSchema.safeParse(result).success).toBe(true);
    },
    60_000
  );
});
