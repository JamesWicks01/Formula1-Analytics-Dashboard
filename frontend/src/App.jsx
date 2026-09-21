import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Routes, Route, useSearchParams } from "react-router-dom";
import { fetchSeasons } from "./api/client";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Drivers from "./pages/Drivers";
import Teams from "./pages/Teams";
import Races from "./pages/Races";

function SeasonPage({ page, seasons, loading, error }) {
  const Page = page;
  const [params] = useSearchParams();
  const season = Number(params.get("season"));
  if (loading) return <main className="min-h-screen bg-gray-950 p-8 text-gray-300" role="status">Loading seasons...</main>;
  if (error || !seasons.includes(season)) return <Navigate to="/" replace />;
  return <Page
    key={season}
    selectedSeason={season}
  />;
}

function App() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    fetchSeasons().then((data) => {
      if (!active) return;
      const years = [...new Set(data.seasons)].filter(Number.isInteger).sort((a, b) => b - a);
      if (!years.length) throw new Error("No seasons are available yet.");
      setSeasons(years);
    }).catch((err) => {
      if (active) setError(err.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [attempt]);
  const retry = () => {
    setError("");
    setLoading(true);
    setAttempt((value) => value + 1);
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome seasons={seasons} loading={loading} error={error} onRetry={retry} />} />
        {[["dashboard", Dashboard], ["drivers", Drivers], ["teams", Teams], ["races", Races]].map(([path, Page]) => (
          <Route key={path} path={`/${path}`} element={<SeasonPage page={Page} seasons={seasons} loading={loading} error={error} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
