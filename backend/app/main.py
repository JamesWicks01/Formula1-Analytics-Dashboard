from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Formula 1 Analytics API",
    version="1.0.0"
)

# Allow frontend to connect
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
    return {"seasons": [2023, 2024, 2025]}

@app.get("/api/season/{year}/overview")
def get_season_overview(year: int):
    # placeholder data for now
    return {
        "season": year,
        "total_races": 22,
        "total_drivers": 20,
        "total_teams": 10,
        "wins_leader": "Max Verstappen"
    }