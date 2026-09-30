import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import { MonteCarloResponse, SimulationConfig } from '../types/simulation';

interface MonteCarloScatterProps {
  monteCarlo: MonteCarloResponse;
  config: SimulationConfig;
}

export const MonteCarloScatter: React.FC<MonteCarloScatterProps> = ({ monteCarlo, config }) => {
  if (!monteCarlo || !monteCarlo.points || monteCarlo.points.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-mono">No Monte Carlo data available.</div>;
  }

  const targetX = config.target_position[0];
  const targetY = config.target_position[1];

  // Convert points to relative offsets from target (meters)
  const scatterData = monteCarlo.points.map((pt) => ({
    x: Number((pt.final_x - targetX).toFixed(2)),
    y: Number((pt.final_y - targetY).toFixed(2)),
    miss: pt.miss_distance,
    id: pt.run_id,
    time: pt.flight_time,
    status: pt.status,
  }));

  // Determine plot extent
  const maxOffset = Math.max(
    ...scatterData.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y), 25))
  );
  const domainLimit = Math.ceil(maxOffset * 1.15);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            2D Impact & Event Dispersion (Target Centered)
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Terminal Coordinates Relative to Target (0, 0) | CEP-50 Sim: {monteCarlo.cep_50_simulation}m
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Target
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Simulation Run
          </span>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="x"
              name="Along-Track Error"
              unit="m"
              domain={[-domainLimit, domainLimit]}
              stroke="#64748b"
              fontSize={11}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Cross-Track Error"
              unit="m"
              domain={[-domainLimit, domainLimit]}
              stroke="#64748b"
              fontSize={11}
            />
            <ZAxis range={[25, 25]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs font-mono shadow-2xl">
                      <p className="text-sky-400 font-bold">Run #{pt.id}</p>
                      <p className="text-slate-300">Miss Distance: {pt.miss} m</p>
                      <p className="text-slate-400">
                        ΔX: {pt.x} m | ΔY: {pt.y} m
                      </p>
                      <p className="text-slate-500">Flight Time: {pt.time} s</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Center target dot */}
            <ReferenceDot x={0} y={0} r={6} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} />
            <Scatter name="Dispersion" data={scatterData} fill="#38bdf8" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-center text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        SIMULATION ONLY — Normalized educational Monte Carlo analysis
      </div>
    </div>
  );
};
