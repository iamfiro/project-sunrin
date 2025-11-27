export interface GameResult {
  musicId: string; //곡 ID
  difficulty: number;

  score: number; //곡 최종 점수
  accuracy: number; //정확도
  rank: "F" | "D" | "C" | "B" | "A" | "S" | "SS"; //점수 기반 랭크 저장

  combo: string[]; //스트링으로 저장하고 차후 파싱 예정
  isFullCombo: boolean;
  isAllPerfect: boolean;

  earlyCount: number; // 빠르게 친 판정
  lateCount: number; // 느리게 친 판정 수

  perfectHigh: number; // 완벽한 퍼펙 (Perfect·High)
  perfect: number; // 퍼펙
  great: number; // 좋음
  good: number; // 중간
  miss: number; // 놓침
  bad?: number; // 나쁨

  playedAt: string;
}
