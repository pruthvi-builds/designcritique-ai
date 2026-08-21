import { describe, expect, it } from "vitest";
import {
  checkContrast,
  contrastRatio,
  hexToRgb,
  isValidHexColor,
  relativeLuminance,
  wcagLevel,
} from "@/lib/contrast";

describe("isValidHexColor", () => {
  it("accepts 6-digit and 3-digit hex, with or without #", () => {
    expect(isValidHexColor("#ffffff")).toBe(true);
    expect(isValidHexColor("ffffff")).toBe(true);
    expect(isValidHexColor("#fff")).toBe(true);
    expect(isValidHexColor("fff")).toBe(true);
  });

  it("rejects invalid input", () => {
    expect(isValidHexColor("")).toBe(false);
    expect(isValidHexColor("not-a-color")).toBe(false);
    expect(isValidHexColor("#ff")).toBe(false);
    expect(isValidHexColor("#gggggg")).toBe(false);
  });
});

describe("hexToRgb", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("expands 3-digit hex", () => {
    expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("throws on invalid input", () => {
    expect(() => hexToRgb("nope")).toThrow();
  });
});

describe("relativeLuminance", () => {
  it("is 1 for white and 0 for black", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });
});

describe("contrastRatio", () => {
  it("is 21:1 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("is 1:1 for identical colors", () => {
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });

  it("is symmetric regardless of argument order", () => {
    const a = contrastRatio("#123456", "#abcdef");
    const b = contrastRatio("#abcdef", "#123456");
    expect(a).toBeCloseTo(b, 10);
  });
});

describe("wcagLevel", () => {
  it("passes AAA for high-contrast normal text", () => {
    expect(wcagLevel(21, false)).toBe("AAA");
  });

  it("passes AA but not AAA for mid-range normal text", () => {
    expect(wcagLevel(5, false)).toBe("AA");
  });

  it("fails low-contrast normal text", () => {
    expect(wcagLevel(2, false)).toBe("Fail");
  });

  it("uses lower thresholds for large text", () => {
    // 3.5:1 fails normal text AA (needs 4.5) but passes large text AA (needs 3)
    expect(wcagLevel(3.5, false)).toBe("Fail");
    expect(wcagLevel(3.5, true)).toBe("AA");
  });
});

describe("checkContrast", () => {
  it("reports full pass for black on white", () => {
    const result = checkContrast("#000000", "#ffffff");
    expect(result.ratio).toBeCloseTo(21, 0);
    expect(result.normalText).toBe("AAA");
    expect(result.largeText).toBe("AAA");
  });

  it("reports fail for near-identical low-contrast colors", () => {
    const result = checkContrast("#777777", "#888888");
    expect(result.normalText).toBe("Fail");
    expect(result.largeText).toBe("Fail");
  });

  it("rounds the ratio to 2 decimal places", () => {
    const result = checkContrast("#123456", "#abcdef");
    expect(Number.isInteger(result.ratio * 100)).toBe(true);
  });
});
