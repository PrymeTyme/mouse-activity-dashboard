import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { TrackingEvent } from "./types";

import Header from "./components/Header";
import KpiCards from "./components/KpiCards";
import MediaViewer from "./components/MediaViewer";
import DashboardCharts from "./components/DashboardCharts";
import ActivityLog from "./components/ActivityLog";

export default function App() {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string>("test2.mp4");

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("pest_tracking_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Fehler beim Laden:", error);
      else setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  if (loading)
    return <div style={{ padding: "2rem" }}>Lade Dashboard-Daten...</div>;

  // Daten-Berechnung
  const videoOptions = Array.from(new Set(events.map((e) => e.video_name)));
  const filteredEvents = events.filter((e) => e.video_name === selectedVideo);

  const totalSightings = filteredEvents.length;
  const avgTime =
    totalSightings > 0
      ? (
          filteredEvents.reduce(
            (acc, curr) => acc + curr.total_time_in_frame,
            0,
          ) / totalSightings
        ).toFixed(1)
      : "0";
  const baitInteractions = filteredEvents.filter(
    (e) => e.interacted_with_bait,
  ).length;
  const acceptanceRate =
    totalSightings > 0
      ? Math.round((baitInteractions / totalSightings) * 100)
      : 0;

  const hourCounts = filteredEvents.reduce(
    (acc, event) => {
      const date = new Date(event.created_at);
      if (!isNaN(date.getTime())) {
        const hour = date.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    },
    {} as Record<number, number>,
  );

  let peakActivity = "Keine Daten";
  let maxEvents = 0;

  for (const [hourStr, count] of Object.entries(hourCounts)) {
    if (count > maxEvents) {
      maxEvents = count;
      const h = parseInt(hourStr);

      peakActivity = `${h.toString().padStart(2, "0")}:00 Uhr`;
    }
  }

  const barChartData = [
    {
      name: "Mauseloch",
      Sekunden: Number(
        filteredEvents
          .reduce((acc, curr) => acc + curr.time_at_hole, 0)
          .toFixed(1),
      ),
    },
    {
      name: "Köderzone",
      Sekunden: Number(
        filteredEvents
          .reduce((acc, curr) => acc + curr.time_at_bait, 0)
          .toFixed(1),
      ),
    },
  ];

  const pieChartData = [
    {
      name: "Köder A",
      value: Number(
        filteredEvents
          .reduce((acc, curr) => acc + curr.time_at_bait_a, 0)
          .toFixed(1),
      ),
    },
    {
      name: "Köder B",
      value: Number(
        filteredEvents
          .reduce((acc, curr) => acc + curr.time_at_bait_b, 0)
          .toFixed(1),
      ),
    },
  ].filter((item) => item.value > 0);

  const baseName = selectedVideo.split(".")[0];
  const videoSrc = `/tracked_${baseName}.mp4`;
  const heatmapSrc = `/heatmap_${baseName}.jpg`;

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      <Header
        selectedVideo={selectedVideo}
        videoOptions={videoOptions}
        onVideoChange={setSelectedVideo}
      />

      <KpiCards
        totalSightings={totalSightings}
        avgTime={avgTime}
        baitInteractions={baitInteractions}
        acceptanceRate={acceptanceRate}
        peakActivity={peakActivity}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 items-stretch">
        <MediaViewer videoSrc={videoSrc} heatmapSrc={heatmapSrc} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            height: "100%",
            minHeight: 0,
          }}
        >
          <DashboardCharts
            barChartData={barChartData}
            pieChartData={pieChartData}
          />
          <ActivityLog events={filteredEvents} />
        </div>
      </div>
    </div>
  );
}
