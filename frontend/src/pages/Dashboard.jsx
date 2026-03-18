import { useEffect, useState } from "react";
import { fetchSeasonOverview } from "../api/client";
import StatCard from "../components/StatCard";
import WinsChart from "../components/WinsChart";

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchSeasonOverview(2023);
        setOverview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-4xl font-bold">Formula 1 Dashboard</h1>

      <div className="mb-6">
        <p className="text-lg text-gray-700">
          Season: <span className="font-semibold">{overview.season}</span>
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Races" value={overview.total_races} />
        <StatCard title="Total Drivers" value={overview.total_drivers} />
        <StatCard title="Total Teams" value={overview.total_teams} />
        <StatCard title="Wins Leader" value={overview.wins_leader} />
      </div>

      <WinsChart />
    </div>
  );
}

export default Dashboard;