import { useEffect, useState } from "react";
import { fetchTeamStats } from "../api/client";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await fetchTeamStats(2023);
        setTeams(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, []);

  return (
    <Layout>
      {loading && <LoadingState message="Loading team stats..." />}
      {error && <ErrorState message={`Error: ${error}`} />}

      {!loading && !error && (
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Team Statistics</h2>

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
                {teams.map((team) => (
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