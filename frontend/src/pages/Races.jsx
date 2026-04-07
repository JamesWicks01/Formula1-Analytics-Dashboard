import { useEffect, useState } from "react";
import { fetchRaces, fetchRaceDetails } from "../api/client";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function Races() {
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState("");
  const [raceResults, setRaceResults] = useState([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRaces() {
      try {
        const data = await fetchRaces(2023);
        const raceList = data.races || [];
        setRaces(raceList);

        if (raceList.length > 0) {
          setSelectedRace(raceList[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRaces(false);
      }
    }

    loadRaces();
  }, []);

  useEffect(() => {
    async function loadRaceDetails() {
      if (!selectedRace) return;

      setLoadingDetails(true);

      try {
        const data = await fetchRaceDetails(2023, selectedRace);
        setRaceResults(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingDetails(false);
      }
    }

    loadRaceDetails();
  }, [selectedRace]);

  return (
    <Layout>
      {loadingRaces && <LoadingState message="Loading races..." />}
      {error && <ErrorState message={`Error: ${error}`} />}

      {!loadingRaces && !error && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Race Explorer</h2>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Race
            </label>

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

          {loadingDetails && <LoadingState message="Loading race details..." />}

          {!loadingDetails && raceResults.length > 0 && (
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
                      <th className="p-3">Laps</th>
                      <th className="p-3">Time/Retired</th>
                      <th className="p-3">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raceResults.map((result, index) => (
                      <tr
                        key={`${result.driver_name}-${index}`}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">{result.position}</td>
                        <td className="p-3 font-medium">{result.driver_name}</td>
                        <td className="p-3">{result.team_name}</td>
                        <td className="p-3">{result.grid}</td>
                        <td className="p-3">{result.laps}</td>
                        <td className="p-3">{result.time_retired}</td>
                        <td className="p-3">{result.points}</td>
                      </tr>
                    ))}
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