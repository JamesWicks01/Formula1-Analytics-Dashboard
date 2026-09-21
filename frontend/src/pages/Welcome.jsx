import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Welcome({ seasons, loading, error, onRetry }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(params.get("season") || "");
  const valid = seasons.includes(Number(selected));

  function openDashboard(event) {
    event.preventDefault();
    if (valid) navigate(`/dashboard?season=${selected}`);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-6 py-8 text-white sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-full w-96 -skew-x-12 border-l border-red-600/40 bg-red-600/10" />
      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <section>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-red-400">Formula 1 Analytics</p>
          <div className="mb-6 h-1 w-16 rounded bg-red-600" />
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">Every season.<br />A different story.</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-gray-300 sm:mt-6 sm:text-lg">Explore the drivers, teams and races that shaped the championship. Choose a season to get started.</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400">
            <li>Driver comparisons</li>
            <li>Team performance</li>
            <li>Race results</li>
          </ul>
        </section>

        <section aria-labelledby="season-heading" className="rounded-3xl border border-gray-700 bg-gray-900 p-6 shadow-2xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">Your starting grid</p>
          <h2 id="season-heading" className="mt-3 text-3xl font-bold">Choose your season</h2>
          <p className="mt-3 text-gray-400">Start with a year. Follow every result.</p>
          {loading ? <p role="status" className="mt-8 text-gray-300">Loading available seasons...</p> : error ? (
            <div className="mt-8">
              <p role="alert" className="text-red-300">Unable to load seasons. {error}</p>
              <button type="button" onClick={onRetry} className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-bold hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400">Try again</button>
            </div>
          ) : (
            <form onSubmit={openDashboard} className="mt-8">
              <label htmlFor="opening-season" className="mb-3 block text-sm font-medium text-gray-300">Formula 1 season</label>
              <select id="opening-season" required value={valid ? selected : ""} onChange={(event) => setSelected(event.target.value)} className="w-full rounded-xl border border-gray-600 bg-gray-950 p-4 text-lg text-white focus:border-red-500 focus:outline-2 focus:outline-red-500">
                <option value="" disabled>Select a season</option>
                {seasons.map((year) => <option key={year} value={year}>{year} season</option>)}
              </select>
              <button type="submit" disabled={!valid} className="mt-5 flex w-full items-center justify-between rounded-xl bg-red-600 px-5 py-4 font-bold transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400">
                Open dashboard <span aria-hidden="true">→</span>
              </button>
              <p className="mt-5 text-sm leading-relaxed text-gray-400">You can switch seasons at any time while exploring.</p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
