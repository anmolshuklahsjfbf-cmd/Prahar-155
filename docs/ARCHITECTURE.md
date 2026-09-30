# System Architecture & Mathematical Foundations

## 1. Overview
The **Precision Guidance & Smart Fuze Simulation Platform** is an educational, non-deployable aerospace engineering workbench developed for the Smart India Hackathon (SIH). It simulates the complete Guidance, Navigation, and Control (GNC) closed-loop pipeline for an abstract flight vehicle under environmental disturbances.

```
       [ Configuration & Target Coordinates ]
                         │
                         ▼
        ┌──────────────────────────────────┐
   ┌───►│ 6-DOF Vehicle Dynamic Model (RK4)│
   │    └────────────────┬─────────────────┘
   │                     │ True State [p, v, a]
   │                     ▼
   │    ┌──────────────────────────────────┐
   │    │     Simulated Sensors Suite      │
   │    │  (IMU, GNSS, Altimeter, Proximity│
   │    └────────────────┬─────────────────┘
   │                     │ Sensor Measurements + Noise
   │                     ▼
   │    ┌──────────────────────────────────┐
   │    │   State Estimator (Kalman Filter)│
   │    └────────────────┬─────────────────┘
   │                     │ Estimated State [p_hat, v_hat]
   │                     ▼
   │    ┌──────────────────────────────────┐
   │    │   Trajectory Guidance Module     │
   │    └────────────────┬─────────────────┘
   │                     │ Guidance Accel Demand [a_cmd]
   │                     ▼
   │    ┌──────────────────────────────────┐
   │    │   Feedback Controller (Dual PID) │
   │    └────────────────┬─────────────────┘
   │                     │ Normalized Steering [-1, 1]
   │                     ▼
   │    ┌──────────────────────────────────┐
   │    │     Abstract Actuator Model      │
   │    │ (Lag tau=0.08s, Rate Limit, Sat) │
   │    └────────────────┬─────────────────┘
   │                     │ Control Surface Deflections
   └─────────────────────┘
```

---

## 2. Mathematical Formulations

### 2.1 Vehicle Dynamics & Numerical Integration
The generic flight vehicle is modeled as a 3-dimensional point mass with decoupled aerodynamic and steering authorities:
$$\dot{\vec{p}} = \vec{v}$$
$$\dot{\vec{v}} = \vec{g} + \vec{a}_{drag}(\vec{v}_{rel}) + \vec{a}_{ctrl}(\vec{\delta})$$

Where:
- $\vec{g} = [0, 0, -9.81]^T \text{ m/s}^2$
- Relative air velocity: $\vec{v}_{rel} = \vec{v} - \vec{w}_{wind}$
- Aerodynamic drag acceleration: $\vec{a}_{drag} = -c_{drag} \cdot \|\vec{v}_{rel}\| \cdot \vec{v}_{rel}$
- Control acceleration from surface deflections $\delta_{pitch}, \delta_{yaw} \in [-1.0, 1.0]$:
  $$\vec{a}_{ctrl} = a_{max} \left( \delta_{pitch} \hat{u}_{pitch} + \delta_{yaw} \hat{u}_{yaw} \right)$$

Numerical propagation utilizes the classical **4th-Order Runge-Kutta (RK4)** integration:
$$\vec{y}_{n+1} = \vec{y}_n + \frac{\Delta t}{6} \left( k_1 + 2k_2 + 2k_3 + k_4 \right)$$

---

### 2.2 Discrete Kalman Filter State Estimator
To reconstruct position and velocity under sensor noise, a discrete 6-state Kalman filter is implemented:
- **State vector:** $\hat{\mathbf{x}} = [x, y, z, v_x, v_y, v_z]^T$
- **State Transition Matrix:**
  $$F = \begin{bmatrix} I_{3\times 3} & \Delta t \cdot I_{3\times 3} \\ 0_{3\times 3} & I_{3\times 3} \end{bmatrix}$$
- **Control Input:** IMU specific force measurement $\vec{f}_{meas} = \vec{a} - \vec{g}$:
  $$B = \begin{bmatrix} \frac{1}{2} \Delta t^2 \cdot I_{3\times 3} \\ \Delta t \cdot I_{3\times 3} \end{bmatrix}, \quad \vec{u} = \vec{f}_{meas} + \vec{g}$$
- **Measurement Matrix:** GNSS and Altimeter 3D position observables:
  $$H = \begin{bmatrix} I_{3\times 3} & 0_{3\times 3} \end{bmatrix}$$
- **Kalman Gain & Correction:**
  $$K_k = P_k^- H^T \left( H P_k^- H^T + R \right)^{-1}$$
  $$\hat{\mathbf{x}}_k = \hat{\mathbf{x}}_k^- + K_k \left( \vec{z}_{meas} - H \hat{\mathbf{x}}_k^- \right)$$

---

### 2.3 Trajectory Guidance Law
The guidance module generates nominal descent profiles using cubic Bezier curves connecting the start position $\vec{p}_0$ to the target $\vec{p}_{target}$.

Tracking errors:
- **3D Error:** $\vec{e}_{pos} = \vec{p}_{des}(t) - \hat{\vec{p}}(t)$
- **Cross-Track Error:**
  $$e_{cross} = \| \vec{e}_{pos} - (\vec{e}_{pos} \cdot \hat{t}_{path}) \hat{t}_{path} \|$$
- **Corrective Guidance Demand:**
  $$\vec{a}_{guide} = K_p \vec{e}_{pos} + K_d (\vec{v}_{des} - \hat{\vec{v}})$$

---

### 2.4 Actuator Dynamics
Actuators do not deflect instantaneously. Real control-surface actuators exhibit bandwidth limits and rate limits:
$$\tau \frac{d\vec{\delta}}{dt} + \vec{\delta} = \vec{u}_{cmd}$$
$$\left| \frac{d\vec{\delta}}{dt} \right| \le \text{rate\_limit} = 4.0 \text{ units/s}$$
$$\vec{\delta} \in [-1.0, 1.0]$$

---

### 2.5 Simulated Event Manager
A simulated software event trigger is implemented with three selectable modes:
1. **TIMER:** Triggers when flight time $t \ge t_{threshold}$.
2. **PROXIMITY:** Triggers when distance to target $\|\vec{p} - \vec{p}_{target}\| \le d_{threshold}$.
3. **IMPACT:** Triggers when vehicle altitude $z \le 0.0$ m (ground intersection).

*Note: All event handling is simulated purely in software; no physical explosive or fuze circuits are modeled.*
