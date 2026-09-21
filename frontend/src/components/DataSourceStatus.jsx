import { useEffect, useState } from "react";
import { fetchSourceStatus } from "../api/client";

export default function DataSourceStatus({ season }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    let active = true;
    fetchSourceStatus(season).then(
      (status) => { if (active) setState({ season, status }); },
      (error) => { if (active) setState({ season, error: error.message }); },
    );
    return () => { active = false; };
  }, [season]);

  if (!state || state.season !== season) {
    return <p role="status" className="mb-4 text-sm text-gray-600">Loading season data; the first request may take a few minutes.</p>;
  }
  return (
    <p role="status" className="mb-4 rounded-xl bg-white p-3 text-sm text-gray-700">
      {state.error || <>
        Data source: {state.status.source === "fastf1" ? "FastF1" : "CSV fallback"}
        {` · ${state.status.completed_races} races with results`}
        {state.status.message && ` · ${state.status.message}`}
        {state.status.completed_races === 0 && " · No race results have been published yet."}
      </>}
    </p>
  );
}
