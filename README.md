# 🏎️ Formula 1 Analytics Dashboard


A full-stack web application for exploring and analysing Formula 1 race data using real datasets.  
Built with **FastAPI (backend)** and **React + Vite (frontend)**.


---


## 🚀 Features


### 📊 Dashboard
- Season overview (races, drivers, teams)
- Wins leaderboard
- Podiums leaderboard
- Cumulative points trend chart (top drivers)
- Season selector


### 👨‍🏎️ Drivers Page
- Driver statistics table:
  - Races, wins, podiums, points
  - Average finish
  - DNFs
- Search and sorting:
  - Points, wins, podiums, DNFs, name
- Driver comparison tool:
  - Compare two drivers side-by-side
  - Stats: races, wins, podiums, points, avg finish, DNFs


### 🏁 Teams Page
- Team statistics table:
  - Races, wins, podiums, points
  - Average finish
- Search and sorting


### 🏎️ Race Explorer
- Select any race from the season
- Full race results table
- Features:
  - Positions gained (grid → finish)
  - DNFs moved to bottom of table
  - Highlighted:
    - 🟡 Winner
    - 🟢 Biggest Gainer
    - 🔴 Biggest Loser
  - Race summary cards:
    - Biggest Gainer
    - Biggest Loser


---


## 🧠 Backend (FastAPI)


### Features
- CSV data loading for season datasets
- Data cleaning and column normalization
- API endpoints for:
  - Season overview
  - Drivers stats
  - Teams stats
  - Race list and race results
  - Driver comparison
  - Analytics:
    - Wins
    - Podiums
    - Points trend


### Tech Stack
- FastAPI
- Pandas


---


## 🎨 Frontend (React)


### Features
- Multi-page app with routing
- Reusable components:
  - Layout
  - Navbar
  - Stat cards
  - Charts
  - Loading & error states
- Interactive charts using Recharts:
  - Wins (bar chart)
  - Podiums (bar chart)
  - Points trend (line chart)


### Tech Stack
- React + Vite
- Tailwind CSS
- Recharts


---


## ⚙️ Setup


### 1. Backend




```bash
cd backend
pip install -r requirements.txt
Backend runs at:
```
http://127.0.0.1:8000




### 2. Frontend


```bash
cd frontend
npm install
npm run dev
```
Frontend runs at:
http://localhost:5173


---


## 📌 Notes
* Designed to work with F1 datasets from: [https://github.com/toUpperCase78/formula1-datasets](https://github.com/toUpperCase78/formula1-datasets)
* Currently focused on the 2023 season (expandable)

---


## 📸 Screenshots


*Add screenshots here (Dashboard, Drivers, Race Explorer, etc.)*


---


## 🏁 Summary
This project demonstrates:

* Full-stack development
* Data processing with Pandas
* REST API design with FastAPI
* Interactive UI with React
* Data visualisation with charts
