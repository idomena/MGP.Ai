export async function callAiCoach(
  message: string,
  history?: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ response: string; advice: string }> {
  const res = await fetch("/api/ai-coach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history: history || [] }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to get AI response");
  }

  return res.json();
}

export async function extractOcrText(image: string, mimeType: string = "image/jpeg"): Promise<{ text: string }> {
  const res = await fetch("/api/ocr-extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image, mimeType }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to extract text");
  }

  return res.json();
}

export async function generateContent(
  prompt: string,
  systemPrompt?: string
): Promise<{ text: string }> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, systemPrompt }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to generate content");
  }

  return res.json();
}
