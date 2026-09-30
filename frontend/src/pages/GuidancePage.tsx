import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ErrorChart } from '../charts/ErrorChart';
import { TrajectoryChart } from '../charts/TrajectoryChart';
import {
  Navigation2,
  Crosshair,
  Compass,
  ArrowRight,
  TrendingDown,
  Target,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const GuidancePage: React.FC = () => {
  const { currentPoint, simulation, config, setConfig, runSimulation } = useSimulation();

  if (!currentPoint) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono">
        No active simulation loaded. Run simulation to view guidance telemetry.
      </div>
    );
  }

  const toggleGuidance = () => {
    const updated = { ...config, guidance_enabled: !config.guidance_enabled };
    setConfig(updated);
    runSimulation(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Navigation2 className="w-5 h-5 text-sky-400" />
            Generic Trajectory-Following Guidance
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Educational Trajectory Reference • Error Vector Computation • Steering Commands
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleGuidance}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
              config.guidance_enabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {config.guidance_enabled ? 'GUIDANCE: ENABLED' : 'GUIDANCE: DISABLED (BALLISTIC)'}
          </button>
        </div>
      </div>

      {/* Architecture Flow Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase font-mono text-slate-400 mb-3">
          Guidance Architecture Loop
        </h3>
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono text-slate-300">
          <div className="px-3 py-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-rose-400">
            <Target className="w-3.5 h-3.5" /> Target Position
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <div className="px-3 py-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-amber-400">
            <Navigation2 className="w-3.5 h-3.5" /> Desired Trajectory
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <div className="px-3 py-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-sky-400">
            <TrendingDown className="w-3.5 h-3.5" /> Tracking Errors (Pos/Heading)
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <div className="px-3 py-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-purple-400">
            <Compass className="w-3.5 h-3.5" /> Guidance Accel Command
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
          <div className="px-3 py-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-emerald-400">
            <Sliders className="w-3.5 h-3.5" /> Feedback Controller
          </div>
        </div>
      </div>

      {/* 4 Guidance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. 3D Position Error */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>3D Position Error</span>
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {currentPoint.position_error.toFixed(2)}{' '}
            <span className="text-xs text-slate-500 font-normal">m</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            || P_desired - P_estimated ||
          </span>
        </div>

        {/* 2. Cross-Track Error */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Cross-Track Error</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {currentPoint.cross_track_error.toFixed(2)}{' '}
            <span className="text-xs text-slate-500 font-normal">m</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Orthogonal deviation to flight path
          </span>
        </div>

        {/* 3. Heading Error */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Heading Error</span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {currentPoint.heading_error.toFixed(2)}{' '}
            <span className="text-xs text-slate-500 font-normal">deg</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Angle between velocity & target vector
          </span>
        </div>

        {/* 4. Guidance Command Magnitude */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Guidance Acceleration</span>
            <Navigation2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300">
            {Math.hypot(currentPoint.guidance_command[0], currentPoint.guidance_command[1]).toFixed(1)}{' '}
            <span className="text-xs text-slate-500 font-normal">m/s²</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            P: {currentPoint.guidance_command[0].toFixed(1)} | Y: {currentPoint.guidance_command[1].toFixed(1)}
          </span>
        </div>
      </div>

      {/* Trajectory and Error Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {simulation && <ErrorChart telemetry={simulation.telemetry} />}
        {simulation && <TrajectoryChart telemetry={simulation.telemetry} />}
      </div>

      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Educational generic trajectory tracking model. Demonstrates cross-track and along-track error minimization without using classified or military proportional navigation laws.
        </span>
      </div>
    </div>
  );
};
