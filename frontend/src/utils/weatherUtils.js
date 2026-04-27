/**
 * weatherUtils.js — Utilitare frontend pentru afisarea datelor meteo
 * ─────────────────────────────────────────────────────────────────────────
 * Functii de formatare, culori si interpretare vizuala.
 * Nu contin logica de business — aceasta e in backend/weatherService.js
 * ─────────────────────────────────────────────────────────────────────────
 */

/**
 * Determina clasa CSS de fundal in functie de conditia meteo
 * @param {number} weatherId - ID-ul conditiei meteo OWM
 * @param {boolean} isDay - true daca e zi (intre rasarit si apus)
 * @returns {string} clasa CSS
 */
export function getWeatherBackground(weatherId, isDay = true) {
  if (!weatherId) return "bg-weather-night";

  if (weatherId >= 200 && weatherId < 300) return "bg-weather-storm";
  if (weatherId >= 300 && weatherId < 600) return "bg-weather-rain";
  if (weatherId >= 600 && weatherId < 700) return "bg-weather-snow";
  if (weatherId >= 700 && weatherId < 800) return "bg-weather-clouds";
  if (weatherId === 800) return isDay ? "bg-weather-clear" : "bg-weather-night";
  if (weatherId > 800) return "bg-weather-clouds";

  return "bg-weather-night";
}

/**
 * Formateaza ora din ISO string la HH:MM
 * @param {string} isoString - data ISO
 * @param {string} timezone - timezone (ex: "Europe/Bucharest")
 * @returns {string} ora formatata HH:MM
 */
export function formatTime(isoString, timezone) {
  if (!isoString) return "--:--";
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || "UTC",
    }).format(new Date(isoString));
  } catch {
    return "--:--";
  }
}

/**
 * Formateaza data din ISO string la format romanesc prescurtat
 * @param {string} isoString - data ISO
 * @returns {string} ex: "Lun, 15 Apr"
 */
export function formatDate(isoString) {
  if (!isoString) return "";
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(isoString));
  } catch {
    return "";
  }
}

/**
 * Formateaza ora pentru prognoza orara (HH:00)
 * @param {string} isoString - data ISO
 * @param {string} timezone - timezone
 * @returns {string} ex: "14:00"
 */
export function formatHour(isoString, timezone) {
  if (!isoString) return "";
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || "UTC",
    }).format(new Date(isoString));
  } catch {
    return "";
  }
}

/**
 * Verifica daca ora curenta e intre rasarit si apus (zi sau noapte)
 * @param {string} sunrise - ISO string rasarit
 * @param {string} sunset - ISO string apus
 * @returns {boolean} true daca e zi
 */
export function isDay(sunrise, sunset) {
  const now = Date.now();
  return now >= new Date(sunrise).getTime() && now <= new Date(sunset).getTime();
}

/**
 * Calculeaza durata zilei in ore si minute
 * @param {string} sunrise - ISO string rasarit
 * @param {string} sunset - ISO string apus
 * @returns {string} ex: "14h 32min"
 */
export function getDaylightDuration(sunrise, sunset) {
  const ms = new Date(sunset) - new Date(sunrise);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}min`;
}

/**
 * Returneaza culoarea pentru temperatura (de la albastru la rosu)
 * @param {number} tempCelsius - temperatura in grade Celsius
 * @returns {string} culoare hex
 */
export function getTempColor(tempCelsius) {
  if (tempCelsius < -10) return "#818cf8"; // violet
  if (tempCelsius < 0) return "#93c5fd";   // albastru deschis
  if (tempCelsius < 10) return "#60a5fa";  // albastru
  if (tempCelsius < 18) return "#34d399";  // verde
  if (tempCelsius < 25) return "#fbbf24";  // galben
  if (tempCelsius < 32) return "#f97316";  // portocaliu
  return "#ef4444";                         // rosu
}

/**
 * Returneaza descrierea fazei lunii
 * @param {number} phase - faza lunii (0-1)
 * @returns {object} { name, emoji }
 */
export function getMoonPhase(phase) {
  if (phase === 0 || phase === 1)
    return { name: "Luna Noua", emoji: "🌑" };
  if (phase < 0.25) return { name: "Semiluna Crescatoare", emoji: "🌒" };
  if (phase === 0.25) return { name: "Primul Patrar", emoji: "🌓" };
  if (phase < 0.5) return { name: "Luna Gibboasa Crescatoare", emoji: "🌔" };
  if (phase === 0.5) return { name: "Luna Plina", emoji: "🌕" };
  if (phase < 0.75) return { name: "Luna Gibboasa Descrescatoare", emoji: "🌖" };
  if (phase === 0.75) return { name: "Ultimul Patrar", emoji: "🌗" };
  return { name: "Semiluna Descrescatoare", emoji: "🌘" };
}

/**
 * Returneaza descrierea indicelui UV
 * @param {number} uvi - indicele UV
 * @returns {object} { label, color, advice }
 */
export function getUVDescription(uvi) {
  if (uvi <= 2)
    return {
      label: "Scazut",
      color: "#22c55e",
      advice: "Protectie minima necesara",
    };
  if (uvi <= 5)
    return {
      label: "Moderat",
      color: "#eab308",
      advice: "Foloseste crema SPF 30+",
    };
  if (uvi <= 7)
    return {
      label: "Ridicat",
      color: "#f97316",
      advice: "Crema SPF 50+, palarie obligatorii",
    };
  if (uvi <= 10)
    return {
      label: "Foarte ridicat",
      color: "#ef4444",
      advice: "Evita expunerea 11-15. SPF 50+",
    };
  return {
    label: "Extrem",
    color: "#7c3aed",
    advice: "Evita expunerea directa!",
  };
}

/**
 * Formateaza viteza vantului cu unitatea de masura
 * @param {number} speed - viteza in km/h
 * @returns {string} ex: "25 km/h"
 */
export function formatWindSpeed(speed) {
  return `${speed} km/h`;
}

/**
 * Formateaza vizibilitatea
 * @param {number} km - vizibilitate in km
 * @returns {string} ex: "10 km" sau "< 1 km"
 */
export function formatVisibility(km) {
  if (!km) return "N/A";
  if (km >= 10) return "10+ km";
  if (km < 1) return "< 1 km";
  return `${km} km`;
}