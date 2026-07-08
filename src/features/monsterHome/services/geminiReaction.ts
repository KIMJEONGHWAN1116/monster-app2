import { FeedEmotion } from "../state/monsterState";

const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/interactions";
const defaultModel = "gemini-3.5-flash";

export async function generateGeminiMonsterReaction(emotion: FeedEmotion) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) return null;

  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL || defaultModel;
  const response = await fetch(geminiEndpoint, {
    body: JSON.stringify({
      input: [
        {
          content: [
            {
              text: buildReactionPrompt(emotion),
              type: "input_text",
            },
          ],
          role: "user",
        },
      ],
      model,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    method: "POST",
  });

  if (!response.ok) return null;

  const data: unknown = await response.json();
  const text = extractGeminiText(data);

  return text ? sanitizeReactionText(text) : null;
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
