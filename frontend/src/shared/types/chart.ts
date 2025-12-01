export interface ChartRankUser {
  id: number;
  username: string;
  profileImage: string | null;
}

export interface ChartRank {
  user: ChartRankUser;
  score: number;
}

export interface UserBestRecord {
  accuracy: number;
  combo: string;
  score: number;
  rank: string;
  isFullCombo: boolean;
  isAllPerfect: boolean;
}

export interface Note {
  id: number;
  time: number;
  lane: number;
  type: "tap" | "hold";
  duration: number | null;
  chart: number;
}

export interface Chart {
  id: string;
  ranks: ChartRank[];
  userBestRecord: UserBestRecord | null;
  notes: Note[];
  musicId: string;
  title: string;
  song: string;
  backgroundVideo: string;
  coverUrl: string;
  isCommunitySong: boolean;
  artist: string;
  bpm: number;
  difficulty: number;
  creator: number;
}

export type ChartSortOption = "latest" | "oldest" | "mostPlayed";
