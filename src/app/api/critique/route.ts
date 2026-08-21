import { NextRequest, NextResponse } from "next/server";
import { GeminiRequestError, MissingApiKeyError, runDesignCritique } from "@/lib/gemini";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(
      { error: "Expected multipart/form-data with an 'image' file." },
      { status: 400 }
    );
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'image' file." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported image type "${file.type}". Use PNG, JPEG, or WebP.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Max size is 8MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = buffer.toString("base64");

  try {
    const critique = await runDesignCritique({ imageBase64, mimeType: file.type });
    return NextResponse.json({ critique });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof GeminiRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json(
      { error: "Something went wrong analyzing the image." },
      { status: 500 }
    );
  }
}
