/**
 * HourlyForecast.jsx — Prognoza orara (24 ore)
 * ─────────────────────────────────────────────────────────────────────────
 * Afiseaza un slider orizontal cu prognoza pe ore:
 *  - Temperatura in °C
 *  - Iconita conditie meteo
 *  - Probabilitate precipitatii
 *  - Directia vantului
 * ─────────────────────────────────────────────────────────────────────────
 */

import { formatHour, getTempColor } from "../utils/weatherUtils";

/**
 * @param {Array} hourly - lista datelor orare procesate
 * @param {string} timezone - timezone-ul orasului
 */
export default function HourlyForecast({ hourly, timezone }) {
  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-4 animate-fade-in-up">
      <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wide mb-4 px-1">
        📅 Prognoza Orara — Urmatoarele 24 Ore
      </h3>

      {/* Slider orizontal cu scroll */}
      <div className="overflow-x-auto pb-2 -mx-1">
        <div className="flex gap-3 px-1 min-w-max">
          {hourly.map((h, i) => (
            <HourCard key={i} hour={h} timezone={timezone} isNow={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Card individual pentru o ora
 */
function HourCard({ hour, timezone, isNow }) {
  const tempColor = getTempColor(hour.tempCelsius);

  return (
    <div
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl min-w-17.5 transition-all
        ${isNow
          ? "bg-sky-500/20 border border-sky-500/40"
          : "bg-slate-800/50 hover:bg-slate-700/50"
        }`}
    >
      {/* Ora */}
      <span className="text-xs font-medium text-slate-400">
        {isNow ? "Acum" : formatHour(hour.dt, timezone)}
      </span>

      {/* Iconita meteo */}
      <img
        src={hour.iconUrl}
        alt={hour.description}
        className="w-10 h-10"
      />

      {/* Temperatura */}
      <span
        className="text-base font-bold"
        style={{ color: tempColor }}
      >
        {hour.tempCelsius}°
      </span>

      {/* Probabilitate precipitatii */}
      {hour.pop > 10 && (
        <span className="text-xs text-sky-400 font-medium">
          {hour.pop}%
        </span>
      )}

      {/* Directia vantului */}
      <span className="text-xs text-slate-500" title={`${hour.windSpeed} km/h`}>
        {hour.windDirection.emoji} {hour.windSpeed}
      </span>
    </div>
  );
}