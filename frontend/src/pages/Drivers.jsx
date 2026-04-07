import { useEffect, useState } from "react";
import { fetchDriverStats } from "../api/client";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDrivers() {
      try {
        const data = await fetchDriverStats(2023);
        setDrivers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDrivers();
  }, []);

  return (
    <Layout>
      {loading && <LoadingState message="Loading driver stats..." />}
      {error && <ErrorState message={`Error: ${error}`} />}

      {!loading && !error && (
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Driver Statistics</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
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
                {drivers.map((driver) => (
                  <tr key={driver.driver_name} className="border-b hover:bg-gray-50">
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
    </Layout>
  );
}

export default Drivers;