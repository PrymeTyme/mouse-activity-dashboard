import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type ChartProps = {
  barChartData: { name: string; Sekunden: number }[];
  pieChartData: { name: string; value: number }[];
};

const COLORS = ["#ef4444", "#f97316"];

export default function DashboardCharts({
  barChartData,
  pieChartData,
}: ChartProps) {
  const totalPieValue = pieChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* BarChart */}

      <div className="bg-white px-6 pt-4 pb-4 rounded-xl shadow-sm flex flex-col flex-1 min-h-[375px]">
        <h3 className="m-0 mb-2  text-lg font-bold leading-tight text-slate-800">
          Aufenthaltsdauer nach Zone
        </h3>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="Sekunden" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PieChart */}
      <div className="bg-white px-6 pt-4 pb-4 rounded-xl shadow-sm flex flex-col flex-1 min-h-[375px]">
        <h3 className="m-0 mb-2  text-lg font-bold leading-tight text-slate-800">
          A/B Test: Köder-Präferenz
        </h3>
        {pieChartData.length > 0 ? (
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={false}
                >
                  {pieChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} sek`} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => {
                    const percent =
                      totalPieValue > 0
                        ? (entry.payload.value / totalPieValue) * 100
                        : 0;
                    return (
                      <span className="text-slate-700 font-medium">
                        {value} ({percent.toFixed(0)}%)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            Keine Köder-Daten
          </div>
        )}
      </div>
    </div>
  );
}
