import pandas as pd


def calculate_driver_stats(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame()

    # Ensure required columns exist
    required = ["driver_name", "position", "points"]
    for col in required:
        if col not in df.columns:
            return pd.DataFrame()

    stats = df.copy()

    # Wins
    stats["win"] = stats["position"] == 1

    # Podiums
    stats["podium"] = stats["position"].isin([1, 2, 3])

    # DNF detection (position is NaN or non-numeric)
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

    if "round" not in df.columns or "driver_name" not in df.columns or "points" not in df.columns:
        return []

    trend_df = df[["round", "grand_prix", "driver_name", "points"]].copy()

    trend_df["round"] = pd.to_numeric(trend_df["round"], errors="coerce")
    trend_df["points"] = pd.to_numeric(trend_df["points"], errors="coerce").fillna(0)

    trend_df = trend_df.dropna(subset=["round", "driver_name"])
    trend_df = trend_df.sort_values(by=["driver_name", "round"])

    trend_df["cumulative_points"] = trend_df.groupby("driver_name")["points"].cumsum()

    return trend_df.to_dict(orient="records")


def calculate_position_change(df: pd.DataFrame):
    if df is None:
        return pd.DataFrame()

    if "grid" not in df.columns or "position" not in df.columns:
        return pd.DataFrame()

    df = df.copy()
    df["positions_gained"] = df["grid"] - df["position"]

    return df