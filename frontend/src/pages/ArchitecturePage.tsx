import React from 'react';
import { ArchitectureDiagram } from '../architecture/ArchitectureDiagram';
import { Cpu, Layers, GitBranch, ShieldCheck } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          System Architecture & Subsystem Dataflow
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Closed-Loop Guidance, Navigation & Control (GNC) Simulation Architecture for SIH Evaluation
        </p>
      </div>

      {/* Interactive Diagram Component */}
      <ArchitectureDiagram />

      {/* Subsystem Engineering Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Navigation & Estimation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold">
            <Layers className="w-4 h-4" />
            <h3>Navigation & Estimation</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            The state estimator operates on a 6-state discrete Kalman filter formulating kinematics through high-rate inertial specific force inputs, continuously corrected by pseudo-range GNSS updates and barometric altimetry.
          </p>
          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            Sampling: 100 Hz IMU / 10 Hz GNSS
          </div>
        </div>

        {/* Guidance & Trajectory */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <GitBranch className="w-4 h-4" />
            <h3>Guidance Strategy</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            A nominal 3D reference flight profile is synthesized using cubic Bezier curves connecting the release point to the designated target coordinates. Lateral and vertical trajectory tracking guidance commands null cross-track and heading errors.
          </p>
          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            Formulation: Cross-track PD acceleration
          </div>
        </div>

        {/* Closed-Loop Control */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <h3>Flight Control & Actuator</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Normalized pitch and yaw steering commands [-1.0, +1.0] are computed via anti-windup PID loops, driving a first-order lag control-surface actuator model subject to rate limits and mechanical deflections.
          </p>
          <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            Actuator Bandwidth: 12.5 Hz (tau = 0.08s)
          </div>
        </div>
      </div>
    </div>
  );
};
