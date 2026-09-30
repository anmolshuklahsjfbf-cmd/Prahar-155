import numpy as np
from typing import Dict, Any, Tuple

class GenericFeedbackController:
    """
    Generic Dual-Axis PID Feedback Controller.
    Channels: Pitch channel (vertical) and Yaw channel (lateral).
    Academic / Educational Simulation Model.
    Produces normalized control commands in [-1.0, +1.0].
    """
    def __init__(self, kp: float = 1.5, ki: float = 0.05, kd: float = 0.8, response_scale: float = 1.0, dt: float = 0.05):
        self.kp = kp * response_scale
        self.ki = ki * response_scale
        self.kd = kd * response_scale
        self.dt = dt

        self.integral_pitch = 0.0
        self.integral_yaw = 0.0
        self.prev_error_pitch = 0.0
        self.prev_error_yaw = 0.0

    def compute(self, guidance_accel: np.ndarray, current_vel: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        guidance_accel: desired correction acceleration [ax, ay, az]
        Computes normalized control command [u_pitch, u_yaw] in [-1.0, +1.0].
        """
        # Pitch channel demands vertical acceleration (az)
        # Yaw channel demands lateral acceleration (ay / ax perpendicular)
        error_pitch = float(guidance_accel[2])
        # Project horizontal guidance acceleration onto lateral axis
        speed_h = max(0.1, float(np.linalg.norm(current_vel[0:2])))
        # Lateral unit vector: [-vy, vx] / speed_h
        lat_unit = np.array([-current_vel[1], current_vel[0]]) / speed_h
        error_yaw = float(np.dot(guidance_accel[0:2], lat_unit))

        # Integrate with anti-windup clamping
        self.integral_pitch = np.clip(self.integral_pitch + error_pitch * self.dt, -15.0, 15.0)
        self.integral_yaw = np.clip(self.integral_yaw + error_yaw * self.dt, -15.0, 15.0)

        # Derivative
        deriv_pitch = (error_pitch - self.prev_error_pitch) / max(1e-4, self.dt)
        deriv_yaw = (error_yaw - self.prev_error_yaw) / max(1e-4, self.dt)

        self.prev_error_pitch = error_pitch
        self.prev_error_yaw = error_yaw

        # Normalized scaling gain (maps ~25 m/s^2 demand to 1.0 deflection)
        scale = 0.04

        u_pitch_raw = scale * (self.kp * error_pitch + self.ki * self.integral_pitch + self.kd * deriv_pitch)
        u_yaw_raw = scale * (self.kp * error_yaw + self.ki * self.integral_yaw + self.kd * deriv_yaw)

        # Saturate to [-1.0, 1.0]
        u_pitch = float(np.clip(u_pitch_raw, -1.0, 1.0))
        u_yaw = float(np.clip(u_yaw_raw, -1.0, 1.0))

        cmd = np.array([u_pitch, u_yaw])
        telemetry = {
            "pitch_command_raw": float(u_pitch_raw),
            "yaw_command_raw": float(u_yaw_raw),
            "pitch_command_clamped": u_pitch,
            "yaw_command_clamped": u_yaw,
            "pitch_integral": float(self.integral_pitch),
            "yaw_integral": float(self.integral_yaw),
            "error_pitch": error_pitch,
            "error_yaw": error_yaw
        }

        return cmd, telemetry
