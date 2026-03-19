from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.services.cleaner import clean_season_data
from app.services.data_loader import list_available_files, load_season_data
from app.services.merger import build_merged_season_dataset
from app.utils.constants import SUPPORTED_SEASONS

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