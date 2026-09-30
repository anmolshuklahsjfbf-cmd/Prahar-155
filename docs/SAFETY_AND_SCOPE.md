# Important Safety, Scope and Academic Boundary Declaration

## 1. Project Context
This software was created for an engineering competition (Smart India Hackathon - SIH) as an academic visualization and control simulation workbench.

## 2. Boundaries and Explicit Exclusions
In compliance with strict safety directives and responsible AI guidelines, this project explicitly avoids:
1. **No Real Artillery Firing Solutions:** Does not provide, compute, or utilize real ballistic trajectory tables (firing tables), elevation angles, propellant burn data, or muzzle velocity tables.
2. **No Real 155 mm Projectile Parameters:** Projectile dimensions, mass, center of gravity, moments of inertia, and Mach-dependent drag curves ($C_D$ vs Mach) are abstract and fictionalized.
3. **No Launch Acceleration Parameters:** Does not model high-g setback acceleration or rifling spin rates associated with gun-launched weapons.
4. **No Real Weapon Guidance Laws:** Real military proportional navigation (Pro-Nav), augmented proportional navigation, or seeker homing logic are not implemented. Guidance is generic line/polynomial trajectory tracking.
5. **No Real Weapon Optimization:** No parameter tuning aimed at maximizing physical damage or lethal radii.
6. **No Detonation or Fuze Electronics:** No explosive chemistry, ignition trains, electro-explosive devices (EED), arming sequences, or firing capacitors are modeled. The "Smart Fuze" simulation is purely an abstract software event manager that outputs simulated timestamps when thresholds are met.
7. **No Deployable Instructions:** The source code cannot be adapted or used to control physical military ordnance.

## 3. Educational Purpose
The simulation demonstrates core aerospace computer science concepts:
- Discrete numerical integration (4th-Order Runge-Kutta).
- Optimal state estimation with Kalman Filtering.
- Feedback PID control loops with actuator rate and deflection saturation.
- Vectorized Monte Carlo statistical uncertainty quantification.
- Interactive WebGL/Three.js 3D telemetry visualization.
