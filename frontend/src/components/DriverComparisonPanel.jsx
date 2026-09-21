import { useEffect, useState } from "react";
import { fetchDrivers, compareDrivers } from "../api/client";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

function DriverStatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="mt-1 text-xl font-bold text-gray-100">{value}</p>
    </div>
  );
}

function DriverSummary({ title, data }) {
  return (
    <div className="analytics-panel">
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
    let active = true;
    async function loadDriversList() {
      try {
        setError("");
        setLoadingDrivers(true);

        const result = await fetchDrivers(season);
        if (!active) return;
        const driverList = result.drivers || [];

        setDrivers(driverList);
        setDriver1(driverList[0] || "");
        setDriver2(driverList[1] || driverList[0] || "");
      } catch (err) {
        if (!active) return;
        setError(err.message);
      } finally {
        if (active) setLoadingDrivers(false);
      }
    }

    loadDriversList();
    return () => { active = false; };
  }, [season]);

  useEffect(() => {
    let active = true;
    async function loadComparison() {
      if (!driver1 || !driver2) return;

      try {
        setError("");
        setLoadingComparison(true);

        const result = await compareDrivers(season, driver1, driver2);
        if (!active) return;
        setComparison(result);
      } catch (err) {
        if (!active) return;
        setError(err.message);
      } finally {
        if (active) setLoadingComparison(false);
      }
    }

    loadComparison();
    return () => { active = false; };
  }, [season, driver1, driver2]);

  if (loadingDrivers) {
    return <LoadingState message="Loading drivers..." />;
  }

  if (error) {
    return <ErrorState message={`Error: ${error}`} />;
  }

  return (
    <div className="space-y-6">
      <div className="analytics-panel">
        <h2 className="mb-4 text-2xl font-bold">Driver Comparison</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="compare-driver-1" className="mb-2 block text-sm font-medium text-gray-300">
              Driver 1
            </label>
            <select
              id="compare-driver-1"
              value={driver1}
              onChange={(e) => setDriver1(e.target.value)}
              className="analytics-control w-full"
            >
              {drivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="compare-driver-2" className="mb-2 block text-sm font-medium text-gray-300">
              Driver 2
            </label>
            <select
              id="compare-driver-2"
              value={driver2}
              onChange={(e) => setDriver2(e.target.value)}
              className="analytics-control w-full"
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
