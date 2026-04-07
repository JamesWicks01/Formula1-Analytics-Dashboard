import { useEffect, useState } from "react";
import { fetchSeasonOverview, fetchWins } from "../api/client";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import WinsChart from "../components/WinsChart";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [wins, setWins] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewData, winsData] = await Promise.all([
          fetchSeasonOverview(2023),
          fetchWins(2023),
        ]);

        setOverview(overviewData);
        setWins(winsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <Layout>
      {loading && <LoadingState message="Loading dashboard..." />}
      {error && <ErrorState message={`Error: ${error}`} />}

      {!loading && !error && overview && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Season" value={overview.season ?? "-"} />
            <StatCard title="Total Races" value={overview.total_races ?? "-"} />
            <StatCard title="Total Drivers" value={overview.total_drivers ?? "-"} />
            <StatCard title="Total Teams" value={overview.total_teams ?? "-"} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <StatCard title="Wins Leader" value={overview.wins_leader ?? "-"} />
          </div>

          <WinsChart data={wins} />
        </>
      )}
    </Layout>
  );
}

export default Dashboard;