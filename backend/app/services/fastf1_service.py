"""Translate FastF1 results to the dashboard's existing dataset contract."""
import os
from pathlib import Path
from threading import Lock

import fastf1
import pandas as pd

from app.utils.constants import DATA_DIR, SEASON_FILE_PATTERNS

_lock = Lock()
RESULT_COLUMNS = [
    "round", "grand_prix", "driver_name", "team_name", "no", "position",
    "grid", "laps", "points", "time_retired", "is_dnf",
]


def normalize_results(results, round_number, event_name):
    required = {"FullName", "TeamName", "Position", "Points", "Status", "GridPosition", "Laps"}
    if results is None or results.empty or not required.issubset(results.columns):
        raise ValueError(f"Results unavailable for round {round_number}")
    df = pd.DataFrame(results).rename(columns={
        "FullName": "driver_name", "TeamName": "team_name",
        "DriverNumber": "no", "Position": "position", "GridPosition": "grid",
        "Laps": "laps", "Points": "points", "Status": "time_retired",
    }).copy()
    for col in ("position", "grid", "laps", "points"):
        df[col] = pd.to_numeric(df.get(col, float("nan")), errors="coerce")
    # FastF1 can return a driver list even when race results are not published.
    if (not df["position"].gt(0).any() or df["points"].isna().any()
            or df["driver_name"].fillna("").eq("").any()
            or df["team_name"].fillna("").eq("").any()
            or df["time_retired"].fillna("").eq("").any()):
        raise ValueError(f"Incomplete results for round {round_number}")
    df["position"] = df["position"].where(df["position"] > 0)
    df["round"] = int(round_number)
    df["grand_prix"] = event_name
    df["is_dnf"] = ~df["time_retired"].str.fullmatch(r"Finished|\+\d+ Laps?", na=False)
    return df.reindex(columns=RESULT_COLUMNS)


def load_fastf1_season(year):
    # FastF1 configures a process-wide cache. Serialize access to its client.
    with _lock:
        cache_dir = DATA_DIR / "cache" / "fastf1"
        if os.getenv("FASTF1_CACHE_DIR"):
            cache_dir = Path(os.environ["FASTF1_CACHE_DIR"])
        cache_dir.mkdir(parents=True, exist_ok=True)
        fastf1.Cache.enable_cache(str(cache_dir))
        schedule = fastf1.get_event_schedule(year, include_testing=False)
        if schedule is None or schedule.empty:
            raise ValueError("Season schedule unavailable")
        schedule = schedule[schedule["RoundNumber"] > 0].sort_values("RoundNumber")
        calendar = pd.DataFrame({
            "round": schedule["RoundNumber"].astype(int),
            "grand_prix": schedule["EventName"],
            "date": pd.to_datetime(schedule["EventDate"]).dt.strftime("%Y-%m-%d"),
            "country": schedule["Country"],
            "location": schedule["Location"],
        }).reset_index(drop=True)
        races = []
        now = pd.Timestamp.now(tz="UTC")
        for _, event in schedule.iterrows():
            # EventDate may be midnight; use the actual race start when supplied.
            race_date = pd.NaT
            for slot in range(1, 6):
                if event.get(f"Session{slot}") == "Race":
                    race_date = pd.to_datetime(event.get(f"Session{slot}DateUtc"), utc=True)
                    break
            if pd.isna(race_date):
                race_date = pd.to_datetime(event["EventDate"], utc=True) + pd.Timedelta(days=1)
            if race_date + pd.Timedelta(hours=4) > now:
                continue
            session = schedule.get_event_by_round(int(event["RoundNumber"])).get_session("R")
            session.load(laps=False, telemetry=False, weather=False, messages=False)
            races.append(normalize_results(session.results, event["RoundNumber"], event["EventName"]))
        results = pd.concat(races, ignore_index=True) if races else pd.DataFrame(columns=RESULT_COLUMNS)
        data = dict.fromkeys(SEASON_FILE_PATTERNS)
        data.update({
            "calendar": calendar,
            "race_results": results,
            "drivers": results[["driver_name"]].drop_duplicates(),
            "teams": results[["team_name"]].drop_duplicates(),
        })
        return data
