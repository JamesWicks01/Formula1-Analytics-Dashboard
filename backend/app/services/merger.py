from typing import Dict, Optional

import pandas as pd


def find_merge_keys(*dfs: Optional[pd.DataFrame]) -> list[str]:
    candidate_keys = ["round", "grand_prix", "driver_name", "team_name"]

    valid_keys = []
    for key in candidate_keys:
        if all(df is not None and key in df.columns for df in dfs):
            valid_keys.append(key)

    return valid_keys


def merge_race_and_qualifying(
    race_results: Optional[pd.DataFrame],
    qualifying: Optional[pd.DataFrame],
) -> Optional[pd.DataFrame]:
    if race_results is None:
        return None

    if qualifying is None:
        return race_results.copy()

    merge_keys = find_merge_keys(race_results, qualifying)
    if not merge_keys:
        return race_results.copy()

    qualifying_cols = [
        col for col in qualifying.columns
        if col in merge_keys or col in ["position", "q1", "q2", "q3"]
    ]

    qualifying_subset = qualifying[qualifying_cols].copy()

    if "position" in qualifying_subset.columns:
        qualifying_subset = qualifying_subset.rename(columns={"position": "qualifying_position"})

    merged = race_results.merge(
        qualifying_subset,
        on=merge_keys,
        how="left",
        suffixes=("", "_quali"),
    )

    return merged


def merge_driver_of_the_day(
    base_df: Optional[pd.DataFrame],
    dotd_df: Optional[pd.DataFrame],
) -> Optional[pd.DataFrame]:
    if base_df is None:
        return None

    if dotd_df is None:
        return base_df.copy()

    possible_keys = ["round", "grand_prix", "driver_name"]
    merge_keys = [key for key in possible_keys if key in base_df.columns and key in dotd_df.columns]

    if not merge_keys:
        return base_df.copy()

    extra_cols = [col for col in dotd_df.columns if col in merge_keys or "vote" in col or "driver_of_the_day" in col]
    dotd_subset = dotd_df[extra_cols].copy()

    merged = base_df.merge(
        dotd_subset,
        on=merge_keys,
        how="left",
        suffixes=("", "_dotd"),
    )

    return merged


def merge_sprint_results(
    base_df: Optional[pd.DataFrame],
    sprint_df: Optional[pd.DataFrame],
) -> Optional[pd.DataFrame]:
    if base_df is None:
        return None

    if sprint_df is None:
        return base_df.copy()

    possible_keys = ["round", "grand_prix", "driver_name", "team_name"]
    merge_keys = [key for key in possible_keys if key in base_df.columns and key in sprint_df.columns]

    if not merge_keys:
        return base_df.copy()

    sprint_cols = [
        col for col in sprint_df.columns
        if col in merge_keys or col in ["position", "points", "grid"]
    ]

    sprint_subset = sprint_df[sprint_cols].copy().rename(
        columns={
            "position": "sprint_position",
            "points": "sprint_points",
            "grid": "sprint_grid",
        }
    )

    merged = base_df.merge(
        sprint_subset,
        on=merge_keys,
        how="left",
        suffixes=("", "_sprint"),
    )

    return merged


def attach_calendar_info(
    base_df: Optional[pd.DataFrame],
    calendar_df: Optional[pd.DataFrame],
) -> Optional[pd.DataFrame]:
    if base_df is None:
        return None

    if calendar_df is None:
        return base_df.copy()

    possible_keys = ["round", "grand_prix"]
    merge_keys = [key for key in possible_keys if key in base_df.columns and key in calendar_df.columns]

    if not merge_keys:
        return base_df.copy()

    calendar_cols = [col for col in calendar_df.columns if col not in ["driver_name", "team_name"]]
    calendar_subset = calendar_df[calendar_cols].drop_duplicates()

    merged = base_df.merge(calendar_subset, on=merge_keys, how="left", suffixes=("", "_calendar"))
    return merged


def attach_driver_info(
    base_df: Optional[pd.DataFrame],
    drivers_df: Optional[pd.DataFrame],
) -> Optional[pd.DataFrame]:
    if base_df is None:
        return None

    if drivers_df is None:
        return base_df.copy()

    possible_keys = ["driver_name"]
    merge_keys = [key for key in possible_keys if key in base_df.columns and key in drivers_df.columns]

    if not merge_keys:
        return base_df.copy()

    driver_subset = drivers_df.drop_duplicates()
    merged = base_df.merge(driver_subset, on=merge_keys, how="left", suffixes=("", "_driver"))
    return merged


def attach_team_info(
    base_df: Optional[pd.DataFrame],
    teams_df: Optional[pd.DataFrame],
) -> Optional[pd.DataFrame]:
    if base_df is None:
        return None

    if teams_df is None:
        return base_df.copy()

    possible_keys = ["team_name"]
    merge_keys = [key for key in possible_keys if key in base_df.columns and key in teams_df.columns]

    if not merge_keys:
        return base_df.copy()

    team_subset = teams_df.drop_duplicates()
    merged = base_df.merge(team_subset, on=merge_keys, how="left", suffixes=("", "_team"))
    return merged


def build_merged_season_dataset(season_data: Dict[str, Optional[pd.DataFrame]]) -> Optional[pd.DataFrame]:
    merged = merge_race_and_qualifying(
        season_data.get("race_results"),
        season_data.get("qualifying"),
    )

    merged = merge_sprint_results(merged, season_data.get("sprint_results"))
    merged = merge_driver_of_the_day(merged, season_data.get("driver_of_the_day"))
    merged = attach_calendar_info(merged, season_data.get("calendar"))
    merged = attach_driver_info(merged, season_data.get("drivers"))
    merged = attach_team_info(merged, season_data.get("teams"))

    return merged