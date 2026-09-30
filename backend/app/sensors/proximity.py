import numpy as np
from typing import Dict, Any

class SimulatedProximitySensor:
    """
    Educational Simulated Proximity / Range-to-Target Sensor.
    Academic / Simulation only: Demonstrates sensor threshold detection logic.
    Does NOT implement any explosive, ignition, or weapon detonation logic.
    """
    def __init__(self, threshold_distance: float = 25.0, noise_scale: float = 0.05):
        self.threshold_distance = threshold_distance
        self.noise_scale = noise_scale
        self.status = "SEARCHING"
        self.has_triggered = False

    def measure(self, vehicle_pos: np.ndarray, target_pos: np.ndarray) -> Dict[str, Any]:
        """
        vehicle_pos: [x, y, z]
        target_pos: [xt, yt, zt]
        """
        true_distance = float(np.linalg.norm(vehicle_pos - target_pos))
        sigma = max(0.05, 0.5 * self.noise_scale)
        noise = float(np.random.normal(0.0, sigma))
        measured_distance = float(max(0.0, true_distance + noise))
        error = measured_distance - true_distance

        detection_status = "OUT_OF_RANGE"
        if measured_distance <= self.threshold_distance:
            detection_status = "PROXIMITY_DETECTED"
            self.status = "TRIGGER_FIRED"
            self.has_triggered = True
        elif measured_distance <= self.threshold_distance * 4.0:
            detection_status = "TARGET_APPROACHING"
            self.status = "TARGET_ACQUIRED"
        else:
            self.status = "SEARCHING"

        return {
            "name": "Simulated Proximity Range Sensor",
            "status": self.status,
            "true_distance": true_distance,
            "measured_distance": measured_distance,
            "noise": noise,
            "error": error,
            "threshold": self.threshold_distance,
            "detection_status": detection_status,
            "triggered": self.has_triggered,
            "unit": "m"
        }
