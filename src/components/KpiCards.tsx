import { Activity, Clock, Crosshair, Percent, Flame } from "lucide-react";

type KpiProps = {
  totalSightings: number;
  avgTime: string;
  baitInteractions: number;
  acceptanceRate: number;
  peakActivity: string;
};

export default function KpiCards({
  totalSightings,
  avgTime,
  baitInteractions,
  acceptanceRate,
  peakActivity,
}: KpiProps) {
  const cardClass = "p-6 bg-white rounded-xl shadow-sm flex flex-col";
  const labelClass =
    "flex items-center gap-2 text-slate-500 mb-2 text-sm md:text-base font-medium";
  const valueClass = "text-3xl md:text-4xl font-bold text-slate-900 mt-auto";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
      <div className={`${cardClass} border-l-4 border-blue-500`}>
        <div className={labelClass}>
          <Activity size={18} /> Erfasste Sichtungen
        </div>
        <div className={valueClass}>{totalSightings}</div>
      </div>

      <div className={`${cardClass} border-l-4 border-purple-500`}>
        <div className={labelClass}>
          <Clock size={18} /> Ø Verweildauer
        </div>
        <div className={valueClass}>
          {avgTime}{" "}
          <span className="text-base text-slate-400 font-normal">sek</span>
        </div>
      </div>

      <div className={`${cardClass} border-l-4 border-emerald-500`}>
        <div className={labelClass}>
          <Crosshair size={18} /> Köder-Kontakte
        </div>
        <div className={valueClass}>{baitInteractions}</div>
      </div>

      <div className={`${cardClass} border-l-4 border-amber-500`}>
        <div className={labelClass}>
          <Percent size={18} /> Akzeptanzrate
        </div>
        <div className={valueClass}>
          {acceptanceRate}{" "}
          <span className="text-base text-slate-400 font-normal">%</span>
        </div>
      </div>

      <div className={`${cardClass} border-l-4 border-red-500`}>
        <div className={labelClass}>
          <Flame size={18} /> Aktivitäts-Peak
        </div>
        <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-auto">
          {peakActivity}
        </div>
      </div>
    </div>
  );
}
