// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";

import NavBar from "./components/NavBar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Checkup from "./pages/Checkup";
import Documents from "./pages/Documents";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          {/* Publiczne, ale tylko dla niezalogowanych */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Chronione — tylko dla zalogowanych */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/checkup" element={<Checkup />} />
	    <Route path="/documents" element={<Documents />} />
          </Route>

          {/* Strona główna: przekierowanie zależne od stanu */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Fallback 404 -> na "/" (a stamtąd HomeRedirect zrobi resztę) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}
