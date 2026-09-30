import numpy as np
from typing import Dict, Any

class SimulatedIMU:
    """
    Educational Simulated IMU (Inertial Measurement Unit).
    Abstract simulation model - not representing any specific military hardware.
    Simulates:
      - 3-axis Accelerometer (specific force including gravity)
      - 3-axis Rate Gyroscope (pitch, yaw, roll rates)
      - Sensor noise and bias drift
    """
    def __init__(self, noise_scale: float = 0.05):
        self.noise_scale = noise_scale
        # Small static bias for demonstration
        self.accel_bias = np.array([0.02, -0.015, 0.03]) * noise_scale
        self.gyro_bias = np.array([0.005, 0.008, -0.004]) * noise_scale
        self.status = "OPERATIONAL"

    def measure(self, true_accel: np.ndarray, true_rates: np.ndarray, orientation: np.ndarray) -> Dict[str, Any]:
        """
        true_accel: [ax, ay, az] in m/s^2 (kinematic acceleration)
        true_rates: [p, q, r] in rad/s (roll, pitch, yaw rates)
        orientation: [roll, pitch, yaw] in degrees
        """
        # Specific force includes opposite of gravity [0, 0, -9.81]
        gravity = np.array([0.0, 0.0, -9.81])
        specific_force_true = true_accel - gravity

        # Generate noise
        acc_noise = np.random.normal(0.0, 0.15 * max(0.01, self.noise_scale), 3)
        gyro_noise = np.random.normal(0.0, 0.02 * max(0.01, self.noise_scale), 3)

        measured_accel = specific_force_true + self.accel_bias + acc_noise
        measured_gyro = true_rates + self.gyro_bias + gyro_noise

        return {
            "name": "Simulated 6-DOF IMU",
            "status": self.status,
            "accel_x": {
                "true": float(specific_force_true[0]),
                "measured": float(measured_accel[0]),
                "noise": float(acc_noise[0]),
                "error": float(measured_accel[0] - specific_force_true[0]),
                "unit": "m/s²"
            },
            "accel_y": {
                "true": float(specific_force_true[1]),
                "measured": float(measured_accel[1]),
                "noise": float(acc_noise[1]),
                "error": float(measured_accel[1] - specific_force_true[1]),
                "unit": "m/s²"
            },
            "accel_z": {
                "true": float(specific_force_true[2]),
                "measured": float(measured_accel[2]),
                "noise": float(acc_noise[2]),
                "error": float(measured_accel[2] - specific_force_true[2]),
                "unit": "m/s²"
            },
            "gyro_pitch": {
                "true": float(true_rates[1]),
                "measured": float(measured_gyro[1]),
                "error": float(measured_gyro[1] - true_rates[1]),
                "unit": "rad/s"
            },
            "gyro_yaw": {
                "true": float(true_rates[2]),
                "measured": float(measured_gyro[2]),
                "error": float(measured_gyro[2] - true_rates[2]),
                "unit": "rad/s"
            },
            "orientation": {
                "roll": float(orientation[0]),
                "pitch": float(orientation[1]),
                "yaw": float(orientation[2]),
                "unit": "deg"
            }
        }
