/**
 * WeatherPage.jsx — Pagina principala (ruta /)
 * ─────────────────────────────────────────────────────────────────────────
 * Pagina principala a aplicatiei. Permite:
 *  - Cautarea vremii dupa oras
 *  - Geolocalizare (locatia curenta)
 *  - Afisarea tuturor datelor meteo procesate de backend
 *
 * Arhitectura (conform cerintei proiect):
 *   React (5173) → Express (5000) → OWM API
 *   Procesarea meteo: backend/weatherService.js (SEPARATA de afisare)
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import CurrentWeather from "../components/CurrentWeather";
import HourlyForecast from "../components/HourlyForecast";
import DailyForecast from "../components/DailyForecast";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useWeather } from "../hooks/useWeather";
import { addFavorite, getFavorites, deleteFavorite } from "../api/weatherApi";

export default function WeatherPage({ initialCity }) {
  const { weather, airQuality, loading, error, searchByCity, searchByCoords } = useWeather();
  const [favorites, setFavorites] = useState([]);
  const [favFeedback, setFavFeedback] = useState("");

  // Incarca favoritele la montare
  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch(() => setFavorites([]));
  }, []);

  // Daca pagina e accesata cu ?city= in URL, cauta automat
  useEffect(() => {
    if (initialCity) {
      searchByCity(initialCity);
    }
  }, [initialCity]);

  // Verifica daca orasul curent e la favorite
  const isFavorite = weather
    ? favorites.some(
        (f) =>
          f.city.toLowerCase() === weather.city.toLowerCase() &&
          f.country === weather.country
      )
    : false;

  // Toggle favorite
  async function handleFavoriteToggle() {
    if (!weather) return;

    if (isFavorite) {
      // Sterge din favorite
      const fav = favorites.find(
        (f) =>
          f.city.toLowerCase() === weather.city.toLowerCase() &&
          f.country === weather.country
      );
      if (!fav) return;

      try {
        await deleteFavorite(fav.id);
        setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
        showFavFeedback(`${weather.city} scos din favorite.`);
      } catch (err) {
        showFavFeedback("Eroare la stergere: " + err.message);
      }
    } else {
      // Adauga la favorite
      try {
        const newFav = await addFavorite({
          city: weather.city,
          country: weather.country,
          lat: weather.lat,
          lon: weather.lon,
        });
        setFavorites((prev) => [...prev, newFav]);
        showFavFeedback(`${weather.city} adaugat la favorite! ⭐`);
      } catch (err) {
        showFavFeedback(err.message);
      }
    }
  }

  function showFavFeedback(msg) {
    setFavFeedback(msg);
    setTimeout(() => setFavFeedback(""), 3000);
  }

  return (
    <div className="min-h-screen">
      {/* Hero section cu search */}
      <section
        className="py-10 px-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,165,233,0.08) 0%, transparent 100%)",
        }}
      >
        {/* Decoratiuni fundal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-10 left-1/4 w-64 h-64 rounded-full opacity-5 animate-spin-slow"
            style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }}
          />
          <div
            className="absolute top-5 right-1/4 w-48 h-48 rounded-full opacity-5 animate-spin-slow"
            style={{
              background: "radial-gradient(circle, #f59e0b, transparent)",
              animationDirection: "reverse",
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Titlu */}
          {!weather && !loading && (
            <div className="text-center mb-8 animate-fade-in-up">
              <h1
                className="text-4xl md:text-6xl font-black text-white mb-3"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                E frumos azi? ☀️
              </h1>
              <p className="text-slate-400 text-lg">
                Cauta un oras pentru a vedea starea vremii in timp real.
              </p>
            </div>
          )}

          {/* Bara de cautare */}
          <SearchBar
            onSearch={searchByCity}
            onGeolocate={searchByCoords}
            loading={loading}
          />

          {/* Feedback favorit */}
          {favFeedback && (
            <div className="mt-3 text-center text-sky-300 text-sm animate-fade-in-up">
              {favFeedback}
            </div>
          )}
        </div>
      </section>

      {/* Continut principal */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        {/* Eroare */}
        {error && !loading && (
          <div
            className="rounded-2xl p-6 text-center animate-fade-in-up"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-300 font-semibold text-lg">{error}</p>
            <p className="text-slate-400 text-sm mt-2">
              Verifica numele orasului sau conexiunea la internet.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <LoadingSkeleton />}

        {/* Date meteo */}
        {weather && !loading && (
          <div className="space-y-4">
            <CurrentWeather
              weather={weather}
              airQuality={airQuality}
              onAddFavorite={handleFavoriteToggle}
              isFavorite={isFavorite}
            />
            <HourlyForecast hourly={weather.hourly} timezone={weather.timezone} />
            <DailyForecast daily={weather.daily} />
          </div>
        )}

        {/* Stare initiala — niciun oras cautat */}
        {!weather && !loading && !error && (
          <div className="text-center py-16 text-slate-600 animate-fade-in-up">
            <div className="text-6xl mb-4 animate-float" style={{ display: "inline-block" }}>
              🌍
            </div>
            <p className="text-xl font-medium text-slate-500">
              Introdu un oras pentru a vedea vremea
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Sau apasa 📍 pentru locatia ta curenta
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
