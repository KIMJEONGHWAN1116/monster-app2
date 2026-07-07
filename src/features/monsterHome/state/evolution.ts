import { ImageSourcePropType } from "react-native";
import type { AnimationObject } from "lottie-react-native";

import { EmotionLogEntry } from "./emotionLog";

export type EvolutionId = "anxiety" | "ikari" | "kanashimi";

export type EvolutionAnimation = {
  idleBodySource: AnimationObject;
  idleFaceSource: AnimationObject;
  previewScale?: number;
  stageScale?: number;
  touchBodySource?: AnimationObject;
  touchFaceSource?: AnimationObject;
};

export type EvolutionVisual =
  | {
      imageSource: ImageSourcePropType;
      kind: "image";
    }
  | {
      animation: EvolutionAnimation;
      kind: "lottie";
    };

export type EvolutionChoice = {
  description: string;
  id: EvolutionId;
  keywords: string[];
  name: string;
  visual: EvolutionVisual;
};

const anxietyEvolutionImage = require("../../../assets/images/evolution/anxiety-evolution-mint.png");
const kanashimiEvolutionImage = require("../../../assets/images/evolution/kanashimi-evolution.png");
const ikariDevilBodyIdle = require("../../../assets/lottie/evolution/ikari-devil-body-idle.json") as AnimationObject;
const ikariDevilBodyTouch = require("../../../assets/lottie/evolution/ikari-devil-body-touch.json") as AnimationObject;
const ikariDevilFaceAngry = require("../../../assets/lottie/evolution/ikari-devil-face-angry.json") as AnimationObject;
const ikariDevilFaceIdle = require("../../../assets/lottie/evolution/ikari-devil-face-idle.json") as AnimationObject;

export const evolutionChoices: EvolutionChoice[] = [
  {
    description:
      "不安やこわさを多く食べて育つ進化先。揺れる気持ちをそっと包み、深呼吸できる場所をつくってくれます。",
    id: "anxiety",
    keywords: ["不安", "こわい", "モヤモヤ"],
    name: "不安タイプ",
    visual: {
      imageSource: anxietyEvolutionImage,
      kind: "image",
    },
  },
  {
    description:
      "イライラやくやしさを多く食べて育つ進化先。熱くなった気持ちを受け止め、あなたの代わりに小さくふんばってくれます。",
    id: "ikari",
    keywords: ["イライラ", "くやしい"],
    name: "いかりタイプ",
    visual: {
      animation: {
        idleBodySource: ikariDevilBodyIdle,
        idleFaceSource: ikariDevilFaceIdle,
        previewScale: 2.28,
        stageScale: 2.28,
        touchBodySource: ikariDevilBodyTouch,
        touchFaceSource: ikariDevilFaceAngry,
      },
      kind: "lottie",
    },
  },
  {
    description:
      "かなしさやさみしさを多く食べて育つ進化先。こぼれそうな気持ちに寄り添い、静かにそばにいてくれます。",
    id: "kanashimi",
    keywords: ["かなしい", "さみしい", "つかれた", "その他"],
    name: "かなしみタイプ",
    visual: {
      imageSource: kanashimiEvolutionImage,
      kind: "image",
    },
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
