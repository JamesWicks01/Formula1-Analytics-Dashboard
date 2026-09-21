from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"

# FastF1's modern event schedule coverage starts in 2018.
SUPPORTED_SEASONS = list(range(2018, datetime.now(timezone.utc).year + 1))

SEASON_FILE_PATTERNS = {
    "calendar": "Formula1_{year}season_calendar.csv",
    "drivers": "Formula1_{year}season_drivers.csv",
    "teams": "Formula1_{year}season_teams.csv",
    "qualifying": "Formula1_{year}season_qualifyingResults.csv",
    "race_results": "Formula1_{year}season_raceResults.csv",
    "sprint_results": "Formula1_{year}season_sprintResults.csv",
    "driver_of_the_day": "Formula1_{year}season_driverOfTheDayVotes.csv",
}
