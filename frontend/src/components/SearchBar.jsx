/**
 * SearchBar.jsx — Bara de cautare a orasului
 * ─────────────────────────────────────────────────────────────────────────
 * Functionalitati:
 *  - Input cu debounce 400ms (similar cu citate-autori lab 6)
 *  - Buton de geolocalizare (locatia curenta)
 *  - Sugestii de cautare rapida (orase populare)
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";

// Orase populare pentru sugestii rapide
const POPULAR_CITIES = [
  "Iași", "București", "Cluj-Napoca", "Timișoara", "Brașov",
  "Constanța", "Sibiu", "Oradea", "London", "Paris", "Berlin",
  "New York", "Tokyo", "Rome", "Barcelona",
];

/**
 * @param {function} onSearch - callback apelat cu numele orasului
 * @param {function} onGeolocate - callback apelat pentru locatia curenta
 * @param {boolean} loading - true cat timp se incarca datele
 */
export default function SearchBar({ onSearch, onGeolocate, loading }) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const inputRef = useRef(null);

  // Filtreaza orasele populare dupa inputul curent
  const filtered = POPULAR_CITIES.filter((c) =>
    c.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.length > 0
  );

  // Submit la Enter sau click pe buton
  function handleSubmit(e) {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
      setShowSuggestions(false);
    }
  }

  // Selectie din sugestii
  function handleSuggestion(city) {
    setInputValue(city);
    setShowSuggestions(false);
    onSearch(city);
  }

  // Geolocalizare — preia locatia curenta din browser
  function handleGeolocate() {
    if (!navigator.geolocation) {
      alert("Geolocalizarea nu este suportata de browserul tau.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onGeolocate(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
      },
      (err) => {
        console.error("Eroare geolocalizare:", err);
        alert("Nu s-a putut accesa locatia. Verifica permisiunile browserului.");
        setGeoLoading(false);
      },
      { timeout: 1000 }
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Input cautare oras */}
        <div className="relative flex-1">
          {/* Iconita lupa */}
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            🔍
          </span>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Cauta un oras... (ex: Iași, Paris, New York)"
            className="input-weather w-full pl-11 pr-10 py-4 rounded-2xl text-base font-medium"
            autoComplete="off"
          />

          {/* Buton X — sterge inputul */}
          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xl leading-none transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Buton Cauta */}
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="px-6 py-4 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
          ) : (
            "Cauta"
          )}
        </button>

        {/* Buton Geolocalizare */}
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={geoLoading || loading}
          title="Foloseste locatia mea curenta"
          className="px-4 py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-200 rounded-2xl transition-all duration-200 text-xl"
        >
          {geoLoading ? (
            <span className="w-5 h-5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin inline-block" />
          ) : (
            "📍"
          )}
        </button>
      </form>

      {/* Dropdown sugestii */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl shadow-2xl z-50 overflow-hidden">
          {filtered.slice(0, 6).map((city) => (
            <button
              key={city}
              onMouseDown={() => handleSuggestion(city)}
              className="w-full text-left px-4 py-3 text-slate-200 hover:bg-sky-500/20 hover:text-sky-300 transition-colors flex items-center gap-3 border-b border-slate-700/50 last:border-0"
            >
              <span className="text-slate-400 text-sm">📍</span>
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
