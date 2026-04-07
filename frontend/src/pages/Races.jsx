import { useEffect, useMemo, useState } from "react";
import { fetchSeasons, fetchRaces, fetchRaceDetails } from "../api/client";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import SeasonSelector from "../components/SeasonSelector";

function getPositionNumber(position) {
  const value = Number(position);
  return Number.isFinite(value) ? value : null;
}

function Races() {
  const [seasons, setSeasons] = useState([2023]);
  const [selectedSeason, setSelectedSeason] = useState(2023);
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState("");
  const [raceResults, setRaceResults] = useState([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const seasonData = await fetchSeasons();
        setSeasons(seasonData.seasons || [2023]);
      } catch {
        setSeasons([2023]);
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    async function loadRaces() {
      try {
        setError("");
        setLoadingRaces(true);

        const data = await fetchRaces(selectedSeason);
        const raceList = data.races || [];

        setRaces(raceList);
        setSelectedRace(raceList[0] || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRaces(false);
      }
    }

    loadRaces();
  }, [selectedSeason]);

  useEffect(() => {
    async function loadRaceDetails() {
      if (!selectedRace) return;

      try {
        setError("");
        setLoadingDetails(true);

        const data = await fetchRaceDetails(selectedSeason, selectedRace);
        setRaceResults(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingDetails(false);
      }
    }

    loadRaceDetails();
  }, [selectedSeason, selectedRace]);

  const processedResults = useMemo(() => {
    return raceResults
      .map((result) => {
        const grid = Number(result.grid);
        const position = getPositionNumber(result.position);
        const status = String(result.time_retired || "");
        const isDnf = /retired|dnf|dns|dsq/i.test(status);

        const positionsGained =
          !isDnf && Number.isFinite(grid) && Number.isFinite(position)
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
    return processedResults.reduce((best, current) => {
      if (current.isDnf) return best;
      if (current.positionsGained == null) return best;
      if (!best || current.positionsGained > best.positionsGained) return current;
      return best;
    }, null);
  }, [processedResults]);

  const biggestLoser = useMemo(() => {
    return processedResults.reduce((worst, current) => {
      if (current.isDnf) return worst;
      if (current.positionsGained == null) return worst;
      if (!worst || current.positionsGained < worst.positionsGained) return current;
      return worst;
    }, null);
  }, [processedResults]);

  return (
    <Layout>
      <div className="mb-6">
        <SeasonSelector
          seasons={seasons}
          selectedSeason={selectedSeason}
          onChange={setSelectedSeason}
        />
      </div>

      {loadingRaces && <LoadingState message="Loading races..." />}
      {error && <ErrorState message={`Error: ${error}`} />}

      {!loadingRaces && !error && (
        <div className="space-y-6">
          {/* Race selector */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Race Explorer</h2>

            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3"
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
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3 className="text-xl font-bold">Biggest Gainer</h3>
                <p className="mt-2">
                  {biggestGainer.driver_name} gained{" "}
                  {biggestGainer.positionsGained} places
                </p>
              </div>
            )}

            {biggestLoser && (
              <div className="rounded-2xl bg-white p-6 shadow-md">
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
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-xl font-bold">{selectedRace} Results</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-left">
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
                    {processedResults.map((result, index) => {
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
                          className={`border-b hover:bg-gray-50
                            ${isWinner ? "bg-yellow-50" : ""}
                            ${isSecond ? "bg-gray-200" : ""}
                            ${isThird ? "bg-orange-100" : ""}
                            ${isBiggestLoser ? "bg-red-50" : ""}
                            ${isBiggestGainer ? "bg-green-50" : ""}
                          `}
                        >
                          <td className="p-3">{result.position || "-"}</td>

                          <td className="p-3 font-medium">
                            {result.driver_name}

                            {isWinner && (
                              <span className="ml-2 rounded bg-yellow-200 px-2 py-1 text-xs">
                                Winner
                              </span>
                            )}

                            {isSecond && (
                              <span className="ml-2 rounded bg-gray-300 px-2 py-1 text-xs">
                                2nd
                              </span>
                            )}

                            {isThird && (
                              <span className="ml-2 rounded bg-orange-300 px-2 py-1 text-xs">
                                3rd
                              </span>
                            )}

                            {isBiggestGainer && (
                              <span className="ml-2 rounded bg-green-200 px-2 py-1 text-xs">
                                Biggest Gainer
                              </span>
                            )}

                            {isBiggestLoser && (
                              <span className="ml-2 rounded bg-red-200 px-2 py-1 text-xs">
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
                              <span className="rounded bg-red-200 px-2 py-1 text-xs">
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