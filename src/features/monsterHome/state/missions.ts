import { EmotionLogEntry } from "./emotionLog";
import { getEvolutionIdForFeeling } from "./evolution";
import type { MonsterState } from "./monsterState";

export type MissionCategory = "daily" | "weekly" | "special";

export type MissionId =
  | "daily-feed-one"
  | "daily-feed-three"
  | "daily-feeling-two"
  | "weekly-feed-five"
  | "weekly-feed-ten"
  | "weekly-feed-days"
  | "weekly-feeling-five"
  | "weekly-emotion-types"
  | "special-first-item"
  | "special-first-evolution"
  | "special-all-evolutions";

export type MissionClaimKey = MissionId | `${MissionId}@${string}`;

export type MissionStatus = {
  category: MissionCategory;
  claimKey: MissionClaimKey;
  description: string;
  id: MissionId;
  isClaimed: boolean;
  isComplete: boolean;
  progress: number;
  reward: number;
  target: number;
  title: string;
};

type MissionContext = {
  monster: MonsterState;
  todayLogs: EmotionLogEntry[];
  weekLogs: EmotionLogEntry[];
};

type MissionDefinition = {
  category: MissionCategory;
  description: string;
  getProgress: (context: MissionContext) => number;
  id: MissionId;
  reward: number;
  target: number;
  title: string;
};

const missionDefinitions: MissionDefinition[] = [
  {
    category: "daily",
    description: "今日のモヤモヤを1回、もぐもんに食べてもらおう。",
    getProgress: ({ todayLogs }) => todayLogs.length,
    id: "daily-feed-one",
    reward: 15,
    target: 1,
    title: "はじめのひとくち",
  },
  {
    category: "daily",
    description: "今日の気持ちを3回記録して、少しずつ心を軽くしよう。",
    getProgress: ({ todayLogs }) => todayLogs.length,
    id: "daily-feed-three",
    reward: 25,
    target: 3,
    title: "もぐもぐタイム",
  },
  {
    category: "daily",
    description: "今日感じた、ちがう種類の気持ちを2つ見つけよう。",
    getProgress: ({ todayLogs }) =>
      new Set(todayLogs.map((log) => log.feeling)).size,
    id: "daily-feeling-two",
    reward: 30,
    target: 2,
    title: "気持ちを見つける",
  },
  {
    category: "weekly",
    description: "今週、モヤモヤを5回食べてもらおう。",
    getProgress: ({ weekLogs }) => weekLogs.length,
    id: "weekly-feed-five",
    reward: 50,
    target: 5,
    title: "今週の5もぐ",
  },
  {
    category: "weekly",
    description: "今週10回記録して、気持ちと丁寧に向き合おう。",
    getProgress: ({ weekLogs }) => weekLogs.length,
    id: "weekly-feed-ten",
    reward: 80,
    target: 10,
    title: "もぐもぐ習慣",
  },
  {
    category: "weekly",
    description: "今週3日以上、もぐもんのお世話をしよう。",
    getProgress: ({ weekLogs }) =>
      new Set(weekLogs.map((log) => getLocalDateKey(new Date(log.createdAt))))
        .size,
    id: "weekly-feed-days",
    reward: 70,
    target: 3,
    title: "3日のお世話",
  },
  {
    category: "weekly",
    description: "今週感じた、ちがう種類の気持ちを5つ記録しよう。",
    getProgress: ({ weekLogs }) =>
      new Set(weekLogs.map((log) => log.feeling)).size,
    id: "weekly-feeling-five",
    reward: 75,
    target: 5,
    title: "こころの色あつめ",
  },
  {
    category: "weekly",
    description: "不安・怒り・悲しみ、3タイプの気持ちを記録しよう。",
    getProgress: ({ weekLogs }) =>
      new Set(
        weekLogs
          .map((log) => getEvolutionIdForFeeling(log.feeling))
          .filter((id) => id !== null)
      ).size,
    id: "weekly-emotion-types",
    reward: 90,
    target: 3,
    title: "3つの気持ち",
  },
  {
    category: "special",
    description: "ショップではじめてアイテムを手に入れよう。",
    getProgress: ({ monster }) => monster.ownedItemIds.length,
    id: "special-first-item",
    reward: 80,
    target: 1,
    title: "はじめてのお買いもの",
  },
  {
    category: "special",
    description: "もぐもんのはじめての進化を見届けよう。",
    getProgress: ({ monster }) => monster.registeredEvolutionIds.length,
    id: "special-first-evolution",
    reward: 150,
    target: 1,
    title: "はじめての進化",
  },
  {
    category: "special",
    description: "3種類の進化体に出会って、図鑑に登録しよう。",
    getProgress: ({ monster }) =>
      new Set(
        monster.registeredEvolutionIds.filter(
          (id) => id === "anxiety" || id === "ikari" || id === "kanashimi"
        )
      ).size,
    id: "special-all-evolutions",
    reward: 300,
    target: 3,
    title: "進化コンプリート",
  },
];

const missionIds = new Set<MissionId>(
  missionDefinitions.map((mission) => mission.id)
);

export function getMissionStatuses(
  logs: EmotionLogEntry[],
  monster: MonsterState,
  now = new Date()
): MissionStatus[] {
  const dayStart = startOfDay(now);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 1);

  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const context: MissionContext = {
    monster,
    todayLogs: filterLogsBetween(logs, dayStart, dayEnd),
    weekLogs: filterLogsBetween(logs, weekStart, weekEnd),
  };

  return missionDefinitions.map((mission) => {
    const progress = Math.min(
      Math.max(mission.getProgress(context), 0),
      mission.target
    );
    const claimKey = getMissionClaimKey(mission, dayStart, weekStart);

    return {
      category: mission.category,
      claimKey,
      description: mission.description,
      id: mission.id,
      isClaimed: monster.claimedMissionIds.includes(claimKey),
      isComplete: progress >= mission.target,
      progress,
      reward: mission.reward,
      target: mission.target,
      title: mission.title,
    };
  });
}

export function isMissionClaimKey(value: unknown): value is MissionClaimKey {
  if (typeof value !== "string") return false;

  const [rawId, periodKey, extra] = value.split("@");

  if (extra !== undefined || !missionIds.has(rawId as MissionId)) return false;

  const mission = missionDefinitions.find((item) => item.id === rawId);
  if (!mission) return false;

  if (mission.category === "special") return periodKey === undefined;

  return /^\d{4}-\d{2}-\d{2}$/.test(periodKey ?? "");
}

function getMissionClaimKey(
  mission: MissionDefinition,
  dayStart: Date,
  weekStart: Date
): MissionClaimKey {
  if (mission.category === "daily") {
    return `${mission.id}@${getLocalDateKey(dayStart)}`;
  }

  if (mission.category === "weekly") {
    return `${mission.id}@${getLocalDateKey(weekStart)}`;
  }

  return mission.id;
}

function filterLogsBetween(
  logs: EmotionLogEntry[],
  start: Date,
  end: Date
) {
  return logs.filter((log) => {
    const date = new Date(log.createdAt);
    return date >= start && date < end;
  });
}

function getWeekStart(date: Date) {
  const result = startOfDay(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  return result;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
