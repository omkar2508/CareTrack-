"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  condition?: string;
  heightCm?: number;
  isProfileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("ct_token");
    const savedUser = localStorage.getItem("ct_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const saveSession = (token: string, user: User) => {
    localStorage.setItem("ct_token", token);
    localStorage.setItem("ct_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    const data = await authApi.signup(name, email, password, confirmPassword);
    saveSession(data.token, data.user);
    router.push("/dashboard");
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    saveSession(data.token, data.user);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("ct_token");
    localStorage.removeItem("ct_user");
    setToken(null);
    setUser(null);
    router.push("/");
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const data = await authApi.updateProfile(token!, profileData);
    const updated = { ...user!, ...data.user };
    localStorage.setItem("ct_user", JSON.stringify(updated));
    setUser(updated);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const data = await authApi.me(token);
      const updated = { ...user!, ...data.user };
      localStorage.setItem("ct_user", JSON.stringify(updated));
      setUser(updated);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signup, login, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
