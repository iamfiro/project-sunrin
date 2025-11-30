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

export interface User {
  id: number;
  email: string;
  nickname: string;
  // Add other user fields as needed
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

export async function logout(): Promise<void> {
  // You might want to implement token invalidation on the backend
  return Promise.resolve();
}

// Removed the duplicate logout function
