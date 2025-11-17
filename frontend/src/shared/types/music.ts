export interface Track {
  title: string;
  artist: string;

  bpm: number;

  community: boolean;

  difficulties: TrackDifficulty[];
  // 에셋
  coverSrc: string;
  cdSrc: string;
  backgroundVideoSrc: string;
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
