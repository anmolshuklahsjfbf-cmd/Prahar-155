# REST API Documentation

The backend service is exposed via FastAPI on `http://127.0.0.1:8000`.

## Endpoints

### 1. Health Check
- **Endpoint:** `GET /health`
- **Description:** Verifies service availability and operation mode.
- **Response:**
```json
{
  "status": "healthy",
  "service": "Precision Guidance & Smart Fuze Simulation Backend",
  "mode": "Simulation-Only / Academic",
  "version": "1.0.0"
}
```

---

### 2. Run Simulation
- **Endpoint:** `POST /simulate`
- **Description:** Executes 6-DOF RK4 trajectory simulation, sensor generation, Kalman filtering, guidance tracking, and simulated event detection.
- **Request Body (`SimulationConfig`):**
```json
{
  "initial_position": [0.0, 0.0, 1000.0],
  "initial_velocity": [120.0, 15.0, -10.0],
  "target_position": [3000.0, 400.0, 0.0],
  "wind_disturbance": [3.0, -2.0, 0.5],
  "sensor_noise": 0.05,
  "navigation_error": 0.02,
  "guidance_enabled": true,
  "controller_response": 1.0,
  "kp": 1.5,
  "ki": 0.05,
  "kd": 0.8,
  "simulation_duration": 30.0,
  "timestep": 0.05,
  "event_mode": "TIMER",
  "event_timer_threshold": 22.0,
  "event_proximity_threshold": 25.0
}
```
- **Response (`SimulationResponse`):**
```json
{
  "id": "e81f2a9c",
  "timestamp": "2026-09-30T12:00:00Z",
  "config": { ... },
  "telemetry": [
    {
      "time": 0.05,
      "true_position": [6.0, 0.75, 999.49],
      "true_velocity": [119.8, 14.9, -10.4],
      "estimated_position": [6.1, 0.72, 999.6],
      "desired_position": [6.2, 0.8, 1000.1],
      "position_error": 0.51,
      "cross_track_error": 0.22,
      "heading_error": 0.15,
      "guidance_command": [0.35, -0.12],
      "control_command": [0.04, -0.01],
      "actuator_deflection": [0.02, -0.005],
      "actuator_status": "NOMINAL",
      "altitude": 999.49,
      "sensor_data": {
        "imu": { ... },
        "gnss": { ... },
        "altitude": { ... },
        "proximity": { ... }
      }
    }
  ],
  "event": {
    "triggered": true,
    "event_mode": "TIMER",
    "event_time": 22.0,
    "miss_distance": 12.4,
    "message": "SIMULATED TIMER EVENT TRIGGERED..."
  },
  "summary": {
    "flight_time_s": 22.0,
    "final_position": [2995.2, 396.1, 8.4],
    "target_position": [3000.0, 400.0, 0.0],
    "final_miss_distance_m": 6.8,
    "mean_position_error_m": 4.2,
    "max_position_error_m": 15.6,
    "guidance_enabled": true
  }
}
```

---

### 3. Run Monte Carlo Dispersion
- **Endpoint:** `POST /monte-carlo`
- **Description:** Runs 100, 500, 1000, or 5000 vectorized stochastic runs in &lt;1 second to calculate statistical dispersion, CEP percentiles, and error histograms.
- **Request Body (`MonteCarloRequest`):**
```json
{
  "runs": 500,
  "base_config": { ... },
  "pos_noise_std": 15.0,
  "vel_noise_std": 2.5,
  "wind_noise_std": 3.0,
  "sensor_noise_factor": 0.05,
  "controller_variation_factor": 0.15
}
```
- **Response (`MonteCarloResponse`):**
```json
{
  "runs": 500,
  "points": [ ... ],
  "mean_error": 14.8,
  "std_dev_error": 6.2,
  "max_error": 38.5,
  "min_error": 1.2,
  "median_error": 13.9,
  "cep_50_simulation": 13.9,
  "cep_95_simulation": 26.4,
  "within_radius": {
    "5m": 12.4,
    "10m": 41.2,
    "25m": 94.6,
    "50m": 100.0
  },
  "histogram": [ ... ],
  "disclaimer": "SIMULATION ONLY: Academic Monte Carlo statistical dispersion analysis."
}
```

---

### 4. Fetch Stored Simulation by ID
- **Endpoint:** `GET /simulation/{id}`
- **Description:** Retrieves cached simulation telemetry by its unique identifier.
