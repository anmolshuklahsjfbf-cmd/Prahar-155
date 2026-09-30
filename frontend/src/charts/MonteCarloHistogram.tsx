import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { MonteCarloResponse } from '../types/simulation';

interface MonteCarloHistogramProps {
  monteCarlo: MonteCarloResponse;
}

export const MonteCarloHistogram: React.FC<MonteCarloHistogramProps> = ({ monteCarlo }) => {
  if (!monteCarlo || !monteCarlo.histogram || monteCarlo.histogram.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-mono">No histogram data available.</div>;
  }

  const data = monteCarlo.histogram.map((bin) => ({
    range: `${bin.bin_min.toFixed(0)}-${bin.bin_max.toFixed(0)}m`,
    center: bin.bin_center,
    count: bin.count,
    frequency: Number((bin.frequency * 100).toFixed(1)),
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Error Distribution Histogram
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Frequency of Terminal Miss Distances across {monteCarlo.runs} Simulated Runs
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          <span>Mean: <strong className="text-sky-300">{monteCarlo.mean_error} m</strong></span>
          <span className="mx-2 text-slate-700">|</span>
          <span>Std Dev: <strong className="text-amber-300">±{monteCarlo.std_dev_error} m</strong></span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="range" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" />
            <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Runs Count', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
              formatter={(val: any, name: any, item: any) => [
                `${val} runs (${item.payload.frequency}%)`,
                'Frequency',
              ]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index < 4 ? '#10b981' : index < 8 ? '#38bdf8' : index < 12 ? '#f59e0b' : '#f43f5e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
