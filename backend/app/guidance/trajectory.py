import numpy as np
from typing import Tuple

class NominalTrajectoryGenerator:
    """
    Generates a smooth nominal reference flight path between initial point and target.
    Academic / Educational Model: Uses cubic polynomial smoothing in 3D.
    """
    def __init__(self, start_pos: np.ndarray, target_pos: np.ndarray, total_time: float):
        self.p0 = np.array(start_pos, dtype=float)
        self.p_target = np.array(target_pos, dtype=float)
        self.T = max(1.0, float(total_time))
        
        # Calculate nominal glide slope or trajectory profile
        # Midpoint apex for a gentle parabolic descent trajectory
        self.midpoint = 0.5 * (self.p0 + self.p_target)
        # Gentle convex glide descent
        self.midpoint[2] = 0.5 * (self.p0[2] + self.p_target[2]) + 25.0

    def sample(self, t: float) -> Tuple[np.ndarray, np.ndarray]:
        """
        Samples desired position and desired velocity at normalized time tau = t/T.
        tau in [0, 1]
        """
        tau = min(1.0, max(0.0, t / self.T))
        
        # Quadratic Bezier interpolation for smooth reference path
        # B(tau) = (1-tau)^2 * P0 + 2*(1-tau)*tau * Pmid + tau^2 * Ptarget
        b0 = (1.0 - tau) ** 2
        b1 = 2.0 * (1.0 - tau) * tau
        b2 = tau ** 2
        
        desired_pos = b0 * self.p0 + b1 * self.midpoint + b2 * self.p_target
        
        # Derivative with respect to t: dtau/dt = 1/T
        db0 = -2.0 * (1.0 - tau) / self.T
        db1 = (2.0 - 4.0 * tau) / self.T
        db2 = (2.0 * tau) / self.T
        
        desired_vel = db0 * self.p0 + db1 * self.midpoint + db2 * self.p_target
        
        return desired_pos, desired_vel
