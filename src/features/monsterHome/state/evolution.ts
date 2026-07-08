import type { AnimationObject } from "lottie-react-native";
import { ImageSourcePropType } from "react-native";

import { EmotionLogEntry } from "./emotionLog";

export type EvolutionId =
  | "anxiety"
  | "ikari"
  | "kanashimi"
  | "yurari"
  | "musutto"
  | "baran"
  | "nemuri"
  | "sizuku"
  | "kaburi";

export type EvolutionAnimation = {
  idleArmSource?: AnimationObject;
  idleBodySource: AnimationObject;
  idleFaceSource: AnimationObject;
  previewScale?: number;
  stageScale?: number;
  touchArmSource?: AnimationObject;
  touchFaceSource?: AnimationObject;
};

export type EvolutionVisual =
  | {
      imageSource: ImageSourcePropType;
      kind: "image";
      lockedImageSource?: ImageSourcePropType;
    }
  | {
      animation: EvolutionAnimation;
      kind: "lottie";
      lockedImageSource?: ImageSourcePropType;
      previewImageSource?: ImageSourcePropType;
    };

export type EvolutionChoice = {
  canEvolve?: boolean;
  description: string;
  id: EvolutionId;
  keywords: string[];
  name: string;
  visual: EvolutionVisual;
};

export type FeedFeelingOption = {
  evolutionId: EvolutionId;
  label: string;
};

const anxietyEvolutionImage = require("../../../assets/images/evolution/anxiety-evolution-mint.png");
const anxietyEvolutionLockedImage = require("../../../assets/images/evolution/S-anxiety-evolution-mint.png");
const ikariEvolutionImage = require("../../../assets/images/evolution/ikari-evolution.png");
const ikariEvolutionLockedImage = require("../../../assets/images/evolution/S-ikari-evolution.png");
const kanashimiEvolutionImage = require("../../../assets/images/evolution/kanashimi-evolution.png");
const kanashimiEvolutionLockedImage = require("../../../assets/images/evolution/S-kanashimi-evolution.png");
const yurariEvolutionImage = require("../../../assets/images/evolution/S-yurari.png");
const musuttoEvolutionImage = require("../../../assets/images/evolution/S-musutto.png");
const baranEvolutionImage = require("../../../assets/images/evolution/S-baran.png");
const nemuriEvolutionImage = require("../../../assets/images/evolution/S-nemuri.png");
const sizukuEvolutionImage = require("../../../assets/images/evolution/S-sizuku.png");
const kaburiEvolutionImage = require("../../../assets/images/evolution/S-kaburi.png");
const ikariDevilArmsIdle = require("../../../assets/lottie/evolution/ikari-devil-arms-idle.json") as AnimationObject;
const ikariDevilArmsTouch = require("../../../assets/lottie/evolution/ikari-devil-arms-touch.json") as AnimationObject;
const ikariDevilBodyIdle = require("../../../assets/lottie/evolution/ikari-devil-body-idle.json") as AnimationObject;
const ikariDevilFaceAngry = require("../../../assets/lottie/evolution/ikari-devil-face-angry.json") as AnimationObject;
const ikariDevilFaceIdle = require("../../../assets/lottie/evolution/ikari-devil-face-idle.json") as AnimationObject;

export const feedFeelingOptions: FeedFeelingOption[] = [
  { evolutionId: "anxiety", label: "不安" },
  { evolutionId: "anxiety", label: "心配" },
  { evolutionId: "anxiety", label: "こわい" },
  { evolutionId: "ikari", label: "イライラ" },
  { evolutionId: "ikari", label: "怒り" },
  { evolutionId: "ikari", label: "くやしい" },
  { evolutionId: "kanashimi", label: "かなしい" },
  { evolutionId: "kanashimi", label: "さみしい" },
  { evolutionId: "kanashimi", label: "つらい" },
];

export const feedFeelingLabels = feedFeelingOptions.map((option) => option.label);

const evolutionIdByFeeling = new Map(
  feedFeelingOptions.map((option) => [option.label, option.evolutionId])
);

export const evolutionChoices: EvolutionChoice[] = [
  {
    canEvolve: true,
    description:
      "不安やこわさを多く食べて育つ進化先。揺れる気持ちをそっと包み、深呼吸できる場所をつくってくれます。",
    id: "anxiety",
    keywords: ["不安", "心配", "こわい"],
    name: "不安タイプ",
    visual: {
      imageSource: anxietyEvolutionImage,
      kind: "image",
      lockedImageSource: anxietyEvolutionLockedImage,
    },
  },
  {
    canEvolve: true,
    description:
      "イライラやくやしさを多く食べて育つ進化先。熱くなった気持ちを受け止め、あなたの代わりに小さくふんばってくれます。",
    id: "ikari",
    keywords: ["イライラ", "怒り", "くやしい"],
    name: "いかりタイプ",
    visual: {
      animation: {
        idleArmSource: ikariDevilArmsIdle,
        idleBodySource: ikariDevilBodyIdle,
        idleFaceSource: ikariDevilFaceIdle,
        previewScale: 3.7,
        stageScale: 3.7,
        touchArmSource: ikariDevilArmsTouch,
        touchFaceSource: ikariDevilFaceAngry,
      },
      kind: "lottie",
      lockedImageSource: ikariEvolutionLockedImage,
      previewImageSource: ikariEvolutionImage,
    },
  },
  {
    canEvolve: true,
    description:
      "かなしさやさみしさを多く食べて育つ進化先。こぼれそうな気持ちに寄り添い、静かにそばにいてくれます。",
    id: "kanashimi",
    keywords: ["かなしい", "さみしい", "つらい"],
    name: "かなしみタイプ",
    visual: {
      imageSource: kanashimiEvolutionImage,
      kind: "image",
      lockedImageSource: kanashimiEvolutionLockedImage,
    },
  },  {
    description:
      "不安や寂しさを多く食べて育つ特殊な進化先。考えすぎてしまう性格だが、相手の小さな変化によく気づく優しいモンスター。揺れる気持ちにもそっと寄り添うことができる。",
    id: "yurari",
    keywords: [],
    name: "ユラリ",
    visual: {
      imageSource: yurariEvolutionImage,
      kind: "image",
    },
  },
  {
    description:
      "怒りや悲しみを多く食べて育つ特殊な進化先。強がりで素直じゃない性格だが、本当は誰よりも仲間思いなモンスター。悔しい気持ちを力に変えて、あなたを守ろうとする。",
    id: "musutto",
    keywords: [],
    name: "ムスット",
    visual: {
      imageSource: musuttoEvolutionImage,
      kind: "image",
    },
  },
  {
    description:
      "さまざまな感情をバランスよく食べて育つ特殊な進化先。気分屋で自由な性格だが、どんな気持ちも受け止められる大きな心を持つモンスター。",
    id: "baran",
    keywords: [],
    name: "バラン",
    visual: {
      imageSource: baranEvolutionImage,
      kind: "image",
    },
  },
  {
    description:
      "ゆっくり時間をかけた愛情を多く食べて育つ特殊な進化先。のんびり屋でマイペースな性格だが、一緒に過ごした時間を何より大切にするモンスター。",
    id: "nemuri",
    keywords: [],
    name: "ネムリ",
    visual: {
      imageSource: nemuriEvolutionImage,
      kind: "image",
    },
  },
  {
    description:
      "夜に生まれる不安や寂しさを多く食べて育つ特殊な進化先。物静かで少し寂しがりやな性格だが、そばにいるだけで安心できる空気を持つモンスター。",
    id: "sizuku",
    keywords: [],
    name: "シズク",
    visual: {
      imageSource: sizukuEvolutionImage,
      kind: "image",
    },
  },
  {
    description:
      "身につけたものへの想いを多く食べて育つ特殊な進化先。少し変わり者で個性的な性格だが、自分らしさを大切にする自由なモンスター。",
    id: "kaburi",
    keywords: [],
    name: "カブリ",
    visual: {
      imageSource: kaburiEvolutionImage,
      kind: "image",
    },
  },];

export function getEvolutionById(id: EvolutionId | null) {
  if (!id) return null;
  return evolutionChoices.find((choice) => choice.id === id) ?? null;
}

export function getEvolutionCandidates(logs: EmotionLogEntry[]) {
  return evolutionChoices
    .filter((choice) => choice.canEvolve === true)
    .map((choice, index) => ({
      choice,
      index,
      score: getEvolutionScore(logs, choice.id),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.choice)
    .slice(0, 3);
}

export function getDominantEvolution(logs: EmotionLogEntry[]) {
  const autoEvolutionChoices = evolutionChoices.filter(
    (choice) => choice.canEvolve === true
  );
  const scoredChoices = autoEvolutionChoices.map((choice, index) => ({
    choice,
    index,
    score: getEvolutionScore(logs, choice.id),
  }));

  scoredChoices.sort((a, b) => b.score - a.score || a.index - b.index);

  return scoredChoices[0]?.choice ?? autoEvolutionChoices[0] ?? evolutionChoices[0];
}

export function getEvolutionIdForFeeling(feeling: string) {
  return evolutionIdByFeeling.get(feeling) ?? null;
}

function getEvolutionScore(logs: EmotionLogEntry[], evolutionId: EvolutionId) {
  return logs.reduce((total, log) => {
    return getEvolutionIdForFeeling(log.feeling) === evolutionId
      ? total + 1
      : total;
  }, 0);
}
