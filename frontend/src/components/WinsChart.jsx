import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const sampleData = [
  { driver: "Verstappen", wins: 19 },
  { driver: "Perez", wins: 2 },
  { driver: "Sainz", wins: 1 },
  { driver: "Leclerc", wins: 0 },
];

function WinsChart() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Wins by Driver</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="driver" />
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