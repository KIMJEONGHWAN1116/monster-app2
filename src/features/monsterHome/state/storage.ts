import AsyncStorage from "@react-native-async-storage/async-storage";

import { EmotionLogEntry } from "./emotionLog";
import { initialMonsterState, MonsterState } from "./monsterState";
import { MissionId } from "./missions";

const emotionLogsKey = "monster-app:emotion-logs";
const monsterStateKey = "monster-app:monster-state";

export async function loadEmotionLogs() {
  const storedLogs = await AsyncStorage.getItem(emotionLogsKey);

  if (!storedLogs) return [];

  try {
    const parsedLogs = JSON.parse(storedLogs);
    return Array.isArray(parsedLogs) ? (parsedLogs as EmotionLogEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveEmotionLogs(logs: EmotionLogEntry[]) {
  await AsyncStorage.setItem(emotionLogsKey, JSON.stringify(logs));
}

export async function resetStoredAppData() {
  await AsyncStorage.multiSet([
    [emotionLogsKey, JSON.stringify([])],
    [monsterStateKey, JSON.stringify(initialMonsterState)],
  ]);
}

export async function loadMonsterState() {
  const storedMonster = await AsyncStorage.getItem(monsterStateKey);

  if (!storedMonster) return initialMonsterState;

  try {
    const parsedMonster = JSON.parse(storedMonster) as Partial<MonsterState>;
    const rawEvolutionId = (parsedMonster as { evolutionId?: unknown })
      .evolutionId;
    const evolutionId = normalizeEvolutionId(rawEvolutionId);
    const registeredEvolutionIds = normalizeEvolutionIds(
      (parsedMonster as { registeredEvolutionIds?: unknown })
        .registeredEvolutionIds,
      evolutionId
    );
    const claimedMissionIds = normalizeMissionIds(
      (parsedMonster as { claimedMissionIds?: unknown }).claimedMissionIds
    );
    const onakaPercent =
      typeof parsedMonster.onakaPercent === "number"
        ? Math.min(Math.max(parsedMonster.onakaPercent, 0), 100)
        : initialMonsterState.onakaPercent;
    const points =
      typeof (parsedMonster as { points?: unknown }).points === "number"
        ? Math.max(0, Math.floor((parsedMonster as { points: number }).points))
        : initialMonsterState.points;

    return {
      ...initialMonsterState,
      claimedMissionIds,
      evolutionId,
      name: parsedMonster.name ?? initialMonsterState.name,
      onakaPercent,
      points,
      registeredEvolutionIds,
    };
  } catch {
    return initialMonsterState;
  }
}

function normalizeMissionIds(ids: unknown): MissionId[] {
  if (!Array.isArray(ids)) return [];

  return Array.from(
    new Set(
      ids.filter(
        (id): id is MissionId =>
          id === "today-feed" ||
          id === "week-three-feeds" ||
          id === "three-feelings" ||
          id === "full-onaka" ||
          id === "first-evolution"
      )
    )
  );
}

export async function saveMonsterState(monster: MonsterState) {
  await AsyncStorage.setItem(monsterStateKey, JSON.stringify(monster));
}

function normalizeEvolutionId(id: unknown): MonsterState["evolutionId"] {
  if (id === "anxiety" || id === "ikari" || id === "kanashimi") {
    return id;
  }

  if (id === "shizuku") return "anxiety";
  if (id === "nemuri" || id === "fuwafuwa") return "kanashimi";

  return null;
}

function normalizeEvolutionIds(
  ids: unknown,
  currentEvolutionId: MonsterState["evolutionId"]
): MonsterState["registeredEvolutionIds"] {
  const normalized = Array.isArray(ids)
    ? ids.flatMap((id) => {
        const evolutionId = normalizeEvolutionId(id);
        return evolutionId ? [evolutionId] : [];
      })
    : [];

  if (currentEvolutionId) {
    normalized.push(currentEvolutionId);
  }

  return Array.from(new Set(normalized));
}
