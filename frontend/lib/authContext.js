"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiRegister } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedEmail = localStorage.getItem("user_email");
    const savedGender = localStorage.getItem("user_gender");
    if (token && savedEmail) {
      setUser({ email: savedEmail, gender: savedGender || "man" });
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_gender", data.gender || "man");
      setUser({ email, gender: data.gender || "man" });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const register = async (email, password, gender) => {
    try {
      await apiRegister(email, password, gender);
      // register only, no auto-login
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_gender");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}