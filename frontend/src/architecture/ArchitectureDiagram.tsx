import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import {
  Cpu,
  Settings,
  Plane,
  Radio,
  Filter,
  Navigation2,
  Sliders,
  Gauge,
  ArrowRight,
  ArrowDown,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';

interface BlockDetails {
  id: string;
  name: string;
  category: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  mathFormulation: string;
  status: string;
}

export const ArchitectureDiagram: React.FC = () => {
  const { config, currentPoint, simulation } = useSimulation();
  const [selectedBlock, setSelectedBlock] = useState<string | null>('guidance');

  const blocks: Record<string, BlockDetails> = {
    config: {
      id: 'config',
      name: 'Configuration & Target',
      category: 'Mission Parameters',
      purpose: 'Defines abstract mission parameters, target coordinates, wind disturbances, sensor noise factors, and simulated event thresholds.',
      inputs: ['User Interface Sliders', 'Scenario Presets (Demo Mode)'],
      outputs: ['P0 (Init Position)', 'V0 (Init Velocity)', 'P_target', 'Wind Vector', 'Gains (Kp, Ki, Kd)'],
      mathFormulation: 'Target P_t = [X_t, Y_t, Z_t] in Cartesian 3D coordinate space',
      status: 'CONFIGURED',
    },
    vehicle: {
      id: 'vehicle',
      name: 'Vehicle Dynamics Model',
      category: 'Physics & Kinematics',
      purpose: 'Simulates 3D translational and rotational equations of motion of a generic guided flight vehicle using 4th-Order Runge-Kutta numerical integration.',
      inputs: ['Actuator Deflection (Pitch, Yaw)', 'Wind Vector', 'Gravity Vector [0, 0, -9.81]'],
      outputs: ['True Position [X, Y, Z]', 'True Velocity [Vx, Vy, Vz]', 'Attitude [Roll, Pitch, Yaw]', 'Total Acceleration'],
      mathFormulation: 'a = g + a_drag(v_rel) + a_ctrl(deflection), integrated via RK4 step',
      status: currentPoint ? 'ACTIVE_FLIGHT' : 'STANDBY',
    },
    sensors: {
      id: 'sensors',
      name: 'Simulated Sensor Suite',
      category: 'Avionics Simulation',
      purpose: 'Educational simulation of onboard navigation sensors: 3-axis IMU (specific force & gyro rates), GNSS receiver (3D position fix), Altitude sensor (barometric/radar), and Proximity sensor.',
      inputs: ['Vehicle Kinematics (True Position, Velocity, Acceleration)', 'Target Position'],
      outputs: ['IMU Accel/Gyro Measurements', 'GNSS Position Fix', 'Altimeter Altitude', 'Range-to-Target'],
      mathFormulation: 'z_meas = z_true + b_sensor + eta_noise, with eta ~ N(0, sigma^2)',
      status: 'SAMPLING_100HZ',
    },
    estimator: {
      id: 'estimator',
      name: 'State Estimator (Kalman Filter)',
      category: 'Data Fusion',
      purpose: 'Fuses high-rate IMU accelerations with periodic GNSS fixes and altitude measurements to compute optimal estimated vehicle state.',
      inputs: ['IMU Specific Force [ax, ay, az]', 'GNSS Position [x, y, z]', 'Altimeter Z'],
      outputs: ['Estimated Position [X_est, Y_est, Z_est]', 'Estimated Velocity [Vx_est, Vy_est, Vz_est]', 'Estimation Error Covariance P'],
      mathFormulation: 'x_pred = F*x + B*u; K = P*H^T*(H*P*H^T + R)^-1; x_new = x_pred + K*(z - H*x_pred)',
      status: 'KALMAN_CONVERGED',
    },
    guidance: {
      id: 'guidance',
      name: 'Trajectory Guidance Module',
      category: 'Path Generation & Tracking',
      purpose: 'Samples nominal cubic Bezier reference trajectory and computes lateral and vertical guidance acceleration commands to null cross-track and heading errors.',
      inputs: ['Estimated State (Pos, Vel)', 'Desired Reference Trajectory', 'Target Location'],
      outputs: ['Guidance Acceleration Command [Pitch Cmd, Yaw Cmd]', 'Cross-Track Error', 'Heading Error', 'Range to Target'],
      mathFormulation: 'a_cmd = K_p * (p_des - p_est) + K_d * (v_des - v_est), clamped to a_max',
      status: config.guidance_enabled ? 'GUIDANCE_ACTIVE' : 'BALLISTIC_FREE_FLIGHT',
    },
    controller: {
      id: 'controller',
      name: 'Feedback Controller',
      category: 'Closed-Loop Control',
      purpose: 'Dual-axis PID controller with integral anti-windup that translates guidance acceleration demands into normalized steering commands.',
      inputs: ['Guidance Acceleration Demands', 'Estimated Velocity Vector', 'PID Gains (Kp, Ki, Kd)'],
      outputs: ['Normalized Pitch Command u_p in [-1, 1]', 'Normalized Yaw Command u_y in [-1, 1]'],
      mathFormulation: 'u(t) = K_p*e(t) + K_i*int(e)dt + K_d*de/dt, saturated to [-1.0, 1.0]',
      status: 'CLOSED_LOOP_ACTIVE',
    },
    actuator: {
      id: 'actuator',
      name: 'Abstract Actuator Model',
      category: 'Control Surfaces',
      purpose: 'Simulates physical control surface deflection lag, rate limits, and mechanical saturation for Pitch and Yaw aerodynamic steering.',
      inputs: ['Normalized Commands [u_pitch, u_yaw]'],
      outputs: ['Actual Deflection [delta_p, delta_y]', 'Actuator Status (Nominal, Rate Limited, Saturated)'],
      mathFormulation: 'tau * d(delta)/dt + delta = u_cmd, bounded by rate_limit & saturation [-1, 1]',
      status: currentPoint ? currentPoint.actuator_status : 'NOMINAL',
    },
  };

  const blockKeys = ['config', 'vehicle', 'sensors', 'estimator', 'guidance', 'controller', 'actuator'];

  const activeDetails = selectedBlock ? blocks[selectedBlock] : blocks['guidance'];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Diagram Canvas */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-400" />
              Closed-Loop Simulation Architecture
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Click any functional block below to inspect inputs, outputs, mathematical models, and live telemetry.
            </p>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded text-xs font-mono bg-sky-500/10 border border-sky-500/30 text-sky-400">
            INTERACTIVE
          </span>
        </div>

        {/* Flow Blocks Layout */}
        <div className="flex flex-col gap-4">
          {/* Row 1: Config -> Vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedBlock('config')}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                selectedBlock === 'config'
                  ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-400">
                  <Settings className="w-4 h-4" /> CONFIGURATION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  INIT
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-200">Mission & Environment Setup</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">Target, initial state, wind disturbances</p>
            </button>

            <button
              onClick={() => setSelectedBlock('vehicle')}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                selectedBlock === 'vehicle'
                  ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
                  <Plane className="w-4 h-4" /> VEHICLE MODEL
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  RK4 6-DOF
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-200">Flight Dynamics & Aero Forces</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">Computes true trajectory and state</p>
            </button>
          </div>

          {/* Arrow */}
          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-5 h-5 animate-pulse" />
          </div>

          {/* Row 2: Sensors -> Estimator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedBlock('sensors')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedBlock === 'sensors'
                  ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400">
                  <Radio className="w-4 h-4" /> SENSORS SUITE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  IMU/GNSS/ALT
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-200">Sensor Noise & Sampling</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">Simulated measurements with bias and Gaussian noise</p>
            </button>

            <button
              onClick={() => setSelectedBlock('estimator')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedBlock === 'estimator'
                  ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400">
                  <Filter className="w-4 h-4" /> STATE ESTIMATOR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  KALMAN FILTER
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-200">State Estimation & Filtering</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">Reconstructs position and velocity state</p>
            </button>
          </div>

          {/* Arrow */}
          <div className="flex justify-center text-slate-600">
            <ArrowDown className="w-5 h-5 animate-pulse" />
          </div>

          {/* Row 3: Guidance -> Controller -> Actuator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedBlock('guidance')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedBlock === 'guidance'
                  ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-400">
                  <Navigation2 className="w-3.5 h-3.5" /> GUIDANCE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  TRACKING
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200">Trajectory Follower</p>
              <p className="text-[11px] text-slate-500 mt-1">Cross-track error to acceleration demand</p>
            </button>

            <button
              onClick={() => setSelectedBlock('controller')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedBlock === 'controller'
                  ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400">
                  <Sliders className="w-3.5 h-3.5" /> CONTROLLER
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  PID DUAL-AXIS
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200">Feedback PID</p>
              <p className="text-[11px] text-slate-500 mt-1">Generates [-1.0, 1.0] commands</p>
            </button>

            <button
              onClick={() => setSelectedBlock('actuator')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedBlock === 'actuator'
                  ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
                  <Gauge className="w-3.5 h-3.5" /> ACTUATOR
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  SURFACE
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200">Fin Deflection</p>
              <p className="text-[11px] text-slate-500 mt-1">Lag, rate limits, deflection</p>
            </button>
          </div>

          {/* Feedback loop return arrow indicator */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Closed feedback loop: Actuator deflections apply corrective aerodynamic moment to Vehicle Model</span>
          </div>
        </div>
      </div>

      {/* Information Side Panel for Selected Block */}
      <div className="w-full lg:w-96 bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider block">
                {activeDetails.category}
              </span>
              <h3 className="text-base font-bold text-slate-100">{activeDetails.name}</h3>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
              {activeDetails.status}
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Purpose */}
            <div>
              <h4 className="text-slate-400 font-semibold mb-1 text-[11px] uppercase">Purpose & Overview</h4>
              <p className="text-slate-300 leading-relaxed font-sans">{activeDetails.purpose}</p>
            </div>

            {/* Inputs */}
            <div>
              <h4 className="text-slate-400 font-semibold mb-1.5 text-[11px] uppercase">Inputs</h4>
              <ul className="space-y-1">
                {activeDetails.inputs.map((inp, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outputs */}
            <div>
              <h4 className="text-slate-400 font-semibold mb-1.5 text-[11px] uppercase">Outputs</h4>
              <ul className="space-y-1">
                {activeDetails.outputs.map((out, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mathematical Model */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <h4 className="text-slate-400 font-semibold mb-1 text-[10px] uppercase">Formulation</h4>
              <code className="text-sky-300 text-[11px] block break-words">
                {activeDetails.mathFormulation}
              </code>
            </div>
          </div>
        </div>

        {/* Live Simulation State Values */}
        {currentPoint && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2">
              Live State (T+{currentPoint.time.toFixed(2)}s)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">3D ERROR</span>
                <span className="text-emerald-400 font-semibold">{currentPoint.position_error.toFixed(2)} m</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">CROSS-TRACK</span>
                <span className="text-amber-400 font-semibold">{currentPoint.cross_track_error.toFixed(2)} m</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">DEFLECTION P</span>
                <span className="text-sky-300 font-semibold">{currentPoint.actuator_deflection[0].toFixed(2)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">DEFLECTION Y</span>
                <span className="text-sky-300 font-semibold">{currentPoint.actuator_deflection[1].toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
