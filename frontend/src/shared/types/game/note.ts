export type NoteType = "tap" | "hold";

export interface Note {
  id: string; // 유니크 ID
  time: number; // 노트가 떨어지는 시간(ms 또는 beat 단위)
  lane: number; // 몇 번째 라인인지 (1, 2, 3, ...)
  type: NoteType; // 노트 타입

  // optional: 홀드/슬라이드 길이
  duration?: number; // 홀드/슬라이드의 지속 시간(ms)
}
