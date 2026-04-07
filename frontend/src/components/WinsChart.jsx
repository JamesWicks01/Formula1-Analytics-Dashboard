import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function WinsChart({ data }) {
  const chartData = Object.entries(data || {}).map(([driver, wins]) => ({
    driver,
    wins,
  }));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Wins by Driver</h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="driver" angle={-20} textAnchor="end" height={90} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="wins" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default WinsChart;