import type { EvolutionId } from "./evolution";
import { MAX_FEED_CHARGES } from "./feedCharges";
import type { MissionClaimKey } from "./missions";
import type { ProfileAvatarId } from "./profile";
import type { RoomItemPlacements, ShopItemSlot } from "./shopItems";

export type BgmTrackId = "nukumori" | "hidamari";
export type MonsterFormKey = "base" | EvolutionId;
export type MonsterNamesByForm = Partial<Record<MonsterFormKey, string>>;
export type RoomItemPlacementsByForm = Partial<
  Record<MonsterFormKey, RoomItemPlacements>
>;

export type MonsterCompanion = {
  evolutionId: EvolutionId | null;
  feedChargeCount: number;
  feedChargeUpdatedAt: number | null;
  growthStartedAt: number | null;
  id: string;
  name: string;
  onakaPercent: number;
  onakaUpdatedAt: number | null;
  roomItemPlacements: RoomItemPlacements;
};

export const INITIAL_MONSTER_ID = "monster-initial";

export type MonsterState = {
  activeMonsterId: string;
  bgmTrack: BgmTrackId;
  bgmVolume: number;
  claimedMissionIds: MissionClaimKey[];
  eggDiscoveredAt: number | null;
  eggHatchRevealedAt: number | null;
  equippedItemIds: Partial<Record<ShopItemSlot, string>>;
  evolutionId: EvolutionId | null;
  feedChargeCount: number;
  feedChargeUpdatedAt: number | null;
  hasCompletedProfile: boolean;
  growthStartedAt: number | null;
  hungerNotificationId: string | null;
  monsterArchive: MonsterCompanion[];
  monsterNamesByForm: MonsterNamesByForm;
  name: string;
  notificationsEnabled: boolean;
  onakaPercent: number;
  onakaUpdatedAt: number | null;
  ownedItemIds: string[];
  points: number;
  profileAvatarId: ProfileAvatarId;
  profileImageUri: string;
  registeredEvolutionIds: EvolutionId[];
  roomItemPlacements: RoomItemPlacements;
  roomItemPlacementsByForm: RoomItemPlacementsByForm;
  seVolume: number;
  userBirthday: string;
  userName: string;
};

export type FeedEmotion = {
  feeling: string;
  note: string;
};

export const ONAKA_GAIN_PER_FEED = 11;

export const initialMonsterState: MonsterState = {
  activeMonsterId: INITIAL_MONSTER_ID,
  bgmTrack: "nukumori",
  bgmVolume: 0.75,
  claimedMissionIds: [],
  eggDiscoveredAt: null,
  eggHatchRevealedAt: null,
  equippedItemIds: {},
  evolutionId: null,
  feedChargeCount: MAX_FEED_CHARGES,
  feedChargeUpdatedAt: null,
  growthStartedAt: null,
  hasCompletedProfile: false,
  hungerNotificationId: null,
  monsterArchive: [],
  monsterNamesByForm: {},
  name: "モンスターの名前",
  notificationsEnabled: true,
  onakaPercent: 0,
  onakaUpdatedAt: null,
  ownedItemIds: [],
  points: 0,
  profileAvatarId: "star",
  profileImageUri: "",
  registeredEvolutionIds: [],
  roomItemPlacements: {},
  roomItemPlacementsByForm: {},
  seVolume: 0.72,
  userBirthday: "",
  userName: "",
};

export function getMonsterFormKey(
  evolutionId: EvolutionId | null
): MonsterFormKey {
  return evolutionId ?? "base";
}

export function getActiveMonsterCompanion(
  monster: MonsterState
): MonsterCompanion {
  return {
    evolutionId: monster.evolutionId,
    feedChargeCount: monster.feedChargeCount,
    feedChargeUpdatedAt: monster.feedChargeUpdatedAt,
    growthStartedAt: monster.growthStartedAt,
    id: monster.activeMonsterId,
    name: monster.name,
    onakaPercent: monster.onakaPercent,
    onakaUpdatedAt: monster.onakaUpdatedAt,
    roomItemPlacements: monster.roomItemPlacements,
  };
}

export function createMonsterId(now = Date.now()) {
  return `monster-${now}-${Math.random().toString(36).slice(2, 8)}`;
}
