# 🏎️ Formula 1 Analytics Dashboard

A full-stack web application for exploring and analysing Formula 1 race data using real-world datasets.

Built with **FastAPI** (backend) and **React + Vite** (frontend), the dashboard provides interactive statistics, race analysis, driver comparisons, team performance, and data visualisations for the 2023 Formula 1 World Championship.

---

# 🌐 Live Demo

🚧 **A live demo is coming soon.**

Until then, you can run the project locally using the setup instructions below.

**GitHub Repository**

https://github.com/JamesWicks01/Formula1-Analytics-Dashboard

---

# 🚀 Features

## 📊 Dashboard

- Season overview
- Total races, drivers and teams
- Wins leaderboard
- Podiums leaderboard
- Cumulative points trend chart
- Season selector

---

## 👨‍🏎️ Drivers Page

- Driver statistics table
  - Races
  - Wins
  - Podiums
  - Points
  - Average finishing position
  - DNFs
- Search drivers
- Sort by:
  - Points
  - Wins
  - Podiums
  - DNFs
  - Name
- Driver comparison tool
- Multi-line cumulative points trend chart
- Individual driver colours on charts

---

## 🏁 Teams Page

- Team statistics table
- Total races
- Wins
- Podiums
- Championship points
- Average finishing position
- Search
- Sorting

---

## 🏎️ Race Explorer

- Browse every race in the season
- Interactive race selector
- Full classified race results
- Positions gained (Grid → Finish)
- DNFs automatically moved below classified finishers
- Unclassified drivers ordered by laps completed
- Race summary cards
  - Biggest Gainer
  - Biggest Loser
- Driver highlights
  - 🥇 Winner
  - 🥈 Second Place
  - 🥉 Third Place
  - 🟢 Biggest Gainer
  - 🔴 Biggest Loser

---

# 🧠 Backend (FastAPI)

## Features

- REST API
- CSV dataset loading
- Dataset cleaning and normalisation
- Driver statistics
- Team statistics
- Race results
- Driver comparison
- Analytics
  - Wins
  - Podiums
  - Points Trend

## Tech Stack

- Python
- FastAPI
- Pandas

---

# 🎨 Frontend (React)

## Features

- Multi-page application
- React Router
- Responsive interface
- Reusable components
  - Layout
  - Navigation Bar
  - Stat Cards
  - Charts
  - Loading States
  - Error States
- Interactive charts powered by Recharts
  - Wins Leaderboard
  - Podiums Leaderboard
  - Cumulative Points Trend

## Tech Stack

- React
- Vite
- Tailwind CSS
- Recharts

---

# 📁 Project Structure

```text
Formula1-Analytics-Dashboard/
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application
│   │   ├── models/                  # Pydantic models
│   │   └── services/
│   │       ├── cleaner.py           # Dataset cleaning
│   │       ├── loader.py            # CSV loading
│   │       ├── metrics.py           # Analytics calculations
│   │
│   ├── data/
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── LICENSE
└── README.md
```

---

# 📋 Requirements

Before running the project, ensure the following software is installed:

- Python **3.10** or later
- Node.js **18** or later (includes npm)
- Git

Verify your installation:

```bash
python --version
node --version
npm --version
git --version
```

---

# ⚙️ Setup

## 1. Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

## 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 📡 API Endpoints

```text
GET /api/seasons

GET /api/season/{year}/overview

GET /api/season/{year}/drivers

GET /api/season/{year}/drivers/stats

GET /api/season/{year}/drivers/compare

GET /api/season/{year}/teams/stats

GET /api/season/{year}/races

GET /api/season/{year}/races/{race_name}

GET /api/season/{year}/analytics/wins

GET /api/season/{year}/analytics/podiums

GET /api/season/{year}/analytics/points-trend
```

---

# 📌 Data Source

The project currently uses Formula 1 datasets from:

https://github.com/toUpperCase78/formula1-datasets

Future versions will migrate to **FastF1** as the primary data source while retaining CSV support as a fallback.

---

# 📸 Screenshots

Add screenshots of:

- Dashboard
- Drivers Page
- Teams Page
- Race Explorer
- Driver Comparison
- Cumulative Points Trend

---

# 🏁 Summary

This project demonstrates:

- Full-stack software development
- REST API development with FastAPI
- Data processing using Pandas
- Interactive user interfaces with React
- Responsive design with Tailwind CSS
- Data visualisation using Recharts
- Modern frontend and backend architecture
