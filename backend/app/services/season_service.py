"""Select a complete source per season and cache successes and failures."""
from copy import deepcopy
from datetime import datetime, timezone
import logging
from threading import Lock
from time import monotonic

from app.services.cleaner import clean_season_data
from app.services.data_loader import load_csv_season_data
from app.services.fastf1_service import load_fastf1_season
from app.utils.constants import SUPPORTED_SEASONS

logger = logging.getLogger(__name__)
CACHE_TTL = 3600
RETRY_TTL = 60
_cache = {}
_locks = {year: Lock() for year in SUPPORTED_SEASONS}


class UnsupportedSeason(ValueError):
    pass


class DataUnavailable(RuntimeError):
    pass


def get_season(year):
    if year not in SUPPORTED_SEASONS:
        raise UnsupportedSeason("Season not supported")
    with _locks[year]:
        cached = _cache.get(year)
        if cached and monotonic() < cached[0]:
            if cached[1] is None:
                raise DataUnavailable(cached[2]["message"])
            data, status = deepcopy(cached[1:])
            status["cached"] = True
            return data, status
        source, message, ttl = "fastf1", None, CACHE_TTL
        try:
            data = load_fastf1_season(year)
        except Exception:
            logger.warning("FastF1 failed for season %s", year, exc_info=True)
            source, ttl = "csv", RETRY_TTL
            message = "FastF1 is unavailable or its results are incomplete. Showing local CSV data."
            try:
                data = clean_season_data(load_csv_season_data(year))
                results = data.get("race_results")
                required = {"driver_name", "team_name", "position", "points", "grand_prix", "round"}
                if results is None or results.empty or not required.issubset(results.columns):
                    raise ValueError("No usable CSV results")
            except Exception:
                message = f"Data for {year} is temporarily unavailable and no usable CSV fallback exists. Please retry shortly."
                status = {"season": year, "source": "unavailable", "message": message}
                _cache[year] = (monotonic() + RETRY_TTL, None, status)
                raise DataUnavailable(message) from None
        status = {
            "season": year, "source": source, "cached": False,
            "fallback": source == "csv", "message": message,
            "loaded_at": datetime.now(timezone.utc).isoformat(),
            "completed_races": int(data["race_results"]["round"].nunique()),
        }
        _cache[year] = (monotonic() + ttl, deepcopy(data), status)
        return data, deepcopy(status)
