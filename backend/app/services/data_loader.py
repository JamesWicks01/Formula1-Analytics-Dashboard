from pathlib import Path
from typing import Dict, Optional

import pandas as pd

from app.utils.constants import RAW_DATA_DIR, SEASON_FILE_PATTERNS


def build_file_path(year: int, dataset_key: str) -> Path:
    filename = SEASON_FILE_PATTERNS[dataset_key].format(year=year)
    return RAW_DATA_DIR / filename


def load_csv_if_exists(file_path: Path) -> Optional[pd.DataFrame]:
    if not file_path.exists():
        return None
    return pd.read_csv(file_path)


def load_season_data(year: int) -> Dict[str, Optional[pd.DataFrame]]:
    season_data = {}

    for dataset_key in SEASON_FILE_PATTERNS:
        file_path = build_file_path(year, dataset_key)
        season_data[dataset_key] = load_csv_if_exists(file_path)

    return season_data


def list_available_files(year: int) -> Dict[str, bool]:
    available = {}

    for dataset_key in SEASON_FILE_PATTERNS:
        file_path = build_file_path(year, dataset_key)
        available[dataset_key] = file_path.exists()

    return available