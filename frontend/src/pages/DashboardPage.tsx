import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useNavigate } from 'react-router-dom';
import { Flight3DView } from '../simulation/Flight3DView';
import { PlaybackControls } from '../components/PlaybackControls';
import { ActuatorVisualizer } from '../components/ActuatorVisualizer';
import { TrajectoryChart } from '../charts/TrajectoryChart';
import {
  Activity,
  Crosshair,
  Compass,
  Gauge,
  Radio,
  Sliders,
  Sparkles,
  FileText,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Wind,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    simulation,
    currentPoint,
    isPlaying,
    isLoading,
    isMonteCarloLoading,
    togglePlayPause,
    resetPlayback,
    runSimulation,
    runMonteCarlo,
  } = useSimulation();

  const navigate = useNavigate();

  const handleStartSim = () => {
    runSimulation();
  };

  const handleMonteCarlo = async () => {
    await runMonteCarlo(500);
    navigate('/monte-carlo');
  };

  const handleReport = () => {
    navigate('/reports');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Simulated Event Manager Status */}
      {simulation && simulation.event && (
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-lg ${
            simulation.event.triggered
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-sky-950/40 border-sky-500/40 text-sky-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`p-1.5 rounded-lg ${
                simulation.event.triggered ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold tracking-wide uppercase">
                {simulation.event.triggered ? 'SIMULATED EVENT TRIGGERED' : 'SIMULATION ACTIVE'}
              </span>
              <p className="text-slate-300 font-sans text-xs mt-0.5">{simulation.event.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300 self-end sm:self-center">
            <span>
              MODE: <strong className="text-amber-400">{simulation.config.event_mode}</strong>
            </span>
            {simulation.event.event_time && (
              <span>
                TIME: <strong className="text-sky-300">{simulation.event.event_time}s</strong>
              </span>
            )}
            <span>
              MISS: <strong className="text-emerald-400">{simulation.event.miss_distance}m</strong>
            </span>
          </div>
        </div>
      )}

      {/* KPI Telemetry Header Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* System Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase mb-1">
            <span>System</span>
            <Activity className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            OPERATIONAL
          </div>
          <span className="text-[10px] font-mono text-slate-500">Academic Demo</span>
        </div>

        {/* Simulation Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase mb-1">
            <span>Simulation</span>
            <Layers className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-xs font-mono font-bold text-sky-300">
            {isLoading ? 'CALCULATING' : isPlaying ? 'PLAYING' : 'READY'}
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {simulation ? `ID #${simulation.id}` : 'None'}
          </span>
        </div>

        {/* Simulation Time */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase mb-1">
            <span>Flight Time</span>
            <Clock className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-xs font-mono font-bold text-amber-300">
            {currentPoint ? `T+${currentPoint.time.toFixed(2)}s` : '0.00s'}
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Max: {simulation?.config.simulation_duration || 30}s
          </span>
        </div>

        {/* Current Position */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase mb-1">
            <span>Position (X, Z)</span>
            <Crosshair className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-xs font-mono font-bold text-slate-200">
            {currentPoint
              ? `${Math.round(currentPoint.true_position[0])}m, ${Math.round(currentPoint.true_position[2])}m`
              : '0m, 0m'}
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Y: {currentPoint ? `${Math.round(currentPoint.true_position[1])}m` : '0m'}
          </span>
        </div>

        {/* Target Position */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase mb-1">
            <span>Target</span>
            <Crosshair className="w-3 h-3 text-rose-400" />
          </div>
          <div className="text-xs font-mono font-bold text-rose-300">
            {simulation
              ? `${simulation.config.target_position[0]}m, ${simulation.config.target_position[1]}m`
              : '3000m, 400m'}
          </div>
          <span className="text-[10px] font-mono text-slate-500">Alt: 0m (Ground)</span>
        </div>

        {/* Position Error */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase mb-1">
            <span>Tracking Error</span>
            <Gauge className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-xs font-mono font-bold text-purple-300">
            {currentPoint ? `${currentPoint.position_error.toFixed(2)} m` : '0.00 m'}
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            X-Track: {currentPoint?.cross_track_error.toFixed(1) || '0.0'}m
          </span>
        </div>

        {/* Sensor Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase mb-1">
            <span>Sensors</span>
            <Radio className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-xs font-mono font-bold text-cyan-400">
            {currentPoint ? currentPoint.sensor_data.gnss.status.slice(0, 11) : 'ONLINE'}
          </div>
          <span className="text-[10px] font-mono text-slate-500">4 Subsystems</span>
        </div>

        {/* Controller Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase mb-1">
            <span>Controller</span>
            <Sliders className="w-3 h-3 text-emerald-400" />
          </div>
          <div
            className={`text-xs font-mono font-bold ${
              currentPoint?.actuator_status === 'NOMINAL'
                ? 'text-emerald-400'
                : currentPoint?.actuator_status === 'RATE_LIMITED'
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {currentPoint ? currentPoint.actuator_status : 'READY'}
          </div>
          <span className="text-[10px] font-mono text-slate-500">Dual PID</span>
        </div>
      </div>

      {/* Main 3D Tactical Simulation Window */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-sky-400" />
            3D Flight Trajectory & Attitude Simulation
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Drag to Orbit • Scroll to Zoom • Right-click to Pan
          </span>
        </div>

        <Flight3DView height="520px" />

        {/* Playback Controls */}
        <PlaybackControls />
      </div>

      {/* Quick Dashboard Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={handleStartSim}
          disabled={isLoading}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
        >
          <Play className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono font-semibold text-slate-200">Start Simulation</span>
          <span className="text-[10px] font-mono text-slate-500">Run generic flight model</span>
        </button>

        <button
          onClick={togglePlayPause}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          ) : (
            <Play className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs font-mono font-semibold text-slate-200">
            {isPlaying ? 'Pause' : 'Resume'} Playback
          </span>
          <span className="text-[10px] font-mono text-slate-500">Toggle flight animation</span>
        </button>

        <button
          onClick={resetPlayback}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
        >
          <RotateCcw className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono font-semibold text-slate-200">Reset View</span>
          <span className="text-[10px] font-mono text-slate-500">Rewind to initial state</span>
        </button>

        <button
          onClick={handleMonteCarlo}
          disabled={isMonteCarloLoading}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
        >
          <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono font-semibold text-slate-200">Monte Carlo</span>
          <span className="text-[10px] font-mono text-slate-500">500 stochastic runs</span>
        </button>

        <button
          onClick={handleReport}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center gap-1.5 group text-center col-span-2 sm:col-span-1"
        >
          <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono font-semibold text-slate-200">Generate Report</span>
          <span className="text-[10px] font-mono text-slate-500">Export PDF/summary</span>
        </button>
      </div>

      {/* Actuator & Trajectory Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActuatorVisualizer currentPoint={currentPoint} />
        {simulation && <TrajectoryChart telemetry={simulation.telemetry} />}
      </div>
    </div>
  );
};
