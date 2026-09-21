import { useEffect, useMemo, useState } from "react";
import { fetchDriverStats } from "../api/client";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import DriverComparisonPanel from "../components/DriverComparisonPanel";

function Drivers({ selectedSeason }) {
  const [drivers, setDrivers] = useState([]);
  const [sortBy, setSortBy] = useState("points");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDrivers() {
      try {
        setError("");
        setLoading(true);

        const data = await fetchDriverStats(selectedSeason);
        if (!active) return;
        setDrivers(data);
      } catch (err) {
        if (!active) return;
        setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDrivers();
    return () => { active = false; };
  }, [selectedSeason]);

  const filteredDrivers = useMemo(() => {
    const filtered = drivers.filter((driver) =>
      driver.driver_name?.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return (a.driver_name || "").localeCompare(b.driver_name || "");
      }
      return Number(b[sortBy] ?? 0) - Number(a[sortBy] ?? 0);
    });
  }, [drivers, sortBy, search]);

  return (
    <Layout>
      {loading && <LoadingState message="Loading driver stats..." />}
      {error && <ErrorState message={`Error: ${error}`} />}

      {!loading && !error && (
        <div className="analytics-panel">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-2xl font-bold">Driver Statistics</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                aria-label="Search drivers"
                type="text"
                placeholder="Search driver..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="analytics-control"
              />

              <select
                aria-label="Sort drivers"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="analytics-control"
              >
                <option value="points">Sort by Points</option>
                <option value="wins">Sort by Wins</option>
                <option value="podiums">Sort by Podiums</option>
                <option value="dnfs">Sort by DNFs</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="p-3">Driver</th>
                  <th className="p-3">Races</th>
                  <th className="p-3">Wins</th>
                  <th className="p-3">Podiums</th>
                  <th className="p-3">Points</th>
                  <th className="p-3">Avg Finish</th>
                  <th className="p-3">DNFs</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.driver_name} className="border-b border-gray-800 hover:bg-gray-800/70">
                    <td className="p-3 font-medium">{driver.driver_name}</td>
                    <td className="p-3">{driver.races}</td>
                    <td className="p-3">{driver.wins}</td>
                    <td className="p-3">{driver.podiums}</td>
                    <td className="p-3">{Number(driver.points).toFixed(1)}</td>
                    <td className="p-3">
                      {driver.avg_finish ? Number(driver.avg_finish).toFixed(2) : "-"}
                    </td>
                    <td className="p-3">{driver.dnfs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-6">
        <DriverComparisonPanel key={selectedSeason} season={selectedSeason} />
      </div>
    </Layout>
  );
}

export default Drivers;
