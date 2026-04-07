import { useEffect, useMemo, useState } from "react";
import { fetchSeasons, fetchTeamStats } from "../api/client";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import SeasonSelector from "../components/SeasonSelector";

function Teams() {
  const [seasons, setSeasons] = useState([2023]);
  const [selectedSeason, setSelectedSeason] = useState(2023);
  const [teams, setTeams] = useState([]);
  const [sortBy, setSortBy] = useState("points");
  const [search, setSearch] = useState("");
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
    async function loadTeams() {
      try {
        setError("");
        setLoading(true);

        const data = await fetchTeamStats(selectedSeason);
        setTeams(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, [selectedSeason]);

  const filteredTeams = useMemo(() => {
    const filtered = teams.filter((team) =>
      team.team_name?.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return (a.team_name || "").localeCompare(b.team_name || "");
      }
      return Number(b[sortBy] ?? 0) - Number(a[sortBy] ?? 0);
    });
  }, [teams, sortBy, search]);

  return (
    <Layout>
      <div className="mb-6">
        <SeasonSelector
          seasons={seasons}
          selectedSeason={selectedSeason}
          onChange={setSelectedSeason}
        />
      </div>

      {loading && <LoadingState message="Loading team stats..." />}
      {error && <ErrorState message={`Error: ${error}`} />}

      {!loading && !error && (
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-2xl font-bold">Team Statistics</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                placeholder="Search team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-gray-300 p-3"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-300 p-3"
              >
                <option value="points">Sort by Points</option>
                <option value="wins">Sort by Wins</option>
                <option value="podiums">Sort by Podiums</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">Team</th>
                  <th className="p-3">Races</th>
                  <th className="p-3">Wins</th>
                  <th className="p-3">Podiums</th>
                  <th className="p-3">Points</th>
                  <th className="p-3">Avg Finish</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.team_name} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{team.team_name}</td>
                    <td className="p-3">{team.races}</td>
                    <td className="p-3">{team.wins}</td>
                    <td className="p-3">{team.podiums}</td>
                    <td className="p-3">{Number(team.points).toFixed(1)}</td>
                    <td className="p-3">
                      {team.avg_finish ? Number(team.avg_finish).toFixed(2) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Teams;