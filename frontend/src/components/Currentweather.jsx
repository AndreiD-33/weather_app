/**
 * CurrentWeather.jsx — Cardul principal cu vremea curenta
 * ─────────────────────────────────────────────────────────────────────────
 * Afiseaza:
 *  - Temperatura in °C si °F (cerinta proiect)
 *  - Iconita si descrierea vremii
 *  - Interpretarea zilei (ce fel de zi e, haina/umbrela)
 *  - Rasarit / Apus
 *  - Detalii: umiditate, vant, presiune, vizibilitate, UV
 * ─────────────────────────────────────────────────────────────────────────
 */

import { formatTime, isDay, getDaylightDuration, getTempColor, getUVDescription, formatVisibility } from "../utils/weatherUtils";

/**
 * @param {object} weather - datele meteo procesate de backend
 * @param {object} airQuality - datele calitatii aerului (optional)
 * @param {function} onAddFavorite - callback pentru adaugare la favorite
 * @param {boolean} isFavorite - true daca orasul e deja la favorite
 */
export default function CurrentWeather({ weather, airQuality, onAddFavorite, isFavorite }) {
  if (!weather) return null;

  const { current, dayInterpretation, city, country } = weather;
  const daytime = isDay(current.sunrise, current.sunset);
  const tempColor = getTempColor(current.tempCelsius);
  const uvInfo = getUVDescription(current.uvIndex);
  const daylight = getDaylightDuration(current.sunrise, current.sunset);

  return (
    <div className="animate-fade-in-up space-y-4">

      {/* Card principal — temperatura si conditie */}
      <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden">

        {/* Fundal decorativ */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${tempColor}, transparent 60%)`,
          }}
        />

        <div className="relative z-10">
          {/* Header: oras + buton favorit */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                {city}
                {country && (
                  <span className="ml-2 text-lg text-slate-400 font-normal">{country}</span>
                )}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {new Date(current.dt).toLocaleDateString("ro-RO", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>

            {/* Buton favorit */}
            <button
              onClick={onAddFavorite}
              title={isFavorite ? "Deja la favorite" : "Adauga la favorite"}
              className={`text-2xl transition-all duration-200 ${isFavorite ? "opacity-100 scale-110" : "opacity-50 hover:opacity-100 hover:scale-110"}`}
            >
              {isFavorite ? "⭐" : "☆"}
            </button>
          </div>

          {/* Temperatura + iconita */}
          <div className="flex items-center gap-6 mb-6">
            {/* Iconita meteo mare */}
            <div className="animate-float">
              <img
                src={current.iconUrl}
                alt={current.description}
                className="w-24 h-24 drop-shadow-lg"
                style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))" }}
              />
            </div>

            {/* Temperatura principala */}
            <div>
              <div
                className="text-7xl md:text-8xl font-black leading-none"
                style={{ fontFamily: "Outfit, sans-serif", color: tempColor }}
              >
                {current.tempCelsius}°
              </div>
              <div className="text-slate-300 text-lg mt-1">
                {current.tempFahrenheit}°F &nbsp;·&nbsp;
                <span className="capitalize">{current.description}</span>
              </div>
              <div className="text-slate-400 text-sm mt-1">
                Simte ca <span className="text-slate-200">{current.feelsLikeCelsius}°C / {current.feelsLikeFahrenheit}°F</span>
              </div>
            </div>
          </div>

          {/* Banner interpretare zi (haina/umbrela) */}
          <div className="rounded-2xl p-4 mb-4 flex items-start gap-3"
            style={{ background: "rgba(14, 165, 233, 0.1)", border: "1px solid rgba(14, 165, 233, 0.2)" }}>
            <span className="text-3xl shrink-0">{dayInterpretation.emoji}</span>
            <div>
              <p className="text-sky-200 font-semibold text-sm">{dayInterpretation.message}</p>
              <p className="text-slate-400 text-xs mt-0.5">{dayInterpretation.suggestion}</p>
              <div className="flex gap-3 mt-2">
                {dayInterpretation.needsCoat && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    🧥 Ia haina!
                  </span>
                )}
                {dayInterpretation.needsUmbrella && (
                  <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                    ☂️ Ia umbrela!
                  </span>
                )}
                {!dayInterpretation.needsCoat && !dayInterpretation.needsUmbrella && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
                    ✅ Esti pregatit!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grid detalii meteo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DetailCard icon="💧" label="Umiditate" value={`${current.humidity}%`} />
            <DetailCard
              icon={current.windDirection.emoji}
              label={`Vant (${current.windDirection.abbr})`}
              value={`${current.windSpeed} km/h`}
              sub={current.windDirection.text}
            />
            <DetailCard icon="🌡️" label="Presiune" value={`${current.pressure} hPa`} />
            <DetailCard icon="👁️" label="Vizibilitate" value={formatVisibility(current.visibility)} />
            <DetailCard icon="☁️" label="Innorare" value={`${current.cloudiness}%`} />
            <DetailCard icon="🌡️" label="Punct roua" value={`${current.dewPoint}°C`} />
            <DetailCard
              icon="☀️"
              label="Index UV"
              value={`${current.uvIndex} — ${uvInfo.label}`}
              valueColor={uvInfo.color}
            />
            {current.rain1h > 0 && (
              <DetailCard icon="🌧️" label="Ploaie (1h)" value={`${current.rain1h} mm`} />
            )}
            {current.snow1h > 0 && (
              <DetailCard icon="❄️" label="Zapada (1h)" value={`${current.snow1h} mm`} />
            )}
            {current.windGust && (
              <DetailCard icon="💨" label="Rafale" value={`${current.windGust} km/h`} />
            )}
          </div>
        </div>
      </div>

      {/* Card rasarit / apus */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex justify-around items-center">
          <div className="text-center">
            <div className="text-3xl mb-1">🌅</div>
            <div className="text-slate-400 text-xs uppercase tracking-wide">Rasarit</div>
            <div className="text-white font-bold text-lg">{formatTime(current.sunrise, weather.timezone)}</div>
          </div>

          <div className="text-center px-6 border-x border-slate-700">
            <div className="text-2xl mb-1">{daytime ? "☀️" : "🌙"}</div>
            <div className="text-slate-400 text-xs uppercase tracking-wide">Durata zilei</div>
            <div className="text-sky-300 font-semibold text-sm">{daylight}</div>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-1">🌇</div>
            <div className="text-slate-400 text-xs uppercase tracking-wide">Apus</div>
            <div className="text-white font-bold text-lg">{formatTime(current.sunset, weather.timezone)}</div>
          </div>
        </div>
      </div>

      {/* Card calitatea aerului */}
      {airQuality && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
              Calitatea Aerului
            </h3>
            <span
              className="font-bold text-sm px-3 py-1 rounded-full"
              style={{
                background: airQuality.aqiInfo.color + "30",
                color: airQuality.aqiInfo.color,
                border: `1px solid ${airQuality.aqiInfo.color}50`,
              }}
            >
              {airQuality.aqiInfo.emoji} {airQuality.aqiInfo.label}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "PM2.5", value: airQuality.components.pm2_5?.toFixed(1) },
              { label: "PM10", value: airQuality.components.pm10?.toFixed(1) },
              { label: "O₃", value: airQuality.components.o3?.toFixed(1) },
              { label: "NO₂", value: airQuality.components.no2?.toFixed(1) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/50 rounded-xl p-2">
                <div className="text-slate-400 text-xs">{label}</div>
                <div className="text-white font-semibold text-sm">{value ?? "—"}</div>
                <div className="text-slate-500 text-xs">μg/m³</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerte meteo */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="rounded-2xl p-4 border border-red-500/30"
          style={{ background: "rgba(239, 68, 68, 0.1)" }}>
          <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
            ⚠️ Alerte Meteo Active
          </h3>
          {weather.alerts.map((alert, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-red-300 font-semibold text-sm">{alert.event}</p>
              <p className="text-slate-400 text-xs">{alert.senderName}</p>
              <p className="text-slate-300 text-xs mt-1 line-clamp-2">{alert.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Card detaliu individual (umiditate, vant etc.)
 */
function DetailCard({ icon, label, value, sub, valueColor }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs uppercase tracking-wide">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div
        className="font-bold text-sm"
        style={{ color: valueColor || "#f1f5f9" }}
      >
        {value}
      </div>
      {sub && <div className="text-slate-500 text-xs capitalize">{sub}</div>}
    </div>
  );
}