import { Note } from "./note";

export interface Chart {
  id: string; // 채보 ID
  title: string; // 곡 제목
  artist: string; // 아티스트명
  difficulty: number; // 난이도 숫자 (예: 1~15)
  notes: Note[]; // 실제 노트들
}
