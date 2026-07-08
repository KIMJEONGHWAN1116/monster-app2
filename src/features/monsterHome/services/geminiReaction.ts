import { FeedEmotion } from "../state/monsterState";

const geminiInteractionsEndpoint =
  "https://generativelanguage.googleapis.com/v1beta/interactions";
const defaultModel = "gemini-2.5-flash";
const fallbackModels = ["gemini-2.5-flash", "gemini-2.0-flash"];

export async function generateGeminiMonsterReaction(emotion: FeedEmotion) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    logGeminiWarning("EXPO_PUBLIC_GEMINI_API_KEY is not set.");
    return null;
  }

  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL || defaultModel;
  const prompt = buildReactionPrompt(emotion);
  const modelsToTry = Array.from(new Set([model, ...fallbackModels]));

  for (const currentModel of modelsToTry) {
    const interactionText = await requestGeminiInteraction(
      apiKey,
      currentModel,
      prompt
    );

    if (interactionText) return sanitizeReactionText(interactionText);

    const generatedText = await requestGeminiGenerateContent(
      apiKey,
      currentModel,
      prompt
    );

    if (generatedText) return sanitizeReactionText(generatedText);
  }

  return null;
}

function buildReactionPrompt(emotion: FeedEmotion) {
  return [
    "あなたは、ユーザーのモヤモヤを食べてくれる小さなやさしいモンスターです。",
    "ユーザーの感情と文章を読んで、毎回少し違う反応を日本語で返してください。",
    "条件:",
    "- 1文だけ",
    "- 45文字以内",
    "- かわいく、やさしく、押しつけない",
    "- 医療・診断・断定はしない",
    "- 「これは...」から始める",
    `感情: ${emotion.feeling}`,
    `文章: ${emotion.note}`,
  ].join("\n");
}

function extractGeminiText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const directText = findTextValue(data, [
    "output_text",
    "outputText",
    "text",
  ]);

  if (directText) return directText;

  return findNestedText(data);
}

function findTextValue(data: object, keys: string[]) {
  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}

function findNestedText(data: unknown): string | null {
  if (typeof data === "string") return data.trim() || null;
  if (!data || typeof data !== "object") return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const text = findNestedText(item);
      if (text) return text;
    }

    return null;
  }

  const record = data as Record<string, unknown>;

  if (typeof record.text === "string" && record.text.trim()) {
    return record.text;
  }

  for (const value of Object.values(record)) {
    const text = findNestedText(value);
    if (text) return text;
  }

  return null;
}

function sanitizeReactionText(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 70);
}

async function requestGeminiInteraction(
  apiKey: string,
  model: string,
  prompt: string
) {
  const response = await fetch(geminiInteractionsEndpoint, {
    body: JSON.stringify({
      input: prompt,
      model,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    method: "POST",
  });

  return readGeminiTextResponse(response, `interactions:${model}`);
}

async function requestGeminiGenerateContent(
  apiKey: string,
  model: string,
  prompt: string
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
            role: "user",
          },
        ],
        generationConfig: {
          maxOutputTokens: 80,
          temperature: 0.9,
        },
      }),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      method: "POST",
    }
  );

  return readGeminiTextResponse(response, `generateContent:${model}`);
}

async function readGeminiTextResponse(response: Response, label: string) {
  if (!response.ok) {
    await logGeminiResponseError(response, label);
    return null;
  }

  const data: unknown = await response.json();
  const text = extractGeminiText(data);

  if (!text) {
    logGeminiWarning(`${label} returned no text.`);
    return null;
  }

  return text;
}

async function logGeminiResponseError(response: Response, label: string) {
  try {
    const detail = await response.text();
    logGeminiWarning(
      `${label} failed: ${response.status} ${response.statusText}`,
      detail
    );
  } catch {
    logGeminiWarning(`${label} failed: ${response.status} ${response.statusText}`);
  }
}

function logGeminiWarning(message: string, detail?: string) {
  if (process.env.NODE_ENV === "production") return;

  if (detail) {
    console.warn(`[Gemini] ${message}`, detail.slice(0, 500));
    return;
  }

  console.warn(`[Gemini] ${message}`);
}
