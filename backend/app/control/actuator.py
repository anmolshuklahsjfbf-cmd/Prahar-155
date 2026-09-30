import numpy as np
from typing import Dict, Any, Tuple

class SimulatedActuator:
    """
    Abstract Control-Surface Actuator.
    Academic / Simulation Model - not representing any military hardware.
    
    Models:
      - First-order lag (actuator bandwidth tau)
      - Rate limiting (max deflection speed)
      - Deflection saturation [-1.0, +1.0]
    """
    def __init__(self, time_constant: float = 0.08, rate_limit: float = 4.0, dt: float = 0.05):
        self.tau = max(0.01, time_constant)
        self.rate_limit = rate_limit  # max units/sec
        self.dt = dt

        # Current actual deflection [-1.0, 1.0] for [pitch, yaw]
        self.deflection = np.array([0.0, 0.0])
        self.status = "NOMINAL"

    def step(self, cmd: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        cmd: normalized command [cmd_pitch, cmd_yaw] in [-1.0, 1.0]
        """
        clamped_cmd = np.clip(cmd, -1.0, 1.0)
        
        # Desired deflection rate: (cmd - current) / tau
        ideal_rate = (clamped_cmd - self.deflection) / self.tau

        # Check rate saturation
        actual_rate = np.clip(ideal_rate, -self.rate_limit, self.rate_limit)
        is_rate_limited = np.any(np.abs(ideal_rate) > self.rate_limit)

        # Update deflection
        new_deflection = self.deflection + actual_rate * self.dt

        # Check deflection saturation
        is_saturated = np.any(np.abs(new_deflection) >= 1.0)
        self.deflection = np.clip(new_deflection, -1.0, 1.0)

        # Determine status string
        if is_saturated:
            self.status = "SATURATED"
        elif is_rate_limited:
            self.status = "RATE_LIMITED"
        else:
            self.status = "NOMINAL"

        info = {
            "name": "Simulated Dual-Axis Actuator",
            "command": [float(cmd[0]), float(cmd[1])],
            "deflection": [float(self.deflection[0]), float(self.deflection[1])],
            "rate": [float(actual_rate[0]), float(actual_rate[1])],
            "status": self.status,
            "saturation_level": float(np.max(np.abs(self.deflection)))
        }

        return self.deflection.copy(), info
