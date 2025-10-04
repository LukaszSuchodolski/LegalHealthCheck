import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Trzymamy token w localStorage, by przetrwał odświeżenie strony
  const [token, setToken] = useState(() => localStorage.getItem("lhc_token"));

  const isAuthenticated = !!token;

  const login = (newToken) => {
    localStorage.setItem("lhc_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("lhc_token");
    setToken(null);
  };

  // useMemo żeby nie tworzyć nowego obiektu przy każdym renderze bez potrzeby
  const value = useMemo(
    () => ({ token, isAuthenticated, login, logout }),
    [token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
