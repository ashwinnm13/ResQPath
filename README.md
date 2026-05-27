<!-- BANNER SUGGESTION: Create a dark-themed banner (1280×640px) with a red emergency cross
     on the left, an animated map route line in the center, and "ResQPath" in bold white
     on the right. Tools: Figma / Canva / Adobe Express. -->

<div align="center">

# 🚑 ResQPath

### AI-Powered Emergency Dispatch & Ambulance Routing System

*Connecting the right ambulance to the right hospital — in seconds, not minutes.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Python](https://img.shields.io/badge/Python-3.12.14-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://resqpath-frontend.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-red?style=for-the-badge)](LICENSE)

**[🌐 Live Demo](https://resqpath-frontend.vercel.app/)** · **[📖 API Docs](https://your-backend-url/docs)** · **[🐛 Report Bug](https://github.com/ashwinnm13/ResQPath/issues)** · **[✨ Request Feature](https://github.com/ashwinnm13/ResQPath/issues)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Folder Structure](#-folder-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🎯 Overview

Every minute in a medical emergency is critical. In dense urban environments like Chennai, the gap between a distress call and ambulance arrival can be the difference between life and death — caused not by a lack of ambulances, but by **poor coordination, manual dispatch, and no real-time routing**.

**ResQPath** eliminates that gap.

It is a full-stack emergency dispatch platform that:
- Finds the **nearest available ambulance** to any incident using geospatial queries
- Scores and ranks **hospitals by composite priority** (proximity + capacity + trauma level)
- Fetches **real road routes** via OpenRouteService with automatic straight-line fallback
- Persists every **incident atomically** — ambulance status flips to `dispatched` in the same transaction

> **Real-world use case:** A 108 emergency operator receives a call. ResQPath surfaces the 3 closest available ambulances ranked by distance, shows the top 5 hospitals ranked by composite score, plots the optimal road route, and creates a dispatch record — all within a single API call chain, in under 500ms.

---

## ✨ Features

### 🗺️ Geospatial Intelligence
- `$nearSphere` queries on GeoJSON Point fields for accurate great-circle distance
- `2dsphere` indexes on both `ambulances` and `hospitals` collections
- Configurable search radius (default 15 km for ambulances, 50 km for hospitals)

### 🏥 Smart Hospital Ranking
- Composite scoring algorithm: **40% distance + 40% occupancy + 20% trauma level**
- Real-time available bed calculation (`beds × (1 - occupancy_rate)`)
- Trauma level weighting (Level 1 preferred over Level 2/3)

### 🚑 Incident Management
- Atomic dispatch transactions using Motor async sessions
- Full incident lifecycle: `dispatched → en_route → resolved`
- Populated refs: incident response includes full ambulance and hospital documents

### 🛣️ Real Road Routing
- OpenRouteService (ORS) integration for driving-car profile
- Returns encoded polyline, `duration_minutes`, and `distance_km`
- Graceful fallback to Haversine straight-line ETA on ORS timeout/rate-limit (never a 500)

### ⚡ Modern Backend
- Fully async FastAPI with Motor (async MongoDB driver)
- Pydantic v2 models with automatic OpenAPI/Swagger docs at `/docs`
- CORS configured for React frontend origin
- Lifespan-managed database connection (no deprecated `@app.on_event`)

### 🖥️ React Frontend
- Vite-powered React 18 SPA deployed on Vercel
- Three core views: Dashboard, Emergency Form, Dispatch View
- Axios for API communication, React Router v6 for navigation

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA UI scaffold |
| **Routing (FE)** | React Router DOM v6 | Client-side navigation |
| **HTTP Client** | Axios | API communication |
| **Backend** | FastAPI (Python 3.11) | Async REST API server |
| **DB Driver** | Motor (async) | Non-blocking MongoDB access |
| **Database** | MongoDB Atlas M0 | Geospatial document store |
| **Geo Index** | MongoDB 2dsphere | `$nearSphere` spatial queries |
| **Validation** | Pydantic v2 | Request/response schemas |
| **Routing API** | OpenRouteService | Real road route + polyline |
| **Config** | python-dotenv | Environment variable management |
| **Frontend Deploy** | Vercel | Global CDN, zero-config |
| **Backend Deploy** | *(Render / Railway recommended)* | Python ASGI hosting |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│              React 18 SPA  (Vercel CDN)                     │
│         Dashboard │ EmergencyForm │ DispatchView             │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / Axios
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                           │
│                                                             │
│  /ambulances/nearest  →  GeoQuery Service                   │
│  /hospitals           →  Composite Score Service            │
│  /incidents  (POST)   →  Atomic Dispatch Service            │
│  /incidents/{id}      →  Populated Ref Resolver             │
│  /route               →  ORS Integration + Fallback ETA     │
│                                                             │
│              Pydantic v2 • Motor • CORS                     │
└────────────┬─────────────────────────┬───────────────────────┘
             │ Motor (async)           │ httpx (async)
             ▼                         ▼
┌─────────────────────┐    ┌──────────────────────────┐
│   MongoDB Atlas     │    │   OpenRouteService API    │
│                     │    │                          │
│  ambulances         │    │  /v2/directions/          │
│    └─ 2dsphere idx  │    │     driving-car           │
│  hospitals          │    │                          │
│    └─ 2dsphere idx  │    │  Returns: polyline +      │
│  incidents          │    │  duration + distance      │
└─────────────────────┘    └──────────────────────────┘
```

### Request Flow — Emergency Dispatch

```
1. Operator enters incident coordinates + severity
       ↓
2. GET /ambulances/nearest?lat=&lng=
   → MongoDB $nearSphere → top 3 available units
       ↓
3. GET /hospitals?lat=&lng=&limit=5
   → Geo-sort → composite score → ranked list
       ↓
4. POST /incidents  { location, severity, ambulance_id, hospital_id }
   → Motor session transaction:
       INSERT incidents document
       UPDATE ambulances SET status="dispatched"
       ↓
5. GET /route?from_lat=&from_lng=&to_lat=&to_lng=
   → ORS road route → polyline + ETA
   → (fallback: Haversine × 1.3 road factor)
       ↓
6. DispatchView renders route on map + incident summary
```

---

## 📁 Folder Structure

```
ResQPath/
├── backend/                    # FastAPI Python service
│   ├── main.py                 # App factory, lifespan, router registration
│   ├── config.py               # dotenv loader — MONGO_URI, ORS_API_KEY, MAPS_API_KEY
│   ├── database.py             # Motor client, connect_db / close_db / get_db
│   ├── seed.py                 # Seeds 10 ambulances + 5 hospitals with GeoJSON coords
│   ├── verify_geo.py           # Smoke test: $nearSphere query validation
│   ├── routers/
│   │   ├── ambulances.py       # GET /ambulances/nearest
│   │   ├── hospitals.py        # GET /hospitals  (composite scoring)
│   │   ├── incidents.py        # POST /incidents, GET /incidents/{id}
│   │   └── routing.py          # GET /route  (ORS + fallback)
│   ├── models/
│   │   └── schemas.py          # Pydantic v2: AmbulanceResponse, HospitalResponse,
│   │                           #   IncidentCreate, IncidentResponse, SeverityLevel
│   ├── services/
│   │   └── routing.py          # get_route_ors(), straight_line_eta()
│   └── .env                    # ← never committed (in .gitignore)
│
├── frontend/                   # React 18 + Vite SPA
│   ├── src/
│   │   ├── App.jsx             # BrowserRouter + Route definitions
│   │   └── pages/
│   │       ├── Dashboard.jsx   # Overview / home
│   │       ├── EmergencyForm.jsx  # Incident creation form
│   │       └── DispatchView.jsx   # Live dispatch + route display
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore                  # venv/, node_modules/, .env, *.pkl, *.dll
└── README.md
```

---

## 🚀 Installation Guide

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| MongoDB Atlas | M0 free | [cloud.mongodb.com](https://cloud.mongodb.com) |
| ORS API Key | Free | [openrouteservice.org](https://openrouteservice.org) |

### 1. Clone the repository

```bash
git clone https://github.com/ashwinnm13/ResQPath.git
cd ResQPath
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn[standard] motor python-dotenv pydantic httpx
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

---

## 🔐 Environment Variables

Create `backend/.env` — **never commit this file**.

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/resqpath?retryWrites=true&w=majority

# OpenRouteService free API key (openrouteservice.org)
ORS_API_KEY=your_ors_token_here
ORS_BASE_URL=https://api.openrouteservice.org

# Google Maps API key (for future map integration)
MAPS_API_KEY=your_google_maps_key_here

APP_ENV=development
```

> Copy `backend/.env.example` as a starting point (see [missing files](#-readme-improvement-suggestions) section).

---

## ▶️ Running Locally

### Seed the database (first time only)

```bash
cd backend
source venv/bin/activate
python seed.py
# Output: Inserted 10 ambulances, 5 hospitals, geo indexes created
```

### Verify geospatial setup

```bash
python verify_geo.py
# Output: Nearest ambulance: AMB-01 | Driver: Ravi Kumar | Status: available
```

### Start the backend

```bash
uvicorn main:app --reload --port 8000
# API running at: http://localhost:8000
# Swagger docs at: http://localhost:8000/docs
```

### Start the frontend

```bash
cd ../frontend
npm run dev
# App running at: http://localhost:5173
```

---

## 📡 API Endpoints

Base URL: `http://localhost:8000`  
Interactive docs: [`/docs`](http://localhost:8000/docs)

### Ambulances

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/ambulances/nearest` | Nearest available ambulances by geo-coords |

**Query params:** `lat`, `lng`, `limit` (default 3), `max_distance_m` (default 15000)

```bash
curl "localhost:8000/ambulances/nearest?lat=13.0827&lng=80.2707&limit=3"
```

```json
{
  "count": 3,
  "ambulances": [
    { "unit_id": "AMB-01", "status": "available", "driver": "Ravi Kumar",
      "location": { "type": "Point", "coordinates": [80.2707, 13.0827] } }
  ]
}
```

---

### Hospitals

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/hospitals` | Hospitals ranked by composite score |

**Query params:** `lat`, `lng`, `limit` (default 5)  
**Composite score:** 40% distance + 40% occupancy rate + 20% trauma level penalty

```bash
curl "localhost:8000/hospitals?lat=13.0827&lng=80.2707&limit=5"
```

```json
{
  "count": 5,
  "hospitals": [
    { "name": "Apollo Hospital", "available_beds": 56,
      "composite_score": 0.312, "distance_m": 1240, "trauma_level": 1 }
  ]
}
```

---

### Incidents

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/incidents` | Create incident + dispatch ambulance (atomic) |
| `GET` | `/incidents/{id}` | Fetch incident with populated ambulance & hospital |

**POST body:**

```json
{
  "location": { "type": "Point", "coordinates": [80.2707, 13.0827] },
  "severity": "high",
  "description": "Road accident, 2 casualties",
  "caller_phone": "+91-9876543210",
  "ambulance_id": "AMB-01",
  "hospital_id": "64f3a2b1c9e77f001e3d4521"
}
```

**Severity enum:** `low` | `medium` | `high` | `critical`

```bash
# After POST, verify ambulance status flipped:
# db.ambulances.findOne({unit_id: "AMB-01"}) → status: "dispatched"
```

---

### Routing

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/route` | Road route between two coordinates |

**Query params:** `from_lat`, `from_lng`, `to_lat`, `to_lng`

```bash
curl "localhost:8000/route?from_lat=13.0685&from_lng=80.2512&to_lat=13.0120&to_lng=80.2569"
```

```json
{
  "source": "ors",
  "polyline": "encoded_polyline_string...",
  "duration_minutes": 14.2,
  "distance_km": 7.8
}
```

**Fallback response** (on ORS timeout / rate-limit):

```json
{
  "source": "straight_line_estimate",
  "polyline": null,
  "duration_minutes": 11.3,
  "distance_km": 6.7,
  "warning": "ORS unavailable — straight-line estimate only"
}
```

---

## 🌐 Deployment

### Frontend — Vercel (live)

**Live URL:** [https://resqpath-frontend.vercel.app](https://resqpath-frontend.vercel.app)

```bash
# Deploy frontend to Vercel
cd frontend
npx vercel --prod
```

Vercel auto-detects Vite and sets `npm run build` + `dist/` as output. No configuration needed.

### Backend — Render (recommended free tier)

1. Push `backend/` to GitHub
2. New Web Service on [render.com](https://render.com) → select repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env` in the Render dashboard

> **Note:** Generate `requirements.txt` with `pip freeze > requirements.txt` from inside your activated venv.

### Backend — Railway (alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 🔭 Future Improvements

| Priority | Feature | Description |
|---|---|---|
| 🔴 High | Real-time map UI | Leaflet/MapLibre GL with live ambulance markers and ORS polyline rendering |
| 🔴 High | WebSocket updates | Socket.io push notifications for ambulance status changes |
| 🟡 Medium | ML dispatch optimizer | XGBoost model scoring ETA accuracy using historical incident data |
| 🟡 Medium | Authentication | JWT-based operator login with role-based access (dispatcher / admin) |
| 🟡 Medium | Route caching | Cache ORS routes in MongoDB by hashed origin+destination to save API quota |
| 🟢 Low | Docker Compose | Single-command full-stack local setup |
| 🟢 Low | CI/CD pipeline | GitHub Actions: lint → test → deploy on push to main |
| 🟢 Low | Admin dashboard | Metrics: incidents/day, avg response time, ambulance utilization heatmap |
| 🟢 Low | SMS alerts | Twilio integration to notify caller with ETA and unit ID on dispatch |
| 🟢 Low | Multi-city support | Configurable city seed data with region-based ambulance pools |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/<your-username>/ResQPath.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes, then commit
git add .
git commit -m "feat: add your feature description"

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
```

**Commit convention:** `feat:` / `fix:` / `docs:` / `chore:` / `refactor:`

Please make sure:
- New endpoints have Pydantic schemas defined in `models/schemas.py`
- Geo queries always use `$nearSphere` (not `$near`) for spherical accuracy
- GeoJSON coordinates are always `[longitude, latitude]` order
- `.env` is never committed

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Ashwin NM**

[![GitHub](https://img.shields.io/badge/GitHub-ashwinnm13-181717?style=for-the-badge&logo=github)](https://github.com/ashwinnm13)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/ashwinnm13)

*Built with ❤️ to make emergency response smarter, faster, and more reliable.*

</div>

---

<div align="center">

⭐ **If ResQPath helped or inspired you, please star the repository** ⭐

</div>

---

---
---

