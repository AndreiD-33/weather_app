/**
 * useWeather.js — Hook custom pentru gestionarea datelor meteo
 * ─────────────────────────────────────────────────────────────────────────
 * Encapsuleaza logica de fetch, loading si error pentru componente.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import {
  getWeatherByCity,
  getWeatherByCoords,
  getAirQuality,
} from "../api/weatherApi";

/**
 * Hook custom pentru datele meteo
 * @returns {object} { weather, airQuality, loading, error, searchByCity, searchByCoords, clearWeather }
 */
export function useWeather() {
  // Starea datelor meteo procesate
  const [weather, setWeather] = useState(null);
  // Starea calitatii aerului (separat de meteo principal)
  const [airQuality, setAirQuality] = useState(null);
  // Indicatorul de incarcare
  const [loading, setLoading] = useState(false);
  // Mesajul de eroare
  const [error, setError] = useState(null);

  /**
   * Cauta vremea dupa numele orasului
   * @param {string} city - numele orasului cautat
   */
  const searchByCity = useCallback(async (city) => {
    if (!city || !city.trim()) return;

    setLoading(true);
    setError(null);
    setWeather(null);
    setAirQuality(null);

    try {
      // Preia datele meteo principale
      const data = await getWeatherByCity(city);
      setWeather(data);

      // Preia calitatea aerului in paralel (non-blocant)
      getAirQuality(data.lat, data.lon)
        .then(setAirQuality)
        .catch(() => setAirQuality(null)); // Esecul nu e critic
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cauta vremea dupa coordonate GPS (locatia curenta)
   * @param {number} lat - latitudine
   * @param {number} lon - longitudine
   * @param {string} cityName - numele orasului (optional)
   * @param {string} country - codul tarii (optional)
   */
  const searchByCoords = useCallback(
    async (lat, lon, cityName = "", country = "") => {
      setLoading(true);
      setError(null);
      setWeather(null);
      setAirQuality(null);

      try {
        const data = await getWeatherByCoords(lat, lon, cityName, country);
        setWeather(data);

        // Calitatea aerului in paralel
        getAirQuality(lat, lon)
          .then(setAirQuality)
          .catch(() => setAirQuality(null));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Reseteaza starea — curata datele afisate
   */
  const clearWeather = useCallback(() => {
    setWeather(null);
    setAirQuality(null);
    setError(null);
  }, []);

  return {
    weather,
    airQuality,
    loading,
    error,
    searchByCity,
    searchByCoords,
    clearWeather,
  };
}