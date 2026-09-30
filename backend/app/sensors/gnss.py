import numpy as np
from typing import Dict, Any

class SimulatedGNSS:
    """
    Educational Simulated GNSS Receiver (Global Navigation Satellite System).
    Abstract simulation model - not representing any specific military receiver.
    Simulates:
      - 3D Position fix with pseudo-range noise
      - HDOP/VDOP metrics
      - Lock status
    """
    def __init__(self, noise_scale: float = 0.05):
        self.noise_scale = noise_scale
        self.status = "LOCKED_3D_FIX"

    def measure(self, true_pos: np.ndarray) -> Dict[str, Any]:
        """
        true_pos: [x, y, z] in meters
        """
        # Horizontal error std ~ 1.5m * noise_scale factor
        horiz_sigma = max(0.2, 2.5 * self.noise_scale)
        vert_sigma = max(0.5, 4.0 * self.noise_scale)

        noise = np.array([
            np.random.normal(0.0, horiz_sigma),
            np.random.normal(0.0, horiz_sigma),
            np.random.normal(0.0, vert_sigma)
        ])

        measured_pos = true_pos + noise
        error_3d = float(np.linalg.norm(noise))

        # Status check based on noise
        if self.noise_scale > 0.4:
            self.status = "DEGRADED_SIGNAL"
        else:
            self.status = "LOCKED_3D_FIX"

        return {
            "name": "Simulated Multi-Constellation GNSS",
            "status": self.status,
            "x": {
                "true": float(true_pos[0]),
                "measured": float(measured_pos[0]),
                "noise": float(noise[0]),
                "error": float(noise[0]),
                "unit": "m"
            },
            "y": {
                "true": float(true_pos[1]),
                "measured": float(measured_pos[1]),
                "noise": float(noise[1]),
                "error": float(noise[1]),
                "unit": "m"
            },
            "z": {
                "true": float(true_pos[2]),
                "measured": float(measured_pos[2]),
                "noise": float(noise[2]),
                "error": float(noise[2]),
                "unit": "m"
            },
            "total_error_3d": error_3d,
            "satellites_tracked": 12 if self.noise_scale < 0.2 else 8,
            "hdop": float(round(0.8 + 0.5 * self.noise_scale, 2)),
            "vdop": float(round(1.2 + 0.8 * self.noise_scale, 2))
        }
