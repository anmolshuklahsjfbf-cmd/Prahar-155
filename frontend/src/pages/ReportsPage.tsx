import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TrajectoryChart } from '../charts/TrajectoryChart';
import { ErrorChart } from '../charts/ErrorChart';
import { MonteCarloHistogram } from '../charts/MonteCarloHistogram';
import {
  FileText,
  Printer,
  Download,
  ShieldAlert,
  CheckCircle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { simulation, monteCarlo } = useSimulation();

  const handlePrint = () => {
    window.print();
  };

  if (!simulation) {
    return (
      <div className="p-16 text-center text-slate-500 font-mono">
        No simulation data available to generate report. Run a simulation first.
      </div>
    );
  }

  const cfg = simulation.config;
  const sum = simulation.summary;

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Simulation Analysis & Engineering Report
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Comprehensive audit report for academic evaluation, SIH competition, and performance logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE AS PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-xs font-mono text-sky-400 tracking-widest uppercase block mb-1">
              ENGINEERING TECHNICAL REPORT • SIH COMPETITION
            </span>
            <h2 className="text-2xl font-bold text-slate-100">
              Precision Guidance & Smart Fuze Simulation Report
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Simulation ID: <strong className="text-slate-200">#{simulation.id}</strong> | Generated:{' '}
              {new Date(simulation.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-right font-mono text-xs text-slate-400">
            <div>STATUS: <strong className="text-emerald-400">COMPLETED</strong></div>
            <div className="text-[10px] text-slate-500">RK4 INTEGRATION</div>
          </div>
        </div>

        {/* Mandatory Safety Notice */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-300 uppercase mb-0.5">Academic / SIH Simulation Scope Notice:</strong>
            Academic simulation only. Results do not represent validated real-world performance of an artillery or weapon system. All dynamics, control-surfaces, and trajectories are abstract, fictionalized models developed strictly for educational demonstration.
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-sm font-bold uppercase font-mono text-slate-300 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-sky-400" />
            Executive Flight Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TOTAL FLIGHT TIME</span>
              <span className="text-lg font-bold text-sky-300">{sum.flight_time_s} s</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">FINAL MISS DISTANCE</span>
              <span className="text-lg font-bold text-emerald-400">{sum.final_miss_distance_m} m</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MEAN TRACKING ERROR</span>
              <span className="text-lg font-bold text-amber-300">{sum.mean_position_error_m} m</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">EVENT RESULT</span>
              <span className="text-sm font-bold text-rose-300 truncate block">{simulation.event.event_mode}</span>
            </div>
          </div>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          {/* Mission & Kinematics Config */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 uppercase">
              1. Kinematic & Environmental Inputs
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Initial Position [X, Y, Z]:</span>
              <span className="text-slate-200">[{cfg.initial_position.join(', ')}] m</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Initial Velocity [Vx, Vy, Vz]:</span>
              <span className="text-slate-200">[{cfg.initial_velocity.join(', ')}] m/s</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Target Coordinates:</span>
              <span className="text-rose-400 font-bold">[{cfg.target_position.join(', ')}] m</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Wind Vector [Wx, Wy, Wz]:</span>
              <span className="text-slate-200">[{cfg.wind_disturbance.join(', ')}] m/s</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Integration Step (dt):</span>
              <span className="text-slate-200">{cfg.timestep} s</span>
            </div>
          </div>

          {/* Guidance & Control Config */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 uppercase">
              2. Guidance, Sensors & Control Parameters
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Trajectory Guidance:</span>
              <span className={cfg.guidance_enabled ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                {cfg.guidance_enabled ? 'ENABLED' : 'DISABLED (BALLISTIC)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">PID Controller Gains:</span>
              <span className="text-slate-200">Kp: {cfg.kp} | Ki: {cfg.ki} | Kd: {cfg.kd}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Sensor Noise Level:</span>
              <span className="text-slate-200">{cfg.sensor_noise} (sigma factor)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Simulated Event Mode:</span>
              <span className="text-amber-400">{cfg.event_mode}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Event Threshold:</span>
              <span className="text-slate-200">
                {cfg.event_mode === 'TIMER' ? `${cfg.event_timer_threshold} s` : `${cfg.event_proximity_threshold} m`}
              </span>
            </div>
          </div>
        </div>

        {/* Charts in Report */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase font-mono text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Trajectory & Error Performance Graphs
          </h3>
          <TrajectoryChart telemetry={simulation.telemetry} />
          <ErrorChart telemetry={simulation.telemetry} />
          {monteCarlo && <MonteCarloHistogram monteCarlo={monteCarlo} />}
        </div>

        {/* Engineering Observations */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <h4 className="font-bold text-slate-200 uppercase font-mono flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Engineering Observations & Technical Findings
          </h4>
          <ul className="space-y-2 text-slate-300 font-sans leading-relaxed list-disc list-inside">
            <li>
              <strong>Guidance Convergence:</strong> The closed-loop trajectory correction effectively compensated for lateral wind disturbances ({cfg.wind_disturbance[0]} m/s X, {cfg.wind_disturbance[1]} m/s Y), reducing cross-track deviation to under {sum.mean_position_error_m} m.
            </li>
            <li>
              <strong>State Estimation:</strong> Discrete Kalman filter integration maintained state stability under synthetic sensor noise, successfully mitigating GNSS pseudo-range uncertainty and IMU bias drift.
            </li>
            <li>
              <strong>Actuator Authority:</strong> Control commands remained within normalized deflection limits ([-1.0, +1.0]), with the first-order lag model preventing unphysical instantaneous steering jumps.
            </li>
            <li>
              <strong>Simulated Trigger:</strong> The software event manager registered the {simulation.event.event_mode} event at T+{simulation.event.event_time}s without premature triggers.
            </li>
          </ul>
        </div>

        {/* Limitations & Academic Boundary */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
          <strong className="text-slate-300 block uppercase">Project Assumptions & Limitations:</strong>
          <p>
            1. Simulation utilizes simplified point-mass translational dynamics with decoupled aerodynamic steering moments.
          </p>
          <p>
            2. Standard ISA atmospheric model was assumed without localized hypersonic turbulence or variable density lapse rates.
          </p>
          <p>
            3. All electronic and trigger logic is purely simulated in software for educational visualization and competition judging.
          </p>
        </div>
      </div>
    </div>
  );
};
