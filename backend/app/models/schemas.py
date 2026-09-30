from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class SimulationConfig(BaseModel):
    # Abstract initial conditions (normalized/fictional parameters for academic demo)
    initial_position: List[float] = Field(default=[0.0, 0.0, 1000.0], description="[x, y, z] in meters")
    initial_velocity: List[float] = Field(default=[120.0, 15.0, -10.0], description="[vx, vy, vz] in m/s")
    target_position: List[float] = Field(default=[3000.0, 400.0, 0.0], description="[xt, yt, zt] in meters")
    
    # Disturbances & Unmodelled dynamics
    wind_disturbance: List[float] = Field(default=[3.0, -2.0, 0.5], description="[wx, wy, wz] in m/s")
    sensor_noise: float = Field(default=0.05, ge=0.0, le=1.0, description="Normalized sensor noise level [0-1]")
    navigation_error: float = Field(default=0.02, ge=0.0, le=1.0, description="Navigation drift/bias factor")
    
    # Guidance & Control (Generic trajectory follower)
    guidance_enabled: bool = Field(default=True, description="Enable trajectory-following guidance")
    controller_response: float = Field(default=1.0, ge=0.1, le=5.0, description="Controller response gain scaler")
    kp: float = Field(default=1.5, ge=0.0, le=10.0, description="Proportional gain")
    ki: float = Field(default=0.05, ge=0.0, le=2.0, description="Integral gain")
    kd: float = Field(default=0.8, ge=0.0, le=5.0, description="Derivative gain")
    
    # Simulation parameters
    simulation_duration: float = Field(default=30.0, ge=1.0, le=120.0, description="Max flight time (s)")
    timestep: float = Field(default=0.05, ge=0.01, le=0.5, description="Integration timestep dt (s)")
    
    # Simulated Event Trigger
    event_mode: str = Field(default="TIMER", description="TIMER, PROXIMITY, or IMPACT")
    event_timer_threshold: float = Field(default=22.0, ge=1.0, le=120.0, description="Event threshold in seconds")
    event_proximity_threshold: float = Field(default=25.0, ge=1.0, le=500.0, description="Event distance in meters")

class SensorTelemetry(BaseModel):
    imu: Dict[str, Any]
    gnss: Dict[str, Any]
    altitude: Dict[str, Any]
    proximity: Dict[str, Any]

class TelemetryPoint(BaseModel):
    time: float
    true_position: List[float]
    true_velocity: List[float]
    estimated_position: List[float]
    estimated_velocity: List[float]
    desired_position: List[float]
    position_error: float
    cross_track_error: float
    heading_error: float
    guidance_command: List[float]  # [pitch_cmd, yaw_cmd]
    control_command: List[float]   # [cmd_pitch, cmd_yaw] normalized [-1, 1]
    actuator_deflection: List[float] # actual deflection [-1, 1]
    actuator_status: str           # NOMINAL, RATE_LIMITED, SATURATED
    sensor_data: SensorTelemetry
    altitude: float

class SimulationEvent(BaseModel):
    triggered: bool
    event_mode: str
    event_time: Optional[float] = None
    miss_distance: float
    message: str

class SimulationResponse(BaseModel):
    id: str
    timestamp: str
    config: SimulationConfig
    telemetry: List[TelemetryPoint]
    event: SimulationEvent
    summary: Dict[str, Any]
    disclaimer: str = (
        "Academic / SIH simulation only. Abstract non-deployable guided-flight model. "
        "Contains NO real-world artillery parameters, firing tables, or weapon mechanics."
    )

class MonteCarloRequest(BaseModel):
    runs: int = Field(default=100, ge=10, le=5000, description="Number of Monte Carlo runs: 100, 500, 1000, 5000")
    base_config: Optional[SimulationConfig] = None
    pos_noise_std: float = Field(default=15.0, ge=0.0, le=200.0, description="Std dev of initial position (m)")
    vel_noise_std: float = Field(default=2.5, ge=0.0, le=50.0, description="Std dev of initial velocity (m/s)")
    wind_noise_std: float = Field(default=3.0, ge=0.0, le=30.0, description="Std dev of wind disturbance (m/s)")
    sensor_noise_factor: float = Field(default=0.05, ge=0.0, le=0.5)
    controller_variation_factor: float = Field(default=0.15, ge=0.0, le=0.5)

class MonteCarloPoint(BaseModel):
    run_id: int
    final_x: float
    final_y: float
    final_z: float
    miss_distance: float
    flight_time: float
    status: str

class HistogramBin(BaseModel):
    bin_center: float
    bin_min: float
    bin_max: float
    count: int
    frequency: float

class MonteCarloResponse(BaseModel):
    runs: int
    points: List[MonteCarloPoint]
    mean_error: float
    std_dev_error: float
    max_error: float
    min_error: float
    median_error: float
    cep_50_simulation: float
    cep_95_simulation: float
    within_radius: Dict[str, float]
    histogram: List[HistogramBin]
    disclaimer: str = (
        "SIMULATION ONLY: Academic Monte Carlo statistical dispersion analysis. "
        "Does not represent real-world weapon circular error probable (CEP)."
    )
