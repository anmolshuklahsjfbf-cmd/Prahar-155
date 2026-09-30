import numpy as np
from typing import Dict, Any
from app.sensors.imu import SimulatedIMU
from app.sensors.gnss import SimulatedGNSS
from app.sensors.altitude import SimulatedAltitudeSensor
from app.sensors.proximity import SimulatedProximitySensor

class SimulatedSensorSuite:
    """
    Coordinates all simulated sensors on the flight vehicle.
    """
    def __init__(self, noise_scale: float = 0.05, proximity_threshold: float = 25.0):
        self.imu = SimulatedIMU(noise_scale=noise_scale)
        self.gnss = SimulatedGNSS(noise_scale=noise_scale)
        self.altitude = SimulatedAltitudeSensor(noise_scale=noise_scale)
        self.proximity = SimulatedProximitySensor(threshold_distance=proximity_threshold, noise_scale=noise_scale)

    def sample_all(
        self,
        true_pos: np.ndarray,
        true_vel: np.ndarray,
        true_accel: np.ndarray,
        angular_rates: np.ndarray,
        orientation_deg: np.ndarray,
        target_pos: np.ndarray
    ) -> Dict[str, Any]:
        """
        Samples all simulated sensors simultaneously.
        """
        imu_data = self.imu.measure(true_accel, angular_rates, orientation_deg)
        gnss_data = self.gnss.measure(true_pos)
        alt_data = self.altitude.measure(true_pos[2])
        alt_data["vertical_rate"] = float(true_vel[2])
        prox_data = self.proximity.measure(true_pos, target_pos)

        return {
            "imu": imu_data,
            "gnss": gnss_data,
            "altitude": alt_data,
            "proximity": prox_data
        }
