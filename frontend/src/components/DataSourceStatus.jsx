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
    return <p role="status" className="mt-4 text-xs text-gray-400">Loading season data; the first request may take a few minutes.</p>;
  }
  return (
    <p role="status" className="mt-4 flex flex-wrap items-center gap-x-1 text-xs leading-relaxed text-gray-400">
      <span aria-hidden="true" className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${state.error || state.status?.fallback ? "bg-amber-400" : "bg-emerald-400"}`} />
      {state.error || <>
        Data source: {state.status.source === "fastf1" ? "FastF1" : "CSV fallback"}
        {` · ${state.status.completed_races} races with results`}
        {state.status.message && ` · ${state.status.message}`}
        {state.status.completed_races === 0 && " · No race results have been published yet."}
      </>}
    </p>
  );
}
