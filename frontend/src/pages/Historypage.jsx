/**
 * HistoryPage.jsx — Pagina istoricului cautarilor (ruta /history)
 * ─────────────────────────────────────────────────────────────────────────
 * Afiseaza cautarile recente salvate in json-server (db.json).
 * Similar cu ManagePage din citate-autori — operatii CRUD pe date locale.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSearchHistory, deleteSearch, clearAllSearches } from "../api/weatherApi";

export default function HistoryPage() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  // Incarca istoricul la montare
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await getSearchHistory();
      setSearches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Sterge o cautare individuala
  async function handleDelete(id, city) {
    if (!window.confirm(`Stergi "${city}" din istoric?`)) return;
    try {
      await deleteSearch(id);
      setSearches((prev) => prev.filter((s) => s.id !== id));
      showFeedback(`"${city}" sters din istoric.`, "success");
    } catch (err) {
      showFeedback(err.message, "error");
    }
  }

  // Sterge tot istoricul
  async function handleClearAll() {
    if (!window.confirm("Stergi tot istoricul cautarilor?")) return;
    try {
      await clearAllSearches();
      setSearches([]);
      showFeedback("Istoricul a fost sters complet.", "success");
    } catch (err) {
      showFeedback(err.message, "error");
    }
  }

  // Repeta cautarea — navigheaza la pagina principala cu parametrul city
  function handleRepeatSearch(city) {
    navigate(`/?city=${encodeURIComponent(city)}`);
  }

  function showFeedback(message, type) {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  }

  // Formateaza timestamp-ul relativ (ex: "acum 5 minute")
  function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "acum";
    if (minutes < 60) return `acum ${minutes} min`;
    if (hours < 24) return `acum ${hours} ore`;
    if (days === 1) return "ieri";
    return `acum ${days} zile`;
  }

  return (
    <div className="min-h-screen">
      {/* Header pagina */}
      <section className="py-8 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-black text-white"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              📋 Istoricul Cautarilor
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {searches.length} cautari salvate
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-sky-400 border border-sky-500/30 rounded-xl hover:bg-sky-500/10 transition-colors"
          >
            ← Inapoi la vreme
          </Link>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Banner feedback */}
        {feedback.message && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in-up ${
              feedback.type === "success"
                ? "bg-green-500/10 text-green-300 border border-green-500/20"
                : "bg-red-500/10 text-red-300 border border-red-500/20"
            }`}
          >
            {feedback.type === "success" ? "✅ " : "⚠️ "}
            {feedback.message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Eroare */}
        {error && !loading && (
          <div className="text-center py-10 text-red-400">
            <p>⚠️ {error}</p>
            <p className="text-slate-500 text-sm mt-1">
              Verifica daca json-server ruleaza pe portul 3000.
            </p>
          </div>
        )}

        {/* Lista cautari */}
        {!loading && !error && searches.length > 0 && (
          <div className="space-y-3">
            {/* Buton sterge tot */}
            <div className="flex justify-end mb-2">
              <button
                onClick={handleClearAll}
                className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                🗑️ Sterge tot istoricul
              </button>
            </div>

            {searches.map((search) => (
              <div
                key={search.id}
                className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in-up hover:border-sky-500/20 transition-all"
              >
                {/* Info oras */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0">📍</span>
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">
                      {search.city}
                      <span className="text-slate-400 font-normal ml-2 text-sm">
                        {search.country}
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs">
                      {timeAgo(search.timestamp)} &nbsp;·&nbsp;
                      {search.lat?.toFixed(2)}°, {search.lon?.toFixed(2)}°
                    </div>
                  </div>
                </div>

                {/* Actiuni */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRepeatSearch(search.city)}
                    className="px-3 py-1.5 text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg hover:bg-sky-500/20 transition-colors"
                  >
                    🔄 Repeta
                  </button>
                  <button
                    onClick={() => handleDelete(search.id, search.city)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gol */}
        {!loading && !error && searches.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-400 text-xl font-medium">
              Nicio cautare salvata inca.
            </p>
            <Link
              to="/"
              className="inline-block mt-4 text-sky-400 underline hover:text-sky-300"
            >
              Cauta primul oras →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}