// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkBase =
    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out";
  const active = "bg-blue-100 text-blue-700 shadow-sm border border-blue-200";
  const inactive = "text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm";

  const NavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? active : inactive}`
      }
      onClick={() => setOpen(false)}
    >
      {children}
    </NavLink>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      <NavItem to="/login">Login</NavItem>
      <NavItem to="/register">Register</NavItem>
    </div>
  );

  const PrivateLinks = () => (
    <div className="flex items-center gap-4">
      <NavItem to="/dashboard">Dashboard</NavItem>
      <NavItem to="/alerts">Alerts</NavItem>
      <NavItem to="/checkup">Checkup</NavItem>
      <NavItem to="/documents">Documents</NavItem>
      <button
        type="button"
        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
        onClick={() => {
          setOpen(false);
          logout();
        }}
      >
        Logout{user?.email ? ` (${user.email})` : ""}
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5"
        aria-label="Główna nawigacja"
      >
        {/* Logo + nazwa – dopasowana tarcza */}
<NavLink to="/" className="flex items-center gap-2 group">
  <img
    src="/logo.svg"   // ← Twój nowy plik SVG z tarczą
    alt="LegalHealthCheck logo"
    className="h-8 w-auto md:h-9 -translate-y-[1px]" // większe, lekko podniesione
  />
  <span className="text-[20px] md:text-[22px] font-extrabold tracking-tight">
    <span className="text-blue-600 group-hover:text-blue-700">Legal</span>
    <span className="text-slate-900">Health</span>
    <span className="text-blue-600 group-hover:text-blue-700">Check</span>
  </span>
</NavLink>


        {/* Linki desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? <PrivateLinks /> : <AuthButtons />}
        </div>

        {/* Prawa strona (mobile): Zarejestruj się + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {!isAuthenticated && (
            <NavLink
              to="/register"
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition"
            >
              Zarejestruj się
            </NavLink>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 border border-gray-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? "Zamknij menu" : "Otwórz menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-600"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-600"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Panel mobilny */}
      <div id="mobile-menu" className={`md:hidden ${open ? "block" : "hidden"}`}>
        <div
          className="fixed inset-0 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div className="fixed inset-x-0 top-14 mx-3 rounded-2xl bg-white shadow-xl border border-gray-200 p-3">
          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <NavItem to="/dashboard">Dashboard</NavItem>
                <NavItem to="/alerts">Alerts</NavItem>
                <NavItem to="/checkup">Checkup</NavItem>
                <NavItem to="/documents">Documents</NavItem>
                <button
                  type="button"
                  className={`${linkBase} ${inactive} text-left`}
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                >
                  Logout{user?.email ? ` (${user.email})` : ""}
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login">Login</NavItem>
                {/* Register przeniesiony obok hamburgera */}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
