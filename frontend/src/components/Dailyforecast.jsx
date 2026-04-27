/**
 * DailyForecast.jsx — Prognoza zilnica (5 zile)
 * ─────────────────────────────────────────────────────────────────────────
 * Afiseaza prognoza pentru urmatoarele 5 zile cu:
 *  - Temperatura maxima si minima
 *  - Iconita conditie
 *  - Probabilitate precipitatii
 *  - Faza lunii
 *  - Rezumat zilnic (daca exista)
  * ─────────────────────────────────────────────────────────────────────────
 */

import { formatDate, getTempColor, getMoonPhase } from "../utils/weatherUtils";

/**
 * @param {Array} daily - lista datelor zilnice procesate (7 zile)
 */
export default function DailyForecast({ daily }) {
  if (!daily || daily.length === 0) return null;

  // Gasim min/max globale pentru bara de temperatura relativa
  const allMaxes = daily.map((d) => d.tempMaxCelsius);
  const allMins = daily.map((d) => d.tempMinCelsius);
  const globalMax = Math.max(...allMaxes);
  const globalMin = Math.min(...allMins);

  return (
    <div className="glass-card rounded-2xl p-4 animate-fade-in-up">
      <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wide mb-4 px-1">
        📆 Prognoza 5 Zile
      </h3>

      <div className="space-y-2">
        {daily.map((day, i) => (
          <DayRow
            key={i}
            day={day}
            isToday={i === 0}
            globalMin={globalMin}
            globalMax={globalMax}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Rand individual pentru o zi
 */
function DayRow({ day, isToday, globalMin, globalMax }) {
  const moonInfo = getMoonPhase(day.moonPhase);
  const maxColor = getTempColor(day.tempMaxCelsius);
  const minColor = getTempColor(day.tempMinCelsius);

  // Calculeaza pozitia barei de temperatura relativa
  const range = globalMax - globalMin || 1;
  const minPct = ((day.tempMinCelsius - globalMin) / range) * 100;
  const barWidth = ((day.tempMaxCelsius - day.tempMinCelsius) / range) * 100;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isToday ? "bg-sky-500/10 border border-sky-500/20" : "hover:bg-slate-800/50"
      }`}
    >
      {/* Ziua saptamanii */}
      <div className="w-20 shrink-0">
        <div className="text-slate-200 font-semibold text-sm">
          {isToday ? "Astazi" : formatDate(day.dt)}
        </div>
        {day.summary && (
          <div className="text-slate-500 text-xs truncate">{day.summary}</div>
        )}
      </div>

      {/* Iconita + precipitatii */}
      <div className="flex items-center gap-1 w-16 shrink-0">
        <img src={day.iconUrl} alt={day.description} className="w-10 h-10" />
        {day.pop > 10 && (
          <span className="text-sky-400 text-xs font-medium">{day.pop}%</span>
        )}
      </div>

      {/* Bara temperatura */}
      <div className="flex-1 flex items-center gap-2">
        {/* Min temp */}
        <span
          className="text-sm font-semibold w-10 text-right shrink-0"
          style={{ color: minColor }}
        >
          {day.tempMinCelsius}°
        </span>

        {/* Bara relativa */}
        <div className="flex-1 h-2 bg-slate-700 rounded-full relative overflow-hidden">
          <div
            className="absolute h-full rounded-full"
            style={{
              left: `${minPct}%`,
              width: `${Math.max(barWidth, 5)}%`,
              background: `linear-gradient(to right, ${getTempColor(day.tempMinCelsius)}, ${getTempColor(day.tempMaxCelsius)})`,
            }}
          />
        </div>

        {/* Max temp */}
        <span
          className="text-sm font-bold w-10 shrink-0"
          style={{ color: maxColor }}
        >
          {day.tempMaxCelsius}°
        </span>
      </div>

      {/* Faza lunii */}
      <div
        className="w-8 text-center shrink-0 text-lg"
        title={moonInfo.name}
      >
        {moonInfo.emoji}
      </div>
    </div>
  );
}