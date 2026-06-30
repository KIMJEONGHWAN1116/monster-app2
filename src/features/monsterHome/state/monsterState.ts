import type { EvolutionId } from "./evolution";
import type { MissionId } from "./missions";

export type MonsterState = {
  claimedMissionIds: MissionId[];
  evolutionId: EvolutionId | null;
  name: string;
  onakaPercent: number;
  points: number;
  registeredEvolutionIds: EvolutionId[];
};

export type FeedEmotion = {
  feeling: string;
  note: string;
};

export const initialMonsterState: MonsterState = {
  claimedMissionIds: [],
  evolutionId: null,
  name: "モンスターの名前",
  onakaPercent: 0,
  points: 0,
  registeredEvolutionIds: [],
};
