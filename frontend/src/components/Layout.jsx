import Navbar from "./Navbar";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import DataSourceStatus from "./DataSourceStatus";

const pages = {
  "/dashboard": ["Season overview", "The big picture. Every result, every point, every podium."],
  "/drivers": ["The drivers", "Explore the field. Compare performances and follow the front runners."],
  "/teams": ["The teams", "See how each team performed across the season."],
  "/races": ["Race explorer", "Go race by race. Discover the results behind the season."],
};

function Layout({ children }) {
  const { pathname, search } = useLocation();
  const [params] = useSearchParams();
  const season = Number(params.get("season"));
  const [title, description] = pages[pathname] || pages["/dashboard"];
  return (
    <div className="analytics-shell relative min-h-screen overflow-hidden bg-gray-950 text-gray-100">
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-0 h-[700px] w-96 -skew-x-12 border-l border-red-600/30 bg-red-600/5" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <Link to={`/${search}`} className="text-sm font-bold uppercase tracking-widest text-red-400">Formula 1 Analytics</Link>
          <span className="rounded-full border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-300">{season} season</span>
        </header>
        <Navbar />
        <main id="main-content">
          <div className="mb-8 mt-10">
            <div className="mb-5 h-1 w-12 rounded bg-red-600" />
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-gray-400">{description}</p>
            <DataSourceStatus season={season} />
          </div>
          {children}
        </main>
        <footer className="mt-12 flex flex-wrap justify-between gap-2 border-t border-gray-800 py-6 text-xs text-gray-500">
          <span>Formula 1 Analytics · {season}</span>
          <span>Explore the story behind the results.</span>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
