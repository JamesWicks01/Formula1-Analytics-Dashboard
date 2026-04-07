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
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Podiums by Driver</h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="driver" angle={-20} textAnchor="end" height={90} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="podiums" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PodiumsChart;