const API_BASE_URL = "http://127.0.0.1:8000";

async function fetchJson(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function fetchSeasons() {
  return fetchJson(`/api/seasons`);
}

export function fetchSeasonOverview(year) {
  return fetchJson(`/api/season/${year}/overview`);
}

export function fetchDrivers(year) {
  return fetchJson(`/api/season/${year}/drivers`);
}

export function fetchDriverStats(year) {
  return fetchJson(`/api/season/${year}/drivers/stats`);
}

export function compareDrivers(year, driver1, driver2) {
  return fetchJson(
    `/api/season/${year}/drivers/compare?driver1=${encodeURIComponent(driver1)}&driver2=${encodeURIComponent(driver2)}`
  );
}

export function fetchTeamStats(year) {
  return fetchJson(`/api/season/${year}/teams/stats`);
}

export function fetchRaces(year) {
  return fetchJson(`/api/season/${year}/races`);
}

export function fetchRaceDetails(year, raceName) {
  return fetchJson(`/api/season/${year}/races/${encodeURIComponent(raceName)}`);
}

export function fetchWins(year) {
  return fetchJson(`/api/season/${year}/analytics/wins`);
}

export function fetchPodiums(year) {
  return fetchJson(`/api/season/${year}/analytics/podiums`);
}

export function fetchPointsTrend(year) {
  return fetchJson(`/api/season/${year}/analytics/points-trend`);
}