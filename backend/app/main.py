from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.services.cleaner import clean_season_data
from app.services.data_loader import list_available_files, load_season_data
from app.services.merger import build_merged_season_dataset
from app.utils.constants import SUPPORTED_SEASONS

from app.services.metrics import (
    calculate_driver_stats,
    calculate_team_stats,
    calculate_wins,
    calculate_podiums,
    calculate_points_trend,
)

app = FastAPI(
    title="Formula 1 Analytics API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Formula 1 Analytics API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/seasons")
def get_seasons():
    return {"seasons": SUPPORTED_SEASONS}


@app.get("/api/season/{year}/files")
def get_season_files(year: int):
    if year not in SUPPORTED_SEASONS:
        raise HTTPException(status_code=404, detail="Season not supported")

    return {
        "season": year,
        "files": list_available_files(year)
    }


@app.get("/api/season/{year}/preview")
def preview_merged_data(year: int):
    if year not in SUPPORTED_SEASONS:
        raise HTTPException(status_code=404, detail="Season not supported")

    season_data = load_season_data(year)
    cleaned_data = clean_season_data(season_data)
    merged_df = build_merged_season_dataset(cleaned_data)

    if merged_df is None or merged_df.empty:
        raise HTTPException(status_code=404, detail="No merged data available")

    preview_rows = merged_df.head(10).fillna("").to_dict(orient="records")

    return {
        "season": year,
        "row_count": len(merged_df),
        "columns": merged_df.columns.tolist(),
        "preview": preview_rows,
    }


@app.get("/api/season/{year}/overview")
def get_season_overview(year: int):
    if year not in SUPPORTED_SEASONS:
        raise HTTPException(status_code=404, detail="Season not supported")

    season_data = load_season_data(year)
    cleaned_data = clean_season_data(season_data)

    race_results = cleaned_data.get("race_results")
    drivers = cleaned_data.get("drivers")
    teams = cleaned_data.get("teams")
    calendar = cleaned_data.get("calendar")

    if race_results is None:
        raise HTTPException(status_code=404, detail="Race results file missing")

    total_races = len(calendar["round"].dropna().unique()) if calendar is not None and "round" in calendar.columns else None
    total_drivers = len(drivers["driver_name"].dropna().unique()) if drivers is not None and "driver_name" in drivers.columns else None
    total_teams = len(teams["team_name"].dropna().unique()) if teams is not None and "team_name" in teams.columns else None

    wins_leader = None
    if "position" in race_results.columns and "driver_name" in race_results.columns:
        winners = race_results[race_results["position"] == 1]
        if not winners.empty:
            wins_leader = winners["driver_name"].value_counts().idxmax()

    return {
        "season": year,
        "total_races": total_races,
        "total_drivers": total_drivers,
        "total_teams": total_teams,
        "wins_leader": wins_leader,
    }

@app.get("/api/season/{year}/drivers")
def get_drivers(year: int):
    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    if df is None:
        raise HTTPException(status_code=404, detail="No race data")

    drivers = sorted(df["driver_name"].dropna().unique())
    return {"drivers": drivers}

@app.get("/api/season/{year}/drivers/stats")
def get_driver_stats(year: int):
    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    stats = calculate_driver_stats(df)

    return stats.fillna(0).to_dict(orient="records")

@app.get("/api/season/{year}/drivers/compare")
def compare_drivers(year: int, driver1: str, driver2: str):
    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    stats = calculate_driver_stats(df)

    d1 = stats[stats["driver_name"] == driver1]
    d2 = stats[stats["driver_name"] == driver2]

    if d1.empty or d2.empty:
        raise HTTPException(status_code=404, detail="Driver not found")

    return {
        "driver1": d1.fillna(0).to_dict(orient="records")[0],
        "driver2": d2.fillna(0).to_dict(orient="records")[0],
    }

@app.get("/api/season/{year}/teams")
def get_teams(year: int):
    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    teams = sorted(df["team_name"].dropna().unique())

    return {"teams": teams}

@app.get("/api/season/{year}/teams/stats")
def get_team_stats(year: int):
    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    stats = calculate_team_stats(df)

    return stats.fillna(0).to_dict(orient="records")

@app.get("/api/season/{year}/races")
def get_races(year: int):
    if year not in SUPPORTED_SEASONS:
        raise HTTPException(status_code=404, detail="Season not supported")

    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No race data")

    if "grand_prix" not in df.columns:
        raise HTTPException(
            status_code=500,
            detail=f"No grand_prix column found. Available columns: {df.columns.tolist()}"
        )

    races = sorted(df["grand_prix"].dropna().astype(str).unique())

    return {
        "season": year,
        "races": races,
    }

@app.get("/api/season/{year}/races/{race_name}")
def get_race_details(year: int, race_name: str):
    if year not in SUPPORTED_SEASONS:
        raise HTTPException(status_code=404, detail="Season not supported")

    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    if df is None or df.empty:
        raise HTTPException(status_code=404, detail="No race data")

    if "grand_prix" not in df.columns:
        raise HTTPException(
            status_code=500,
            detail=f"No grand_prix column found. Available columns: {df.columns.tolist()}"
        )

    race_df = df[df["grand_prix"].astype(str) == race_name]

    if race_df.empty:
        raise HTTPException(status_code=404, detail="Race not found")

    return {
        "season": year,
        "race": race_name,
        "results": race_df.fillna("").to_dict(orient="records"),
    }

@app.get("/api/season/{year}/analytics/wins")
def get_wins(year: int):
    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    return calculate_wins(df)

@app.get("/api/season/{year}/analytics/podiums")
def get_podiums(year: int):
    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    return calculate_podiums(df)

@app.get("/api/season/{year}/analytics/points-trend")
def get_points_trend(year: int):
    season_data = load_season_data(year)
    cleaned = clean_season_data(season_data)

    df = cleaned.get("race_results")
    return calculate_points_trend(df)