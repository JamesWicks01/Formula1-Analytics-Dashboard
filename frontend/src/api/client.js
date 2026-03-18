const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchSeasonOverview(year) {
  const response = await fetch(`${API_BASE_URL}/api/season/${year}/overview`);

  if (!response.ok) {
    throw new Error("Failed to fetch season overview");
  }

  return response.json();
}