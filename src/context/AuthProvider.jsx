import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { authAPI } from "../api/auth.api";

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load user on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.me();
        setUser(res.data.data);

      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 🔹 Login
  const login = async (data) => {
    const res = await authAPI.login(data);
    const { user, accessToken } = res.data.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(user);
    console.log(user);
  };

  // 🔹 Register
  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user, accessToken } = res.data.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(user);
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.log("Failed to logout");
    }
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const forgotPassword = async (data) => {
    const res = await authAPI.forgetPassword(data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};