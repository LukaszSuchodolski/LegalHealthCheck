/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("lhc_token") || "",
  );
  const [role, setRole] = useState(
    () => localStorage.getItem("lhc_role") || "",
  );
  const [userId, setUserId] = useState(
    () => localStorage.getItem("lhc_user") || "",
  );

  function loginOk({ token, role, user_id }) {
    setToken(token);
    setRole(role);
    setUserId(user_id);
    localStorage.setItem("lhc_token", token);
    localStorage.setItem("lhc_role", role);
    localStorage.setItem("lhc_user", user_id);
  }

  function logout() {
    setToken("");
    setRole("");
    setUserId("");
    localStorage.removeItem("lhc_token");
    localStorage.removeItem("lhc_role");
    localStorage.removeItem("lhc_user");
  }

  const value = { token, role, userId, isAuthed: !!token, loginOk, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
