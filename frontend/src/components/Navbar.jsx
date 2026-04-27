/**
 * Navbar.jsx — Bara de navigare principala
 */

import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Vreme", icon: "🌤️" },
  { to: "/history", label: "Istoric", icon: "📋" },
  { to: "/favorites", label: "Favorite", icon: "⭐" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-700/50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl animate-float" style={{ display: "inline-block" }}>🌍</span>
          <span
            className="text-lg font-black text-white group-hover:text-sky-400 transition-colors"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            WeatherApp
          </span>
        </Link>

        {/* Navigatie */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${pathname === to
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}