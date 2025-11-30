export interface GameResult {
  musicId: string;
  difficulty: number;

  score: number;
  accuracy: number;
  rank: "F" | "D" | "C" | "B" | "A" | "S" | "SS";

  combo: string[];
  isFullCombo: boolean;
  isAllPerfect: boolean;

  earlyCount: number;
  lateCount: number;

  perfect: number;
  great: number;
  good: number;
  miss: number;
  bad?: number;

  playedAt: string;
}
