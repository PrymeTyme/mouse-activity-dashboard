export default function MediaViewer({
  videoSrc,
  heatmapSrc,
}: {
  videoSrc: string;
  heatmapSrc: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Video Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
        <h3 className="m-0 mb-4 text-lg font-bold text-slate-900">
          Kamera-Aufzeichnung
        </h3>
        <div className="bg-black rounded-lg overflow-hidden aspect-video">
          <video
            key={videoSrc}
            src={videoSrc}
            controls
            autoPlay
            muted
            loop
            className="w-full h-full object-cover block"
          />
        </div>
      </div>

      {/* Heatmap Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
        <h3 className="m-0 mb-4 text-lg font-bold text-slate-900">
          Aktivitäts-Heatmap
        </h3>
        <div className="rounded-lg overflow-hidden">
          <img
            key={heatmapSrc}
            src={heatmapSrc}
            alt="Heatmap"
            className="w-full block object-contain"
          />
        </div>
      </div>
    </div>
  );
}
