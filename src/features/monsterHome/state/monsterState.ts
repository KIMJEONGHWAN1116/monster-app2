import type { EvolutionId } from "./evolution";
import type { MissionId } from "./missions";
import type { RoomItemPlacements, ShopItemSlot } from "./shopItems";

export type MonsterState = {
  claimedMissionIds: MissionId[];
  equippedItemIds: Partial<Record<ShopItemSlot, string>>;
  evolutionId: EvolutionId | null;
  name: string;
  onakaPercent: number;
  ownedItemIds: string[];
  points: number;
  registeredEvolutionIds: EvolutionId[];
  roomItemPlacements: RoomItemPlacements;
};

export type FeedEmotion = {
  feeling: string;
  note: string;
};

export const initialMonsterState: MonsterState = {
  claimedMissionIds: [],
  equippedItemIds: {},
  evolutionId: null,
  name: "モンスターの名前",
  onakaPercent: 0,
  ownedItemIds: [],
  points: 0,
  registeredEvolutionIds: [],
  roomItemPlacements: {},
};
