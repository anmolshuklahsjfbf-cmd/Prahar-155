import numpy as np
from typing import Dict, Any, Tuple

class GenericTrajectoryGuidance:
    """
    Generic Trajectory Tracking Guidance.
    Academic / Educational Simulation Model.
    
    Generates guidance acceleration commands based on tracking error between
    the estimated vehicle position and the reference trajectory path, transitioning
    to target line-of-sight tracking in the terminal phase.
    Does NOT implement any real weapon or military guidance laws.
    """
    def __init__(self, gain_factor: float = 1.0):
        self.gain = gain_factor

    def compute_guidance(
        self,
        est_pos: np.ndarray,
        est_vel: np.ndarray,
        des_pos: np.ndarray,
        des_vel: np.ndarray,
        target_pos: np.ndarray
    ) -> Tuple[np.ndarray, Dict[str, float]]:
        """
        Computes 3D guidance correction acceleration [ax_cmd, ay_cmd, az_cmd]
        and error metrics (cross-track, heading error, 3D distance).
        """
        # Distance to target
        dist_to_target = float(np.linalg.norm(est_pos - target_pos))

        # Position error relative to desired path
        pos_err = des_pos - est_pos
        vel_err = des_vel - est_vel
        dist_3d = float(np.linalg.norm(pos_err))

        # Nominal flight direction tangent
        speed_des = max(0.1, float(np.linalg.norm(des_vel)))
        tangent = des_vel / speed_des

        # Cross-track error (projection of pos_err orthogonal to path tangent)
        along_track = np.dot(pos_err, tangent)
        cross_track_vec = pos_err - along_track * tangent
        cross_track_error = float(np.linalg.norm(cross_track_vec))

        # Heading error in horizontal plane (degrees)
        horiz_vel = est_vel[0:2]
        horiz_des = des_vel[0:2]
        norm_v = np.linalg.norm(horiz_vel)
        norm_vd = np.linalg.norm(horiz_des)
        
        if norm_v > 0.1 and norm_vd > 0.1:
            dot_prod = np.clip(np.dot(horiz_vel, horiz_des) / (norm_v * norm_vd), -1.0, 1.0)
            heading_err_rad = float(np.arccos(dot_prod))
            cross_z = horiz_vel[0] * horiz_des[1] - horiz_vel[1] * horiz_des[0]
            heading_err_deg = np.degrees(heading_err_rad) * (1.0 if cross_z >= 0 else -1.0)
        else:
            heading_err_deg = 0.0

        # Midcourse path tracking vs Terminal pursuit guidance
        if dist_to_target > 650.0:
            kp_guidance = 1.2 * self.gain
            kd_guidance = 0.6 * self.gain
            a_guidance = kp_guidance * pos_err + kd_guidance * vel_err
        else:
            # Terminal phase: Direct Line-of-Sight vector alignment
            los_unit = (target_pos - est_pos) / max(0.1, dist_to_target)
            speed = np.linalg.norm(est_vel)
            desired_vel = los_unit * speed
            terminal_vel_err = desired_vel - est_vel
            terminal_pos_err = target_pos - est_pos
            a_guidance = (
                (1.5 * self.gain * terminal_pos_err / max(1.0, dist_to_target)) * (speed * 0.1) +
                2.8 * self.gain * terminal_vel_err
            )

        # Limit maximum allowable guidance acceleration
        a_norm = np.linalg.norm(a_guidance)
        max_a = 24.0
        if a_norm > max_a:
            a_guidance = (a_guidance / a_norm) * max_a

        metrics = {
            "position_error_3d": dist_3d,
            "cross_track_error": cross_track_error,
            "along_track_error": float(along_track),
            "heading_error_deg": float(heading_err_deg),
            "guidance_accel_mag": float(np.linalg.norm(a_guidance)),
            "distance_to_target": dist_to_target
        }

        return a_guidance, metrics
