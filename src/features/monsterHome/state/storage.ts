import AsyncStorage from "@react-native-async-storage/async-storage";

import { EmotionLogEntry } from "./emotionLog";
import { MAX_FEED_CHARGES, restoreFeedCharges } from "./feedCharges";
import {
  getMonsterFormKey,
  INITIAL_MONSTER_ID,
  initialMonsterState,
  type MonsterCompanion,
  type MonsterFormKey,
  type MonsterNamesByForm,
  MonsterState,
  type RoomItemPlacementsByForm,
} from "./monsterState";
import { isMissionClaimKey, type MissionClaimKey } from "./missions";
import { restoreOnaka } from "./onaka";
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
    const eggDiscoveredAt = normalizeEggDiscoveredAt(
      (parsedMonster as { eggDiscoveredAt?: unknown }).eggDiscoveredAt,
      evolutionId
    );
    const eggHatchRevealedAt = normalizeEggHatchRevealedAt(
      (parsedMonster as { eggHatchRevealedAt?: unknown }).eggHatchRevealedAt,
      eggDiscoveredAt
    );
    const growthStartedAt = normalizeOptionalTimestamp(
      (parsedMonster as { growthStartedAt?: unknown }).growthStartedAt
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
    const rawMonsterArchive = (
      parsedMonster as { monsterArchive?: unknown }
    ).monsterArchive;
    const hasMonsterArchive = Array.isArray(rawMonsterArchive);
    const legacyRoomItemPlacements = normalizeRoomItemPlacements(
      (parsedMonster as { roomItemPlacements?: unknown }).roomItemPlacements,
      ownedItemIds,
      equippedItemIds
    );
    const rawRoomItemPlacementsByForm = (
      parsedMonster as { roomItemPlacementsByForm?: unknown }
    ).roomItemPlacementsByForm;
    const hasRoomItemPlacementsByForm = Boolean(
      rawRoomItemPlacementsByForm &&
        typeof rawRoomItemPlacementsByForm === "object"
    );
    const roomItemPlacementsByForm = normalizeRoomItemPlacementsByForm(
      rawRoomItemPlacementsByForm,
      ownedItemIds
    );
    const currentFormKey = getMonsterFormKey(evolutionId);

    if (!hasRoomItemPlacementsByForm) {
      roomItemPlacementsByForm[currentFormKey] = legacyRoomItemPlacements;
    }

    const roomItemPlacements = hasMonsterArchive
      ? legacyRoomItemPlacements
      : roomItemPlacementsByForm[currentFormKey] ?? {};
    const legacyMonsterName = normalizeMonsterName(
      (parsedMonster as { name?: unknown }).name
    );
    const rawMonsterNamesByForm = (
      parsedMonster as { monsterNamesByForm?: unknown }
    ).monsterNamesByForm;
    const hasMonsterNamesByForm = Boolean(
      rawMonsterNamesByForm && typeof rawMonsterNamesByForm === "object"
    );
    const monsterNamesByForm = normalizeMonsterNamesByForm(
      rawMonsterNamesByForm
    );

    if (!hasMonsterNamesByForm) {
      monsterNamesByForm[currentFormKey] = legacyMonsterName;
    }

    const name = hasMonsterArchive
      ? legacyMonsterName
      : monsterNamesByForm[currentFormKey] ?? legacyMonsterName;
    const onakaState = restoreOnaka({
      onakaPercent:
        typeof parsedMonster.onakaPercent === "number"
          ? parsedMonster.onakaPercent
          : initialMonsterState.onakaPercent,
      onakaUpdatedAt:
        typeof (parsedMonster as { onakaUpdatedAt?: unknown })
          .onakaUpdatedAt === "number"
          ? (parsedMonster as { onakaUpdatedAt: number }).onakaUpdatedAt
          : null,
    });
    const bgmTrack = normalizeBgmTrack(
      (parsedMonster as { bgmTrack?: unknown }).bgmTrack
    );
    const bgmVolume =
      typeof (parsedMonster as { bgmVolume?: unknown }).bgmVolume === "number"
        ? Math.min(
            Math.max((parsedMonster as { bgmVolume: number }).bgmVolume, 0),
            1
          )
        : initialMonsterState.bgmVolume;
    const seVolume =
      typeof (parsedMonster as { seVolume?: unknown }).seVolume === "number"
        ? Math.min(
            Math.max((parsedMonster as { seVolume: number }).seVolume, 0),
            1
          )
        : initialMonsterState.seVolume;
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
    const userName = normalizeUserName(
      (parsedMonster as { userName?: unknown }).userName,
      hasCompletedProfile
    );
    const feedChargeState = restoreFeedCharges({
      feedChargeCount:
        typeof (parsedMonster as { feedChargeCount?: unknown })
          .feedChargeCount === "number"
          ? (parsedMonster as { feedChargeCount: number }).feedChargeCount
          : MAX_FEED_CHARGES,
      feedChargeUpdatedAt:
        typeof (parsedMonster as { feedChargeUpdatedAt?: unknown })
          .feedChargeUpdatedAt === "number"
          ? (parsedMonster as { feedChargeUpdatedAt: number })
              .feedChargeUpdatedAt
          : null,
    });
    const activeMonsterId = normalizeMonsterId(
      (parsedMonster as { activeMonsterId?: unknown }).activeMonsterId,
      INITIAL_MONSTER_ID
    );
    const monsterArchive = normalizeMonsterArchive(
      rawMonsterArchive,
      ownedItemIds,
      activeMonsterId
    );

    if (!hasMonsterArchive) {
      const archivedBaseName = monsterNamesByForm.base;

      if (
        evolutionId !== null &&
        eggDiscoveredAt === null &&
        archivedBaseName
      ) {
        monsterArchive.push({
          evolutionId: null,
          feedChargeCount: MAX_FEED_CHARGES,
          feedChargeUpdatedAt: null,
          growthStartedAt: null,
          id: "monster-legacy-base",
          name: archivedBaseName,
          onakaPercent: 0,
          onakaUpdatedAt: null,
          roomItemPlacements: roomItemPlacementsByForm.base ?? {},
        });
      }

      registeredEvolutionIds.forEach((registeredEvolutionId) => {
        if (registeredEvolutionId === evolutionId) return;

        monsterArchive.push({
          evolutionId: registeredEvolutionId,
          feedChargeCount: MAX_FEED_CHARGES,
          feedChargeUpdatedAt: null,
          growthStartedAt: null,
          id: `monster-legacy-${registeredEvolutionId}`,
          name:
            monsterNamesByForm[registeredEvolutionId] ?? legacyMonsterName,
          onakaPercent: 0,
          onakaUpdatedAt: null,
          roomItemPlacements:
            roomItemPlacementsByForm[registeredEvolutionId] ?? {},
        });
      });
    }

    return {
      ...initialMonsterState,
      activeMonsterId,
      bgmTrack,
      bgmVolume,
      claimedMissionIds,
      eggDiscoveredAt,
      eggHatchRevealedAt,
      equippedItemIds,
      evolutionId,
      ...feedChargeState,
      growthStartedAt,
      hasCompletedProfile,
      hungerNotificationId:
        typeof (parsedMonster as { hungerNotificationId?: unknown })
          .hungerNotificationId === "string"
          ? (parsedMonster as { hungerNotificationId: string })
              .hungerNotificationId
          : null,
      monsterArchive,
      monsterNamesByForm,
      name,
      notificationsEnabled:
        typeof (parsedMonster as { notificationsEnabled?: unknown })
          .notificationsEnabled === "boolean"
          ? (parsedMonster as { notificationsEnabled: boolean })
              .notificationsEnabled
          : initialMonsterState.notificationsEnabled,
      ...onakaState,
      ownedItemIds,
      points,
      profileAvatarId,
      profileImageUri,
      registeredEvolutionIds,
      roomItemPlacements,
      roomItemPlacementsByForm,
      seVolume,
      userBirthday,
      userName,
    };
  } catch {
    return initialMonsterState;
  }
}

function normalizeBgmTrack(track: unknown): MonsterState["bgmTrack"] {
  return track === "hidamari" ? "hidamari" : "nukumori";
}

function normalizeEggDiscoveredAt(
  value: unknown,
  evolutionId: MonsterState["evolutionId"]
) {
  if (value === null) return null;

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.min(value, Date.now());
  }

  return evolutionId ? Date.now() : null;
}

function normalizeEggHatchRevealedAt(
  value: unknown,
  eggDiscoveredAt: number | null
) {
  if (eggDiscoveredAt === null) return null;
  return normalizeOptionalTimestamp(value);
}

function normalizeOptionalTimestamp(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.min(value, Date.now());
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

function normalizeRoomItemPlacementsByForm(
  placementsByForm: unknown,
  ownedItemIds: string[]
): RoomItemPlacementsByForm {
  if (!placementsByForm || typeof placementsByForm !== "object") return {};

  return Object.entries(placementsByForm).reduce<RoomItemPlacementsByForm>(
    (result, [formKey, placements]) => {
      const normalizedFormKey = normalizeMonsterFormKey(formKey);

      if (normalizedFormKey) {
        result[normalizedFormKey] = normalizeRoomItemPlacements(
          placements,
          ownedItemIds,
          {}
        );
      }

      return result;
    },
    {}
  );
}

function normalizeMonsterFormKey(value: unknown): MonsterFormKey | null {
  if (value === "base") return "base";
  return normalizeEvolutionId(value);
}

function normalizeMonsterName(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return initialMonsterState.name;
  }

  return value.trim().slice(0, 16);
}

function normalizeMonsterId(value: unknown, fallback: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  return value.trim().slice(0, 64);
}

function normalizeMonsterArchive(
  value: unknown,
  ownedItemIds: string[],
  activeMonsterId: string
): MonsterCompanion[] {
  if (!Array.isArray(value)) return [];

  const seenIds = new Set([activeMonsterId]);

  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];

    const candidate = entry as Partial<MonsterCompanion>;
    const id = normalizeMonsterId(candidate.id, `monster-saved-${index}`);

    if (seenIds.has(id)) return [];

    const evolutionId =
      candidate.evolutionId === null
        ? null
        : normalizeEvolutionId(candidate.evolutionId);

    if (candidate.evolutionId !== null && evolutionId === null) return [];

    seenIds.add(id);

    return [
      {
        evolutionId,
        feedChargeCount:
          typeof candidate.feedChargeCount === "number"
            ? Math.round(clamp(candidate.feedChargeCount, 0, MAX_FEED_CHARGES))
            : MAX_FEED_CHARGES,
        feedChargeUpdatedAt: normalizeOptionalTimestamp(
          candidate.feedChargeUpdatedAt
        ),
        growthStartedAt: normalizeOptionalTimestamp(candidate.growthStartedAt),
        id,
        name: normalizeMonsterName(candidate.name),
        onakaPercent:
          typeof candidate.onakaPercent === "number"
            ? Math.round(clamp(candidate.onakaPercent, 0, 100))
            : 0,
        onakaUpdatedAt: normalizeOptionalTimestamp(candidate.onakaUpdatedAt),
        roomItemPlacements: normalizeRoomItemPlacements(
          candidate.roomItemPlacements,
          ownedItemIds,
          {}
        ),
      },
    ];
  });
}

function normalizeMonsterNamesByForm(value: unknown): MonsterNamesByForm {
  if (!value || typeof value !== "object") return {};

  return Object.entries(value).reduce<MonsterNamesByForm>(
    (result, [formKey, name]) => {
      const normalizedFormKey = normalizeMonsterFormKey(formKey);

      if (
        normalizedFormKey &&
        typeof name === "string" &&
        name.trim().length > 0
      ) {
        result[normalizedFormKey] = name.trim().slice(0, 16);
      }

      return result;
    },
    {}
  );
}

function normalizeUserName(value: unknown, hasCompletedProfile: boolean) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim().slice(0, 16);
  }

  return hasCompletedProfile ? "あなた" : initialMonsterState.userName;
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

function normalizeMissionIds(ids: unknown): MissionClaimKey[] {
  if (!Array.isArray(ids)) return [];

  return Array.from(new Set(ids.filter(isMissionClaimKey)));
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
