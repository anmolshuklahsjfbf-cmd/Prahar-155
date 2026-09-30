import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { MonteCarloScatter } from '../charts/MonteCarloScatter';
import { MonteCarloHistogram } from '../charts/MonteCarloHistogram';
import {
  Sparkles,
  Play,
  RotateCcw,
  Target,
  BarChart3,
  Percent,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export const MonteCarloPage: React.FC = () => {
  const { monteCarlo, runMonteCarlo, isMonteCarloLoading, config } = useSimulation();
  const [selectedRuns, setSelectedRuns] = useState<number>(500);

  const handleRun = () => {
    runMonteCarlo(selectedRuns);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Monte Carlo Statistical Dispersion Analysis
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Stochastic Dispersion • Randomized Initial Perturbations • CEP-style Simulation Radius
          </p>
        </div>

        {/* Runs Selector & Trigger Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="px-2 text-slate-500">RUNS:</span>
            {[100, 500, 1000, 5000].map((count) => (
              <button
                key={count}
                onClick={() => setSelectedRuns(count)}
                className={`px-2.5 py-1 rounded transition-all ${
                  selectedRuns === count
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          <button
            onClick={handleRun}
            disabled={isMonteCarloLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-purple-500 hover:bg-purple-400 text-slate-950 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isMonteCarloLoading ? 'COMPUTING RUNS...' : `RUN ${selectedRuns} SIMULATIONS`}</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-mono text-purple-200 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            SIMULATION ONLY: Academic statistical evaluation for generic flight vehicle. Does NOT represent military CEP performance.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
          ACADEMIC / SIH
        </span>
      </div>

      {monteCarlo ? (
        <>
          {/* Statistical KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Runs */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">TOTAL RUNS</span>
              <div className="text-xl font-bold font-mono text-slate-100">{monteCarlo.runs}</div>
              <span className="text-[10px] font-mono text-purple-400">100% Vectorized</span>
            </div>

            {/* Mean Miss Distance */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">MEAN ERROR</span>
              <div className="text-xl font-bold font-mono text-sky-400">{monteCarlo.mean_error} m</div>
              <span className="text-[10px] font-mono text-slate-500">Average Terminal Miss</span>
            </div>

            {/* Standard Deviation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">STD DEVIATION (σ)</span>
              <div className="text-xl font-bold font-mono text-amber-400">±{monteCarlo.std_dev_error} m</div>
              <span className="text-[10px] font-mono text-slate-500">Statistical Variance</span>
            </div>

            {/* CEP 50 Simulation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">CEP-50 (SIMULATED)</span>
              <div className="text-xl font-bold font-mono text-emerald-400">{monteCarlo.cep_50_simulation} m</div>
              <span className="text-[10px] font-mono text-slate-500">50% Dispersion Radius</span>
            </div>

            {/* CEP 95 Simulation */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">CEP-95 (SIMULATED)</span>
              <div className="text-xl font-bold font-mono text-purple-300">{monteCarlo.cep_95_simulation} m</div>
              <span className="text-[10px] font-mono text-slate-500">95% Dispersion Radius</span>
            </div>

            {/* Min / Max Error */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">MIN / MAX ERROR</span>
              <div className="text-sm font-bold font-mono text-slate-200">
                {monteCarlo.min_error}m / {monteCarlo.max_error}m
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Median: {monteCarlo.median_error}m
              </span>
            </div>
          </div>

          {/* Hit Probability Radii Cards */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase font-mono text-slate-300 mb-3 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              Simulated Target Proximity Probability (% of Runs within Radius)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">WITHIN 5 METERS</span>
                  <span className="text-emerald-400 font-bold">{monteCarlo.within_radius['5m']}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${monteCarlo.within_radius['5m']}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">WITHIN 10 METERS</span>
                  <span className="text-sky-400 font-bold">{monteCarlo.within_radius['10m']}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full" style={{ width: `${monteCarlo.within_radius['10m']}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">WITHIN 25 METERS</span>
                  <span className="text-amber-400 font-bold">{monteCarlo.within_radius['25m']}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${monteCarlo.within_radius['25m']}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">WITHIN 50 METERS</span>
                  <span className="text-purple-400 font-bold">{monteCarlo.within_radius['50m']}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full" style={{ width: `${monteCarlo.within_radius['50m']}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Charts: 2D Dispersion Scatter & Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonteCarloScatter monteCarlo={monteCarlo} config={config} />
            <MonteCarloHistogram monteCarlo={monteCarlo} />
          </div>
        </>
      ) : (
        <div className="p-16 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
          <Sparkles className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
          <h2 className="text-base font-bold text-slate-200">No Monte Carlo Dataset Generated Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
            Click &quot;Run {selectedRuns} Simulations&quot; to execute vectorized stochastic runs with randomized wind disturbances, sensor noise, and initial kinematic perturbations.
          </p>
          <button
            onClick={handleRun}
            className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-purple-500 hover:bg-purple-400 text-slate-950 transition-all shadow-lg"
          >
            Launch Monte Carlo Now
          </button>
        </div>
      )}
    </div>
  );
};
