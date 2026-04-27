/**
 * LoadingSkeleton.jsx — Skeleton loading pentru datele meteo
 * Similar citate-autori QuotesPage
 * */

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Card principal */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="skeleton h-10 w-48 mb-2 rounded-xl" />
            <div className="skeleton h-4 w-36 rounded-lg" />
          </div>
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="skeleton w-24 h-24 rounded-2xl" />
          <div>
            <div className="skeleton h-20 w-36 rounded-xl mb-2" />
            <div className="skeleton h-5 w-48 rounded-lg mb-1" />
            <div className="skeleton h-4 w-32 rounded-lg" />
          </div>
        </div>

        {/* Banner */}
        <div className="skeleton h-20 w-full rounded-2xl mb-4" />

        {/* Grid detalii */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Card rasarit/apus */}
      <div className="skeleton h-24 rounded-2xl" />

      {/* Card prognoza orara */}
      <div className="glass-card rounded-2xl p-4">
        <div className="skeleton h-4 w-48 rounded-lg mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-28 w-16 rounded-xl shrink-0" />
          ))}
        </div>
      </div>

      {/* Card prognoza zilnica */}
      <div className="glass-card rounded-2xl p-4">
        <div className="skeleton h-4 w-40 rounded-lg mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}