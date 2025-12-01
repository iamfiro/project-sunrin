import { UserBestRecord } from "./chart";
import { TrackRank } from "./rank";

export interface Track {
  id: string;

  title: string;
  artist: string;

  bpm: number;

  community: boolean;

  difficulties: TrackDifficulty[];

  playTime: number;

  // 에셋
  coverSrc: string;
  cdSrc: string;
  backgroundVideoSrc: string;

  ranks?: TrackRank[];
  userBestRecord?: UserBestRecord | null;
}

export enum TrackDifficultyEnum {
  EASY = "easy",
  NORMAL = "normal",
  HARD = "hard",
}

export interface TrackDifficulty {
  difficulty: TrackDifficultyEnum;
  level: number;
  unlocked: boolean;
}
