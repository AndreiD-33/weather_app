/**
 * weatherApi.js — Stratul API al frontend-ului
 * ─────────────────────────────────────────────────────────────────────────
 * Toate cererile catre backend sunt centralizate intr-un singur fisier.
 * Componentele importa functii de aici, fara a cunoaste detaliile HTTP.
 * ─────────────────────────────────────────────────────────────────────────
 */

// URL-ul de baza dinamic folosind variabile de mediu Vite [cite: 58-61, 72]
// În dezvoltare (local): va folosi valoarea din .env.local (ex: http://localhost:5000) [cite: 63-65]
// În producție (Vercel): va folosi valoarea setata in dashboard-ul Vercel [cite: 156-160]
const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// ─────────────────────────────────────────────────────────────────────────
// METEO
// ─────────────────────────────────────────────────────────────────────────

/**
 * Preia datele meteo dupa numele orasului
 * @param {string} city - numele orasului
 * @returns {Promise<object>} datele meteo procesate
 */
export async function getWeatherByCity(city) {
  const response = await fetch(
    `${BASE_URL}/weather?city=${encodeURIComponent(city)}`
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Nu s-au putut prelua datele meteo.");
  }
  return response.json();
}

/**
 * Preia datele meteo dupa coordonate GPS
 * @param {number} lat - latitudine
 * @param {number} lon - longitudine
 * @param {string} cityName - numele orasului (optional, pentru display)
 * @param {string} country - codul tarii (optional)
 * @returns {Promise<object>} datele meteo procesate
 */
export async function getWeatherByCoords(lat, lon, cityName = "", country = "") {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    ...(cityName && { cityName }),
    ...(country && { country }),
  });

  const response = await fetch(`${BASE_URL}/weather?${params}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Nu s-au putut prelua datele meteo.");
  }
  return response.json();
}

/**
 * Preia calitatea aerului pentru coordonate date
 * @param {number} lat - latitudine
 * @param {number} lon - longitudine
 * @returns {Promise<object>} date calitate aer
 */
export async function getAirQuality(lat, lon) {
  const response = await fetch(`${BASE_URL}/weather/air?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Date calitate aer indisponibile.");
  }
  return response.json();
}

/**
 * Geocodeaza un oras (cauta coordonatele)
 * @param {string} city - numele orasului
 * @returns {Promise<object>} { lat, lon, name, country, allResults }
 */
export async function geocodeCity(city) {
  const response = await fetch(
    `${BASE_URL}/geocode?city=${encodeURIComponent(city)}`
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Geocodarea a esuat.");
  }
  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────
// ISTORICUL CAUTARILOR
// ─────────────────────────────────────────────────────────────────────────

/**
 * Preia istoricul cautarilor
 * @returns {Promise<Array>} lista cautarilor recente
 */
export async function getSearchHistory() {
  const response = await fetch(`${BASE_URL}/searches`);
  if (!response.ok) throw new Error("Nu s-au putut prelua cautarile.");
  return response.json();
}

/**
 * Sterge o cautare din istoric dupa ID
 * @param {string} id - ID-ul cautarii
 */
export async function deleteSearch(id) {
  const response = await fetch(`${BASE_URL}/searches/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Nu s-a putut sterge cautarea.");
}

/**
 * Sterge tot istoricul cautarilor
 */
export async function clearAllSearches() {
  const response = await fetch(`${BASE_URL}/searches`, { method: "DELETE" });
  if (!response.ok) throw new Error("Nu s-a putut sterge istoricul.");
}

// ─────────────────────────────────────────────────────────────────────────
// ORASE FAVORITE
// ─────────────────────────────────────────────────────────────────────────

/**
 * Preia lista oraselor favorite
 * @returns {Promise<Array>} lista favoritelor
 */
export async function getFavorites() {
  const response = await fetch(`${BASE_URL}/favorites`);
  if (!response.ok) throw new Error("Nu s-au putut prelua favoritele.");
  return response.json();
}

/**
 * Adauga un oras la favorite
 * @param {{ city, country, lat, lon }} favoriteData - datele orasului
 * @returns {Promise<object>} orasul adaugat
 */
export async function addFavorite(favoriteData) {
  const response = await fetch(`${BASE_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(favoriteData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Nu s-a putut adauga la favorite.");
  }
  return response.json();
}

/**
 * Sterge un oras din favorite
 * @param {string} id - ID-ul favoritului
 */
export async function deleteFavorite(id) {
  const response = await fetch(`${BASE_URL}/favorites/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Nu s-a putut sterge din favorite.");
}