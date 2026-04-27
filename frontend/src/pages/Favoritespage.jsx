/**
 * FavoritesPage.jsx — Pagina oraselor favorite (ruta /favorites)
 * ─────────────────────────────────────────────────────────────────────────
 * Afiseaza orasele salvate la favorite din json-server.
 * Permite vizualizarea rapida a vremii pentru fiecare oras favorit.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFavorites, deleteFavorite, getWeatherByCity } from "../api/weatherApi";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [weatherPreviews, setWeatherPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  // Incarca favoritele si previzualizarea meteo
  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);

      // Preia vremea curent pentru primele 6 orase favorite (in paralel)
      const previews = {};
      await Promise.allSettled(
        data.slice(0, 6).map(async (fav) => {
          try {
            const weather = await getWeatherByCity(fav.city);
            previews[fav.id] = weather;
          } catch {
            previews[fav.id] = null;
          }
        })
      );
      setWeatherPreviews(previews);
    } catch (err) {
      showFeedback("Nu s-au putut incarca favoritele: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id, city) {
    if (!window.confirm(`Stergi "${city}" din favorite?`)) return;
    try {
      await deleteFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      setWeatherPreviews((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      showFeedback(`"${city}" sters din favorite.`, "success");
    } catch (err) {
      showFeedback(err.message, "error");
    }
  }

  function showFeedback(message, type) {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-8 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-black text-white"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              ⭐ Orase Favorite
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {favorites.length} orase salvate
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
        {/* Feedback */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Grid favorite */}
        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((fav) => {
              const preview = weatherPreviews[fav.id];
              return (
                <FavoriteCard
                  key={fav.id}
                  favorite={fav}
                  preview={preview}
                  onRemove={() => handleRemove(fav.id, fav.city)}
                  onView={() => navigate(`/?city=${encodeURIComponent(fav.city)}`)}
                />
              );
            })}
          </div>
        )}

        {/* Gol */}
        {!loading && favorites.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-slate-400 text-xl font-medium">
              Niciun oras la favorite.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Cauta un oras si apasa ☆ pentru a-l salva.
            </p>
            <Link
              to="/"
              className="inline-block mt-4 text-sky-400 underline hover:text-sky-300"
            >
              Cauta un oras →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Card pentru un oras favorit cu previzualizare meteo
 */
function FavoriteCard({ favorite, preview, onRemove, onView }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 animate-fade-in-up hover:border-sky-500/20 transition-all">
      {/* Header card */}
      <div className="flex items-start justify-between">
        <div>
          <h3
            className="text-white font-bold text-xl"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            {favorite.city}
          </h3>
          <p className="text-slate-400 text-sm">{favorite.country}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-slate-500 hover:text-red-400 transition-colors text-lg"
          title="Sterge din favorite"
        >
          ✕
        </button>
      </div>

      {/* Previzualizare meteo */}
      {preview ? (
        <div className="flex items-center gap-3">
          <img
            src={preview.current.iconUrl}
            alt={preview.current.description}
            className="w-14 h-14"
          />
          <div>
            <div className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
              {preview.current.tempCelsius}°C
            </div>
            <div className="text-slate-400 text-xs capitalize">
              {preview.current.description}
            </div>
            <div className="text-slate-500 text-xs">
              {preview.dayInterpretation.emoji} {preview.dayInterpretation.message.split(".")[0]}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-600 text-sm flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Se incarca previzualizarea...
        </div>
      )}

      {/* Buton vizualizeaza */}
      <button
        onClick={onView}
        className="w-full py-2 text-sm font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl hover:bg-sky-500/20 transition-colors"
      >
        🌤️ Vezi vremea completa →
      </button>
    </div>
  );
}