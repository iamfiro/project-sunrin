import React, { createContext, useContext, useEffect, useState } from "react";

import * as authService from "@/shared/api/authService";
import { User } from "@/shared/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signin: (payload: { nickname: string; password: string }) => Promise<void>;
  signup: (payload: {
    email: string;
    username: string;
    password: string;
  }) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = await authService.me();
      setUser(u ?? null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On mount, try to get current user using httpOnly cookie
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signin = async (payload: { nickname: string; password: string }) => {
    await authService.signin({
      nickname: payload.nickname,
      password: payload.password,
    });
    await refreshUser();
  };

  const signup = async (payload: {
    email: string;
    username: string;
    password: string;
  }) => {
    await authService.signup(payload);
  };

  const signout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, signin, signup, signout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
