import { useEffect, useMemo, useState } from "react";
import { fetchRaces, fetchRaceDetails } from "../api/client";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function getPositionNumber(position) {
  if (position === "" || position == null) return null;
  const value = Number(position);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function Races({ selectedSeason }) {
  const [races, setRaces] = useState([]);
  const [selection, setSelection] = useState(null);
  const selectedRace = selection?.season === selectedSeason ? selection.race : "";
  const [raceResults, setRaceResults] = useState([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadRaces() {
      try {
        setError("");
        setLoadingRaces(true);

        const data = await fetchRaces(selectedSeason);
        if (!active) return;
        const raceList = data.races || [];

        setRaces(raceList);
        setSelection({ season: selectedSeason, race: raceList[0] || "" });
      } catch (err) {
        if (!active) return;
        setError(err.message);
      } finally {
        if (active) setLoadingRaces(false);
      }
    }

    loadRaces();
    return () => { active = false; };
  }, [selectedSeason]);

  useEffect(() => {
    let active = true;
    async function loadRaceDetails() {
      if (!selectedRace) return;

      try {
        setError("");
        setLoadingDetails(true);

        const data = await fetchRaceDetails(selectedSeason, selectedRace);
        if (!active) return;
        setRaceResults(data.results || []);
      } catch (err) {
        if (!active) return;
        setError(err.message);
      } finally {
        if (active) setLoadingDetails(false);
      }
    }

    loadRaceDetails();
    return () => { active = false; };
  }, [selectedSeason, selectedRace]);

  const processedResults = useMemo(() => {
    return raceResults
      .map((result) => {
        const grid = Number(result.grid);
        const position = getPositionNumber(result.position);
        const status = String(result.time_retired || "");
        const isDnf = result.is_dnf ?? /retired|dnf|dns|dsq/i.test(status);

        const positionsGained =
          !isDnf && Number.isFinite(grid) && grid > 0 && Number.isFinite(position)
            ? grid - position
            : null;

        return {
          ...result,
          positionsGained,
          isDnf,
        };
      })
      .sort((a, b) => {
        const posA = getPositionNumber(a.position);
        const posB = getPositionNumber(b.position);

        const isClassifiedA = posA !== null && !a.isDnf;
        const isClassifiedB = posB !== null && !b.isDnf;

        // 1. Classified finishers first
        if (isClassifiedA && !isClassifiedB) return -1;
        if (!isClassifiedA && isClassifiedB) return 1;

        // 2. If both classified → sort by finishing position
        if (isClassifiedA && isClassifiedB) {
          return posA - posB;
        }

        // 3. Both unclassified / DNF → sort by laps DESC
        const lapsA = Number(a.laps);
        const lapsB = Number(b.laps);

        const validLapsA = Number.isFinite(lapsA) ? lapsA : -1;
        const validLapsB = Number.isFinite(lapsB) ? lapsB : -1;

        return validLapsB - validLapsA;
      });
  }, [raceResults]);

  const biggestGainer = useMemo(() => {
    if (loadingDetails || !selectedRace) return null;
    return processedResults.reduce((best, current) => {
      if (current.isDnf) return best;
      if (current.positionsGained == null) return best;
      if (!best || current.positionsGained > best.positionsGained) return current;
      return best;
    }, null);
  }, [processedResults, loadingDetails, selectedRace]);

  const biggestLoser = useMemo(() => {
    if (loadingDetails || !selectedRace) return null;
    return processedResults.reduce((worst, current) => {
      if (current.isDnf) return worst;
      if (current.positionsGained == null) return worst;
      if (!worst || current.positionsGained < worst.positionsGained) return current;
      return worst;
    }, null);
  }, [processedResults, loadingDetails, selectedRace]);

  return (
    <Layout>
      {loadingRaces && <LoadingState message="Loading races..." />}
      {error && <ErrorState message={`Error: ${error}`} />}

      {!loadingRaces && !error && (
        <div className="space-y-6">
          {/* Race selector */}
          <div className="analytics-panel">
            <label htmlFor="race-choice" className="mb-3 block text-xs font-semibold uppercase tracking-widest text-gray-400">Select a Grand Prix</label>

            <select
              id="race-choice"
              value={selectedRace}
              onChange={(e) => setSelection({ season: selectedSeason, race: e.target.value })}
              className="analytics-control w-full"
            >
              {races.map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {biggestGainer && (
              <div className="analytics-panel">
                <h3 className="text-xl font-bold">Biggest Gainer</h3>
                <p className="mt-2">
                  {biggestGainer.driver_name} gained{" "}
                  {biggestGainer.positionsGained} places
                </p>
              </div>
            )}

            {biggestLoser && (
              <div className="analytics-panel">
                <h3 className="text-xl font-bold">Biggest Loser</h3>
                <p className="mt-2">
                  {biggestLoser.driver_name} lost{" "}
                  {Math.abs(biggestLoser.positionsGained)} places
                </p>
              </div>
            )}
          </div>

          {loadingDetails && <LoadingState message="Loading race details..." />}

          {/* Results table */}
          {!loadingDetails && processedResults.length > 0 && (
            <div className="analytics-panel">
              <h3 className="mb-4 text-xl font-bold">{selectedRace} Results</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-left">
                      <th className="p-3">Position</th>
                      <th className="p-3">Driver</th>
                      <th className="p-3">Team</th>
                      <th className="p-3">Grid</th>
                      <th className="p-3">Gained</th>
                      <th className="p-3">Laps</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedResults.map((result) => {
                      const isWinner = Number(result.position) === 1;
                      const isSecond = Number(result.position) === 2;
                      const isThird = Number(result.position) === 3;

                      const isBiggestGainer =
                        biggestGainer &&
                        biggestGainer.driver_name === result.driver_name &&
                        biggestGainer.positionsGained === result.positionsGained;

                      const isBiggestLoser =
                        biggestLoser &&
                        biggestLoser.driver_name === result.driver_name &&
                        biggestLoser.positionsGained === result.positionsGained;

                      return (
                        <tr
                          key={result.driver_name}
                          className={`border-b border-gray-800 hover:bg-gray-800/70
                            ${isWinner ? "bg-yellow-500/5" : ""}
                            ${isSecond ? "bg-slate-400/5" : ""}
                            ${isThird ? "bg-orange-500/5" : ""}
                            ${isBiggestLoser ? "bg-red-500/5" : ""}
                            ${isBiggestGainer ? "bg-emerald-500/5" : ""}
                          `}
                        >
                          <td className="p-3">{result.position || "-"}</td>

                          <td className="p-3 font-medium">
                            {result.driver_name}

                            {isWinner && (
                              <span className="ml-2 rounded bg-yellow-500/15 text-yellow-300 px-2 py-1 text-xs">
                                Winner
                              </span>
                            )}

                            {isSecond && (
                              <span className="ml-2 rounded bg-slate-400/15 text-slate-300 px-2 py-1 text-xs">
                                2nd
                              </span>
                            )}

                            {isThird && (
                              <span className="ml-2 rounded bg-orange-500/15 text-orange-300 px-2 py-1 text-xs">
                                3rd
                              </span>
                            )}

                            {isBiggestGainer && (
                              <span className="ml-2 rounded bg-emerald-500/15 text-emerald-300 px-2 py-1 text-xs">
                                Biggest Gainer
                              </span>
                            )}

                            {isBiggestLoser && (
                              <span className="ml-2 rounded bg-red-500/15 text-red-300 px-2 py-1 text-xs">
                                Biggest Loser
                              </span>
                            )}
                          </td>

                          <td className="p-3">{result.team_name}</td>
                          <td className="p-3">{result.grid}</td>

                          <td className="p-3">
                            {result.positionsGained == null
                              ? "-"
                              : result.positionsGained > 0
                              ? `+${result.positionsGained}`
                              : result.positionsGained}
                          </td>

                          <td className="p-3">{result.laps}</td>

                          <td className="p-3">
                            {result.isDnf ? (
                              <span className="rounded bg-red-500/15 text-red-300 px-2 py-1 text-xs">
                                {result.time_retired || "DNF"}
                              </span>
                            ) : (
                              result.time_retired
                            )}
                          </td>

                          <td className="p-3">{result.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

export default Races;
