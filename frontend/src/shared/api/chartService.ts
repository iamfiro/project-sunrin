import { Chart, ChartSortOption, Note } from "@/shared/types/chart";

import request from "./client";

export interface GetChartsParams {
  search?: string;
  sort?: ChartSortOption;
}

export interface SaveChartNote {
  time: number;
  lane: number;
  type: "tap" | "hold";
  duration?: number;
}

export interface SaveChartParams {
  title: string;
  artist: string;
  bpm: number;
  notes_data: SaveChartNote[];
  musicFile: File;
  difficulty: number;
}

export async function saveChart(data: SaveChartParams) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("artist", data.artist);
  formData.append("bpm", data.bpm.toString());
  formData.append("difficulty", data.difficulty.toString());
  formData.append("musicFile", data.musicFile);
  formData.append("notes_data", JSON.stringify(data.notes_data));

  return request<Chart>("/charts/", {
    method: "POST",
    body: formData,
  });
}

export async function getCharts(_params?: GetChartsParams) {
  return request<Chart[]>("/charts/", {
    method: "GET",
  });
}

export function filterCharts(
  charts: Chart[],
  search: string,
  sort: ChartSortOption,
): Chart[] {
  let filtered = [...charts];

  if (search.trim()) {
    const searchLower = search.toLowerCase().trim();
    filtered = filtered.filter(
      (chart) =>
        chart.title.toLowerCase().includes(searchLower) ||
        chart.artist.toLowerCase().includes(searchLower),
    );
  }

  switch (sort) {
    case "latest":
      filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      break;
    case "oldest":
      filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      break;
    case "mostPlayed":
      filtered.sort((a, b) => {
        const scoreA = a.userBestRecord?.score ?? 0;
        const scoreB = b.userBestRecord?.score ?? 0;
        return scoreB - scoreA;
      });
      break;
  }

  return filtered;
}

export async function getChart(musicId: string) {
  return request<Chart>(`/charts/${musicId}/`, {
    method: "GET",
  });
}

export async function createChart(data: Partial<Chart>) {
  return request<Chart>("/charts/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateChart(musicId: string, data: Partial<Chart>) {
  return request<Chart>(`/charts/${musicId}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteChart(musicId: string) {
  return request<void>(`/charts/${musicId}/`, {
    method: "DELETE",
  });
}
