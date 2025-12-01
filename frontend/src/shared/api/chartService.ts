import { Chart } from "@/shared/types/chart";

import request from "./client";

export async function getCharts() {
  return request<Chart[]>("/charts/", {
    method: "GET",
  });
}

export async function getChart(musicId: string) {
  return request<Chart>(`/charts/${musicId}/`, {
    method: "GET",
  });
}

export async function createChart(data: any) {
  return request<Chart>("/charts/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateChart(musicId: string, data: any) {
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
