# 🛡️ ECOSHIELD AI
### Intelligent Environmental Early-Warning Network & Command Center for India

[![Full-Stack Prototype](https://img.shields.io/badge/Prototype-Fully%20Functional-emerald.svg)]()
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-blue.svg)]()
[![React + TypeScript](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-cyan.svg)]()
[![Real-Time WebSocket](https://img.shields.io/badge/RealTime-WebSocket%20%2B%20MQTT-purple.svg)]()

> **Project Purpose:** EcoShield AI is an AI-powered multi-hazard environmental monitoring and early-warning platform designed for India. It ingests high-frequency telemetry from distributed physical/simulated IoT sensor nodes, evaluates physics-informed multi-hazard risk models, localizes affected geographical radii on an interactive GIS map, and triggers automated early-warning alerts for disaster response authorities (NDMA, SDRF, CPCB, Fire Services).

---

## ⚡ The Operational Pipeline

$$\textbf{SENSE} \longrightarrow \textbf{CONNECT} \longrightarrow \textbf{ANALYZE} \longrightarrow \textbf{PREDICT} \longrightarrow \textbf{LOCALIZE} \longrightarrow \textbf{ALERT} \longrightarrow \textbf{ACT}$$

```
[ PHYSICAL IoT NODES / SIMULATOR ]
  • Ultrasonic Water Gauge (m)
  • Rain Gauge (mm/hr)
  • Thermal & Humidity (DHT22 / BME280)
  • Air Particulates (PM2.5, PM10, NO2)
  • Combustion Gases (CO, Optical Smoke, IR Flame)
                   │
                   ▼ (Wi-Fi / LoRa / MQTT / REST API)
[ FASTAPI HIGH-THROUGHPUT INGESTION ENGINE ]
                   │
                   ▼
[ AI MULTI-HAZARD RISK & ANOMALY ENGINE ]
  • Flood Inundation & Rate-of-Rise (Δh/Δt)
  • Fire Weather Index (FWI) & Combustion Analysis
  • National AQI Multi-Pollutant Standard Compliance
  • Wet-Bulb Globe Temperature (WBGT) Heat Engine
  • Dynamic AI Confidence Scoring (0-100%)
                   │
                   ├───────────────────────────────┐
                   ▼                               ▼
[ POSTGRESQL / SQLITE DATABASE ]       [ WEBSOCKET LIVE BROADCASTER ]
  • Time-series telemetry records                  │
  • Hazard zone polygons                           ▼
  • Emergency audit logs              [ REACT COMMAND CENTER UI ]
                                        • Real-time GIS Risk Map (Leaflet)
                                        • Multi-Vector Live Telemetry
                                        • Predictive AI Insights (1h, 6h, 24h)
                                        • Recharts Analytics Time-Series
                                        • NDMA Emergency Dispatch Cockpit
```

---

## 🌟 Key Features

1. **Multi-Hazard Environmental Surveillance:**
   - 🌊 **Flash Flood & River Inundation:** Swarnamukhi (Tirupati), Krishna Barrage (Vijayawada), Mithi River (Mumbai), Brahmaputra (Assam).
   - 🔥 **Wildfire & Thermal Dryness:** Western Ghats (Sahyadri), Himalayan Foothills (Dehradun).
   - 💨 **Severe Air Pollution (AQI):** Delhi NCR, Hyderabad Lake Front, Bengaluru.
   - ☀️ **Extreme Heatwave:** High Wet-Bulb Globe Temperature warning corridors.
   - 🌱 **Agricultural Stress / Landslide:** Wayanad & Coorg catchments.

2. **Transparent AI Risk Engine:**
   - Rule-based physical threshold heuristics seamlessly architected for plug-and-play PyTorch/scikit-learn ML model swap.
   - Dynamic **AI Confidence Score** computed from multi-sensor cross-validation, sensor battery health, and telemetry signal-to-noise ratio.
   - Generates concrete, human-readable **Action Protocols** for field dispatchers.

3. **Interactive India-Focused GIS Risk Map:**
   - Real-time Leaflet map centered over India.
   - Color-coded risk radius circles (Cyan=Flood, Red=Wildfire, Purple=Smog, Orange=Heat, Green=Normal).
   - Critical infrastructure markers (Dams, Power stations, NDRF battalion bases).

4. **Emergency Control & Common Alerting Protocol (CAP):**
   - Direct 🚨 **EMERGENCY ALERT** trigger with evacuation radius configurator.
   - Integrated disaster management checklist (NDRF, SDRF, Fire Dept, Municipal Spillways).

5. **Integrated IoT Simulator & Hardware Bridge:**
   - Built-in stochastic background simulator.
   - Standalone Python CLI simulator (`simulator/sensor_simulator.py`).
   - Ready-to-flash Arduino/ESP32 C++ firmware (`iot/esp32_ecoshield.ino`).

---

## 📂 Project Structure

```
ecoshield-ai/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   └── risk_engine.py      # Core AI Risk & Heuristic Engine
│   │   ├── api/
│   │   │   ├── auth.py             # JWT & RBAC endpoints
│   │   │   ├── sensors.py          # Sensor CRUD & Telemetry ingestion
│   │   │   ├── hazards.py          # Hazard detection queries
│   │   │   ├── alerts.py           # Alert management & audit trail
│   │   │   ├── analytics.py        # Time-series aggregation
│   │   │   ├── ai.py               # AI Insights & multi-horizon forecasts
│   │   │   ├── system.py           # Status & Simulation triggers
│   │   │   └── websocket.py        # Real-time WebSocket manager
│   │   ├── database/
│   │   │   └── db.py               # SQLite (zero-config) & PostgreSQL async setup
│   │   ├── models/
│   │   │   └── models.py           # SQLAlchemy ORM Models
│   │   ├── mqtt/
│   │   │   └── mqtt_bridge.py      # ESP32 MQTT listener
│   │   ├── schemas/
│   │   │   └── schemas.py          # Pydantic schemas
│   │   └── services/
│   │       ├── sensor_service.py   # Ingestion pipeline & Indian seed data
│   │       └── alert_service.py    # Alert creation & lifecycle
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py                     # FastAPI application entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Layout, Sidebar, StatusBar, KPICard, SensorCard, EmergencyModal
│   │   ├── pages/                  # 9 Command Center Pages:
│   │   │   ├── Dashboard.tsx       # Main Command Center
│   │   │   ├── LiveMonitoring.tsx  # Categorized Live Sensor Feeds
│   │   │   ├── RiskMap.tsx         # Leaflet India Risk Map
│   │   │   ├── SensorNetwork.tsx   # Hardware Node Topology Grid
│   │   │   ├── Alerts.tsx          # Alert Management & Dispatch
│   │   │   ├── AIInsights.tsx      # AI Predictive Insights & Anomaly Logs
│   │   │   ├── Analytics.tsx       # Recharts Time-Series Charts
│   │   │   ├── EmergencyCenter.tsx # Full Emergency Response Cockpit
│   │   │   └── Settings.tsx        # IoT Gateway & AI Tuning
│   │   ├── hooks/                  # useWebSocket hook
│   │   ├── services/               # REST API service
│   │   ├── types/                  # TypeScript data interfaces
│   │   ├── App.tsx                 # React Router
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── simulator/
│   └── sensor_simulator.py         # Standalone Python CLI Simulator
│
├── iot/
│   └── esp32_ecoshield.ino         # ESP32 WiFi + MQTT + REST C++ Code
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quickstart Guide

### Method A: Local Development (Fastest, Zero External Dependencies)

#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python main.py
```
> The backend will automatically create SQLite database `ecoshield.db`, seed default Indian environmental sensor nodes, start the background live simulation pulse, and listen on `http://localhost:8000`.

- **API Documentation (Swagger UI):** `http://localhost:8000/docs`
- **Live WebSocket Endpoint:** `ws://localhost:8000/ws/live`

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
> Open `http://localhost:5173` in your browser.

---

### Method B: One-Command Docker Setup

```bash
docker-compose up --build
```
This boots:
- PostgreSQL on `localhost:5432`
- FastAPI Backend on `localhost:8000`
- React Frontend on `localhost:5173`
- Mosquitto MQTT Broker on `localhost:1883`

---

## 🎬 2-Minute Smart India Hackathon Demonstration Script

Follow this step-by-step walkthrough during jury presentations:

1. **Step 1 — Overview (0:00 - 0:25):**
   - Open the Dashboard at `http://localhost:5173`.
   - Point out the **Top Status Bar** (`SYSTEM: ONLINE`, connected sensors `15/15`, active incidents, and `100%` network health).
   - Show the **5 KPI Cards** (Active Hazards, Connected Sensors, High-Risk Zones, Alerts Today, AI Confidence `94.8%`).

2. **Step 2 — Sensor Network & Telemetry (0:25 - 0:50):**
   - Navigate to **Live Monitoring** or **Sensor Network**.
   - Show sensor nodes distributed across Indian river basins (Tirupati, Vijayawada, Wayanad, Mumbai, Kaziranga, Delhi).
   - Point out real-time value changes (water level in meters, temperature in °C, PM2.5 in µg/m³).

3. **Step 3 — Triggering Flood Simulation (0:50 - 1:15):**
   - In the top action bar, click the **"Flood"** scenario button (or run `python simulator/sensor_simulator.py flood`).
   - Instantly observe:
     - Water level surges to **4.85 m** (breaching critical 4.5m threshold).
     - Rainfall jumps to **94.0 mm/hr**.
     - AI Risk Engine evaluates the rate-of-rise $\Delta h / \Delta t$ and flags **CRITICAL FLOOD RISK (Risk Score: 96/100, AI Confidence: 98%)**.

4. **Step 4 — GIS Localization & Alerts (1:15 - 1:40):**
   - Navigate to **Risk Map**: See the glowing cyan affected zone circle and marker over the Tirupati Swarnamukhi basin.
   - Click the marker to view real-time diagnostics and the AI Recommended Action: *"Issue immediate Tier-1 evacuation alerts for low-lying settlements; deploy NDRF rescue boats."*
   - See the top **Critical Alert Banner** flash. Click **"Acknowledge Protocol"** to log the duty officer's acknowledgment.

5. **Step 5 — Analytics & Emergency Mobilization (1:40 - 2:00):**
   - Navigate to **Analytics**: Show the time-series charts updating with the water level surge crest.
   - Click **"🚨 EMERGENCY ALERT"** in the top bar: Show the multi-agency mobilization cockpit (NDRF, SDRF, Fire Brigade, District Collectorate).
   - Click **"Normal"** in the top bar to reset conditions back to clean baseline.

---

## 📡 Physical ESP32 Hardware Connection Guide

To connect physical ESP32 IoT hardware to EcoShield AI:

1. Connect sensors to ESP32:
   - **HC-SR04 Ultrasonic Sensor** (Water Depth): `Trig -> GPIO 5`, `Echo -> GPIO 18`
   - **Rain Sensor / ADC**: `Analog Out -> GPIO 34`
   - **MQ-135 / MQ-2 Smoke & Gas**: `Analog Out -> GPIO 35`
   - **IR Flame Detector**: `Digital Out -> GPIO 19`
2. Open `iot/esp32_ecoshield.ino` in Arduino IDE.
3. Update `WIFI_SSID`, `WIFI_PASS`, and `BACKEND_SERVER` (e.g. `http://<your-laptop-ip>:8000/api/sensors/data`).
4. Flash the code to ESP32.
5. The ESP32 will immediately post JSON packets every 5 seconds, and the dashboard will update in real time.

---

## 📊 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/system/status` | High-level command center KPIs and network health |
| `POST` | `/api/system/simulate` | Trigger demonstration scenarios (`flood`, `forest_fire`, `air_pollution`, `normal`) |
| `POST` | `/api/system/emergency` | Broadcast Tier-1 Emergency Warning protocol |
| `POST` | `/api/system/reset-demo` | Reset simulation state to pristine baseline |
| `GET` | `/api/sensors` | List all sensors with latest readings and statuses |
| `GET` | `/api/sensors/{id}` | Inspect specific sensor telemetry & recent readings |
| `POST` | `/api/sensors/data` | Ingest sensor telemetry stream and run AI Risk Engine |
| `GET` | `/api/hazards` | Query active detected environmental hazards |
| `GET` | `/api/alerts` | Query early-warning alert logs |
| `POST` | `/api/alerts/{id}/acknowledge` | Acknowledge active alert incident |
| `POST` | `/api/alerts/{id}/resolve` | Mark alert incident as resolved |
| `GET` | `/api/ai/insights` | Fetch AI predictive insights, anomalies & forecasts |
| `GET` | `/api/analytics` | Fetch multi-hazard time-series metrics (`1h`, `24h`, `7d`, `30d`) |
| `WS` | `/ws/live` | WebSocket real-time live event streaming |

---

## 📜 License

Developed for **Smart India Hackathon (SIH)**. Built with pride for national environmental resilience and disaster mitigation across India.
