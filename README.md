# Precision Guidance & Smart Fuze – Simulation Platform

> **Academic / Smart India Hackathon (SIH) Engineering Platform**  
> An interactive full-stack simulation workbench demonstrating 6-DOF flight vehicle dynamics, simulated avionics sensor suites, discrete Kalman filter state estimation, closed-loop trajectory guidance, dual-axis PID control, software event triggering, and high-performance Monte Carlo dispersion analysis.

---

## ⚠️ Important Safety, Scope & Academic Disclaimer

**READ BEFORE USE:**  
This project is an **academic engineering demonstration model** developed strictly for educational research and competition evaluation (Smart India Hackathon).

In accordance with responsible engineering safety boundaries, this platform:
- ❌ **Does NOT** implement or provide real artillery firing solutions, firing tables, or propellant charts.
- ❌ **Does NOT** use real 155 mm artillery or military projectile aerodynamic parameters.
- ❌ **Does NOT** model gun-launch setback acceleration or rifling spin dynamics.
- ❌ **Does NOT** implement real-world military weapon guidance laws (e.g., classified proportional navigation variants).
- ❌ **Does NOT** implement explosive chemistry, pyrotechnic ignition trains, electro-explosive devices (EED), or physical fuze detonation electronics.
- ❌ **Does NOT** optimize lethal radii or physical weapon effectiveness.
- ❌ **CANNOT** be deployed to physical ordnance or weapons hardware.

Instead, the platform models an abstract, non-deployable guided flight vehicle using normalized, fictionalized parameters to teach software architecture, sensor simulation, Kalman filtering, feedback control, and statistical dispersion.

---

## 🚀 Key Features

1. **6-DOF Numerical Flight Vehicle Model**
   - 4th-Order Runge-Kutta (RK4) integration of translational kinematics and attitude.
   - Aerodynamic drag forces relative to ambient wind vectors.
   - Decoupled pitch and yaw control authorities.

2. **Educational Simulated Sensor Suite**
   - **6-DOF IMU:** Specific force accelerometers and rate gyroscopes with Gaussian white noise and bias drift.
   - **Multi-Constellation GNSS:** 3D pseudo-range fixes with HDOP/VDOP metrics and satellite lock states.
   - **Altitude Sensor:** Barometric / Radar altimeter with synthetic noise and vertical rate tracking.
   - **Proximity Sensor:** Relative range calculation and distance threshold detection logic.

3. **Discrete Kalman Filter State Estimator**
   - 6-state discrete Kalman filter fusing high-rate IMU specific forces with periodic GNSS position fixes and altimetry.
   - Dynamic error covariance propagation ($P = (I - KH)P^-$).
   - Real-time estimation error metrics.

4. **Closed-Loop Trajectory Guidance**
   - Cubic Bezier reference trajectory generation from release point to designated target.
   - Cross-track error and heading error computation.
   - Lateral and vertical guidance acceleration command generation.

5. **Feedback Controller & Control-Surface Actuator**
   - Dual-axis PID controller with integral anti-windup clamping.
   - Normalized steering commands in $[-1.0, +1.0]$.
   - First-order actuator lag ($\tau = 0.08\text{ s}$), rate limiter ($4.0\text{ units/s}$), and mechanical saturation detection.
   - Interactive 3D and graphical deflection meter.

6. **Simulated Event Manager**
   - Software-only threshold detection.
   - Selectable modes: `TIMER`, `PROXIMITY`, and `IMPACT`.
   - Halts simulation upon event detection and records precision terminal miss distances.

7. **Vectorized Monte Carlo Dispersion Engine**
   - Executes **100, 500, 1000, or 5000** stochastic simulations in **under 1 second** via NumPy vectorization.
   - Evaluates random initial position dispersion, velocity noise, wind turbulence, sensor noise, and controller variation.
   - Generates 2D impact scatter plots centered on target with simulated CEP-50 and CEP-95 percentiles.
   - Dynamic error distribution histogram with hit probabilities (5m, 10m, 25m, 50m).

8. **Interactive 3D WebGL Visualization**
   - Built with Three.js / WebGL.
   - Technical aerospace grid, origin pad, and pulsed target beacon.
   - Simultaneous rendering of True Trajectory, Desired Reference Path, and Kalman-Estimated Trajectory.
   - OrbitControls with Orbit, Follow, and Top-Down camera views.
   - Live telemetry floating Heads-Up Display (HUD).

9. **Interactive System Architecture Flow**
   - Complete block diagram tracing Configuration $\to$ Vehicle $\to$ Sensors $\to$ Estimator $\to$ Guidance $\to$ Controller $\to$ Actuator $\to$ Vehicle.
   - Clickable subsystem panels detailing purpose, algorithmic formulation, inputs, outputs, and live state values.

10. **Automated Technical Report Generation**
    - One-click printable and exportable PDF report.
    - Includes executive summary, configuration audit matrix, trajectory charts, error analysis, and observations.

11. **One-Click Demo Scenario**
    - Pre-configured safe flight scenario ready for immediate competition demonstration with a single click.

12. **Local Session Persistence**
    - Browser `localStorage` simulation state manager (Save, Load, Delete).
    - Zero cloud dependencies, zero logins required.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React |
| **3D Engine** | Three.js, React Three Fiber, OrbitControls |
| **Charts** | Recharts (Line charts, Scatter plots, Histograms) |
| **Backend API** | Python 3.13 / FastAPI, Uvicorn, Pydantic v2 |
| **Math & Numerics** | NumPy 2.5 (vectorized simulation), SciPy |

---

## 📁 Project Structure

```
precision-sim/
├── backend/
│   ├── app/
│   │   ├── control/
│   │   │   ├── actuator.py            # Abstract control surface dynamics
│   │   │   └── controller.py          # Dual-axis PID feedback controller
│   │   ├── estimation/
│   │   │   └── filter.py              # Discrete Kalman filter estimator
│   │   ├── guidance/
│   │   │   ├── guidance_law.py        # Generic trajectory tracking law
│   │   │   └── trajectory.py          # Cubic reference path generator
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic data schemas
│   │   ├── sensors/
│   │   │   ├── altitude.py            # Simulated altimeter
│   │   │   ├── gnss.py                # Simulated GNSS receiver
│   │   │   ├── imu.py                 # Simulated 6-DOF IMU
│   │   │   ├── proximity.py           # Simulated proximity range trigger
│   │   │   └── sensor_suite.py        # Coordinated sensor suite
│   │   └── simulation/
│   │       ├── engine.py              # Main simulation & fast Monte Carlo engine
│   │       └── vehicle.py             # 3D RK4 vehicle dynamics
│   ├── requirements.txt               # Backend dependencies
│   └── main.py                        # FastAPI entry point & endpoints
├── frontend/
│   ├── src/
│   │   ├── architecture/
│   │   │   └── ArchitectureDiagram.tsx # Interactive subsystem architecture
│   │   ├── charts/
│   │   │   ├── ControlChart.tsx       # Controller command & deflection chart
│   │   │   ├── ErrorChart.tsx         # 3D tracking & cross-track error chart
│   │   │   ├── MonteCarloHistogram.tsx# Error distribution histogram
│   │   │   ├── MonteCarloScatter.tsx  # 2D target-centered dispersion plot
│   │   │   ├── SensorChart.tsx        # Simulated sensor residual errors
│   │   │   └── TrajectoryChart.tsx    # Position and velocity vs time
│   │   ├── components/
│   │   │   ├── ActuatorVisualizer.tsx # Live control surface deflection meter
│   │   │   ├── Header.tsx             # System status & action buttons
│   │   │   ├── Navbar.tsx             # Navigation bar with Demo mode
│   │   │   └── PlaybackControls.tsx   # Scrubber, play/pause, speed controls
│   │   ├── context/
│   │   │   └── SimulationContext.tsx  # Global state & localStorage manager
│   │   ├── pages/
│   │   │   ├── AboutPage.tsx          # Project details & safety scope
│   │   │   ├── ArchitecturePage.tsx   # Architecture deep-dive
│   │   │   ├── ControlPage.tsx        # Controller parameters & actuator
│   │   │   ├── DashboardPage.tsx      # Main aerospace operations dashboard
│   │   │   ├── GuidancePage.tsx       # Trajectory error tracking
│   │   │   ├── MonteCarloPage.tsx     # 100-5000 run dispersion analysis
│   │   │   ├── ReportsPage.tsx        # Printable engineering report
│   │   │   ├── SensorsPage.tsx        # Simulated avionics sensor suite
│   │   │   └── SimulationPage.tsx     # Configuration parameters & presets
│   │   ├── services/
│   │   │   └── api.ts                 # Backend REST client
│   │   ├── simulation/
│   │   │   └── Flight3DView.tsx       # Three.js 3D trajectory visualizer
│   │   ├── types/
│   │   │   └── simulation.ts          # TypeScript type definitions
│   │   ├── App.tsx                    # React router application
│   │   ├── index.css                  # Dark aerospace technical styling
│   │   └── main.tsx                   # React root entry
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/
│   ├── ARCHITECTURE.md                # Mathematical formulations & flowcharts
│   ├── API_DOCUMENTATION.md           # REST API specification
│   └── SAFETY_AND_SCOPE.md            # Strict academic safety declaration
├── run.bat                            # Windows 1-click launcher
├── setup.bat                          # Windows dependency installer
└── README.md
```

---

## ⚡ Quick Start (Windows)

### Option 1: One-Click Automated Scripts

1. **Install Dependencies:**
   Double-click `setup.bat` or run:
   ```cmd
   setup.bat
   ```

2. **Launch Application:**
   Double-click `run.bat` or run:
   ```cmd
   run.bat
   ```
   *This automatically launches the FastAPI backend on port 8000, the Vite React frontend on port 5173, and opens your browser.*

---

### Option 2: Manual Terminal Execution

#### 1. Setup & Start Backend
Open a terminal in the project directory:
```powershell
# Using Python 3.13 / py launcher
py -3.13 -m pip install -r backend/requirements.txt

# Start FastAPI server
cd backend
py -3.13 main.py
```
*Backend runs on: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)*

#### 2. Setup & Start Frontend
Open a second terminal in the project directory:
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

#### 3. Open Web Browser
Navigate to:
```
http://localhost:5173
```

---

## 🧪 Testing the Platform

### 1. Test Backend Endpoints
Verify all REST API endpoints using Python or curl:
```powershell
# Health Check
curl http://localhost:8000/health

# Run Simulation
py -3.13 -c "import urllib.request; req = urllib.request.Request('http://localhost:8000/simulate', data=b'{}', headers={'Content-Type': 'application/json'}); print(urllib.request.urlopen(req).status)"
```

### 2. Test in the Web Dashboard
1. Open `http://localhost:5173`.
2. Click **"Demo Scenario"** in the top navigation bar.
3. Observe the vehicle take off and track along the desired trajectory in the **3D Tactical View**.
4. Use the **Playback Controls** scrubber to inspect telemetry at individual flight seconds.
5. Navigate to **Monte Carlo** and click **"Run 500 Simulations"** — view the 2D dispersion scatter plot and histogram generated instantly.
6. Navigate to **Architecture** and click on any block (e.g. **Guidance** or **Sensors**) to inspect mathematical formulations and live values.
7. Navigate to **Reports** and test **"Print / Save as PDF"**.

---

## 📚 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check service health and operation mode |
| `POST` | `/simulate` | Run full 6-DOF simulation with sensor noise and guidance |
| `POST` | `/monte-carlo` | Run high-speed vectorized Monte Carlo analysis (100–5000 runs) |
| `GET` | `/simulation/{id}` | Retrieve cached simulation by ID |

---

## 📝 License
Academic and Educational Use Only. Developed for the Smart India Hackathon (SIH).
