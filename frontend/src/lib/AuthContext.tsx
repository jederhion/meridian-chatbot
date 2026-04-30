"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchApi } from "./api";

type AuthContextType = {
  isLoggedIn: boolean;
  username: string | null;
  isLoadingAuth: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkAuth = async () => {
    setIsLoadingAuth(true);
    try {
      // ✨ CHANGED: Use /metrics to verify the user session since /keys/status is gone
      const response = await fetchApi("/api/settings/metrics", {
        credentials: "include",
      });
      
      if (response.ok) {
        setIsLoggedIn(true);
        // Since metrics doesn't return the username, we rely entirely on localStorage
        setUsername(localStorage.getItem("username") || "User");
      } else {
        setIsLoggedIn(false);
        setUsername(null);
      }
    } catch (error) {
      console.error("Failed to check auth status", error);
      setIsLoggedIn(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetchApi("/api/auth/logout", { method: "POST", credentials: "include" });
      setIsLoggedIn(false);
      setUsername(null);
      localStorage.removeItem("username");
      window.location.href = "/account";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, isLoadingAuth, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}