"""Offline regression coverage. Run: python -m unittest discover -s tests -v."""
from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
import unittest
from unittest.mock import patch, MagicMock

import pandas as pd
from fastapi.testclient import TestClient
from fastf1.events import EventSchedule

from app.main import app
from app.services import season_service as service
from app.services.fastf1_service import load_fastf1_season, normalize_results
from app.services.metrics import calculate_driver_stats


def sample_results():
    return pd.DataFrame({
        "FullName": ["Max Verstappen", "Sergio Perez", "Lewis Hamilton"],
        "TeamName": ["Red Bull", "Red Bull", "Mercedes"],
        "DriverNumber": ["1", "11", "44"], "Position": [1., 2., 3.],
        "GridPosition": [1., 0., 2.], "Laps": [57., 56., 20.],
        "Points": [25., 18., 0.], "Status": ["Finished", "+1 Lap", "Engine"],
    })


def sample_data():
    results = normalize_results(sample_results(), 1, "Bahrain Grand Prix")
    return {"race_results": results,
            "calendar": pd.DataFrame({"round": [1], "grand_prix": ["Bahrain Grand Prix"]}),
            "drivers": results[["driver_name"]],
            "teams": results[["team_name"]].drop_duplicates()}


class Phase1Tests(unittest.TestCase):
    def setUp(self):
        service._cache.clear()
        self.client = TestClient(app)

    def test_normalization_and_dnf(self):
        data = sample_data()
        stats = calculate_driver_stats(data["race_results"]).set_index("driver_name")
        self.assertEqual(stats.loc["Lewis Hamilton", "dnfs"], 1)
        self.assertEqual(stats.loc["Sergio Perez", "dnfs"], 0)
        self.assertEqual(data["race_results"]["round"].tolist(), [1, 1, 1])
        invalid = sample_results()
        invalid["Points"] = float("nan")
        with self.assertRaises(ValueError):
            normalize_results(invalid, 1, "Bahrain")
        invalid = sample_results()
        invalid["Position"] = 0
        with self.assertRaises(ValueError):
            normalize_results(invalid, 1, "Bahrain")

    def test_schedule_future_events_and_lightweight_loading(self):
        schedule = EventSchedule([
            {"RoundNumber": 1, "EventName": "Bahrain Grand Prix", "EventDate": "2023-03-05",
             "Country": "Bahrain", "Location": "Sakhir", "Session5": "Race",
             "Session5DateUtc": "2023-03-05 15:00:00"},
            {"RoundNumber": 2, "EventName": "Future Grand Prix", "EventDate": "2099-03-05",
             "Country": "Future", "Location": "Future", "Session5": "Race",
             "Session5DateUtc": "2099-03-05 15:00:00"},
        ], year=2023)
        session = MagicMock(results=sample_results())
        cache_dir = "test-cache"
        with patch("app.services.fastf1_service.Path.mkdir") as mkdir, \
                patch.dict("os.environ", {"FASTF1_CACHE_DIR": cache_dir}), \
                patch("app.services.fastf1_service.fastf1.Cache.enable_cache") as cache, \
                patch("app.services.fastf1_service.fastf1.get_event_schedule", return_value=schedule) as fetch, \
                patch("fastf1.events.Event.get_session", return_value=session):
            data = load_fastf1_season(2023)
            fetch.assert_called_once_with(2023, include_testing=False)
            cache.assert_called_once_with(cache_dir)
            mkdir.assert_called_once_with(parents=True, exist_ok=True)
            session.load.assert_called_once_with(laps=False, telemetry=False, weather=False, messages=False)
        self.assertEqual(len(data["calendar"]), 2)
        self.assertEqual(data["race_results"]["round"].unique().tolist(), [1])

    def check_page_contracts(self):
        for endpoint in ["overview", "drivers", "drivers/stats", "teams", "teams/stats",
                         "races", "analytics/wins", "analytics/podiums", "analytics/points-trend",
                         "preview", "schedule", "status"]:
            response = self.client.get(f"/api/season/2023/{endpoint}")
            self.assertEqual(response.status_code, 200, (endpoint, response.text))
        drivers = self.client.get("/api/season/2023/drivers").json()["drivers"]
        response = self.client.get("/api/season/2023/drivers/compare", params={"driver1": drivers[0], "driver2": drivers[1]})
        self.assertEqual(response.status_code, 200)
        races = self.client.get("/api/season/2023/races").json()["races"]
        response = self.client.get(f"/api/season/2023/races/{races[0]}")
        self.assertEqual(response.status_code, 200)
        self.assertTrue({"driver_name", "team_name", "grid", "position", "laps", "points", "time_retired"}.issubset(response.json()["results"][0]))

    def test_all_pages_fastf1(self):
        with patch.object(service, "load_fastf1_season", return_value=sample_data()) as fetch:
            self.check_page_contracts()
            self.assertEqual(self.client.get("/api/season/2023/status").json()["source"], "fastf1")
            fetch.assert_called_once_with(2023)

    def test_all_pages_real_csv_fallback(self):
        with patch.object(service, "load_fastf1_season", side_effect=ConnectionError("offline")):
            self.check_page_contracts()
            status = self.client.get("/api/season/2023/status").json()
            self.assertTrue(status["fallback"])
            self.assertEqual(status["completed_races"], 22)
            self.assertEqual(self.client.get("/api/season/2023/overview").json()["wins_leader"], "Max Verstappen")

    def test_failure_without_csv_and_retry(self):
        with patch.object(service, "load_fastf1_season", side_effect=ConnectionError("offline")) as fetch:
            for _ in range(2):
                response = self.client.get("/api/season/2024/drivers/stats")
                self.assertEqual(response.status_code, 503)
                self.assertEqual(response.headers["Retry-After"], "60")
            fetch.assert_called_once()
        with patch.object(service, "monotonic", return_value=float("inf")), \
                patch.object(service, "load_fastf1_season", return_value=sample_data()):
            self.assertEqual(service.get_season(2024)[1]["source"], "fastf1")

    def test_season_validation(self):
        self.assertIn(2024, self.client.get("/api/seasons").json()["seasons"])
        with patch.object(service, "load_fastf1_season") as fetch:
            for endpoint in ["overview", "drivers", "drivers/stats", "teams", "teams/stats", "races", "status", "schedule", "analytics/wins"]:
                self.assertEqual(self.client.get(f"/api/season/1900/{endpoint}").status_code, 404)
            fetch.assert_not_called()

    def test_concurrent_cache_isolation_and_expiry(self):
        with patch.object(service, "load_fastf1_season", side_effect=lambda year: deepcopy(sample_data())) as fetch:
            with ThreadPoolExecutor(max_workers=4) as pool:
                list(pool.map(service.get_season, [2023] * 4))
            self.assertEqual(fetch.call_count, 1)
            data, _ = service.get_season(2023)
            data["race_results"].loc[0, "points"] = -1
            self.assertEqual(service.get_season(2023)[0]["race_results"].loc[0, "points"], 25)
            service.get_season(2024)
            self.assertEqual(fetch.call_count, 2)
            with patch.object(service, "monotonic", return_value=float("inf")):
                service.get_season(2023)
            self.assertEqual(fetch.call_count, 3)

    def test_empty_season_and_missing_driver(self):
        data = sample_data()
        for key in ("race_results", "drivers", "teams"):
            data[key] = data[key].iloc[:0]
        with patch.object(service, "load_fastf1_season", return_value=data):
            self.assertEqual(self.client.get("/api/season/2023/drivers/stats").json(), [])
            self.assertEqual(self.client.get("/api/season/2023/drivers/compare", params={"driver1": "A", "driver2": "B"}).status_code, 404)


if __name__ == "__main__":
    unittest.main()
