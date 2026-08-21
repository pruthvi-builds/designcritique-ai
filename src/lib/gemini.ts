import { GoogleGenAI, createPartFromBase64, createUserContent } from "@google/genai";
import { HEURISTICS, GEMINI_CRITIQUE_RESPONSE_SCHEMA, CritiqueResultSchema, type CritiqueResult } from "@/lib/critique-schema";

const MODEL = "gemini-3.6-flash";

export class MissingApiKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and add it to your environment.");
    this.name = "MissingApiKeyError";
  }
}

export class GeminiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiRequestError";
  }
}

function buildPrompt(): string {
  return `You are a senior UX researcher performing a heuristic evaluation of a UI screenshot.

Evaluate the screenshot against each of these usability heuristics:
${HEURISTICS.map((h, i) => `${i + 1}. ${h}`).join("\n")}

For each heuristic, give a 0-10 score and specific, evidence-based findings referencing what's actually visible in the screenshot. If a heuristic can't be judged from a single static screenshot (e.g. system status over time, help documentation), say so explicitly in the findings instead of guessing.

Then list the most impactful usability issues overall, ranked by severity, each with a concrete suggested fix.

Give an overall usability score from 0-100 and a short plain-language summary.`;
}

export async function runDesignCritique(params: {
  imageBase64: string;
  mimeType: string;
}): Promise<CritiqueResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models
    .generateContent({
      model: MODEL,
      contents: createUserContent([
        buildPrompt(),
        createPartFromBase64(params.imageBase64, params.mimeType),
      ]),
      config: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_CRITIQUE_RESPONSE_SCHEMA,
      },
    })
    .catch((err: unknown) => {
      throw new GeminiRequestError(
        err instanceof Error ? err.message : "Gemini request failed."
      );
    });

  const text = response.text;
  if (!text) {
    throw new GeminiRequestError("Gemini returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiRequestError("Gemini returned a response that wasn't valid JSON.");
  }

  const result = CritiqueResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new GeminiRequestError(
      "Gemini's response didn't match the expected critique format."
    );
  }

  return result.data;
}
