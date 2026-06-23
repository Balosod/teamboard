import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import api from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    setUser({ id: "1", email, name: "User" }); // In real app, decode JWT or fetch /profile
    setLoading(false);
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    const res = await api.post("/auth/signup", { email, password, name });
    localStorage.setItem("token", res.data.access_token);
    setUser({ id: "1", email, name });
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
