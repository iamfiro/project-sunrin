import { User } from "@/shared/types/user";

import request from "./client";

export interface SignUpPayload {
  email: string;
  username: string;
  password: string;
}

export interface SignInPayload {
  username: string;
  password: string;
}

export async function signup(payload: SignUpPayload) {
  return request<{ success: boolean; message?: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signin(payload: SignInPayload) {
  // Expect server to set httpOnly cookie on success
  return request<{ success: boolean; message?: string }>("/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function me() {
  return request<User | null>("/auth/me", { method: "GET" });
}

export async function logout() {
  return request<{ success: boolean }>("/auth/logout", { method: "POST" });
}
