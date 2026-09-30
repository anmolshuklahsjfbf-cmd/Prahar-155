import time
import uuid
import datetime
import numpy as np
from typing import Dict, Any, List

from app.models.schemas import (
    SimulationConfig,
    SimulationResponse,
    TelemetryPoint,
    SimulationEvent,
    SensorTelemetry,
    MonteCarloRequest,
    MonteCarloResponse,
    MonteCarloPoint,
    HistogramBin
)
from app.simulation.vehicle import GenericFlightVehicle
from app.sensors.sensor_suite import SimulatedSensorSuite
from app.estimation.filter import SimulatedKalmanFilter
from app.guidance.trajectory import NominalTrajectoryGenerator
from app.guidance.guidance_law import GenericTrajectoryGuidance
from app.control.controller import GenericFeedbackController
from app.control.actuator import SimulatedActuator

class SimulationEngine:
    """
    Precision Guidance & Smart Fuze Simulation Engine.
    Coordinates Vehicle Dynamics, Sensor Suite, State Estimation,
    Guidance, Control, and Simulated Event Management.
    """
    def __init__(self):
        self.cached_simulations: Dict[str, SimulationResponse] = {}

    def run_simulation(self, config: SimulationConfig) -> SimulationResponse:
        sim_id = str(uuid.uuid4())[:8]
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        init_pos = np.array(config.initial_position, dtype=float)
        init_vel = np.array(config.initial_velocity, dtype=float)
        target_pos = np.array(config.target_position, dtype=float)
        wind = np.array(config.wind_disturbance, dtype=float)

        dt = float(config.timestep)
        max_duration = float(config.simulation_duration)

        # Approximate total time to target based on distance and speed
        initial_distance = float(np.linalg.norm(init_pos - target_pos))
        est_flight_time = min(max_duration, max(5.0, initial_distance / max(10.0, np.linalg.norm(init_vel))))

        # Initialize subsystem modules
        vehicle = GenericFlightVehicle(init_pos, init_vel)
        sensors = SimulatedSensorSuite(
            noise_scale=config.sensor_noise,
            proximity_threshold=config.event_proximity_threshold
        )
        estimator = SimulatedKalmanFilter(
            init_pos=init_pos,
            init_vel=init_vel,
            dt=dt,
            nav_error_factor=config.navigation_error
        )
        traj_gen = NominalTrajectoryGenerator(
            start_pos=init_pos,
            target_pos=target_pos,
            total_time=est_flight_time
        )
        guidance = GenericTrajectoryGuidance(gain_factor=config.controller_response)
        controller = GenericFeedbackController(
            kp=config.kp,
            ki=config.ki,
            kd=config.kd,
            response_scale=config.controller_response,
            dt=dt
        )
        actuator = SimulatedActuator(dt=dt)

        telemetry: List[TelemetryPoint] = []
        event_info = SimulationEvent(
            triggered=False,
            event_mode=config.event_mode,
            event_time=None,
            miss_distance=initial_distance,
            message="Simulation started."
        )

        current_time = 0.0
        actuator_deflection = np.array([0.0, 0.0])
        act_status = "NOMINAL"
        ctrl_cmd = np.array([0.0, 0.0])
        guidance_accel = np.zeros(3)

        # Main integration loop
        while current_time <= max_duration:
            # 1. Vehicle attitude & sensor sampling
            orientation = vehicle.step_rk4(dt, wind, actuator_deflection)
            sensor_data = sensors.sample_all(
                true_pos=vehicle.pos,
                true_vel=vehicle.vel,
                true_accel=vehicle.accel,
                angular_rates=vehicle.angular_rates,
                orientation_deg=orientation,
                target_pos=target_pos
            )

            # 2. State Estimation Predict & Update
            imu_accel = np.array([
                sensor_data["imu"]["accel_x"]["measured"],
                sensor_data["imu"]["accel_y"]["measured"],
                sensor_data["imu"]["accel_z"]["measured"]
            ])
            estimator.predict(imu_accel)

            gnss_pos = np.array([
                sensor_data["gnss"]["x"]["measured"],
                sensor_data["gnss"]["y"]["measured"],
                sensor_data["gnss"]["z"]["measured"]
            ])
            estimator.update(gnss_pos, sensor_data["altitude"]["measured_altitude"])

            est_pos, est_vel, est_stats = estimator.get_state()

            # 3. Desired Trajectory Sampling & Guidance
            des_pos, des_vel = traj_gen.sample(current_time)
            if config.guidance_enabled:
                guidance_accel, g_metrics = guidance.compute_guidance(
                    est_pos=est_pos,
                    est_vel=est_vel,
                    des_pos=des_pos,
                    des_vel=des_vel,
                    target_pos=target_pos
                )
            else:
                guidance_accel = np.zeros(3)
                pos_err = des_pos - est_pos
                g_metrics = {
                    "position_error_3d": float(np.linalg.norm(pos_err)),
                    "cross_track_error": float(np.linalg.norm(pos_err[0:2])),
                    "along_track_error": 0.0,
                    "heading_error_deg": 0.0,
                    "guidance_accel_mag": 0.0
                }

            # 4. Feedback Controller & Actuator
            if config.guidance_enabled:
                ctrl_cmd, c_info = controller.compute(guidance_accel, est_vel)
            else:
                ctrl_cmd = np.array([0.0, 0.0])

            actuator_deflection, act_info = actuator.step(ctrl_cmd)
            act_status = act_info["status"]

            # Record telemetry point
            current_dist = float(np.linalg.norm(vehicle.pos - target_pos))
            t_point = TelemetryPoint(
                time=round(current_time, 3),
                true_position=[float(vehicle.pos[0]), float(vehicle.pos[1]), float(vehicle.pos[2])],
                true_velocity=[float(vehicle.vel[0]), float(vehicle.vel[1]), float(vehicle.vel[2])],
                estimated_position=[float(est_pos[0]), float(est_pos[1]), float(est_pos[2])],
                estimated_velocity=[float(est_vel[0]), float(est_vel[1]), float(est_vel[2])],
                desired_position=[float(des_pos[0]), float(des_pos[1]), float(des_pos[2])],
                position_error=round(g_metrics["position_error_3d"], 3),
                cross_track_error=round(g_metrics["cross_track_error"], 3),
                heading_error=round(g_metrics["heading_error_deg"], 2),
                guidance_command=[float(guidance_accel[2]), float(guidance_accel[1])],
                control_command=[float(ctrl_cmd[0]), float(ctrl_cmd[1])],
                actuator_deflection=[float(actuator_deflection[0]), float(actuator_deflection[1])],
                actuator_status=act_status,
                sensor_data=SensorTelemetry(
                    imu=sensor_data["imu"],
                    gnss=sensor_data["gnss"],
                    altitude=sensor_data["altitude"],
                    proximity=sensor_data["proximity"]
                ),
                altitude=round(float(vehicle.pos[2]), 2)
            )
            telemetry.append(t_point)

            # 5. Check Simulated Event Manager Triggers
            should_stop = False

            if config.event_mode == "TIMER" and current_time >= config.event_timer_threshold:
                event_info = SimulationEvent(
                    triggered=True,
                    event_mode="TIMER",
                    event_time=round(current_time, 2),
                    miss_distance=round(current_dist, 2),
                    message=f"SIMULATED TIMER EVENT TRIGGERED at t = {round(current_time, 2)} s (Threshold: {config.event_timer_threshold} s). Miss distance = {round(current_dist, 2)} m."
                )
                should_stop = True
            elif config.event_mode == "PROXIMITY" and current_dist <= config.event_proximity_threshold:
                event_info = SimulationEvent(
                    triggered=True,
                    event_mode="PROXIMITY",
                    event_time=round(current_time, 2),
                    miss_distance=round(current_dist, 2),
                    message=f"SIMULATED PROXIMITY EVENT TRIGGERED at range = {round(current_dist, 2)} m (Threshold: {config.event_proximity_threshold} m)."
                )
                should_stop = True
            elif vehicle.pos[2] <= 0.0:  # Ground intersection
                event_info = SimulationEvent(
                    triggered=True,
                    event_mode="IMPACT",
                    event_time=round(current_time, 2),
                    miss_distance=round(current_dist, 2),
                    message=f"SIMULATED GROUND IMPACT REACHED at t = {round(current_time, 2)} s with terminal miss distance = {round(current_dist, 2)} m."
                )
                should_stop = True

            if should_stop:
                break

            current_time += dt

        # If loop reached max duration without explicit event
        if not event_info.triggered:
            final_dist = float(np.linalg.norm(vehicle.pos - target_pos))
            event_info = SimulationEvent(
                triggered=False,
                event_mode="TIMEOUT",
                event_time=round(current_time, 2),
                miss_distance=round(final_dist, 2),
                message=f"Simulation duration limit reached ({max_duration} s)."
            )

        # Compute summary
        errors = [p.position_error for p in telemetry]
        final_p = telemetry[-1]
        summary = {
            "flight_time_s": final_p.time,
            "final_position": final_p.true_position,
            "target_position": config.target_position,
            "final_miss_distance_m": event_info.miss_distance,
            "mean_position_error_m": round(float(np.mean(errors)), 3) if errors else 0.0,
            "max_position_error_m": round(float(np.max(errors)), 3) if errors else 0.0,
            "guidance_enabled": config.guidance_enabled,
            "telemetry_points_count": len(telemetry),
            "actuator_final_status": final_p.actuator_status,
            "terminal_velocity_mag": round(float(np.linalg.norm(final_p.true_velocity)), 2)
        }

        response = SimulationResponse(
            id=sim_id,
            timestamp=timestamp,
            config=config,
            telemetry=telemetry,
            event=event_info,
            summary=summary
        )

        self.cached_simulations[sim_id] = response
        return response

    def run_monte_carlo(self, req: MonteCarloRequest) -> MonteCarloResponse:
        """
        High-Performance Vectorized Monte Carlo statistical dispersion analysis.
        Capable of simulating 100 to 5000 runs in under 1 second using NumPy vectorization.
        """
        cfg = req.base_config or SimulationConfig()
        runs = req.runs
        
        base_pos = np.array(cfg.initial_position, dtype=float)
        base_vel = np.array(cfg.initial_velocity, dtype=float)
        target_pos = np.array(cfg.target_position, dtype=float)
        base_wind = np.array(cfg.wind_disturbance, dtype=float)
        
        # Approximate flight time
        init_dist = float(np.linalg.norm(base_pos - target_pos))
        est_time = min(30.0, max(5.0, init_dist / max(10.0, np.linalg.norm(base_vel))))
        dt = 0.1
        steps = int(est_time / dt)

        # Initialize vectorized state matrices of shape (runs, 3)
        p_noise = np.random.normal(0.0, req.pos_noise_std, (runs, 3))
        v_noise = np.random.normal(0.0, req.vel_noise_std, (runs, 3))
        w_noise = np.random.normal(0.0, req.wind_noise_std, (runs, 3))

        pos = np.tile(base_pos, (runs, 1)) + p_noise
        vel = np.tile(base_vel, (runs, 1)) + v_noise
        wind = np.tile(base_wind, (runs, 1)) + w_noise

        # Controller gain perturbations per run
        gain_factors = 1.0 + np.random.uniform(-req.controller_variation_factor, req.controller_variation_factor, (runs, 1))
        effective_kp = cfg.kp * gain_factors
        effective_kd = cfg.kd * gain_factors

        # Active flag per run
        active = np.ones(runs, dtype=bool)
        flight_times = np.full(runs, est_time)
        statuses = ["IN_FLIGHT"] * runs

        # Nominal Trajectory Generator reference
        t_gen = NominalTrajectoryGenerator(base_pos, target_pos, est_time)

        gravity = np.array([0.0, 0.0, -9.81])
        c_drag = 0.00008

        # Vectorized integration loop
        for s in range(steps):
            t_curr = s * dt
            if not np.any(active):
                break

            des_pos, des_vel = t_gen.sample(t_curr)

            # Aerodynamic drag relative to wind
            v_rel = vel[active] - wind[active]
            speed_rel = np.linalg.norm(v_rel, axis=1, keepdims=True)
            drag = -c_drag * speed_rel * v_rel

            # Guidance acceleration
            if cfg.guidance_enabled:
                # Add estimation noise to perceived position
                est_noise = np.random.normal(0.0, 5.0 * req.sensor_noise_factor, pos[active].shape)
                est_p = pos[active] + est_noise
                
                pos_err = des_pos - est_p
                vel_err = des_vel - vel[active]
                
                a_guidance = effective_kp[active] * 0.8 * pos_err + effective_kd[active] * 0.4 * vel_err
                a_mag = np.linalg.norm(a_guidance, axis=1, keepdims=True)
                max_a = 22.0
                clipped_a = np.where(a_mag > max_a, (a_guidance / np.maximum(1e-4, a_mag)) * max_a, a_guidance)
            else:
                clipped_a = np.zeros_like(vel[active])

            # Semi-implicit Euler integration for fast vector Monte Carlo
            total_accel = gravity + drag + clipped_a
            vel[active] += total_accel * dt
            pos[active] += vel[active] * dt

            # Distance to target for active runs
            dists = np.linalg.norm(pos[active] - target_pos, axis=1)

            # Check terminations: ground impact or proximity trigger
            hit_ground = pos[active, 2] <= 0.0
            prox_triggered = (cfg.event_mode == "PROXIMITY") & (dists <= cfg.event_proximity_threshold)

            terminating = hit_ground | prox_triggered
            if np.any(terminating):
                active_indices = np.where(active)[0]
                term_indices = active_indices[terminating]
                
                for idx in term_indices:
                    flight_times[idx] = round(t_curr, 2)
                    statuses[idx] = "TRIGGERED" if prox_triggered[active_indices == idx][0] else "GROUND_INTERSECT"
                
                active[term_indices] = False

        # Compute miss distances to target
        miss_distances = np.linalg.norm(pos - target_pos, axis=1)

        # Assemble individual point records (limit detailed point array to 500 for lightweight JSON transfer)
        display_limit = min(500, runs)
        points: List[MonteCarloPoint] = []
        for i in range(display_limit):
            points.append(MonteCarloPoint(
                run_id=i + 1,
                final_x=round(float(pos[i, 0]), 2),
                final_y=round(float(pos[i, 1]), 2),
                final_z=round(float(pos[i, 2]), 2),
                miss_distance=round(float(miss_distances[i]), 2),
                flight_time=round(float(flight_times[i]), 2),
                status=statuses[i]
            ))

        mean_err = float(np.mean(miss_distances))
        std_err = float(np.std(miss_distances))
        max_err = float(np.max(miss_distances))
        min_err = float(np.min(miss_distances))
        median_err = float(np.median(miss_distances))

        cep_50 = float(np.percentile(miss_distances, 50))
        cep_95 = float(np.percentile(miss_distances, 95))

        within_radii = {
            "5m": round(float(np.mean(miss_distances <= 5.0) * 100.0), 1),
            "10m": round(float(np.mean(miss_distances <= 10.0) * 100.0), 1),
            "25m": round(float(np.mean(miss_distances <= 25.0) * 100.0), 1),
            "50m": round(float(np.mean(miss_distances <= 50.0) * 100.0), 1),
        }

        # Histogram generation (16 bins)
        counts, bin_edges = np.histogram(miss_distances, bins=16)
        hist_bins: List[HistogramBin] = []
        for b_idx in range(len(counts)):
            b_min = float(bin_edges[b_idx])
            b_max = float(bin_edges[b_idx + 1])
            hist_bins.append(HistogramBin(
                bin_center=round(0.5 * (b_min + b_max), 2),
                bin_min=round(b_min, 2),
                bin_max=round(b_max, 2),
                count=int(counts[b_idx]),
                frequency=round(float(counts[b_idx]) / runs, 4)
            ))

        return MonteCarloResponse(
            runs=runs,
            points=points,
            mean_error=round(mean_err, 2),
            std_dev_error=round(std_err, 2),
            max_error=round(max_err, 2),
            min_error=round(min_err, 2),
            median_error=round(median_err, 2),
            cep_50_simulation=round(cep_50, 2),
            cep_95_simulation=round(cep_95, 2),
            within_radius=within_radii,
            histogram=hist_bins
        )

# Global simulation engine instance
engine = SimulationEngine()
