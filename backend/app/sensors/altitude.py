import numpy as np
from typing import Dict, Any

class SimulatedAltitudeSensor:
    """
    Educational Simulated Barometric / Radar Altitude Sensor.
    Abstract educational model.
    """
    def __init__(self, noise_scale: float = 0.05):
        self.noise_scale = noise_scale
        self.status = "ACTIVE"

    def measure(self, true_altitude: float) -> Dict[str, Any]:
        """
        true_altitude: altitude in meters (z coordinate above ground)
        """
        sigma = max(0.1, 1.2 * self.noise_scale)
        noise = float(np.random.normal(0.0, sigma))
        measured_alt = float(max(0.0, true_altitude + noise))
        error = measured_alt - true_altitude

        return {
            "name": "Simulated Altitude Sensor (Baro/Radar)",
            "status": self.status,
            "true_altitude": float(true_altitude),
            "measured_altitude": measured_alt,
            "noise": noise,
            "error": error,
            "unit": "m",
            "vertical_rate": 0.0 # updated in sensor suite
        }
