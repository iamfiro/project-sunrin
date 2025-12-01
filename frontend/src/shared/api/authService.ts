import request from "./client";

export interface SignUpPayload {
  email: string;
  nickname: string;
  password: string;
  password_confirm: string;
}

export interface SignInPayload {
  nickname: string;
  password: string;
}

export interface UserStats {
  perfectCount: number;
  highestScore: number;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
  stats: UserStats;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens?: {
    refresh: string;
    access: string;
  };
}

export async function signup(payload: SignUpPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signin(payload: SignInPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nickname: payload.nickname,
      password: payload.password,
    }),
  });
}

export async function me(): Promise<User | null> {
  try {
    const response = await request<{ user: User }>("/auth/me", {
      method: "GET",
    });
    return response.user;
  } catch (error) {
    return null;
  }
}

export async function logout(): Promise<void> {
  await request("/auth/logout", {
    method: "POST",
  });
}
