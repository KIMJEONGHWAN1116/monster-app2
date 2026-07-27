import type { EvolutionId } from "./evolution";
import { MAX_FEED_CHARGES } from "./feedCharges";
import type { MissionClaimKey } from "./missions";
import type { ProfileAvatarId } from "./profile";
import type { RoomItemPlacements, ShopItemSlot } from "./shopItems";

export type BgmTrackId = "nukumori" | "hidamari";

export type MonsterState = {
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
  seVolume: number;
  userBirthday: string;
};

export type FeedEmotion = {
  feeling: string;
  note: string;
};

export const ONAKA_GAIN_PER_FEED = 11;

export const initialMonsterState: MonsterState = {
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
  seVolume: 0.72,
  userBirthday: "",
};
