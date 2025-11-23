import React, { createContext, useContext, useEffect, useState } from "react";

import * as authService from "@/shared/api/authService";
import { User } from "@/shared/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signin: (payload: { username: string; password: string }) => Promise<void>;
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

  // Development convenience: allow a local dev-login shortcut.
  // Enabled when VITE_DEV_AUTH === 'true' OR when running in Vite development mode.
  // Default dev credentials requested: username `dev`, password `qwer1234@`.
  const DEV_AUTH_ENABLED =
    (import.meta.env.VITE_DEV_AUTH as string) === "true" ||
    import.meta.env.MODE === "development";
  const DEV_USERNAME = (import.meta.env.VITE_DEV_USERNAME as string) || "dev";
  const DEV_PASSWORD =
    (import.meta.env.VITE_DEV_PASSWORD as string) || "qwer1234@";
  const DEV_USER: User = {
    id: (import.meta.env.VITE_DEV_USER_ID as string) || "dev-id",
    name: (import.meta.env.VITE_DEV_USER_NAME as string) || "Developer",
    profileImage: "",
    stats: { perfectCount: 0, highestScore: 0 },
  };

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

  const signin = async (payload: { username: string; password: string }) => {
    // If dev auth is enabled and credentials match, short-circuit to a fake user
    if (
      DEV_AUTH_ENABLED &&
      payload.username === DEV_USERNAME &&
      payload.password === DEV_PASSWORD
    ) {
      setUser(DEV_USER);
      setLoading(false);
      return;
    }

    await authService.signin(payload);
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
