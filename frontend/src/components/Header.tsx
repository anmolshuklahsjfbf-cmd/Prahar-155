import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  ShieldAlert,
  Server,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    simulation,
    backendOnline,
    isLoading,
    isMonteCarloLoading,
    runSimulation,
    resetPlayback,
    runMonteCarlo,
  } = useSimulation();

  const navigate = useNavigate();

  const handleStartSim = async () => {
    await runSimulation();
  };

  const handleMonteCarlo = async () => {
    await runMonteCarlo(500);
    navigate('/monte-carlo');
  };

  const handleReport = () => {
    navigate('/reports');
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Backend Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
              backendOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <Server className="w-3 h-3" />
            <span>{backendOnline ? 'BACKEND 8000: ONLINE' : 'LOCAL BACKEND: CONNECTING'}</span>
          </div>

          {/* Academic Simulation Scope Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Activity className="w-3 h-3" />
            <span>GENERIC VEHICLE SIMULATION</span>
          </div>

          {/* Active Sim Mode */}
          {simulation && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-slate-500">EVENT MODE:</span>
              <span className="text-amber-400 font-semibold">{simulation.config.event_mode}</span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleStartSim}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isLoading ? 'Simulating...' : 'Run Simulation'}</span>
          </button>

          <button
            onClick={resetPlayback}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleMonteCarlo}
            disabled={isMonteCarloLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isMonteCarloLoading ? 'Running...' : 'Monte Carlo'}</span>
          </button>

          <button
            onClick={handleReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
