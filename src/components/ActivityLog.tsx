import { useState } from "react";
import type { TrackingEvent } from "../types";
import { ArrowDownUp, Filter } from "lucide-react";

export default function ActivityLog({ events }: { events: TrackingEvent[] }) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [filterBait, setFilterBait] = useState<"all" | "yes" | "no">("all");

  let processedEvents = [...events];
  if (filterBait === "yes")
    processedEvents = processedEvents.filter((e) => e.interacted_with_bait);
  else if (filterBait === "no")
    processedEvents = processedEvents.filter((e) => !e.interacted_with_bait);

  processedEvents.sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex-grow flex flex-col h-full">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="m-0 text-lg font-bold text-slate-900">
          Ereignis-Protokoll
        </h3>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex-grow md:flex-grow-0">
            <Filter size={16} className="text-slate-500" />
            <select
              value={filterBait}
              onChange={(e) => setFilterBait(e.target.value as any)}
              className="bg-transparent border-none text-slate-900 text-sm outline-none cursor-pointer w-full"
            >
              <option value="all">Alle Events</option>
              <option value="yes">Mit Köder</option>
              <option value="no">Ohne Köder</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm cursor-pointer hover:bg-slate-100 flex-grow md:flex-grow-0 transition-colors"
          >
            <ArrowDownUp size={16} className="text-slate-500" />
            {sortOrder === "desc" ? "Neueste" : "Älteste"}
          </button>
        </div>
      </div>

      {/* DESKTOP-ANSICHT: Die klassische Tabelle (Wird auf Handys ausgeblendet) */}

      <div className="hidden md:flex flex-col flex-1 min-h-0 overflow-y-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b-2 border-slate-200 text-slate-500">
              <th className="p-4 font-semibold">Datum & Uhrzeit</th>
              <th className="p-4 font-semibold">Dauer</th>
              <th className="p-4 font-semibold">Am Köder?</th>
            </tr>
          </thead>
          <tbody>
            {processedEvents.length > 0 ? (
              processedEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-slate-900 font-medium">
                    {new Date(event.created_at).toLocaleString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="p-4 text-slate-900">
                    {event.total_time_in_frame}s
                  </td>
                  <td className="p-4">
                    {event.interacted_with_bait ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                        Ja
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-medium">
                        Nein
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center p-8 text-slate-400">
                  Keine Events gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/*  MOBILE-ANSICHT: Die Card-Liste (Wird auf großen Bildschirmen ausgeblendet) */}

      <div className="md:hidden flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-1">
        {processedEvents.length > 0 ? (
          processedEvents.map((event) => (
            <div
              key={event.id}
              className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col gap-3 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900">
                  {new Date(event.created_at).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                {event.interacted_with_bait ? (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
                    Am Köder
                  </span>
                ) : (
                  <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full text-xs font-medium">
                    Kein Köder
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-sm text-slate-600 border-t border-slate-200 pt-2">
                <span>Verweildauer:</span>
                <span className="font-bold text-slate-900">
                  {event.total_time_in_frame} Sekunden
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 text-slate-400 border border-slate-200 rounded-lg bg-slate-50">
            Keine Events gefunden.
          </div>
        )}
      </div>
    </div>
  );
}
