import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";

// proste widoki testowe
function Home() {
  return (
    <div style={{ padding: 16, fontSize: 18 }}>✅ Router działa — Home.</div>
  );
}
function Checkup() {
  return (
    <div style={{ padding: 16, fontSize: 18 }}>🩺 Checkup — widok testowy.</div>
  );
}
function Results() {
  return (
    <div style={{ padding: 16, fontSize: 18 }}>📊 Results — placeholder.</div>
  );
}

// ← tu najważniejsze: import PRAWDZIWEJ strony Documents
import Documents from "./pages/Documents";

const root = document.getElementById("root");
ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <NavBar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkup" element={<Checkup />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/results" element={<Results />} />
      <Route path="*" element={<div style={{ padding: 16 }}>404</div>} />
    </Routes>
  </BrowserRouter>,
);
