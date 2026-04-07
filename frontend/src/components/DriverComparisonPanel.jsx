import { useEffect, useState } from "react";
import { fetchDrivers, compareDrivers } from "../api/client";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

function DriverStatCard({ title, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function DriverSummary({ title, data }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <DriverStatCard title="Driver" value={data.driver_name ?? "-"} />
        <DriverStatCard title="Races" value={data.races ?? "-"} />
        <DriverStatCard title="Wins" value={data.wins ?? "-"} />
        <DriverStatCard title="Podiums" value={data.podiums ?? "-"} />
        <DriverStatCard title="Points" value={Number(data.points ?? 0).toFixed(1)} />
        <DriverStatCard
          title="Avg Finish"
          value={data.avg_finish ? Number(data.avg_finish).toFixed(2) : "-"}
        />
        <DriverStatCard title="DNFs" value={data.dnfs ?? "-"} />
      </div>
    </div>
  );
}

function DriverComparisonPanel({ season }) {
  const [drivers, setDrivers] = useState([]);
  const [driver1, setDriver1] = useState("");
  const [driver2, setDriver2] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDriversList() {
      try {
        setError("");
        setLoadingDrivers(true);

        const result = await fetchDrivers(season);
        const driverList = result.drivers || [];

        setDrivers(driverList);
        setDriver1(driverList[0] || "");
        setDriver2(driverList[1] || driverList[0] || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingDrivers(false);
      }
    }

    loadDriversList();
  }, [season]);

  useEffect(() => {
    async function loadComparison() {
      if (!driver1 || !driver2) return;

      try {
        setError("");
        setLoadingComparison(true);

        const result = await compareDrivers(season, driver1, driver2);
        setComparison(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingComparison(false);
      }
    }

    loadComparison();
  }, [season, driver1, driver2]);

  if (loadingDrivers) {
    return <LoadingState message="Loading drivers..." />;
  }

  if (error) {
    return <ErrorState message={`Error: ${error}`} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Driver Comparison</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Driver 1
            </label>
            <select
              value={driver1}
              onChange={(e) => setDriver1(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3"
            >
              {drivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Driver 2
            </label>
            <select
              value={driver2}
              onChange={(e) => setDriver2(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3"
            >
              {drivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loadingComparison && <LoadingState message="Comparing drivers..." />}

      {!loadingComparison && comparison && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DriverSummary title="Driver 1" data={comparison.driver1} />
          <DriverSummary title="Driver 2" data={comparison.driver2} />
        </div>
      )}
    </div>
  );
}

export default DriverComparisonPanel;