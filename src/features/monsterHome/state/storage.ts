import AsyncStorage from "@react-native-async-storage/async-storage";

import { EmotionLogEntry } from "./emotionLog";
import { initialMonsterState, MonsterState } from "./monsterState";
import { MissionId } from "./missions";
import { isProfileAvatarId } from "./profile";
import {
  getShopItemById,
  isRoomItemPlacement,
  isShopItemId,
  isShopItemSlot,
  RoomItemPlacement,
  RoomItemPlacements,
  ShopItemSlot,
} from "./shopItems";

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
    const ownedItemIds = normalizeShopItemIds(
      (parsedMonster as { ownedItemIds?: unknown }).ownedItemIds
    );
    const equippedItemIds = normalizeEquippedItemIds(
      (parsedMonster as { equippedItemIds?: unknown }).equippedItemIds,
      ownedItemIds
    );
    const roomItemPlacements = normalizeRoomItemPlacements(
      (parsedMonster as { roomItemPlacements?: unknown }).roomItemPlacements,
      ownedItemIds,
      equippedItemIds
    );
    const onakaPercent =
      typeof parsedMonster.onakaPercent === "number"
        ? Math.min(Math.max(parsedMonster.onakaPercent, 0), 100)
        : initialMonsterState.onakaPercent;
    const points =
      typeof (parsedMonster as { points?: unknown }).points === "number"
        ? Math.max(0, Math.floor((parsedMonster as { points: number }).points))
        : initialMonsterState.points;
    const profileAvatarId = isProfileAvatarId(
      (parsedMonster as { profileAvatarId?: unknown }).profileAvatarId
    )
      ? (parsedMonster as { profileAvatarId: MonsterState["profileAvatarId"] })
          .profileAvatarId
      : initialMonsterState.profileAvatarId;
    const profileImageUri =
      typeof (parsedMonster as { profileImageUri?: unknown }).profileImageUri ===
      "string"
        ? (parsedMonster as { profileImageUri: string }).profileImageUri
        : initialMonsterState.profileImageUri;
    const userBirthday =
      typeof (parsedMonster as { userBirthday?: unknown }).userBirthday ===
      "string"
        ? (parsedMonster as { userBirthday: string }).userBirthday.slice(0, 24)
        : initialMonsterState.userBirthday;
    const hasCompletedProfile =
      typeof (parsedMonster as { hasCompletedProfile?: unknown })
        .hasCompletedProfile === "boolean"
        ? (parsedMonster as { hasCompletedProfile: boolean })
            .hasCompletedProfile
        : Boolean(parsedMonster.name && userBirthday);

    return {
      ...initialMonsterState,
      claimedMissionIds,
      equippedItemIds,
      evolutionId,
      hasCompletedProfile,
      name: parsedMonster.name ?? initialMonsterState.name,
      onakaPercent,
      ownedItemIds,
      points,
      profileAvatarId,
      profileImageUri,
      registeredEvolutionIds,
      roomItemPlacements,
      userBirthday,
    };
  } catch {
    return initialMonsterState;
  }
}

function normalizeShopItemIds(ids: unknown) {
  if (!Array.isArray(ids)) return [];

  return Array.from(new Set(ids.filter(isShopItemId)));
}

function normalizeEquippedItemIds(
  equippedItemIds: unknown,
  ownedItemIds: string[]
): MonsterState["equippedItemIds"] {
  if (!equippedItemIds || typeof equippedItemIds !== "object") return {};

  return Object.entries(equippedItemIds).reduce<
    Partial<Record<ShopItemSlot, string>>
  >((result, [slot, itemId]) => {
    if (
      isShopItemSlot(slot) &&
      isShopItemId(itemId) &&
      ownedItemIds.includes(itemId)
    ) {
      result[slot] = itemId;
    }

    return result;
  }, {});
}

function normalizeRoomItemPlacements(
  placements: unknown,
  ownedItemIds: string[],
  legacyEquippedItemIds: MonsterState["equippedItemIds"]
): RoomItemPlacements {
  const normalizedPlacements: RoomItemPlacements = {};

  if (placements && typeof placements === "object") {
    Object.entries(placements).forEach(([itemId, placement]) => {
      if (
        isShopItemId(itemId) &&
        ownedItemIds.includes(itemId) &&
        isRoomItemPlacement(placement)
      ) {
        normalizedPlacements[itemId] = clampRoomItemPlacement(placement);
      }
    });
  }

  Object.values(legacyEquippedItemIds).forEach((itemId) => {
    if (!itemId || normalizedPlacements[itemId]) return;

    const item = getShopItemById(itemId);

    if (item && ownedItemIds.includes(itemId)) {
      normalizedPlacements[itemId] = item.defaultPlacement;
    }
  });

  return normalizedPlacements;
}

function clampRoomItemPlacement(
  placement: RoomItemPlacement
): RoomItemPlacement {
  return {
    height: clamp(placement.height, 0.06, 0.85),
    left: clamp(placement.left, -0.2, 1.1),
    rotate: placement.rotate,
    top: clamp(placement.top, -0.2, 1.1),
    width: clamp(placement.width, 0.06, 0.95),
    zIndex: Math.round(clamp(placement.zIndex, 1, 30)),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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
