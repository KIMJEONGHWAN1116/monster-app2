import { FeedEmotion } from "../state/monsterState";

const defaultModel = "gemini-2.5-flash";
const geminiApiBaseUrl = "https://generativelanguage.googleapis.com/v1beta";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: unknown;
      }>;
    };
  }>;
};

type GeminiReactionJson = {
  reaction?: unknown;
};

export async function generateGeminiMonsterReaction(emotion: FeedEmotion) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    logGeminiWarning("EXPO_PUBLIC_GEMINI_API_KEY is not set.");
    return null;
  }

  const model = normalizeModelName(
    process.env.EXPO_PUBLIC_GEMINI_MODEL || defaultModel
  );
  const prompt = buildReactionPrompt(emotion);
  const reactionText = await requestGeminiGenerateContent(
    apiKey,
    model,
    prompt
  );

  if (!reactionText) return null;

  return sanitizeReactionText(reactionText);
}

function buildReactionPrompt(emotion: FeedEmotion) {
  const feeling = emotion.feeling || "わからない";
  const note = emotion.note?.trim() || "特に文章はありません。";

  return [
    "あなたは、ユーザーのモヤモヤを食べてくれる小さなやさしいモンスターです。",
    "次の感情と文章を読んで、モンスターの自然な反応を1つ作ってください。",
    "",
    "返答はJSONだけにしてください。",
    '形式: {"reaction":"これは、..."}',
    "",
    "reactionの条件:",
    "・日本語",
    "・35〜75文字くらい",
    "・かわいく、やさしく、押しつけない",
    "・医療、診断、断定、強いアドバイスはしない",
    "・ユーザーの文章の内容を少しだけ反映する",
    "・毎回まったく同じ言い方にしない",
    "・できれば「これは、」から自然に始める",
    "・文末は自然に終える",
    "",
    `感情: ${feeling}`,
    `文章: ${note}`,
  ].join("\n");
}

async function requestGeminiGenerateContent(
  apiKey: string,
  model: string,
  prompt: string
) {
  const endpoint = `${geminiApiBaseUrl}/models/${model}:generateContent`;

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
          role: "user",
        },
      ],
      generationConfig: {
        maxOutputTokens: 512,
        thinkingConfig: {
          thinkingBudget: 0,
        },
        temperature: 0.9,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    method: "POST",
  });

  return readGeminiTextResponse(response, `generateContent:${model}`);
}

async function readGeminiTextResponse(response: Response, label: string) {
  const data = await readGeminiJson(response);

  if (!response.ok) {
    logGeminiWarning(
      `${label} failed: ${response.status} ${response.statusText}`,
      JSON.stringify(data).slice(0, 500)
    );
    return null;
  }

  const text = extractGenerateContentText(data);

  if (!text) {
    logGeminiWarning(
      `${label} returned no text.`,
      JSON.stringify(data).slice(0, 500)
    );
    return null;
  }

  return text;
}

function extractGenerateContentText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const record = data as GeminiGenerateContentResponse;
  const text = record.candidates?.[0]?.content?.parts?.find(
    (part) => typeof part.text === "string" && part.text.trim()
  )?.text;

  if (typeof text === "string" && text.trim()) {
    return text.trim();
  }

  return null;
}

function sanitizeReactionText(text: string) {
  const jsonReaction = extractReactionFromJson(text);
  const normalized = normalizeReactionText(jsonReaction ?? text);

  if (!normalized || isInstructionEcho(normalized)) {
    logGeminiWarning("Gemini reaction was rejected.", text);
    return null;
  }

  if (/[。！？]$/.test(normalized)) return normalized;

  return `${normalized}。`;
}

function extractReactionFromJson(text: string) {
  const cleaned = text.replace(/```(?:json)?|```/g, "").trim();
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  const jsonText = objectMatch?.[0] ?? cleaned;

  try {
    const parsed = JSON.parse(jsonText) as GeminiReactionJson;
    return typeof parsed.reaction === "string" ? parsed.reaction : null;
  } catch {
    return null;
  }
}

function normalizeReactionText(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^[\s\-・*]+/, "")
        .replace(/^モンスター\s*[:：]\s*/, "")
        .replace(/^reaction\s*[:：]\s*/i, "")
        .replace(/^["'「『]+|["'」』]+$/g, "")
        .trim()
    )
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function isInstructionEcho(text: string) {
  if (text.length < 8) return true;
  if (/^これは[、,.。…?？!！]*$/.test(text)) return true;

  return /^(必ず|条件|感情|文章|文頭|文末|返答|形式|reaction|JSON|ユーザー|あなたは|医療|診断)/i.test(
    text
  );
}

function normalizeModelName(model: string) {
  return model.trim().replace(/^models\//, "") || defaultModel;
}

async function readGeminiJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
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
