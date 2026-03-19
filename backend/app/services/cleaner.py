from typing import Dict, Optional

import pandas as pd


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("-", "_")
        .str.replace("/", "_")
        .str.replace(r"[()]", "", regex=True)
    )
    return df


def strip_string_values(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()
    return df


def normalize_text_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    likely_name_columns = [
        "grand_prix",
        "race",
        "race_name",
        "driver",
        "driver_name",
        "team",
        "constructor",
    ]

    for col in likely_name_columns:
        if col in df.columns:
            df[col] = (
                df[col]
                .astype(str)
                .str.strip()
                .str.replace(r"\s+", " ", regex=True)
            )

    return df


def convert_numeric_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    numeric_candidates = [
        "round",
        "position",
        "grid",
        "points",
        "q1",
        "q2",
        "q3",
        "laps",
    ]

    for col in numeric_candidates:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def add_common_aliases(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    rename_map = {}

    if "grand_prix" not in df.columns:
        if "race_name" in df.columns:
            rename_map["race_name"] = "grand_prix"
        elif "race" in df.columns:
            rename_map["race"] = "grand_prix"

    if "driver_name" not in df.columns and "driver" in df.columns:
        rename_map["driver"] = "driver_name"

    if "team_name" not in df.columns:
        if "team" in df.columns:
            rename_map["team"] = "team_name"
        elif "constructor" in df.columns:
            rename_map["constructor"] = "team_name"

    df = df.rename(columns=rename_map)
    return df


def clean_dataframe(df: Optional[pd.DataFrame]) -> Optional[pd.DataFrame]:
    if df is None:
        return None

    df = clean_column_names(df)
    df = strip_string_values(df)
    df = add_common_aliases(df)
    df = normalize_text_columns(df)
    df = convert_numeric_columns(df)

    return df


def clean_season_data(season_data: Dict[str, Optional[pd.DataFrame]]) -> Dict[str, Optional[pd.DataFrame]]:
    cleaned = {}

    for key, df in season_data.items():
        cleaned[key] = clean_dataframe(df)

    return cleaned