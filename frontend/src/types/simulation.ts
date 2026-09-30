export interface SimulationConfig {
  initial_position: [number, number, number];
  initial_velocity: [number, number, number];
  target_position: [number, number, number];
  wind_disturbance: [number, number, number];
  sensor_noise: number;
  navigation_error: number;
  guidance_enabled: boolean;
  controller_response: number;
  kp: number;
  ki: number;
  kd: number;
  simulation_duration: number;
  timestep: number;
  event_mode: 'TIMER' | 'PROXIMITY' | 'IMPACT';
  event_timer_threshold: number;
  event_proximity_threshold: number;
}

export interface SensorValue {
  true: number;
  measured: number;
  noise?: number;
  error: number;
  unit: string;
}

export interface IMUTelemetry {
  name: string;
  status: string;
  accel_x: SensorValue;
  accel_y: SensorValue;
  accel_z: SensorValue;
  gyro_pitch: SensorValue;
  gyro_yaw: SensorValue;
  orientation: {
    roll: number;
    pitch: number;
    yaw: number;
    unit: string;
  };
}

export interface GNSSTelemetry {
  name: string;
  status: string;
  x: SensorValue;
  y: SensorValue;
  z: SensorValue;
  total_error_3d: number;
  satellites_tracked: number;
  hdop: number;
  vdop: number;
}

export interface AltitudeTelemetry {
  name: string;
  status: string;
  true_altitude: number;
  measured_altitude: number;
  noise: number;
  error: number;
  unit: string;
  vertical_rate: number;
}

export interface ProximityTelemetry {
  name: string;
  status: string;
  true_distance: number;
  measured_distance: number;
  noise: number;
  error: number;
  threshold: number;
  detection_status: string;
  triggered: boolean;
  unit: string;
}

export interface SensorData {
  imu: IMUTelemetry;
  gnss: GNSSTelemetry;
  altitude: AltitudeTelemetry;
  proximity: ProximityTelemetry;
}

export interface TelemetryPoint {
  time: number;
  true_position: [number, number, number];
  true_velocity: [number, number, number];
  estimated_position: [number, number, number];
  estimated_velocity: [number, number, number];
  desired_position: [number, number, number];
  position_error: number;
  cross_track_error: number;
  heading_error: number;
  guidance_command: [number, number]; // [pitch_cmd, yaw_cmd]
  control_command: [number, number];  // normalized [-1.0, 1.0]
  actuator_deflection: [number, number];
  actuator_status: 'NOMINAL' | 'RATE_LIMITED' | 'SATURATED' | string;
  sensor_data: SensorData;
  altitude: number;
}

export interface SimulationEvent {
  triggered: boolean;
  event_mode: string;
  event_time?: number | null;
  miss_distance: number;
  message: string;
}

export interface SimulationSummary {
  flight_time_s: number;
  final_position: [number, number, number];
  target_position: [number, number, number];
  final_miss_distance_m: number;
  mean_position_error_m: number;
  max_position_error_m: number;
  guidance_enabled: boolean;
  telemetry_points_count: number;
  actuator_final_status: string;
  terminal_velocity_mag: number;
}

export interface SimulationResponse {
  id: string;
  timestamp: string;
  config: SimulationConfig;
  telemetry: TelemetryPoint[];
  event: SimulationEvent;
  summary: SimulationSummary;
  disclaimer: string;
}

export interface MonteCarloRequest {
  runs: number;
  base_config?: SimulationConfig;
  pos_noise_std?: number;
  vel_noise_std?: number;
  wind_noise_std?: number;
  sensor_noise_factor?: number;
  controller_variation_factor?: number;
}

export interface MonteCarloPoint {
  run_id: number;
  final_x: number;
  final_y: number;
  final_z: number;
  miss_distance: number;
  flight_time: number;
  status: string;
}

export interface HistogramBin {
  bin_center: number;
  bin_min: number;
  bin_max: number;
  count: number;
  frequency: number;
}

export interface MonteCarloResponse {
  runs: number;
  points: MonteCarloPoint[];
  mean_error: number;
  std_dev_error: number;
  max_error: number;
  min_error: number;
  median_error: number;
  cep_50_simulation: number;
  cep_95_simulation: number;
  within_radius: {
    '5m': number;
    '10m': number;
    '25m': number;
    '50m': number;
    [key: string]: number;
  };
  histogram: HistogramBin[];
  disclaimer: string;
}
