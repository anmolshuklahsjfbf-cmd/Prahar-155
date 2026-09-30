import numpy as np
from typing import Dict, Any, Tuple

class SimulatedKalmanFilter:
    """
    Simulated 6-State Linear Kalman Filter for Navigation State Estimation.
    Academic / Educational Simulation Model.
    
    States: [x, y, z, vx, vy, vz]
    Inputs: [ax, ay, az] from IMU accelerometer
    Measurements: [x, y, z] from GNSS & Altitude sensor
    """
    def __init__(self, init_pos: np.ndarray, init_vel: np.ndarray, dt: float = 0.05, nav_error_factor: float = 0.02):
        self.dt = dt
        self.nav_error_factor = nav_error_factor
        
        # Initial state estimate with small simulated initialization error
        init_bias = np.random.normal(0.0, 5.0 * nav_error_factor, 3)
        self.x = np.zeros(6)
        self.x[0:3] = init_pos + init_bias
        self.x[3:6] = init_vel + np.random.normal(0.0, 0.5 * nav_error_factor, 3)

        # State transition matrix F
        self.F = np.eye(6)
        self.F[0, 3] = dt
        self.F[1, 4] = dt
        self.F[2, 5] = dt

        # Control input matrix B
        self.B = np.zeros((6, 3))
        self.B[0:3, 0:3] = 0.5 * (dt ** 2) * np.eye(3)
        self.B[3:6, 0:3] = dt * np.eye(3)

        # Measurement matrix H (observes [x, y, z])
        self.H = np.zeros((3, 6))
        self.H[0:3, 0:3] = np.eye(3)

        # Process noise covariance Q
        q_pos = (0.1 + nav_error_factor) ** 2
        q_vel = (0.2 + nav_error_factor) ** 2
        self.Q = np.diag([q_pos, q_pos, q_pos, q_vel, q_vel, q_vel])

        # Measurement noise covariance R
        r_gnss = (2.0 * max(0.01, nav_error_factor * 5)) ** 2
        self.R = np.diag([r_gnss, r_gnss, r_gnss * 1.5])

        # State error covariance P
        self.P = np.diag([25.0, 25.0, 25.0, 4.0, 4.0, 4.0])

        self.last_innovation = np.zeros(3)

    def predict(self, imu_accel: np.ndarray):
        """
        imu_accel: specific force measured by IMU [ax, ay, az]
        Total kinematic acceleration u = a_meas + g
        """
        gravity = np.array([0.0, 0.0, -9.81])
        u_kinematic = imu_accel + gravity

        # State prediction: x_pred = F*x + B*u
        self.x = self.F @ self.x + self.B @ u_kinematic
        # Covariance prediction: P_pred = F*P*F^T + Q
        self.P = self.F @ self.P @ self.F.T + self.Q

    def update(self, gnss_pos: np.ndarray, alt_meas: float):
        """
        Fused measurement vector z = [x_gnss, y_gnss, alt_fused]
        """
        # Average or prioritize altimeter for vertical axis
        z_meas = np.array([gnss_pos[0], gnss_pos[1], 0.6 * alt_meas + 0.4 * gnss_pos[2]])

        # Innovation (measurement residual)
        y = z_meas - self.H @ self.x
        self.last_innovation = y

        # Innovation covariance S = H*P*H^T + R
        S = self.H @ self.P @ self.H.T + self.R

        # Near-optimal Kalman Gain K = P * H^T * inv(S)
        K = self.P @ self.H.T @ np.linalg.inv(S)

        # State update
        self.x = self.x + K @ y

        # Joseph form or standard covariance update: P = (I - K*H)*P
        I = np.eye(6)
        self.P = (I - K @ self.H) @ self.P

    def get_state(self) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
        """
        Returns estimated position, estimated velocity, and estimation statistics.
        """
        est_pos = self.x[0:3].copy()
        est_vel = self.x[3:6].copy()

        # Compute speed and simulated attitude from velocity vector
        speed = float(np.linalg.norm(est_vel))
        horiz_speed = float(np.linalg.norm(est_vel[0:2]))
        pitch_deg = float(np.degrees(np.arctan2(est_vel[2], max(0.1, horiz_speed))))
        yaw_deg = float(np.degrees(np.arctan2(est_vel[1], est_vel[0])))

        stats = {
            "model": "Discrete Extended Kalman Filter (Simulation Model)",
            "speed_m_s": speed,
            "estimated_pitch_deg": pitch_deg,
            "estimated_yaw_deg": yaw_deg,
            "position_variance": float(np.trace(self.P[0:3, 0:3])),
            "velocity_variance": float(np.trace(self.P[3:6, 3:6])),
            "innovation_norm": float(np.linalg.norm(self.last_innovation))
        }

        return est_pos, est_vel, stats
