import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function PointsTrendChart({ data }) {
  const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  const totalsByDriver = rows.reduce((acc, row) => {
    const driver = row.driver_name;
    const points = Number(row.cumulative_points ?? 0);
    acc[driver] = Math.max(acc[driver] ?? 0, points);
    return acc;
  }, {});

  const topDrivers = Object.entries(totalsByDriver)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([driver]) => driver);

  const filteredRows = rows.filter((row) => topDrivers.includes(row.driver_name));

  const groupedByRound = filteredRows.reduce((acc, row) => {
    const round = row.round;
    if (!acc[round]) acc[round] = { round };
    acc[round][row.driver_name] = Number(row.cumulative_points ?? 0);
    return acc;
  }, {});

  const chartData = Object.values(groupedByRound).sort((a, b) => a.round - b.round);

  const COLORS = [
    "#e10600",
    "#00d2be",
    "#1e5bc6",
    "#fcd700",
    "#ff8700",
    "#9b0000",
    "#00594f",
    "#0033a0",
    "#a67c00",
    "#cc5500",
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Cumulative Points Trend</h2>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="round" />
            <YAxis />
            <Tooltip />
            <Legend />

            {topDrivers.map((driver, index) => (
              <Line
                key={driver}
                type="monotone"
                dataKey={driver}
                dot={false}
                strokeWidth={3}
                stroke={COLORS[index % COLORS.length]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PointsTrendChart;