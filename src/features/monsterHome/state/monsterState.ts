import type { EvolutionId } from "./evolution";
import { MAX_FEED_CHARGES } from "./feedCharges";
import type { MissionId } from "./missions";
import type { ProfileAvatarId } from "./profile";
import type { RoomItemPlacements, ShopItemSlot } from "./shopItems";

export type MonsterState = {
  claimedMissionIds: MissionId[];
  eggDiscoveredAt: number | null;
  equippedItemIds: Partial<Record<ShopItemSlot, string>>;
  evolutionId: EvolutionId | null;
  feedChargeCount: number;
  feedChargeUpdatedAt: number | null;
  hasCompletedProfile: boolean;
  name: string;
  onakaPercent: number;
  ownedItemIds: string[];
  points: number;
  profileAvatarId: ProfileAvatarId;
  profileImageUri: string;
  registeredEvolutionIds: EvolutionId[];
  roomItemPlacements: RoomItemPlacements;
  userBirthday: string;
};

export type FeedEmotion = {
  feeling: string;
  note: string;
};

export const ONAKA_GAIN_PER_FEED = 6;

export const initialMonsterState: MonsterState = {
  claimedMissionIds: [],
  eggDiscoveredAt: null,
  equippedItemIds: {},
  evolutionId: null,
  feedChargeCount: MAX_FEED_CHARGES,
  feedChargeUpdatedAt: null,
  hasCompletedProfile: false,
  name: "モンスターの名前",
  onakaPercent: 0,
  ownedItemIds: [],
  points: 0,
  profileAvatarId: "star",
  profileImageUri: "",
  registeredEvolutionIds: [],
  roomItemPlacements: {},
  userBirthday: "",
};
