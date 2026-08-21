import { Type, type Schema } from "@google/genai";
import { z } from "zod";

/**
 * Nielsen's 10 usability heuristics. Some (e.g. "Help and documentation") have
 * limited evidence in a single static screenshot — the model is prompted to say
 * so in its findings rather than guess.
 */
export const HEURISTICS = [
  "Visibility of system status",
  "Match between system and the real world",
  "User control and freedom",
  "Consistency and standards",
  "Error prevention",
  "Recognition rather than recall",
  "Flexibility and efficiency of use",
  "Aesthetic and minimalist design",
  "Help users recognize, diagnose, and recover from errors",
  "Help and documentation",
] as const;

export const HeuristicResultSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(10),
  findings: z.array(z.string()),
});

export const CritiqueIssueSchema = z.object({
  severity: z.enum(["high", "medium", "low"]),
  issue: z.string(),
  suggestion: z.string(),
});

export const CritiqueResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  heuristics: z.array(HeuristicResultSchema),
  topIssues: z.array(CritiqueIssueSchema),
});

export type HeuristicResult = z.infer<typeof HeuristicResultSchema>;
export type CritiqueIssue = z.infer<typeof CritiqueIssueSchema>;
export type CritiqueResult = z.infer<typeof CritiqueResultSchema>;

/** Gemini structured-output schema (OpenAPI-subset format), mirroring CritiqueResultSchema. */
export const GEMINI_CRITIQUE_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "Overall usability score from 0-100.",
    },
    summary: {
      type: Type.STRING,
      description: "2-3 sentence plain-language summary of the design's usability.",
    },
    heuristics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: {
            type: Type.NUMBER,
            description: "Score from 0-10 for this heuristic.",
          },
          findings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Specific, evidence-based observations. If the screenshot doesn't provide enough evidence to judge this heuristic, say so explicitly instead of guessing.",
          },
        },
        required: ["name", "score", "findings"],
      },
    },
    topIssues: {
      type: Type.ARRAY,
      description: "The most impactful usability issues, ranked by severity.",
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, format: "enum", enum: ["high", "medium", "low"] },
          issue: { type: Type.STRING },
          suggestion: { type: Type.STRING },
        },
        required: ["severity", "issue", "suggestion"],
      },
    },
  },
  required: ["overallScore", "summary", "heuristics", "topIssues"],
};
