import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAccessToken as setApiAccessToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Run once on page load
useEffect(() => {
  const initAuth = async () => {
    console.log("🔁 Checking for refresh token...");

    try {
      // 🧠 Only call /auth/refresh if refreshToken cookie exists
      if (!document.cookie.includes("refreshToken")) {
        console.log("⚠️ No refresh cookie found — skipping refresh request");
        setLoading(false);
        return;
      }

      // ✅ Try refresh silently (won’t spam console on 401)
      const res = await api.post("/auth/refresh", {}, { withCredentials: true }).catch(() => null);

      // If no token returned, skip user loading
      if (!res?.data?.success || !res?.data?.data?.accessToken) {
        console.log("⚠️ No refresh token found or not authorized");
        return;
      }

      const newToken = res.data.data.accessToken;
      setAccessToken(newToken);
      setApiAccessToken(newToken);

      // ✅ Fetch user info
      const userRes = await api.get("/users/me");
      setUser(userRes.data.data.user);

    } catch (err) {
      console.warn("⚠️ Silent auth refresh failed:", err.message);
      setUser(null);
      setAccessToken(null);
      setApiAccessToken(null);
    } finally {
      console.log("🧹 Auth check complete");
      setLoading(false);
    }
  };

  initAuth();
}, []);



  // 🔹 Login
  const login = async (email, password) => {
    try {
      const response = await api.post(
        '/auth/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        const token = response.data.data.accessToken;
        setAccessToken(token);
        setApiAccessToken(token);
        setUser(response.data.data.user);
      }

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? 'Invalid email or password'
          : 'Login failed. Please try again.');
      throw new Error(message);
    }
  };

  // 🔹 Register
  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.success) {
      const token = response.data.data.accessToken;
      setAccessToken(token);
      setApiAccessToken(token);
      setUser(response.data.data.user);
      return response.data;
    }
    throw new Error(response.data.message);
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setApiAccessToken(null);
    }
  };

  // 🔹 Refresh (used by interceptors if needed)
  const refreshAccessToken = async () => {
    try {
      const response = await api.post('/auth/refresh', {}, { withCredentials: true });
      if (response.data.success) {
        const token = response.data.data.accessToken;
        setAccessToken(token);
        setApiAccessToken(token);
        return token;
      }
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      setApiAccessToken(null);
      throw error;
    }
  };

  const value = { user, accessToken, loading, login, register, logout, refreshAccessToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
