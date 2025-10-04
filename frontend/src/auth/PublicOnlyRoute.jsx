import React, { createContext, useContext, useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  // Jeżeli już zalogowany -> nie pokazuj logowania/rejestracji, tylko przenieś na /dashboard
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
