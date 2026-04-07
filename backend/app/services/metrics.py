import pandas as pd


def calculate_driver_stats(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame()

    required = ["driver_name", "position", "points"]
    for col in required:
        if col not in df.columns:
            return pd.DataFrame()

    stats = df.copy()

    stats["position"] = pd.to_numeric(stats["position"], errors="coerce")
    stats["points"] = pd.to_numeric(stats["points"], errors="coerce").fillna(0)

    stats["win"] = stats["position"] == 1
    stats["podium"] = stats["position"].isin([1, 2, 3])

    if "time_retired" in stats.columns:
        stats["dnf"] = (
            stats["time_retired"]
            .astype(str)
            .str.contains("retired|dnf|dns|dsq", case=False, na=False)
        )
    else:
        stats["dnf"] = stats["position"].isna()

    grouped = stats.groupby("driver_name").agg(
        races=("driver_name", "count"),
        wins=("win", "sum"),
        podiums=("podium", "sum"),
        points=("points", "sum"),
        avg_finish=("position", "mean"),
        dnfs=("dnf", "sum"),
    )

    return grouped.reset_index().sort_values(by="points", ascending=False)


def calculate_team_stats(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty or "team_name" not in df.columns:
        return pd.DataFrame()

    stats = df.copy()

    stats["win"] = stats["position"] == 1
    stats["podium"] = stats["position"].isin([1, 2, 3])

    grouped = stats.groupby("team_name").agg(
        races=("team_name", "count"),
        wins=("win", "sum"),
        podiums=("podium", "sum"),
        points=("points", "sum"),
        avg_finish=("position", "mean"),
    )

    return grouped.reset_index().sort_values(by="points", ascending=False)


def calculate_wins(df: pd.DataFrame):
    if df is None or "driver_name" not in df.columns:
        return []

    winners = df[df["position"] == 1]
    return winners["driver_name"].value_counts().to_dict()


def calculate_podiums(df: pd.DataFrame):
    if df is None:
        return {}

    podiums = df[df["position"].isin([1, 2, 3])]
    return podiums["driver_name"].value_counts().to_dict()


def calculate_points_trend(df: pd.DataFrame):
    if df is None or df.empty:
        return []

    required = ["round", "driver_name", "points"]
    for col in required:
        if col not in df.columns:
            return []

    trend_df = df.copy()
    trend_df["round"] = pd.to_numeric(trend_df["round"], errors="coerce")
    trend_df["points"] = pd.to_numeric(trend_df["points"], errors="coerce").fillna(0)

    if "grand_prix" not in trend_df.columns:
        trend_df["grand_prix"] = ""

    trend_df = trend_df.dropna(subset=["round", "driver_name"])
    trend_df = trend_df.sort_values(by=["driver_name", "round"])

    trend_df["cumulative_points"] = trend_df.groupby("driver_name")["points"].cumsum()

    return trend_df[["round", "grand_prix", "driver_name", "cumulative_points"]].to_dict(
        orient="records"
    )

def calculate_position_change(df: pd.DataFrame):
    if df is None:
        return pd.DataFrame()

    if "grid" not in df.columns or "position" not in df.columns:
        return pd.DataFrame()

    df = df.copy()
    df["positions_gained"] = df["grid"] - df["position"]

    return df