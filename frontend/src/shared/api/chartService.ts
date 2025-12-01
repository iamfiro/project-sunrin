import { Chart, ChartSortOption } from "@/shared/types/chart";

import request from "./client";

export interface GetChartsParams {
  search?: string;
  sort?: ChartSortOption;
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
      filtered.sort((a, b) => b.id - a.id);
      break;
    case "oldest":
      filtered.sort((a, b) => a.id - b.id);
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
