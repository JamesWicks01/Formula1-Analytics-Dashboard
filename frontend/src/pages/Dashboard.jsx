import { useEffect, useState } from "react";
import {
  fetchSeasons,
  fetchSeasonOverview,
  fetchWins,
  fetchPodiums,
  fetchPointsTrend,
} from "../api/client";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import WinsChart from "../components/WinsChart";
import PodiumsChart from "../components/PodiumsChart";
import PointsTrendChart from "../components/PointsTrendChart";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import SeasonSelector from "../components/SeasonSelector";

function Dashboard() {
  const [seasons, setSeasons] = useState([2023]);
  const [selectedSeason, setSelectedSeason] = useState(2023);
  const [overview, setOverview] = useState(null);
  const [wins, setWins] = useState({});
  const [podiums, setPodiums] = useState({});
  const [pointsTrend, setPointsTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const seasonData = await fetchSeasons();
        setSeasons(seasonData.seasons || [2023]);
      } catch {
        setSeasons([2023]);
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setError("");
        setLoading(true);

        const [overviewData, winsData, podiumsData, pointsTrendData] =
          await Promise.all([
            fetchSeasonOverview(selectedSeason),
            fetchWins(selectedSeason),
            fetchPodiums(selectedSeason),
            fetchPointsTrend(selectedSeason),
          ]);

        setOverview(overviewData);
        setWins(winsData);
        setPodiums(podiumsData);
        setPointsTrend(pointsTrendData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [selectedSeason]);

  return (
    <Layout>
      <div className="mb-6">
        <SeasonSelector
          seasons={seasons}
          selectedSeason={selectedSeason}
          onChange={setSelectedSeason}
        />
      </div>

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

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <WinsChart data={wins} />
            <PodiumsChart data={podiums} />
          </div>

          <PointsTrendChart data={pointsTrend} />
        </>
      )}
    </Layout>
  );
}

export default Dashboard;