import type { EvolutionId } from "./evolution";
import type { MissionId } from "./missions";
import type { ProfileAvatarId } from "./profile";
import type { RoomItemPlacements, ShopItemSlot } from "./shopItems";

export type BgmTrackId = "nukumori" | "hidamari";

export type MonsterState = {
  bgmTrack: BgmTrackId;
  bgmVolume: number;
  claimedMissionIds: MissionId[];
  equippedItemIds: Partial<Record<ShopItemSlot, string>>;
  evolutionId: EvolutionId | null;
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

export const initialMonsterState: MonsterState = {
  bgmTrack: "nukumori",
  bgmVolume: 0.75,
  claimedMissionIds: [],
  equippedItemIds: {},
  evolutionId: null,
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
