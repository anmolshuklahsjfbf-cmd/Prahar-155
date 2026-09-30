import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TelemetryPoint } from '../types/simulation';

interface ErrorChartProps {
  telemetry: TelemetryPoint[];
}

export const ErrorChart: React.FC<ErrorChartProps> = ({ telemetry }) => {
  if (!telemetry || telemetry.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-mono">No simulation telemetry loaded.</div>;
  }

  const step = Math.max(1, Math.floor(telemetry.length / 150));
  const data = telemetry.filter((_, idx) => idx % step === 0).map((pt) => ({
    time: pt.time,
    posError: Number(pt.position_error.toFixed(2)),
    crossTrack: Number(pt.cross_track_error.toFixed(2)),
    headingError: Number(pt.heading_error.toFixed(2)),
  }));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          Trajectory Error Analysis
        </h3>
        <p className="text-xs text-slate-500 font-mono">
          3D Tracking Error, Cross-Track Deviation & Heading Error over Time
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}s`} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
            <Line
              type="monotone"
              dataKey="posError"
              name="3D Pos Error (m)"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="crossTrack"
              name="Cross-Track (m)"
              stroke="#f59e0b"
              strokeWidth={1.8}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="headingError"
              name="Heading Error (°)"
              stroke="#a855f7"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
