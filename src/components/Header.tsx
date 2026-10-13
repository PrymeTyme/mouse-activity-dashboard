type HeaderProps = {
  selectedVideo: string;
  videoOptions: string[];
  onVideoChange: (video: string) => void;
};

export default function Header({
  selectedVideo,
  videoOptions,
  onVideoChange,
}: HeaderProps) {
  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm gap-4">
      <div className="text-center md:text-left">
        <h1 className="m-0 text-slate-900 text-2xl font-bold">
          Mouse Activity Dashboard
        </h1>
        <p className="text-slate-500 mt-1 m-0">
          KI-gestützte Bewegungs- und Köderanalyse
        </p>
      </div>

      <select
        value={selectedVideo}
        onChange={(e) => onVideoChange(e.target.value)}
        className="p-3 text-base rounded-lg border border-slate-300 text-slate-900 bg-slate-50 font-bold cursor-pointer w-full md:w-auto outline-none focus:border-blue-500"
      >
        {videoOptions.map((vid) => (
          <option
            key={vid}
            value={vid}
            style={{ color: "black", backgroundColor: "white" }}
          >
            Analyse: {vid}
          </option>
        ))}
      </select>
    </header>
  );
}
