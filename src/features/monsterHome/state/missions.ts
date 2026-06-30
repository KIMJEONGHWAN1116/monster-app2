import { filterLogsByPeriod, EmotionLogEntry } from "./emotionLog";
import type { MonsterState } from "./monsterState";

export type MissionId =
  | "today-feed"
  | "week-three-feeds"
  | "three-feelings"
  | "full-onaka"
  | "first-evolution";

export type MissionStatus = {
  description: string;
  id: MissionId;
  isClaimed: boolean;
  isComplete: boolean;
  progress: number;
  reward: number;
  target: number;
  title: string;
};

type MissionDefinition = {
  description: string;
  getProgress: (logs: EmotionLogEntry[], monster: MonsterState) => number;
  id: MissionId;
  reward: number;
  target: number;
  title: string;
};

const missionDefinitions: MissionDefinition[] = [
  {
    description: "今日の気持ちを1つ入れて、モンスターに食べてもらう。",
    getProgress: (logs) =>
      logs.filter((log) => isSameDay(new Date(log.createdAt), new Date())).length,
    id: "today-feed",
    reward: 20,
    target: 1,
    title: "今日のモヤモヤ",
  },
  {
    description: "今週、モヤモヤを3回食べてもらう。",
    getProgress: (logs) => filterLogsByPeriod(logs, "week").length,
    id: "week-three-feeds",
    reward: 50,
    target: 3,
    title: "今週のもぐもぐ",
  },
  {
    description: "違う種類の気持ちを3つ記録する。",
    getProgress: (logs) => new Set(logs.map((log) => log.feeling)).size,
    id: "three-feelings",
    reward: 60,
    target: 3,
    title: "気持ちを見つける",
  },
  {
    description: "おなかを100%まで満たして、進化の準備をする。",
    getProgress: (_logs, monster) => monster.onakaPercent,
    id: "full-onaka",
    reward: 80,
    target: 100,
    title: "おなかいっぱい",
  },
  {
    description: "進化体に出会って、モンスター図鑑に登録する。",
    getProgress: (_logs, monster) => monster.registeredEvolutionIds.length,
    id: "first-evolution",
    reward: 120,
    target: 1,
    title: "はじめての進化",
  },
];

export function getMissionStatuses(
  logs: EmotionLogEntry[],
  monster: MonsterState
): MissionStatus[] {
  return missionDefinitions.map((mission) => {
    const progress = Math.min(mission.getProgress(logs, monster), mission.target);

    return {
      description: mission.description,
      id: mission.id,
      isClaimed: monster.claimedMissionIds.includes(mission.id),
      isComplete: progress >= mission.target,
      progress,
      reward: mission.reward,
      target: mission.target,
      title: mission.title,
    };
  });
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
