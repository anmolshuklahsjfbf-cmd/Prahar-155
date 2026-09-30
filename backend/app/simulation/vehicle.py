import numpy as np
from typing import Tuple, Dict, Any

class GenericFlightVehicle:
    """
    Abstract Guided-Flight Vehicle 3D Kinematics and Dynamics.
    Academic / Educational Simulation Model.
    
    Uses normalized/fictional parameters for non-deployable simulation.
    DO NOT substitute real projectile or artillery values.
    """
    def __init__(self, init_pos: np.ndarray, init_vel: np.ndarray):
        self.pos = np.array(init_pos, dtype=float)
        self.vel = np.array(init_vel, dtype=float)
        self.accel = np.zeros(3)
        self.angular_rates = np.zeros(3) # [roll_rate, pitch_rate, yaw_rate]
        
        # Abstract aerodynamic drag coefficient for generic glide body
        self.c_drag = 0.00008
        # Maximum lateral control authority in m/s^2
        self.max_control_accel = 24.0

    def compute_acceleration(self, pos: np.ndarray, vel: np.ndarray, wind: np.ndarray, actuator_deflection: np.ndarray) -> np.ndarray:
        """
        Computes total acceleration = gravity + abstract aerodynamic drag + control force.
        """
        # Gravity
        g = np.array([0.0, 0.0, -9.81])

        # Relative velocity with wind disturbance
        v_rel = vel - wind
        speed_rel = np.linalg.norm(v_rel)

        # Abstract aerodynamic drag force
        drag_accel = -self.c_drag * speed_rel * v_rel

        # Control acceleration from actuator deflections [-1, 1]
        # Deflection[0] -> Pitch (vertical normal to flight path)
        # Deflection[1] -> Yaw (horizontal normal to flight path)
        speed = max(0.1, np.linalg.norm(vel))
        forward_dir = vel / speed

        # Horizontal lateral unit vector: [-vy, vx, 0] / speed_h
        speed_h = max(0.1, np.linalg.norm(vel[0:2]))
        lateral_dir = np.array([-vel[1], vel[0], 0.0]) / speed_h

        # Vertical normal vector (orthogonal to forward and lateral)
        vertical_dir = np.cross(forward_dir, lateral_dir)
        vert_norm = np.linalg.norm(vertical_dir)
        if vert_norm > 1e-4:
            vertical_dir = vertical_dir / vert_norm
        else:
            vertical_dir = np.array([0.0, 0.0, 1.0])

        # Control acceleration vector
        ctrl_accel = (
            actuator_deflection[0] * vertical_dir * self.max_control_accel +
            actuator_deflection[1] * lateral_dir * self.max_control_accel
        )

        total_accel = g + drag_accel + ctrl_accel
        return total_accel

    def step_rk4(self, dt: float, wind: np.ndarray, actuator_deflection: np.ndarray):
        """
        4th-Order Runge-Kutta numerical integration.
        """
        p0 = self.pos
        v0 = self.vel

        k1_v = self.compute_acceleration(p0, v0, wind, actuator_deflection)
        k1_p = v0

        k2_v = self.compute_acceleration(p0 + 0.5 * dt * k1_p, v0 + 0.5 * dt * k1_v, wind, actuator_deflection)
        k2_p = v0 + 0.5 * dt * k1_v

        k3_v = self.compute_acceleration(p0 + 0.5 * dt * k2_p, v0 + 0.5 * dt * k2_v, wind, actuator_deflection)
        k3_p = v0 + 0.5 * dt * k2_v

        k4_v = self.compute_acceleration(p0 + dt * k3_p, v0 + dt * k3_v, wind, actuator_deflection)
        k4_p = v0 + dt * k3_v

        # Update position and velocity
        self.pos = p0 + (dt / 6.0) * (k1_p + 2.0 * k2_p + 2.0 * k3_p + k4_p)
        self.vel = v0 + (dt / 6.0) * (k1_v + 2.0 * k2_v + 2.0 * k3_v + k4_v)
        self.accel = (k1_v + 2.0 * k2_v + 2.0 * k3_v + k4_v) / 6.0

        # Calculate attitude angles
        speed_h = max(0.1, np.linalg.norm(self.vel[0:2]))
        pitch_deg = float(np.degrees(np.arctan2(self.vel[2], speed_h)))
        yaw_deg = float(np.degrees(np.arctan2(self.vel[1], self.vel[0])))
        roll_deg = float(actuator_deflection[1] * 12.0) # slight simulated banking roll

        # Rates approximation
        self.angular_rates = np.array([
            0.0,
            np.radians(pitch_deg) * 0.1,
            np.radians(yaw_deg) * 0.1
        ])

        return np.array([roll_deg, pitch_deg, yaw_deg])
