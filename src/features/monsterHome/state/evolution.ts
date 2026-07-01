import { ImageSourcePropType } from "react-native";

import { EmotionLogEntry } from "./emotionLog";

export type EvolutionId = "anxiety" | "ikari" | "kanashimi";

export type EvolutionChoice = {
  description: string;
  id: EvolutionId;
  imageSource: ImageSourcePropType;
  keywords: string[];
  name: string;
};

const anxietyEvolutionImage = require("../../../assets/images/evolution/anxiety-evolution-mint.png");
const ikariEvolutionImage = require("../../../assets/images/evolution/ikari-evolution.png");
const kanashimiEvolutionImage = require("../../../assets/images/evolution/kanashimi-evolution.png");

export const evolutionChoices: EvolutionChoice[] = [
  {
    description:
      "不安やこわさを多く食べて育つ進化先。揺れる気持ちをそっと包み、深呼吸できる場所をつくってくれます。",
    id: "anxiety",
    imageSource: anxietyEvolutionImage,
    keywords: ["不安", "こわい", "モヤモヤ"],
    name: "不安タイプ",
  },
  {
    description:
      "イライラやくやしさを多く食べて育つ進化先。熱くなった気持ちを受け止め、あなたの代わりに小さくふんばってくれます。",
    id: "ikari",
    imageSource: ikariEvolutionImage,
    keywords: ["イライラ", "くやしい"],
    name: "いかりタイプ",
  },
  {
    description:
      "かなしさやさみしさを多く食べて育つ進化先。こぼれそうな気持ちに寄り添い、静かにそばにいてくれます。",
    id: "kanashimi",
    imageSource: kanashimiEvolutionImage,
    keywords: ["かなしい", "さみしい", "つかれた", "その他"],
    name: "かなしみタイプ",
  },
];

export function getEvolutionById(id: EvolutionId | null) {
  if (!id) return null;
  return evolutionChoices.find((choice) => choice.id === id) ?? null;
}

export function getEvolutionCandidates(logs: EmotionLogEntry[]) {
  const counts = logs.reduce<Record<string, number>>((result, log) => {
    result[log.feeling] = (result[log.feeling] ?? 0) + 1;
    return result;
  }, {});

  return evolutionChoices
    .map((choice, index) => ({
      choice,
      index,
      score: choice.keywords.reduce(
        (total, keyword) => total + (counts[keyword] ?? 0),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.choice)
    .slice(0, 3);
}
