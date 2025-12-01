import request from "./client";

export interface SaveResultParams {
  musicId: string;
  score: number;
  accuracy: number;
  combo: string;
  rank: string;
  isFullCombo: boolean;
  isAllPerfect: boolean;
  perfect: number;
  great: number;
  good: number;
  miss: number;
  bad: number;
  earlyCount: number;
  lateCount: number;
}

export interface SaveResultResponse {
  id: number;
  musicId: string;
  score: number;
  accuracy: number;
  combo: string;
  rank: string;
  isFullCombo: boolean;
  isAllPerfect: boolean;
  perfect: number;
  great: number;
  good: number;
  miss: number;
  bad: number;
  earlyCount: number;
  lateCount: number;
  playedAt: string;
}

export async function saveResult(data: SaveResultParams) {
  return request<SaveResultResponse>("/results/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
