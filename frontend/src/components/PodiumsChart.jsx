import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function PodiumsChart({ data }) {
  const chartData = Object.entries(data || {}).map(([driver, podiums]) => ({
    driver,
    podiums,
  }));

  return (
    <div className="analytics-panel">
      <h2 className="mb-4 text-xl font-bold">Podiums by Driver</h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#273244" vertical={false} />
            <XAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} dataKey="driver" angle={-20} textAnchor="end" height={90} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={36} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 12, color: "#f3f4f6" }} labelStyle={{ color: "#f3f4f6" }} itemStyle={{ color: "#f3f4f6" }} cursor={{ stroke: "#475569", fill: "#ffffff08" }} />
            <Bar dataKey="podiums" fill="#fb923c" radius={[5, 5, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PodiumsChart;